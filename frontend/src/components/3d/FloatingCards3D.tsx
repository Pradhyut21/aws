import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingCard {
    platform: string;
    color: string;
    emoji: string;
    offset: [number, number, number];
    rotationSpeed: number;
    floatOffset: number;
}

const CARDS: FloatingCard[] = [
    { platform: 'Instagram', color: '#E1306C', emoji: '📸', offset: [-3, 1, -1], rotationSpeed: 0.003, floatOffset: 0 },
    { platform: 'WhatsApp', color: '#25D366', emoji: '💬', offset: [0, -1.5, -2], rotationSpeed: -0.004, floatOffset: 2 },
    { platform: 'YouTube', color: '#FF0000', emoji: '▶️', offset: [3, 0.5, -1], rotationSpeed: 0.002, floatOffset: 4 },
];

function FloatingCard3D({ card }: { card: FloatingCard }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        const t = clock.elapsedTime + card.floatOffset;
        groupRef.current.position.y = card.offset[1] + Math.sin(t * 0.5) * 0.3;
        groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;
        groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    });

    return (
        <group ref={groupRef} position={card.offset}>
            <RoundedBox args={[1.8, 1.1, 0.05]} radius={0.1}>
                <meshStandardMaterial
                    color="#111827"
                    roughness={0.3}
                    metalness={0.5}
                    transparent
                    opacity={0.85}
                />
            </RoundedBox>
            {/* Color accent bar */}
            <RoundedBox args={[1.8, 0.15, 0.06]} radius={0.05} position={[0, 0.55, 0.01]}>
                <meshBasicMaterial color={card.color} />
            </RoundedBox>
            <Text
                position={[-0.5, 0, 0.04]}
                fontSize={0.25}
                color={card.color}
                anchorX="left"
                font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
            >
                {card.emoji} {card.platform}
            </Text>
            <Text
                position={[0, -0.2, 0.04]}
                fontSize={0.1}
                color="#94A3B8"
                anchorX="center"
                font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
            >
                AI Generated Content
            </Text>
        </group>
    );
}

export default function FloatingCards3D() {
    return (
        <Canvas
            camera={{ position: [0, 0, 7], fov: 55 }}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, pointerEvents: 'none' }}
            gl={{ antialias: true, alpha: true }}
        >
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} color="#FF6B35" intensity={1} />
            {CARDS.map((card) => (
                <FloatingCard3D key={card.platform} card={card} />
            ))}
        </Canvas>
    );
}
