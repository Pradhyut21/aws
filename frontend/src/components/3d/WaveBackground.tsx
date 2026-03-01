import { useEffect, useRef } from 'react';

export default function WaveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let t = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const w = canvas.width;
            const h = canvas.height;

            // Draw 3 overlapping waves
            const waves = [
                { amp: 30, freq: 0.008, phase: t * 0.02, alpha: 0.15, color: '#FF6B35' },
                { amp: 20, freq: 0.012, phase: t * 0.015 + 1, alpha: 0.1, color: '#F7C948' },
                { amp: 25, freq: 0.006, phase: t * 0.025 + 2, alpha: 0.08, color: '#00D4FF' },
            ];

            waves.forEach(wave => {
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (let x = 0; x <= w; x++) {
                    const y = h * 0.6 + Math.sin(x * wave.freq + wave.phase) * wave.amp;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = wave.color;
                ctx.globalAlpha = wave.alpha;
                ctx.fill();
            });

            ctx.globalAlpha = 1;
            t++;
            animId = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '200px',
                pointerEvents: 'none',
            }}
        />
    );
}
