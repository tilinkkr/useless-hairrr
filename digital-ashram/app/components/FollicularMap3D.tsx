"use client";

import React, { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

type Zone = {
  id: string;
  name: string; // spiritual trait
  thetaMin: number; // longitude range [-PI, PI]
  thetaMax: number;
  phiMin: number; // polar range [0, PI]
  phiMax: number;
  density: number; // 0..1
};

// Graceful, poetic spiritual traits
const ZONES: Zone[] = [
  {
    id: "front_crown",
    name: "Aura Receptivity",
    thetaMin: -Math.PI / 4,
    thetaMax: Math.PI / 4,
    phiMin: Math.PI / 8,
    phiMax: Math.PI / 3,
    density: 0.85,
  },
  {
    id: "left_temporal",
    name: "Thought Conduction",
    thetaMin: Math.PI / 4,
    thetaMax: (3 * Math.PI) / 4,
    phiMin: Math.PI / 4,
    phiMax: (2 * Math.PI) / 3,
    density: 0.6,
  },
  {
    id: "right_temporal",
    name: "Memory Resonance",
    thetaMin: -((3 * Math.PI) / 4),
    thetaMax: -Math.PI / 4,
    phiMin: Math.PI / 4,
    phiMax: (2 * Math.PI) / 3,
    density: 0.72,
  },
  {
    id: "back_occipital",
    name: "Dream Echo",
    thetaMin: (3 * Math.PI) / 4,
    thetaMax: Math.PI,
    phiMin: Math.PI / 3,
    phiMax: (5 * Math.PI) / 6,
    density: 0.4,
  },
  {
    id: "back_occipital_neg",
    name: "Dream Echo",
    thetaMin: -Math.PI,
    thetaMax: -((3 * Math.PI) / 4),
    phiMin: Math.PI / 3,
    phiMax: (5 * Math.PI) / 6,
    density: 0.4,
  },
  {
    id: "vertex",
    name: "Prana Intake",
    thetaMin: -Math.PI,
    thetaMax: Math.PI,
    phiMin: 0,
    phiMax: Math.PI / 8,
    density: 0.95,
  },
];

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

// Map 0..1 density to a spiritual heatmap color (cyan -> saffron -> crimson)
function densityToColor(d: number, target: THREE.Color) {
  const t = clamp01(d);
  // Gradient stops
  const c1 = new THREE.Color("#00BCD4"); // spiritual cyan
  const c2 = new THREE.Color("#FFC300"); // saffron
  const c3 = new THREE.Color("#B71C1C"); // deep crimson
  if (t < 0.5) {
    target.copy(c1).lerp(c2, t / 0.5);
  } else {
    target.copy(c2).lerp(c3, (t - 0.5) / 0.5);
  }
}

// Given spherical coords find matching zone and density
function findZone(theta: number, phi: number): Zone | null {
  for (const z of ZONES) {
    if (theta >= z.thetaMin && theta <= z.thetaMax && phi >= z.phiMin && phi <= z.phiMax) {
      return z;
    }
  }
  return null;
}

function toSpherical(localPoint: THREE.Vector3): { theta: number; phi: number } {
  const v = localPoint.clone().normalize();
  // theta: atan2(z, x) in [-PI, PI], phi: acos(y) in [0, PI]
  const theta = Math.atan2(v.z, v.x);
  const phi = Math.acos(clamp01(v.y));
  return { theta, phi };
}

function colorizeGeometry(geom: THREE.BufferGeometry) {
  const pos = geom.getAttribute("position") as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const v = new THREE.Vector3();

  const box = new THREE.Box3().setFromBufferAttribute(pos);
  const center = new THREE.Vector3();
  box.getCenter(center);

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.sub(center).normalize();
    const { theta, phi } = toSpherical(v);
    const zone = findZone(theta, phi);
    const d = zone ? zone.density : 0.2;
    densityToColor(d, c);
    colors[i * 3 + 0] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geom.attributes.color.needsUpdate = true;
}

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useFrame(() => {
    const aspect = size.width / size.height;
    // Adjust distance for responsiveness
    const baseZ = 8;
    const z = size.width < 480 ? baseZ + 3 : size.width < 768 ? baseZ + 2 : baseZ;
    camera.position.set(0, 0.5, z);
    (camera as THREE.PerspectiveCamera).fov = size.width < 480 ? 65 : 60;
    camera.updateProjectionMatrix();
  });
  return null;
}

