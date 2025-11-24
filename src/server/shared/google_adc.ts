import { log } from "@/shared/logging";

// Stubbed Google Cloud ADC helpers for offline/dev use.
// This avoids calling the real gcloud CLI and prevents fatal errors
// when running the Biomes stack without any GCP configuration.

export interface GCloudConfig {
  accountEmail?: string;
}

/**
 * In the original code this queried the gcloud CLI.
 * For your fork, we just return a dummy config so anything that reads
 * it has something to work with, but we never talk to real GCP.
 */
export async function getGCloudConfig(): Promise<GCloudConfig> {
  log.warn("Using stubbed getGCloudConfig (no real gcloud CLI available).");
  return { accountEmail: "offline@local" };
}

/**
 * Returns a fake GCloud account email for local dev.
 * The rest of the system mostly uses this to determine an employee user id;
 * for your purposes any stable string is fine.
 */
export async function getGCloudAccount(): Promise<string> {
  log.warn("Using stubbed getGCloudAccount (no real gcloud CLI available).");
  return "offline@local";
}
