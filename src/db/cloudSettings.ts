import { getSetting, setSetting } from "./settings";

export function getCloudUrl(): string {
  return getSetting("cloudUrl") ?? "";
}

export function getApiToken(): string {
  return getSetting("apiToken") ?? "";
}

export function saveCloudSettings(url: string, token: string): void {
  setSetting("cloudUrl", url);
  setSetting("apiToken", token);
}
