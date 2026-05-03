#!/usr/bin/env python3
import math
import time

import rclpy
from geometry_msgs.msg import Pose
from rclpy.node import Node


class TrafficInjector(Node):
    def __init__(self) -> None:
        super().__init__("traffic_injector")
        self.publisher = self.create_publisher(Pose, "/scenario/dynamic_obstacle", 10)
        self.timer = self.create_timer(0.5, self.publish_obstacle)
        self.start_time = time.time()

    def publish_obstacle(self) -> None:
        elapsed = time.time() - self.start_time
        msg = Pose()
        msg.position.x = 2.0 + math.sin(elapsed) * 1.5
        msg.position.y = 13.0 + math.cos(elapsed * 0.7) * 1.2
        msg.position.z = 0.0
        self.publisher.publish(msg)


def main() -> None:
    rclpy.init()
    node = TrafficInjector()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == "__main__":
    main()
