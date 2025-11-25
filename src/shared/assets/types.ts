/**
 * Core type definitions for Believe's asset ingestion and management system.
 *
 * This module defines the canonical representation of assets in the pipeline,
 * from initial import through processing stages to final publication.
 * These types are foundational and remain independent of auth, user, or
 * runtime-specific implementation details.
 */

/**
 * Classification of asset source types.
 * Indicates where the asset originated from.
 */
export enum AssetSourceType {
  /** Digital Content Creation tools (Blender, Unreal, Unity, Houdini, etc.) */
  DCC_TOOL = "DCC_TOOL",
  /** Photogrammetry or LIDAR scan captures */
  SCAN_CAPTURE = "SCAN_CAPTURE",
  /** Neural Radiance Field (NERF) representation */
  NERF = "NERF",
  /** AI-generated mesh (Meshy, procedural generators, etc.) */
  AI_MESH = "AI_MESH",
  /** Other or unknown source type */
  OTHER = "OTHER",
}

/**
 * Processing stage in the asset pipeline.
 * Tracks where an asset is in the ingestion workflow.
 */
export enum AssetProcessingStage {
  /** Initial import, no processing applied */
  RAW = "RAW",
  /** File parsed and validated */
  IMPORTED = "IMPORTED",
  /** Coordinate system and scale corrected */
  NORMALIZED = "NORMALIZED",
  /** Art style and materials applied */
  STYLIZED = "STYLIZED",
  /** Fully processed and ready for use */
  READY = "READY",
}

/**
 * Current status of asset processing.
 * Indicates whether processing is ongoing, completed, or failed.
 */
export enum AssetStatus {
  /** Awaiting processing */
  PENDING = "PENDING",
  /** Currently being processed */
  PROCESSING = "PROCESSING",
  /** Processing failed with errors */
  FAILED = "FAILED",
  /** Processing completed successfully */
  COMPLETED = "COMPLETED",
}

/**
 * Unique identifier for a Believe asset.
 * Currently a string, may be refined to a more specific type later.
 */
export type BelieveAssetId = string;

/**
 * Core metadata for a Believe asset.
 * Represents an asset at any stage of the ingestion pipeline.
 *
 * This interface contains only metadata, not the actual asset payload
 * (meshes, textures, etc.), which are stored separately.
 */
export interface BelieveAsset {
  /** Unique identifier for this asset */
  readonly id: BelieveAssetId;

  /** Source type indicating where the asset originated */
  readonly sourceType: AssetSourceType;

  /** Original file path or URI (optional) */
  readonly originalPath?: string;

  /** Timestamp when the asset was first created/imported */
  readonly createdAt: Date;

  /** Timestamp when the asset was last updated */
  readonly updatedAt: Date;

  /** Current processing stage in the pipeline */
  readonly processingStage: AssetProcessingStage;

  /** Current processing status */
  readonly status: AssetStatus;

  /** Error message if status is FAILED (optional) */
  readonly errorMessage?: string;

  /** Arbitrary tags for categorization and filtering */
  readonly tags: readonly string[];

  /**
   * Optional reference to a space where this asset will be placed.
   * This is a lightweight reference (just an ID string) to avoid
   * circular dependencies with the world/space module.
   * Actual placement logic is handled separately.
   */
  readonly spaceId?: string;
}
