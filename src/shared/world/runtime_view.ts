/**
 * Runtime view types for Believe's runtime-facing read model.
 *
 * This module defines the flattened, consumption-ready representation of the
 * current live world state. The Runtime View is derived from editing structures
 * (Regions, Spaces, Placements) and optimized for game engine consumption.
 *
 * No ECS integration, chunk streaming, or Biomes-specific runtime hooks.
 */

import type { PlacementId, Transform } from "@/shared/world/placement";
import type { Region } from "@/shared/world/space";

/**
 * A single placement in the runtime world.
 *
 * Represents a flattened view of an AssetPlacement with validity flags
 * for runtime consumption.
 */
export interface RuntimePlacementView {
  /** Unique placement identifier */
  readonly placementId: PlacementId;

  /** Asset identifier for loading geometry/materials */
  readonly assetId: string;

  /** Optional region ID for spatial context */
  readonly regionId?: string;

  /** Optional space ID for spatial context */
  readonly spaceId?: string;

  /** Final world-space transform (position, rotation, scale) */
  readonly transform: Transform;

  /** Classification tags for filtering and queries */
  readonly tags: readonly string[];

  /**
   * Whether this placement passed validation.
   * If false, runtime may skip rendering or apply special handling.
   */
  readonly isValid: boolean;

  /**
   * Whether this placement has non-blocking validation warnings.
   * Runtime may display warnings or apply degraded rendering.
   */
  readonly hasWarnings: boolean;

  /**
   * Optional array of validation issue IDs.
   * References issues from ValidationResult for debugging.
   */
  readonly validationIssueIds?: readonly string[];
}

/**
 * The complete runtime world state.
 *
 * Provides a flattened, read-only view of all regions and placements
 * suitable for game engine consumption.
 */
export interface RuntimeWorldView {
  /** Array of all regions (spatial partitioning) */
  readonly regions: readonly Region[];

  /** Flattened array of all placements */
  readonly placements: readonly RuntimePlacementView[];
}
