import { useState, useEffect, useRef, useCallback } from 'react';
import type { PipelineStage } from '../lib/types';
import { PIPELINE_STAGES } from '../lib/constants';

interface PipelineState {
    stages: PipelineStage[];
    currentStage: number;
    isComplete: boolean;
    campaignData: unknown;
    error: string | null;
}

export function useCampaignPipeline(campaignId: string | null) {
    const [state, setState] = useState<PipelineState>({
        stages: PIPELINE_STAGES.map(s => ({ ...s, status: 'waiting', detail: '' })),
        currentStage: 0,
        isComplete: false,
        campaignData: null,
        error: null,
    });

    const wsRef = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        if (!campaignId) return;
        const wsUrl = `ws://${window.location.hostname}:4000/ws?campaignId=${campaignId}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
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
                        isComplete: true,
                        campaignData: msg.data,
                        stages: prev.stages.map(s => ({ ...s, status: 'done' })),
                    }));
                } else if (msg.type === 'error') {
                    setState(prev => ({ ...prev, error: msg.message }));
                }
            } catch { }
        };

        ws.onerror = () => setState(prev => ({ ...prev, error: 'Connection error' }));
    }, [campaignId]);

    useEffect(() => {
        if (campaignId) connect();
        return () => wsRef.current?.close();
    }, [campaignId, connect]);

    // Simulate pipeline for demo mode
    const simulatePipeline = useCallback(() => {
        const stages = PIPELINE_STAGES;
        let step = 0;

        setState(prev => ({
            ...prev,
            stages: stages.map(s => ({ ...s, status: 'waiting', detail: '' })),
            currentStage: 0,
            isComplete: false,
        }));

        const details = [
            'Analyzing handicraft trends in UP... Found 3 viral formats this week',
            'Generating Hindi script with Diwali cultural context...',
            'Checking sensitivity across 22 languages... All clear ✅',
            'Optimal time: 7 PM IST | Hashtags: 8 regional tags identified',
            'Content published to 4 platforms! Estimated reach: 24K',
        ];

        const interval = setInterval(() => {
            if (step >= stages.length) {
                clearInterval(interval);
                setState(prev => ({ ...prev, isComplete: true }));
                return;
            }
            const s = stages[step];
            setState(prev => ({
                ...prev,
                currentStage: s.id,
                stages: prev.stages.map(ps =>
                    ps.id === s.id ? { ...ps, status: 'running', detail: details[step] } :
                        ps.id < s.id ? { ...ps, status: 'done' } : ps
                ),
            }));
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    stages: prev.stages.map(ps => ps.id === s.id ? { ...ps, status: 'done' } : ps),
                }));
            }, 1400);
            step++;
        }, 1800);

        return () => clearInterval(interval);
    }, []);

    return { ...state, connect, simulatePipeline };
}
