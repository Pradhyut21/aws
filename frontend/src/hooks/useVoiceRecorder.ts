import { useState, useRef, useCallback } from 'react';

interface VoiceRecorderState {
    isRecording: boolean;
    audioBlob: Blob | null;
    waveformData: number[];
    duration: number;
    error: string | null;
}

export function useVoiceRecorder() {
    const [state, setState] = useState<VoiceRecorderState>({
        isRecording: false,
        audioBlob: null,
        waveformData: new Array(40).fill(4),
        duration: 0,
        error: null,
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const animFrameRef = useRef<number>(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const animateWaveform = useCallback(() => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const step = Math.floor(dataArray.length / 40);
        const bars = Array.from({ length: 40 }, (_, i) => {
            const val = dataArray[i * step] / 255;
            return Math.max(4, val * 80);
        });
        setState(prev => ({ ...prev, waveformData: bars }));
        animFrameRef.current = requestAnimationFrame(animateWaveform);
    }, []);

    const start = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setState(prev => ({ ...prev, audioBlob: blob, isRecording: false, waveformData: new Array(40).fill(4) }));
            };

            recorder.start();
            animateWaveform();

            let secs = 0;
            timerRef.current = setInterval(() => {
                secs++;
                setState(prev => ({ ...prev, duration: secs }));
                if (secs >= 120) stop();
            }, 1000);

            setState(prev => ({ ...prev, isRecording: true, error: null, duration: 0 }));
        } catch {
            setState(prev => ({ ...prev, error: 'Microphone access denied. Please allow microphone.' }));
        }
    }, [animateWaveform]);

    const stop = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        streamRef.current?.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(animFrameRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const reset = useCallback(() => {
        stop();
        setState({ isRecording: false, audioBlob: null, waveformData: new Array(40).fill(4), duration: 0, error: null });
    }, [stop]);

    return { ...state, start, stop, reset };
}
