import { useState, useEffect, useRef, useCallback } from 'react';
import type { PipelineStage } from '../lib/types';
import { PIPELINE_STAGES } from '../lib/constants';
import api from '../lib/api';

interface PipelineState {
    stages: PipelineStage[];
    currentStage: number;
    isComplete: boolean;
    isAborted: boolean;
    campaignData: unknown;
    contentHash: string | null;   // GatedCart-inspired integrity fingerprint
    error: string | null;
}

export function useCampaignPipeline(campaignId: string | null) {
    const [state, setState] = useState<PipelineState>({
        stages:       PIPELINE_STAGES.map(s => ({ ...s, status: 'waiting', detail: '' })),
        currentStage: 0,
        isComplete:   false,
        isAborted:    false,
        campaignData: null,
        contentHash:  null,
        error:        null,
    });

    const wsRef  = useRef<WebSocket | null>(null);
    const sseRef = useRef<EventSource | null>(null);

    // ── Message handler (shared by WS + SSE) ────────────────────────────────
    const handleMsg = useCallback((msg: any) => {
        if (msg.type === 'stage_update') {
            setState(prev => ({
                ...prev,
                currentStage: msg.stage,
                stages: prev.stages.map(s =>
                    s.id === msg.stage ? { ...s, status: msg.status, detail: msg.detail } :
                        s.id < msg.stage ? { ...s, status: 'done' } : s
                ),
            }));
        } else if (msg.type === 'done') {
            setState(prev => ({
                ...prev,
                isComplete:   true,
                campaignData: msg.data,
                contentHash:  (msg.data as any)?.contentHash ?? null,
                stages:       prev.stages.map(s => ({ ...s, status: 'done' })),
            }));
            wsRef.current?.close();
            sseRef.current?.close();
        } else if (msg.type === 'error') {
            setState(prev => ({ ...prev, error: msg.message }));
        } else if (msg.type === 'abort') {
            setState(prev => ({ ...prev, isAborted: true, error: 'Campaign aborted' }));
            wsRef.current?.close();
            sseRef.current?.close();
        } else if (msg.type === 'state') {
            // SSE initial state snapshot
            const c = (msg as any).campaign;
            if (c?.status === 'done') {
                setState(prev => ({
                    ...prev, isComplete: true,
                    campaignData: c.content,
                    contentHash:  c.contentHash ?? null,
                    stages:       prev.stages.map(s => ({ ...s, status: 'done' })),
                }));
            }
        }
    }, []);

    // ── SSE fallback (Veritas-inspired) ──────────────────────────────────────
    const connectSSE = useCallback(() => {
        if (!campaignId) return;
        const apiBase = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000/api`)
            .replace('/api', '');
        const token = localStorage.getItem('authToken') ?? '';
        const es = new EventSource(`${apiBase}/api/campaign/${campaignId}/stream?token=${encodeURIComponent(token)}`);
        sseRef.current = es;
        es.onmessage = (e) => {
            try {
                handleMsg(JSON.parse(e.data));
            } catch {
                /* ignore malformed SSE messages */
            }
        };
        es.onerror   = () => { es.close(); setState(prev => ({ ...prev, error: 'Stream connection lost' })); };
    }, [campaignId, handleMsg]);

    // ── WebSocket connect ─────────────────────────────────────────────────────
    const connect = useCallback(() => {
        if (!campaignId) return;
        const wsBase = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:4000`;
        const ws = new WebSocket(`${wsBase}/ws?campaignId=${campaignId}`);
        wsRef.current = ws;
        ws.onmessage = (e) => {
            try {
                handleMsg(JSON.parse(e.data));
            } catch {
                /* ignore malformed WS messages */
            }
        };
        ws.onerror   = () => {
            // WS failed — fall back to SSE
            console.warn('[Pipeline] WS error, switching to SSE');
            ws.close();
            connectSSE();
        };
    }, [campaignId, handleMsg, connectSSE]);

    useEffect(() => {
        if (campaignId) connect();
        return () => {
            wsRef.current?.close();
            sseRef.current?.close();
        };
    }, [campaignId, connect]);

    // ── Abort (GatedCart Emergency Kill Switch) ──────────────────────────────
    const abort = useCallback(async () => {
        if (!campaignId) return;
        try {
            await api.post(`/campaign/${campaignId}/abort`);
        } catch {
            /* ignore abort request errors */
        }
    }, [campaignId]);

    // ── Demo simulation ───────────────────────────────────────────────────────
    const simulatePipeline = useCallback(() => {
        const stages = PIPELINE_STAGES;
        let step = 0;
        setState(prev => ({
            ...prev,
            stages: stages.map(s => ({ ...s, status: 'waiting', detail: '' })),
            currentStage: 0, isComplete: false,
        }));
        const details = [
            'Analysing handicraft trends in UP… Found 3 viral formats this week',
            'Generating Hindi script with Diwali cultural context…',
            'Checking sensitivity across 22 languages… All clear ✅',
            'Optimal time: 7 PM IST | Hashtags: 8 regional tags identified',
            'Content published to 4 platforms! Estimated reach: 24K',
        ];
        const interval = setInterval(() => {
            if (step >= stages.length) { clearInterval(interval); setState(prev => ({ ...prev, isComplete: true })); return; }
            const s = stages[step];
            setState(prev => ({
                ...prev, currentStage: s.id,
                stages: prev.stages.map(ps =>
                    ps.id === s.id ? { ...ps, status: 'running', detail: details[step] } :
                        ps.id < s.id ? { ...ps, status: 'done' } : ps
                ),
            }));
            setTimeout(() => {
                setState(prev => ({ ...prev, stages: prev.stages.map(ps => ps.id === s.id ? { ...ps, status: 'done' } : ps) }));
            }, 1400);
            step++;
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return { ...state, connect, abort, simulatePipeline };
}
