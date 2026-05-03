#!/usr/bin/env python3
import random

import rclpy
from geometry_msgs.msg import Vector3
from rclpy.node import Node


class NoisePublisher(Node):
    def __init__(self) -> None:
        super().__init__("noise_publisher")
        self.publisher = self.create_publisher(Vector3, "/scenario/odom_noise", 10)
        self.timer = self.create_timer(0.1, self.publish_noise)

    def publish_noise(self) -> None:
        msg = Vector3()
        msg.x = random.gauss(0.0, 0.05)
        msg.y = random.gauss(0.0, 0.05)
        msg.z = random.gauss(0.0, 0.01)
        self.publisher.publish(msg)


def main() -> None:
    rclpy.init()
    node = NoisePublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == "__main__":
    main()