function HeadMesh({ modelUrl }: { modelUrl?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.9,
        metalness: 0.05,
        transparent: true,
        opacity: 0.95,
      }),
    []
  );

  // Attempt to load GLB, else fallback to sphere
  let gltf: any = null;
  try {
    gltf = useGLTF(modelUrl || "/assets/models/head.glb");
    // eslint-disable-next-line no-empty
  } catch (e) {}

  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    if (gltf && gltf.scene) {
      const firstMesh = gltf.scene.getObjectByProperty("type", "Mesh") as THREE.Mesh | null;
      if (firstMesh && (firstMesh.geometry as THREE.BufferGeometry)) {
        const g = (firstMesh.geometry as THREE.BufferGeometry).clone();
        g.computeVertexNormals();
        colorizeGeometry(g);
        return g;
      }
    }
    // Fallback sphere
    const sphere = new THREE.SphereGeometry(3.2, 120, 120);
    colorizeGeometry(sphere);
    return sphere;
  }, [gltf]);

  // Gentle idle motion
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} material={material} position={[0, 0, 0]} />
    </group>
  );
}

export default function FollicularMap3D({ modelUrl }: { modelUrl?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; text: string }>(
    { visible: false, x: 0, y: 0, text: "" }
  );

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const inverseMatrix = useMemo(() => new THREE.Matrix4(), []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip((t) => ({ ...t, x, y }));
  }, []);

  const onScenePointerMove = useCallback((event: any) => {
    // event.intersections[0] is provided by r3f onPointerMove handlers per object; but we handle globally using raycaster
    const { eventObject, point } = event;
    if (!eventObject) return;
    // Convert world point to local of mesh
    const mesh = eventObject as THREE.Mesh;
    inverseMatrix.copy(mesh.matrixWorld).invert();
    tmpVec.copy(point).applyMatrix4(inverseMatrix);
    const { theta, phi } = toSpherical(tmpVec);
    const zone = findZone(theta, phi);
    if (zone) {
      setTooltip((t) => ({ ...t, visible: true, text: zone.name }));
    } else {
      setTooltip((t) => ({ ...t, visible: false }));
    }
  }, [inverseMatrix, tmpVec]);

  const onScenePointerOut = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto">
      <div
        className="relative w-full"
        style={{ aspectRatio: "16 / 9" }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
      >
        <Canvas
          camera={{ position: [0, 0.5, 8], fov: 60 }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} color={0xffc300} />
          <directionalLight position={[-5, -5, -5]} intensity={0.4} color={0x00bcd4} />

          <ResponsiveCamera />

          <Suspense fallback={null}>
            <group
              onPointerMove={onScenePointerMove}
              onPointerOut={onScenePointerOut}
            >
              <HeadMesh modelUrl={modelUrl} />
            </group>
          </Suspense>

          <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} />
        </Canvas>

        {/* Tooltip */}
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            transform: "translate(-50%, -120%)",
            pointerEvents: "none",
            transition: "opacity 200ms ease, transform 200ms ease",
            opacity: tooltip.visible ? 1 : 0,
          }}
          className="px-3 py-1 rounded-md bg-ashram-background/80 border border-ashram-accent text-ashram-text-primary text-xs shadow-lg"
        >
          {tooltip.text}
        </div>
      </div>

      {/* Label */}
      <p className="text-center mt-3 text-ashram-text-secondary">
        <span className="text-ashram-saffron font-semibold">Follicular Faculties Map</span>
      </p>
    </div>
  );
}

useGLTF.preload("/assets/models/head.glb");


