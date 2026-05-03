"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { RobotPose, Waypoint } from "@/types";

interface MapViewerProps {
  pose: RobotPose;
  waypointA: Waypoint;
  waypointB: Waypoint;
}

export default function MapViewer({ pose, waypointA, waypointB }: MapViewerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const robotRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    let disposed = false;
    import("leaflet").then((L) => {
      if (disposed || !ref.current) return;
      const originX = Number(process.env.NEXT_PUBLIC_MAP_ORIGIN_X || -13.67);
      const originY = Number(process.env.NEXT_PUBLIC_MAP_ORIGIN_Y || -10.462);
      const widthMeters = 35;
      const heightMeters = 35;
      const bounds: [[number, number], [number, number]] = [
        [originY, originX],
        [originY + heightMeters, originX + widthMeters],
      ];
      const map = L.map(ref.current, { crs: L.CRS.Simple, minZoom: -2 }).fitBounds(bounds);
      L.imageOverlay("/maps/office_map.png", bounds, { opacity: 0.75 }).addTo(map);
      L.rectangle(bounds, { color: "#94a3b8", weight: 1, fillOpacity: 0.08 }).addTo(map);
      L.marker([waypointA.y, waypointA.x]).addTo(map).bindTooltip("Waypoint A");
      L.marker([waypointB.y, waypointB.x]).addTo(map).bindTooltip("Waypoint B");
      robotRef.current = L.circleMarker([pose.y, pose.x], { radius: 7, color: "#0f766e", fillColor: "#14b8a6", fillOpacity: 1 }).addTo(map);
      mapRef.current = map;
    });
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    robotRef.current?.setLatLng([pose.y, pose.x]);
  }, [pose]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 font-bold">Leaflet Office Map</h2>
      <div ref={ref} className="h-[340px] overflow-hidden rounded-md bg-slate-100" />
    </section>
  );
}
