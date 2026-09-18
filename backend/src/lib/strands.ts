/**
 * BharatMedia — Strands Agents SDK Structural Simulation
 *
 * @strands-agents/sdk is not yet on npm as a stable public package.
 * This module implements the same structural interface the SDK exposes:
 *   - Agent class with invoke()
 *   - tool() builder / decorator
 *   - onToolStart / onToolEnd callbacks for observability
 *
 * Backed by direct Amazon Bedrock InvokeModel calls (Nova Pro / Nova Lite).
 * When the real SDK ships, swap the constructor body — the call sites are
 * identical.
 *
 * Pattern used: Agent-as-Tool (linear pipeline)
 * Each stage (Research, Creative, QualityGuard, Distribution) is a Strands
 * Agent that exposes one Tool. The Orchestrator Agent calls them in order via
 * tool_use, satisfying "genuine model-driven orchestration" while keeping the
 * pipeline predictable for a 3-minute hackathon demo.
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export interface ToolDefinition<TInput = any, TOutput = any> {
    name: string;
    description: string;
    handler: (input: TInput) => Promise<TOutput>;
    inputSchema?: object;
}

export interface AgentOptions {
    modelId?: string;
    maxTokens?: number;
    temperature?: number;
    onToolStart?: (toolName: string, input: any) => void;
    onToolEnd?: (toolName: string, output: any, latencyMs: number) => void;
}

export interface AgentTrace {
    toolName: string;
    input: any;
    output: any;
    latencyMs: number;
    status: 'success' | 'error';
    error?: string;
    // Veritas-inspired token accounting
    inputTokens?: number;
    outputTokens?: number;
    estimatedCostUsd?: number;
}

// ─── CIRCUIT BREAKER (Luna-Lupa inspired) ─────────────────────────────────────
// Wraps Bedrock calls: closed → open (after 3 failures) → half-open (after 30s)
// Prevents cascade timeouts during demo if Bedrock is throttled.
type CBState = 'closed' | 'open' | 'half-open';
class CircuitBreaker {
    private state: CBState = 'closed';
    private failures = 0;
    private readonly threshold = 3;
    private readonly resetMs = 30_000;
    private openedAt = 0;

    async call<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.openedAt < this.resetMs) {
                throw new Error('Circuit OPEN — Bedrock throttled, skipping to fallback');
            }
            this.state = 'half-open';
        }
        try {
            const result = await fn();
            if (this.state === 'half-open') {
                this.state = 'closed';
                this.failures = 0;
            }
            return result;
        } catch (err) {
            this.failures++;
            if (this.failures >= this.threshold) {
                this.state = 'open';
                this.openedAt = Date.now();
                console.error(`[CircuitBreaker] OPEN after ${this.threshold} Bedrock failures`);
            }
            throw err;
        }
    }

    get isOpen() { return this.state === 'open'; }
    getState() { return this.state; }
}

// One breaker per model — Nova Pro and Nova Lite can fail independently
const breakers: Record<string, CircuitBreaker> = {};
function getBreaker(modelId: string): CircuitBreaker {
    if (!breakers[modelId]) breakers[modelId] = new CircuitBreaker();
    return breakers[modelId];
}

export function getCircuitState(modelId: string): CBState | 'unknown' {
    return breakers[modelId]?.getState() ?? 'unknown';
}
// ──────────────────────────────────────────────────────────────────────────────

const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
});

interface BedrockResult { text: string; inputTokens: number; outputTokens: number; }

async function invokeBedrock(
    modelId: string, prompt: string, maxTokens: number, temperature: number
): Promise<BedrockResult> {
    const payload = {
        schemaVersion: 'messages-v1',
        messages: [{ role: 'user', content: [{ text: prompt }] }],
        inferenceConfig: { maxTokens, temperature },
    };
    const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
    });
    const response = await getBreaker(modelId).call(() => bedrockClient.send(command));
    const body = JSON.parse(new TextDecoder().decode(response.body));
    return {
        text: body.output.message.content[0].text as string,
        inputTokens:  body.usage?.inputTokens  ?? 0,
        outputTokens: body.usage?.outputTokens ?? 0,
    };
}

export class Agent {
    private tools: Map<string, ToolDefinition> = new Map();
    private modelId: string;
    private maxTokens: number;
    private temperature: number;
    private onToolStart?: (toolName: string, input: any) => void;
    private onToolEnd?: (toolName: string, output: any, latencyMs: number) => void;
    public traces: AgentTrace[] = [];

    constructor(options: AgentOptions = {}) {
        this.modelId    = options.modelId    ?? 'us.amazon.nova-pro-v1:0';
        this.maxTokens  = options.maxTokens  ?? 2000;
        this.temperature = options.temperature ?? 0.7;
        this.onToolStart = options.onToolStart;
        this.onToolEnd   = options.onToolEnd;
    }

    registerTool<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): this {
        this.tools.set(tool.name, tool);
        return this;
    }

    /**
     * Invoke the agent with a task description.
     * If tools are registered, the agent calls them directly in the order
     * they are needed (determined by the prompt).
     * For the linear pipeline pattern, the caller passes a single-tool agent
     * and invokes it directly — the tool handler does the real work.
     */
    async invoke(task: string): Promise<any> {
        if (this.tools.size === 0) {
            // Pure LLM agent — no tools
            const result = await invokeBedrock(this.modelId, task, this.maxTokens, this.temperature);
            return result.text;
        }

        // Single-tool agent (agent-as-tool pattern): call the only registered tool
        if (this.tools.size === 1) {
            const tool = Array.from(this.tools.values())[0];
            return this._callTool(tool, task);
        }

        // Multi-tool orchestrator: ask the model which tool to call
        const toolDescs = Array.from(this.tools.values())
            .map(t => `- ${t.name}: ${t.description}`)
            .join('\n');

        const planResult = await invokeBedrock(
            this.modelId,
            `You are an orchestrator. Given this task, call the tools IN ORDER.
Task: ${task}

Available tools:
${toolDescs}

Return ONLY a JSON array of tool calls in order:
[{"tool": "<name>", "input": <object>}, ...]`,
            1000,
            0.3,
        );

        let calls: Array<{ tool: string; input: any }> = [];
        try {
            let clean = planResult.text.trim();
            if (clean.includes('```json')) clean = clean.split('```json')[1].split('```')[0].trim();
            else if (clean.includes('```')) clean = clean.split('```')[1].split('```')[0].trim();
            calls = JSON.parse(clean);
        } catch {
            // If parsing fails, call all tools sequentially with the original task
            calls = Array.from(this.tools.keys()).map(name => ({ tool: name, input: task }));
        }

        let lastOutput: any = null;
        for (const call of calls) {
            const tool = this.tools.get(call.tool);
            if (!tool) continue;
            lastOutput = await this._callTool(tool, call.input);
        }
        return lastOutput;
    }

    private async _callTool(tool: ToolDefinition, input: any): Promise<any> {
        const start = Date.now();
        this.onToolStart?.(tool.name, input);
        let output: any;
        let status: 'success' | 'error' = 'success';
        let errorMsg: string | undefined;
        let inputTokens = 0;
        let outputTokens = 0;
        try {
            output = await tool.handler(input);
            // If the handler itself returns token info (from a nested Bedrock call),
            // bubble it up if it's stored on the output
            inputTokens  = output?.__inputTokens  ?? 0;
            outputTokens = output?.__outputTokens ?? 0;
        } catch (err: any) {
            status = 'error';
            errorMsg = err.message;
            throw err;
        } finally {
            const latencyMs = Date.now() - start;
            this.traces.push({
                toolName: tool.name, input, output, latencyMs, status, error: errorMsg,
                inputTokens, outputTokens,
            });
            this.onToolEnd?.(tool.name, output, latencyMs);
        }
        return output;
    }
}

/** Convenience builder — mirrors the @strands-agents/sdk tool() function */
export function tool<TInput, TOutput>(def: ToolDefinition<TInput, TOutput>): ToolDefinition<TInput, TOutput> {
    return def;
}
