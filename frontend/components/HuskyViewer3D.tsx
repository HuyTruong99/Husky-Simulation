"use client";

import { useEffect, useRef, useState } from "react";
import { rosClient } from "@/lib/ros";
import type { RobotPose } from "@/types";

interface HuskyViewer3DProps {
  rosConnected: boolean;
  scenario: string;
  onPoseUpdate: (pose: RobotPose) => void;
}

const wheelJoints = ["front_left_wheel_link", "front_right_wheel_link", "rear_left_wheel_link", "rear_right_wheel_link"];

export default function HuskyViewer3D({ rosConnected, scenario, onPoseUpdate }: HuskyViewer3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const robotRef = useRef<any>(null);
  const [pose, setPose] = useState<RobotPose>({ x: 0, y: 0, z: 0, yaw: 0 });
  const [navStatus, setNavStatus] = useState("IDLE");

  useEffect(() => {
    let disposed = false;
    const mount = mountRef.current;
    if (!mount) return;

    async function setupScene() {
    const mountEl = mountRef.current;
    if (disposed || !mountEl) return;
    const THREE = await import("three");
    const { default: URDFLoader } = await import("urdf-loader");
    const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
    if (disposed) return;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 5, 3);
    scene.add(light);
    scene.add(new THREE.GridHelper(20, 40, 0x93a4b7, 0xd4dbe5));

    const camera = new THREE.PerspectiveCamera(45, mountEl.clientWidth / mountEl.clientHeight, 0.01, 100);
    camera.position.set(2, 1.5, 2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    mountEl.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;

    const loader = new URDFLoader();
    loader.load("/husky/husky.urdf", (robot) => {
      robot.rotation.x = -Math.PI / 2;
      scene.add(robot);
      robotRef.current = robot;
    });

    const resize = () => {
      camera.aspect = mountEl.clientWidth / mountEl.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    };
    window.addEventListener("resize", resize);

    let animation = 0;
    const animate = () => {
      animation = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      renderer.domElement.remove();
    };
    }

    let cleanup: undefined | (() => void);
    setupScene().then((nextCleanup) => {
      cleanup = nextCleanup;
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    const unsubJoint = rosClient.topic<any>("/a200_0000/joint_states", "sensor_msgs/JointState", (msg) => {
      const robot = robotRef.current;
      if (!robot?.joints || !msg.name || !msg.position) return;
      wheelJoints.forEach((joint) => {
        const index = msg.name.indexOf(joint);
        if (index >= 0 && robot.joints[joint]) robot.joints[joint].setAngle(msg.position[index]);
      });
    });

    const unsubTf = rosClient.topic<any>("/tf", "tf2_msgs/TFMessage", (msg) => {
      const transform = msg.transforms?.find((item: any) => item.header?.frame_id === "odom" && item.child_frame_id === "base_link");
      const robot = robotRef.current;
      if (!transform || !robot) return;
      const t = transform.transform.translation;
      const q = transform.transform.rotation;
      robot.position.set(t.x, t.z, -t.y);
      robot.quaternion.set(q.x, q.z, -q.y, q.w);
      const yaw = Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z));
      const nextPose = { x: t.x, y: t.y, z: t.z, yaw };
      setPose(nextPose);
      onPoseUpdate(nextPose);
    });

    const unsubStatus = rosClient.topic<any>(
      "/a200_0000/navigate_through_poses/_action/status",
      "action_msgs/GoalStatusArray",
      (msg) => setNavStatus(String(msg.status_list?.at(-1)?.status ?? "IDLE")),
    );

    return () => {
      unsubJoint();
      unsubTf();
      unsubStatus();
    };
  }, [onPoseUpdate]);

  return (
    <div className="relative h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-slate-950/5">
      <div ref={mountRef} className="h-full w-full" />
      <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-bold shadow">
        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${rosConnected ? "animate-pulse bg-emerald-500" : "bg-red-500"}`} />
        {rosConnected ? "LIVE" : "OFFLINE"}
      </div>
      <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-bold capitalize shadow">{scenario.replace(/_/g, " ")}</div>
      <div className="absolute bottom-4 left-1/2 w-[90%] -translate-x-1/2 rounded-lg bg-slate-900/85 px-4 py-2 text-center text-sm font-semibold text-white">
        x: {pose.x.toFixed(2)} y: {pose.y.toFixed(2)} yaw: {pose.yaw.toFixed(2)}rad | nav: {navStatus}
      </div>
    </div>
  );
}
