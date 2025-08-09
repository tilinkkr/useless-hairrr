"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type HairStrandProps = {
  seed: number;
};

function HairStrand({ seed }: HairStrandProps) {
  const segments = 42;
  const geometryRef = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());

  // Precompute static attributes for this strand
  const { baseX, baseZ, phase, speed, amplitudeByT, yByT } = useMemo(() => {
    const rand = (n: number) => {
      const x = Math.sin(seed * 9999 * (n + 1)) * 43758.5453;
      return x - Math.floor(x);
    };
    const baseX = (rand(1) - 0.5) * 12; // spread horizontally
    const baseZ = (rand(2) - 0.5) * 4; // slight depth variation
    const phase = rand(3) * Math.PI * 2;
    const speed = 0.6 + rand(4) * 0.8;

    // Vertical distribution (top anchored, bottom free)
    const yByT: number[] = [];
    const amplitudeByT: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = THREE.MathUtils.lerp(3.2, -3.2, t);
      // More movement at the tip, almost none at the root
      const tipFactor = Math.pow(t, 1.8);
      amplitudeByT.push(0.18 + tipFactor * 0.55);
      yByT.push(y);
    }

    return { baseX, baseZ, phase, speed, amplitudeByT, yByT };
  }, [seed]);

  // Initialize position buffer
  useMemo(() => {
    const positions = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i++) {
      const idx = i * 3;
      positions[idx + 0] = baseX;
      positions[idx + 1] = yByT[i];
      positions[idx + 2] = baseZ;
    }
    geometryRef.current.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
  }, [baseX, baseZ, yByT]);

  // Animate sway
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pos = geometryRef.current.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i <= segments; i++) {
      const idx = i * 3;
      const ti = i / segments;
      // Subtle turbulent sway using two sines
      const sway =
        Math.sin(t * speed + phase + ti * 2.1) * amplitudeByT[i] * 0.6 +
        Math.sin(t * (speed * 0.73) + phase * 1.3 + ti * 3.5) * amplitudeByT[i] * 0.4;
      pos.array[idx + 0] = baseX + sway;
      pos.array[idx + 1] = yByT[i];
      pos.array[idx + 2] = baseZ + sway * 0.08; // slight depth curl
    }
    pos.needsUpdate = true;
  });

  // Use primitive for three.js Line to avoid TSX intrinsic type conflicts
  const lineObject = useMemo(() => new THREE.Line(geometryRef.current, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.9 })), []);
  useFrame(() => {
    // ensure geometry/material references stay up-to-date
    lineObject.geometry = geometryRef.current;
  });
  // eslint-disable-next-line react/no-unknown-property
  return <primitive object={lineObject} />;
}

export default function HairBackground() {
  const strandCount = 160;
  const strands = useMemo(() =>
    Array.from({ length: strandCount }, (_, i) => ({ id: i, seed: i + 1 })),
  []);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        {/* Dark background for high contrast with white UI text */}
        <color attach="background" args={["#0a0a0a"]} />
        <group position={[0, 0, 0]}>
          {strands.map((s) => (
            <HairStrand key={s.id} seed={s.seed} />
          ))}
        </group>
        <ambientLight intensity={0.7} />
      </Canvas>
    </div>
  );
}


