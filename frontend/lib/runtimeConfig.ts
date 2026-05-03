"use client";

const apiKey = "husky-dashboard-api-url";

export function normalizeApiUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

export function getDefaultApiUrl(): string {
  return normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");
}

export function getStoredApiUrl(): string {
  if (typeof window === "undefined") return getDefaultApiUrl();
  return normalizeApiUrl(window.localStorage.getItem(apiKey) || getDefaultApiUrl());
}

export function setStoredApiUrl(value: string): string {
  const normalized = normalizeApiUrl(value);
  window.localStorage.setItem(apiKey, normalized);
  return normalized;
}

export function apiToWsUrl(apiUrl: string): string {
  const normalized = normalizeApiUrl(apiUrl);
  if (normalized.startsWith("https://")) return normalized.replace("https://", "wss://") + "/ws";
  if (normalized.startsWith("http://")) return normalized.replace("http://", "ws://") + "/ws";
  return normalized;
}

export function getRosbridgeUrl(): string {
  return process.env.NEXT_PUBLIC_ROSBRIDGE_URL || "ws://localhost:9090";
}
