$ErrorActionPreference = "Stop"

Write-Host "Run this in a ROS2 Jazzy terminal with your workspace sourced if this script cannot find ros2."
ros2 launch rosbridge_server rosbridge_websocket_launch.xml port:=9090
