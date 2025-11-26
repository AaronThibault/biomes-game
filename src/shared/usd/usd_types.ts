/**
 * USD types for Believe's OpenUSD integration.
 *
 * This module defines TypeScript representations of USD concepts (not actual USD API).
 * These types serve as contracts for future USD file generation and provide a
 * type-safe interface for mapping Believe data structures to USD schemas.
 *
 * No USD SDK calls or file I/O are performed in this module.
 */

/**
 * Unique identifier for a USD Stage.
 * A stage represents the entire Believe world state.
 */
export type UsdStageIdentifier = string;

/**
 * Unique identifier for a USD Layer.
 * Layers are composited to form the final stage.
 */
export type UsdLayerIdentifier = string;

/**
 * USD prim path following USD path syntax.
 * Example: "/World/Regions/region-forest/Spaces/space-clearing/Placements/Placement_123"
 */
export type UsdPrimPath = string;

/**
 * Believe-specific metadata stored in USD prims.
 *
 * All metadata uses the "believe:" namespace to avoid conflicts with
 * standard USD metadata.
 */
export interface BelieveUsdMetadata {
  /** Region identifier */
  readonly regionId?: string;

  /** Space identifier */
  readonly spaceId?: string;

  /** Placement identifier */
  readonly placementId?: string;

  /** Classification tags */
  readonly tags?: readonly string[];

  /** Access control mode (OPEN, TEACHER_CONTROLLED, etc.) */
  readonly accessMode?: string;

  /** Source asset identifier (for placements) */
  readonly sourceAssetId?: string;

  /** User ID of creator */
  readonly createdByUserId?: string;

  /** Optional notes or description */
  readonly notes?: string;
}

/**
 * Role of a USD layer in the Believe layer stack.
 *
 * Determines how the layer is used in composition and what content it contains.
 */
export enum UsdLayerRole {
  /** Base authoritative world definition */
  BASE = "BASE",

  /** Draft editing session layer (Phase 5) */
  DRAFT = "DRAFT",

  /** Committed changes layer (Phase 6) */
  COMMIT = "COMMIT",

  /** Validation results layer (Phase 7) */
  VALIDATION = "VALIDATION",

  /** Collaboration metadata layer (Phase 8) */
  COLLAB = "COLLAB",

  /** Other or custom layer */
  OTHER = "OTHER",
}

/**
 * Descriptor for a USD layer.
 *
 * Represents metadata about a layer without the actual USD layer content.
 */
export interface UsdLayerDescriptor {
  /** Unique layer identifier */
  readonly id: UsdLayerIdentifier;

  /** Role of this layer in the composition stack */
  readonly role: UsdLayerRole;

  /** Optional human-readable description */
  readonly description?: string;

  /** Timestamp when layer was created */
  readonly createdAt: Date;

  /** Optional user ID of layer creator */
  readonly createdByUserId?: string;

  /** Optional extensible metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Descriptor for a USD prim.
 *
 * Represents the structure and metadata of a USD prim without the actual USD prim object.
 */
export interface UsdPrimDescriptor {
  /** USD prim path */
  readonly path: UsdPrimPath;

  /**
   * USD prim type.
   * Common types: "Xform", "Scope", "Mesh", "Camera", etc.
   */
  readonly type: string;

  /** Optional Believe-specific metadata */
  readonly metadata?: BelieveUsdMetadata;

  /** Optional child prims */
  readonly children?: readonly UsdPrimDescriptor[];
}
