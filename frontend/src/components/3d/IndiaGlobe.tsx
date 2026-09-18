import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { CITY_COORDINATES } from '../../lib/constants';

// Convert lat/lon to 3D sphere coords
function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function Globe() {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.003; });

    // City dots
    const cityPositions = CITY_COORDINATES.map(c => latLonToVec3(c.lat, c.lon, 2.02));

    return (
        <group>
            {/* Main sphere */}
            <Sphere ref={meshRef} args={[2, 64, 64]}>
                <meshStandardMaterial
                    color="#0D1B40"
                    wireframe={false}
                    transparent
                    opacity={0.9}
                    roughness={0.8}
                    metalness={0.1}
                />
            </Sphere>
            {/* Wireframe overlay */}
            <Sphere args={[2.01, 32, 32]}>
                <meshBasicMaterial color="#FF6B35" wireframe transparent opacity={0.08} />
            </Sphere>
            {/* City dots */}
            {cityPositions.map((pos, i) => (
                <group key={i} position={[meshRef.current ? 0 : 0, 0, 0]}>
                    <mesh position={pos}>
                        <sphereGeometry args={[0.03 * (CITY_COORDINATES[i].size || 1), 8, 8]} />
                        <meshBasicMaterial color="#FF6B35" />
                    </mesh>
                    {/* Glow ring */}
                    <mesh position={pos}>
                        <ringGeometry args={[0.04, 0.07, 16]} />
                        <meshBasicMaterial color="#F7C948" transparent opacity={0.6} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function StarField() {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 30;
    }
    return (
        <Points positions={positions}>
            <PointMaterial size={0.02} color="#F5F5F5" transparent opacity={0.6} />
        </Points>
    );
}

function Atmosphere() {
    return (
        <Sphere args={[2.15, 64, 64]}>
            <meshStandardMaterial
                color="#00D4FF"
                transparent
                opacity={0.04}
                side={THREE.BackSide}
            />
        </Sphere>
    );
}

export default function IndiaGlobe() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5.5], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
        >
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} color="#FF6B35" intensity={1.5} />
            <pointLight position={[-10, -10, -10]} color="#00D4FF" intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} />
            <StarField />
            <Globe />
            <Atmosphere />
        </Canvas>
    );
}
