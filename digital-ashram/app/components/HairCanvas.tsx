"use client";

import React, { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Custom shader for living hair animation
const hairVertexShader = `
  uniform float u_time;
  uniform float u_breathingSpeed;
  uniform float u_breathingAmplitude;
  
  void main() {
    vec3 pos = position;
    
    // Create breathing effect using instance ID and time
    float instanceOffset = float(gl_InstanceID) * 0.1;
    float breathing = sin(u_time * u_breathingSpeed + instanceOffset) * u_breathingAmplitude;
    
    // Apply breathing along the normal direction
    pos += normal * breathing;
    
    // Add some randomness for organic movement
    float randomOffset = sin(u_time * 0.5 + float(gl_InstanceID) * 0.01) * 0.02;
    pos += vec3(randomOffset, randomOffset * 0.5, randomOffset * 0.3);
    
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  }
`;

const hairFragmentShader = `
  void main() {
    // Create a subtle gradient effect
    float intensity = 1.0 - gl_FragCoord.y / 1000.0;
    vec3 color = mix(vec3(0.1, 0.05, 0.0), vec3(0.3, 0.2, 0.1), intensity);
    gl_FragColor = vec4(color, 0.8);
  }
`;

function LivingHairField() {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Hair strand geometry
  const hairGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(0.02, 0.01, 2, 4);
    geometry.translate(0, 1, 0); // Move origin to bottom
    return geometry;
  }, []);
  
  // Custom shader material
  const hairMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: hairVertexShader,
      fragmentShader: hairFragmentShader,
      transparent: true,
      uniforms: {
        u_time: { value: 0 },
        u_breathingSpeed: { value: 2.0 },
        u_breathingAmplitude: { value: 0.1 }
      }
    });
    return material;
  }, []);
  
  // Initialize hair positions
  const hairCount = 5000; // Increased for more dramatic effect
  
  useMemo(() => {
    if (!instancedMeshRef.current) return;
    
    for (let i = 0; i < hairCount; i++) {
      // Create scalp-like distribution
      const radius = Math.random() * 3 + 1;
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 0.5;
      
      // Position on scalp surface
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = height;
      
      // Random rotation for natural look
      const rotationX = (Math.random() - 0.5) * 0.3;
      const rotationY = Math.random() * Math.PI * 2;
      const rotationZ = (Math.random() - 0.5) * 0.3;
      
      dummy.position.set(x, y, z);
      dummy.rotation.set(rotationX, rotationY, rotationZ);
      dummy.scale.setScalar(0.8 + Math.random() * 0.4);
      
      dummy.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [hairCount, dummy]);
  
  // Animation loop
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.getElapsedTime();
    }
  });
  
  return (
    <instancedMesh
      ref={instancedMeshRef}
      geometry={hairGeometry}
      material={hairMaterial}
      count={hairCount}
    />
  );
}

function ScalpModel() {
  const scalpGeometry = useMemo(() => {
    return new THREE.SphereGeometry(4, 32, 32);
  }, []);
  
  const scalpMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x2a1a0a,
      transparent: true,
      opacity: 0.3,
      roughness: 0.8,
      metalness: 0.1
    });
  }, []);
  
  return (
    <mesh geometry={scalpGeometry} material={scalpMaterial} />
  );
}

function RotatingHairGroup() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      <ScalpModel />
      <LivingHairField />
    </group>
  );
}

export default function HairCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 60 }}
      style={{ background: 'var(--ashram-background)' }}
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color={0xffc300} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color={0x00bcd4} />
      
      <RotatingHairGroup />
      
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        autoRotate={false}
        maxDistance={20}
        minDistance={5}
      />
    </Canvas>
  );
}


