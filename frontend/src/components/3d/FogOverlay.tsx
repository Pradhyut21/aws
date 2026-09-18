import { useEffect, useRef } from 'react';

interface FogOverlayProps {
    className?: string;
    color?: string;
    opacity?: number;
}

export default function FogOverlay({ className = '', color = '#FF6B35', opacity = 0.06 }: FogOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        type Puff = { x: number; y: number; r: number; vx: number; vy: number; alpha: number; growing: boolean };
        const puffs: Puff[] = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        for (let i = 0; i < 18; i++) {
            puffs.push({
                x: Math.random() * (canvas.offsetWidth || 1200),
                y: Math.random() * (canvas.offsetHeight || 600),
                r: Math.random() * 200 + 100,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.1,
                alpha: Math.random() * opacity,
                growing: Math.random() > 0.5,
            });
        }

        // Parse hex color to rgb
        const hex = color.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            puffs.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x > canvas.width + p.r) p.x = -p.r;
                if (p.x < -p.r) p.x = canvas.width + p.r;
                if (p.y > canvas.height + p.r) p.y = -p.r;
                if (p.y < -p.r) p.y = canvas.height + p.r;

                // Breathe in/out
                if (p.growing) {
                    p.alpha += 0.0003;
                    if (p.alpha >= opacity) p.growing = false;
                } else {
                    p.alpha -= 0.0003;
                    if (p.alpha <= 0.002) p.growing = true;
                }

                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                grad.addColorStop(0, `rgba(${r},${g},${b},${p.alpha})`);
                grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            });

            animRef.current = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener('resize', resize);
        };
    }, [color, opacity]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none' }}
        />
    );
}
