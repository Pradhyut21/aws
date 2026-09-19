import { useEffect, useRef } from 'react';

interface VantaBackgroundProps {
    effect?: 'net' | 'fog' | 'waves' | 'birds';
    className?: string;
    style?: React.CSSProperties;
}

/* Vanta.js WebGL animated backgrounds using Three.js
   Falls back gracefully to CSS gradient if WebGL is unavailable */
export default function VantaBackground({
    effect = 'net',
    className = '',
    style = {},
}: VantaBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const vantaRef = useRef<{ destroy: () => void } | null>(null);

    useEffect(() => {
        let mounted = true;

        async function initVanta() {
            const THREE = await import('three');
            const container = containerRef.current;
            if (!container || !mounted) return;

            let vantaInstance: { destroy: () => void } | null = null;

            try {
                if (effect === 'net') {
                    const VANTA = (await import('vanta/dist/vanta.net.min')).default;
                    vantaInstance = VANTA({
                        el: container,
                        THREE,
                        color: 0xff6b35,
                        backgroundColor: 0x0a0f1e,
                        points: 12.0,
                        maxDistance: 22.0,
                        spacing: 18.0,
                    });
                } else if (effect === 'fog') {
                    const VANTA = (await import('vanta/dist/vanta.fog.min')).default;
                    vantaInstance = VANTA({
                        el: container,
                        THREE,
                        highlightColor: 0xff6b35,
                        midtoneColor: 0x0d1b40,
                        lowlightColor: 0x080d1a,
                        baseColor: 0x0a0f1e,
                        blurFactor: 0.62,
                        speed: 0.8,
                        zoom: 0.8,
                    });
                } else if (effect === 'waves') {
                    const VANTA = (await import('vanta/dist/vanta.waves.min')).default;
                    vantaInstance = VANTA({
                        el: container,
                        THREE,
                        color: 0x0d1b40,
                        shininess: 40,
                        waveHeight: 18,
                        waveSpeed: 0.7,
                        zoom: 0.9,
                    });
                } else if (effect === 'birds') {
                    const VANTA = (await import('vanta/dist/vanta.birds.min')).default;
                    vantaInstance = VANTA({
                        el: container,
                        THREE,
                        backgroundColor: 0x0a0f1e,
                        color1: 0xff6b35,
                        color2: 0xf7c948,
                        colorMode: 'varianceGradient',
                        birdSize: 1.2,
                        quantity: 3,
                        speedLimit: 4,
                    });
                }

                if (mounted && vantaInstance) {
                    vantaRef.current = vantaInstance;
                } else {
                    vantaInstance?.destroy();
                }
            } catch (err) {
                // Vanta failed — CSS gradient fallback already applied
            }
        }

        initVanta();
        return () => {
            mounted = false;
            vantaRef.current?.destroy();
            vantaRef.current = null;
        };
    }, [effect]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                background: 'linear-gradient(135deg, #0A0F1E 0%, #0D1B40 50%, #080d1a 100%)',
                ...style,
            }}
        />
    );
}
