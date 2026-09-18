import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
    active: boolean;
    onComplete?: () => void;
}

interface Piece {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    rotation: number;
    vx: number;
    vy: number;
    rotationSpeed: number;
    shape: 'rect' | 'circle' | 'triangle';
}

const COLORS = ['#FF6B35', '#F7C948', '#00D4FF', '#00FF88', '#FF4DA6', '#9B5DE5'];

export default function Confetti({ active, onComplete }: ConfettiProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const piecesRef = useRef<Piece[]>([]);

    const launch = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        piecesRef.current = Array.from({ length: 180 }, (_, i) => ({
            id: i,
            x: canvas.width * (0.3 + Math.random() * 0.4),
            y: canvas.height * 0.55,
            size: Math.random() * 10 + 5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: Math.random() * 360,
            vx: (Math.random() - 0.5) * 18,
            vy: -(Math.random() * 18 + 8),
            rotationSpeed: (Math.random() - 0.5) * 12,
            shape: (['rect', 'circle', 'triangle'] as const)[Math.floor(Math.random() * 3)],
        }));

        const ctx = canvas.getContext('2d')!;
        let start = 0;

        const draw = (ts: number) => {
            if (!start) start = ts;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let alive = false;
            piecesRef.current.forEach(p => {
                p.vy += 0.45; // gravity
                p.vx *= 0.99; // air resistance
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;

                if (p.y < canvas.height + 20) alive = true;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, 1 - (p.y / canvas.height));

                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(0, -p.size / 2);
                    ctx.lineTo(p.size / 2, p.size / 2);
                    ctx.lineTo(-p.size / 2, p.size / 2);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.restore();
            });

            if (alive) {
                animRef.current = requestAnimationFrame(draw);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                onComplete?.();
            }
        };

        cancelAnimationFrame(animRef.current);
        animRef.current = requestAnimationFrame(draw);
    }, [onComplete]);

    useEffect(() => {
        if (active) {
            launch();
        } else {
            cancelAnimationFrame(animRef.current);
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        return () => cancelAnimationFrame(animRef.current);
    }, [active, launch]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 9998 }}
        />
    );
}
