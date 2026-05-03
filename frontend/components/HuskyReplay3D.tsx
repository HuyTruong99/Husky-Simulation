"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import URDFLoader from "urdf-loader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { RecordingRow } from "@/types";

interface HuskyReplay3DProps {
  csvData: RecordingRow[];
  isPlaying: boolean;
  speed: number;
}

export default function HuskyReplay3D({ csvData, isPlaying, speed }: HuskyReplay3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const robotRef = useRef<any>(null);
  const lineRef = useRef<THREE.Line | null>(null);
  const frameRef = useRef(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 5, 3);
    scene.add(light);
    scene.add(new THREE.GridHelper(20, 40));
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.01, 100);
    camera.position.set(2, 1.5, 2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    new URDFLoader().load("/husky/husky.urdf", (robot) => {
      robot.rotation.x = -Math.PI / 2;
      scene.add(robot);
      robotRef.current = robot;
    });
    const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x1d72b8 }));
    scene.add(line);
    lineRef.current = line;
    let animation = 0;
    const animate = () => {
      animation = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(animation);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || csvData.length === 0) return;
    const timer = setInterval(() => {
      frameRef.current = Math.min(frameRef.current + 1, csvData.length - 1);
      setFrame(frameRef.current);
    }, 100 / speed);
    return () => clearInterval(timer);
  }, [csvData.length, isPlaying, speed]);

  useEffect(() => {
    const row = csvData[frame];
    const robot = robotRef.current;
    if (!row || !robot) return;
    robot.position.set(row.pos_x, 0, -row.pos_y);
    robot.rotation.set(0, row.orientation_yaw, 0);
    ["front_left_wheel_link", "front_right_wheel_link", "rear_left_wheel_link", "rear_right_wheel_link"].forEach((joint) => {
      robot.joints?.[joint]?.setAngle(row[jointToCsv(joint)]);
    });
    const points = csvData.slice(0, frame + 1).map((item) => new THREE.Vector3(item.pos_x, 0.02, -item.pos_y));
    lineRef.current?.geometry.setFromPoints(points);
  }, [csvData, frame]);

  const elapsed = csvData[frame]?.timestamp_sec ?? 0;
  const total = csvData.at(-1)?.timestamp_sec ?? 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div ref={mountRef} className="h-[420px] rounded-md bg-slate-100" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className="rounded border px-3 py-2" onClick={() => setFrame(0)} type="button">|&lt;</button>
        <button className="rounded border px-3 py-2" onClick={() => setFrame(Math.max(0, frame - 10))} type="button">&lt;&lt;</button>
        <input className="min-w-48 flex-1" type="range" min={0} max={Math.max(csvData.length - 1, 0)} value={frame} onChange={(event) => setFrame(Number(event.target.value))} />
        <span className="text-sm font-semibold">Frame {frame + 1} / {csvData.length} - {elapsed.toFixed(0)}s / {total.toFixed(0)}s</span>
      </div>
    </div>
  );
}

function jointToCsv(joint: string): "joint_fl" | "joint_fr" | "joint_rl" | "joint_rr" {
  if (joint.includes("front_left")) return "joint_fl";
  if (joint.includes("front_right")) return "joint_fr";
  if (joint.includes("rear_left")) return "joint_rl";
  return "joint_rr";
}
