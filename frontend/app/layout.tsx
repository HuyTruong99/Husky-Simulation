import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Husky Simulation Dashboard",
  description: "ROS2, Gazebo, Three.js, and Render dashboard for Husky A200 simulation runs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
