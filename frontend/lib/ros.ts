"use client";

type Listener<T> = (message: T) => void;

class RosClient {
  private ros: any = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffMs = 1000;
  private url = process.env.NEXT_PUBLIC_ROSBRIDGE_URL || "ws://localhost:9090";
  private roslib: any = null;

  setUrl(url: string) {
    if (this.url === url) return;
    this.url = url;
    this.reconnectTimer && clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.ros?.close();
    this.ros = null;
    this.backoffMs = 1000;
  }

  async connect(onStatus?: (connected: boolean) => void) {
    if (this.ros) return this.ros;
    if (typeof window === "undefined") return null;
    if (!this.roslib) {
      this.roslib = await import("roslib");
    }
    const ROSLIB = this.roslib.default ?? this.roslib;

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
    let topic: any = null;
    let active = true;
    this.connect().then((ros) => {
      if (!active || !ros) return;
      const ROSLIB = this.roslib.default ?? this.roslib;
      topic = new ROSLIB.Topic({ ros, name, messageType });
      topic.subscribe(listener as Listener<unknown>);
    });
    return () => {
      active = false;
      topic?.unsubscribe(listener as Listener<unknown>);
    };
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
