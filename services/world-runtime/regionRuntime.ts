/**
 * Believe Region Runtime Wrapper
 *
 * This module provides a thin abstraction layer over Biomes' chunk/streaming system
 * for managing Believe regions. Currently contains stub implementations that will
 * be wired to actual Biomes world loading code in future iterations.
 */

import type { Region } from "@/shared/world/space";

/**
 * BelieveRegion wraps a Region with Biomes-specific runtime data.
 *
 * This type will eventually contain references to:
 * - Biomes chunk IDs
 * - World coordinates
 * - Streaming boundaries
 * - Active entity references
 */
export interface BelieveRegion {
  /** The core region data */
  readonly region: Region;

  /**
   * Opaque Biomes-specific identifiers.
   * These will map to actual chunk IDs or world IDs once integrated.
   */
  readonly biomesChunkIds: readonly string[];

  /**
   * Optional world coordinate bounds.
   * Format TBD based on Biomes coordinate system.
   */
  readonly worldBounds?: {
    readonly minX: number;
    readonly minY: number;
    readonly minZ: number;
    readonly maxX: number;
    readonly maxY: number;
    readonly maxZ: number;
  };
}

/**
 * Load a region by its ID.
 *
 * TODO: Implement actual loading logic that:
 * 1. Queries region metadata from storage
 * 2. Maps region to Biomes chunk IDs
 * 3. Initializes streaming boundaries
 * 4. Returns fully populated BelieveRegion
 *
 * @param id - Unique region identifier
 * @returns Promise resolving to the loaded region
 * @throws Error indicating not yet implemented
 */
export async function loadRegionById(id: string): Promise<BelieveRegion> {
  // TODO: Wire to Biomes world/chunk loading system
  // This should:
  // - Load region metadata from storage (DB, config, etc.)
  // - Map spaces to Biomes chunks
  // - Set up streaming boundaries
  // - Return BelieveRegion with actual chunk references
  throw new Error(
    `loadRegionById not implemented yet. Requested region: ${id}`
  );
}

/**
 * List all available regions.
 *
 * TODO: Implement actual listing logic that:
 * 1. Queries all region metadata from storage
 * 2. Maps each region to its Biomes chunks
 * 3. Returns array of BelieveRegions
 *
 * @returns Promise resolving to array of all regions
 * @throws Error indicating not yet implemented
 */
export async function listRegions(): Promise<BelieveRegion[]> {
  // TODO: Wire to Biomes world/chunk loading system
  // This should:
  // - Query all available regions from storage
  // - Map each to BelieveRegion instances
  // - Include chunk references and bounds
  throw new Error("listRegions not implemented yet");
}
