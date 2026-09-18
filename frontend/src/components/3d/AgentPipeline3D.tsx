import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { PIPELINE_STAGES } from '../../lib/constants';

interface AgentPipeline3DProps {
    activeStep: number;
}

const NODE_POSITIONS: [number, number, number][] = [
    [-4, 0, 0],
    [-2, 1, 0],
    [0, 0, 0],
    [2, 1, 0],
    [4, 0, 0],
];

const COLORS = ['#00D4FF', '#FF6B35', '#F7C948', '#00FF88', '#FF6B35'];

function AgentNode({ position, index, isActive, isDone }: {
    position: [number, number, number];
    index: number;
    isActive: boolean;
    isDone: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
            if (isActive) {
                meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.15);
            }
        }
        if (ringRef.current && isActive) {
            ringRef.current.rotation.z += delta * 2;
            ringRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.2);
        }
    });

    const color = isDone ? '#00FF88' : isActive ? COLORS[index] : '#1a2540';

    return (
        <group position={position}>
            {/* Outer glow ring */}
            {(isActive || isDone) && (
                <mesh ref={ringRef}>
                    <torusGeometry args={[0.45, 0.02, 8, 32]} />
                    <meshBasicMaterial color={color} transparent opacity={0.7} />
                </mesh>
            )}
            {/* Main orb */}
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[0.3, 2]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isActive ? 0.8 : isDone ? 0.4 : 0.1}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
            {/* Label */}
        </group>
    );
}

function ConnectionBeam({ from, to, active }: {
    from: [number, number, number];
    to: [number, number, number];
    active: boolean;
}) {
    return (
        <Line
            points={[from, to]}
            color={active ? '#FF6B35' : '#1a2540'}
            lineWidth={active ? 2 : 1}
            transparent
            opacity={active ? 0.8 : 0.3}
        />
    );
}

function Pipeline({ activeStep }: { activeStep: number }) {
    return (
        <group>
            {PIPELINE_STAGES.map((stage, i) => (
                <AgentNode
                    key={stage.id}
                    position={NODE_POSITIONS[i]}
                    index={i}
                    isActive={activeStep === stage.id}
                    isDone={activeStep > stage.id}
                />
            ))}
            {NODE_POSITIONS.slice(0, -1).map((pos, i) => (
                <ConnectionBeam
                    key={i}
                    from={pos}
                    to={NODE_POSITIONS[i + 1]}
                    active={activeStep > i + 1}
                />
            ))}
        </group>
    );
}

export default function AgentPipeline3D({ activeStep }: AgentPipeline3DProps) {
    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 60 }}
            style={{ width: '100%', height: '220px' }}
            gl={{ antialias: true, alpha: true }}
        >
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 5, 5]} color="#FF6B35" intensity={2} />
            <pointLight position={[0, -5, 5]} color="#00D4FF" intensity={1} />
            <Pipeline activeStep={activeStep} />
        </Canvas>
    );
}
