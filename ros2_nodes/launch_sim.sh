#!/usr/bin/env bash
set -euo pipefail

source /opt/ros/jazzy/setup.bash

echo "Launch Gazebo Harmonic office world, Nav2 localization, rosbridge, and scenario nodes from your ROS2 workspace."
echo "Expected rosbridge endpoint: ws://$(hostname -I | awk '{print $1}'):9090"

ros2 launch rosbridge_server rosbridge_websocket_launch.xml port:=9090
