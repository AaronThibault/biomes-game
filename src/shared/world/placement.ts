/**
 * Asset placement types for Believe.
 *
 * This module defines how assets are placed into the world, linking
 * BelieveAssets to Regions/Spaces with transforms and metadata.
 *
 * These types are contracts for future systems (runtime, editors, platform)
 * and remain independent of actual placement storage or spawning logic.
 */

import type { BelieveAssetId } from "@/shared/assets/types";

/**
 * Unique identifier for an asset placement instance.
 */
export type PlacementId = string;

/**
 * 3D transform defining position, rotation, and scale.
 *
 * Coordinate system: Right-handed, Y-up
 * - X-axis: Right (positive) / Left (negative)
 * - Y-axis: Up (positive) / Down (negative)
 * - Z-axis: Forward (positive) / Backward (negative)
 *
 * Rotations are Euler angles in degrees.
 */
export interface Transform {
  /** Position in world coordinates (meters) */
  readonly position: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };

  /** Rotation as Euler angles (degrees) */
  readonly rotation: {
    /** Pitch (nodding) */
    readonly x: number;
    /** Yaw (turning) */
    readonly y: number;
    /** Roll (tilting) */
    readonly z: number;
  };

  /** Scale as multipliers (1.0 = original size) */
  readonly scale: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
}

/**
 * An asset placement instance in the world.
 *
 * Links a BelieveAsset to a Region and/or Space with a transform.
 * Placements are declarative metadata, not runtime instances.
 */
export interface AssetPlacement {
  /** Unique identifier for this placement */
  readonly id: PlacementId;

  /** Reference to the asset being placed */
  readonly assetId: BelieveAssetId;

  /**
   * Target region for this placement (optional).
   * Provides coarse-grained location and streaming context.
   */
  readonly regionId?: string;

  /**
   * Target space for this placement (optional).
   * Provides fine-grained location within a region.
   * At least one of regionId or spaceId should be specified.
   */
  readonly spaceId?: string;

  /** Position, rotation, and scale in world coordinates */
  readonly transform: Transform;

  /** Arbitrary tags for classification and filtering */
  readonly tags: readonly string[];

  /**
   * Optional hint for level-of-detail selection.
   * Examples: "high", "medium", "low", "auto"
   */
  readonly lodHint?: string;

  /**
   * Optional loading/rendering priority.
   * Higher values load first. Used for streaming optimization.
   */
  readonly priority?: number;
}

/**
 * Registry interface for asset placement storage and retrieval.
 *
 * This is a contract only — no implementation is provided in this phase.
 * Future systems (database, cache, runtime) will implement this interface.
 */
export interface AssetPlacementRegistry {
  /**
   * List all placements in a region.
   *
   * @param regionId - Region identifier
   * @returns Promise resolving to array of placements in the region
   */
  listPlacementsForRegion(regionId: string): Promise<readonly AssetPlacement[]>;

  /**
   * Get a specific placement by ID.
   *
   * @param id - Placement identifier
   * @returns Promise resolving to the placement, or null if not found
   */
  getPlacementById(id: PlacementId): Promise<AssetPlacement | null>;

  /**
   * Register a new placement.
   *
   * Future implementations should:
   * - Validate the placement (bounds, collisions, permissions)
   * - Store in persistent storage
   * - Update spatial indices for streaming
   *
   * @param placement - Placement to register
   * @returns Promise resolving to the registered placement (may include generated ID)
   */
  registerPlacement(placement: AssetPlacement): Promise<AssetPlacement>;
}
