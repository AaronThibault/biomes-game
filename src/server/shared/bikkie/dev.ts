import { log } from "@/shared/logging";

// Stubbed Bikkie dev helpers for your fork.
// The original implementation pulled trays from Biomes' production environment.
// For local/offline dev, we don't want to talk to prod or GCP at all.

/**
 * In the original code, this fetched Bikkie tray definitions from prod and
 * returned them as JSON. For your fork, we simply log and return undefined,
 * allowing the rest of the system to continue without preloaded trays.
 */
export async function loadTrayDefinitionFromProd(): Promise<unknown> {
  log.warn(
    "loadTrayDefinitionFromProd: stubbed in local dev; skipping prod tray fetch."
  );
  return undefined;
}

/**
 * In the original code, this loaded a baked tray asset from prod (e.g., a
 * precomputed bundle of Bikkie data). For local dev, we just skip this and
 * return undefined, so the shim can start without external assets.
 */
export async function loadBakedTrayFromProd(): Promise<unknown> {
  log.warn(
    "loadBakedTrayFromProd: stubbed in local dev; skipping baked tray fetch."
  );
  return undefined;
}
