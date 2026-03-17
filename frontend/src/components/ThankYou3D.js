import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// simple spinning cube to thank the user
function SpinningCube() {
  const meshRef = useRef();
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta;
    }
  });
  return (
    <mesh ref={meshRef} scale={1.5}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#10b981" />
    </mesh>
  );
}

export default function ThankYou3D() {
  return (
    <div style={{ width: '300px', height: '300px', margin: '0 auto' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 0, 5]} />
        <SpinningCube />
      </Canvas>
    </div>
  );
}
