#!/usr/bin/env python3
import csv
import math
import os
import time
from pathlib import Path
from uuid import uuid4

import requests
import rclpy
from nav_msgs.msg import Odometry
from rclpy.node import Node
from sensor_msgs.msg import JointState


class OdomRecorder(Node):
    def __init__(self) -> None:
        super().__init__("odom_recorder")
        self.scenario = os.getenv("SCENARIO", "clear")
        self.run_id = os.getenv("RUN_ID", str(uuid4()))
        self.output_dir = Path(os.getenv("HUSKY_RECORDINGS_DIR", str(Path.home() / "husky_recordings")))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        stamp = time.strftime("%Y%m%d_%H%M%S")
        self.path = self.output_dir / f"{self.scenario}_{stamp}_run_{self.run_id.split('-')[0]}.csv"
        self.file = self.path.open("w", newline="", encoding="utf-8")
        self.writer = csv.DictWriter(self.file, fieldnames=[
            "timestamp_sec", "pos_x", "pos_y", "orientation_yaw", "vel_linear_x", "vel_angular_z",
            "distance_to_goal", "scenario", "run_id", "nav_status", "replanning_count", "avg_costmap_cost",
            "joint_fl", "joint_fr", "joint_rl", "joint_rr",
        ])
        self.writer.writeheader()
        self.start_time = time.time()
        self.goal_x = float(os.getenv("GOAL_X", "1.0"))
        self.goal_y = float(os.getenv("GOAL_Y", "21.0"))
        self.joints = {"joint_fl": 0.0, "joint_fr": 0.0, "joint_rl": 0.0, "joint_rr": 0.0}
        self.create_subscription(Odometry, "/a200_0000/odom", self.on_odom, 20)
        self.create_subscription(JointState, "/a200_0000/joint_states", self.on_joints, 20)

    def on_joints(self, msg: JointState) -> None:
        mapping = {
            "front_left_wheel_link": "joint_fl",
            "front_right_wheel_link": "joint_fr",
            "rear_left_wheel_link": "joint_rl",
            "rear_right_wheel_link": "joint_rr",
        }
        for name, field in mapping.items():
            if name in msg.name:
                self.joints[field] = msg.position[msg.name.index(name)]

    def on_odom(self, msg: Odometry) -> None:
        q = msg.pose.pose.orientation
        yaw = math.atan2(2.0 * (q.w * q.z + q.x * q.y), 1.0 - 2.0 * (q.y * q.y + q.z * q.z))
        pos_x = msg.pose.pose.position.x
        pos_y = msg.pose.pose.position.y
        distance_to_goal = math.hypot(self.goal_x - pos_x, self.goal_y - pos_y)
        self.writer.writerow({
            "timestamp_sec": f"{time.time() - self.start_time:.3f}",
            "pos_x": f"{pos_x:.4f}",
            "pos_y": f"{pos_y:.4f}",
            "orientation_yaw": f"{yaw:.4f}",
            "vel_linear_x": f"{msg.twist.twist.linear.x:.4f}",
            "vel_angular_z": f"{msg.twist.twist.angular.z:.4f}",
            "distance_to_goal": f"{distance_to_goal:.4f}",
            "scenario": self.scenario,
            "run_id": self.run_id,
            "nav_status": "NAVIGATING",
            "replanning_count": "0",
            "avg_costmap_cost": "0.0",
            **{key: f"{value:.4f}" for key, value in self.joints.items()},
        })

    def close_and_upload(self) -> None:
        self.file.flush()
        self.file.close()
        backend = os.getenv("RENDER_BACKEND_URL", "https://husky-backend.onrender.com").rstrip("/")
        secret = os.getenv("UPLOAD_SECRET")
        try:
            with self.path.open("rb") as handle:
                response = requests.post(
                    f"{backend}/recordings/upload",
                    data={"run_id": self.run_id, "scenario": self.scenario},
                    files={"file": (self.path.name, handle, "text/csv")},
                    headers={"x-upload-secret": secret} if secret else {},
                    timeout=30,
                )
            response.raise_for_status()
            self.get_logger().info("Upload complete")
        except Exception as exc:
            self.get_logger().error(f"Upload failed: {exc}")


def main() -> None:
    rclpy.init()
    node = OdomRecorder()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.close_and_upload()
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
