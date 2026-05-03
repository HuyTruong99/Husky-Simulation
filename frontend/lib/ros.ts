"use client";

import ROSLIB from "roslib";

type Listener<T> = (message: T) => void;

class RosClient {
  private ros: ROSLIB.Ros | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffMs = 1000;
  private url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

  connect(onStatus?: (connected: boolean) => void) {
    if (this.ros) return this.ros;

    this.ros = new ROSLIB.Ros({ url: this.url });
    this.ros.on("connection", () => {
      this.backoffMs = 1000;
      onStatus?.(true);
    });
    this.ros.on("close", () => {
      onStatus?.(false);
      this.scheduleReconnect(onStatus);
    });
    this.ros.on("error", () => {
      onStatus?.(false);
      this.ros?.close();
    });
    return this.ros;
  }

  topic<T>(name: string, messageType: string, listener: Listener<T>) {
    const ros = this.connect();
    const topic = new ROSLIB.Topic({ ros, name, messageType });
    topic.subscribe(listener as Listener<unknown>);
    return () => topic.unsubscribe(listener as Listener<unknown>);
  }

  private scheduleReconnect(onStatus?: (connected: boolean) => void) {
    if (this.reconnectTimer) return;
    const delay = this.backoffMs;
    this.backoffMs = Math.min(this.backoffMs * 2, 30000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ros = null;
      this.connect(onStatus);
    }, delay);
  }
}

export const rosClient = new RosClient();
