/**
 * Runtime asset binding types for Believe's asset loading system.
 *
 * This module defines contracts for bridging BelieveAsset and RuntimeWorldView
 * to engine-facing asset handles, providing load state visibility without
 * integrating with specific engine SDKs or performing actual I/O.
 *
 * Phase 17: Contract-level types only, no engine integration or I/O.
 */

import type { PlanNodeId } from "@/shared/plan/plan_types";

/**
 * Current state of asset loading.
 */
export enum RuntimeAssetLoadState {
  /** Asset not yet requested */
  UNLOADED = "UNLOADED",

  /** Asset loading in progress */
  LOADING = "LOADING",

  /** Asset loaded and ready for use */
  READY = "READY",

  /** Asset loading failed (missing, corrupt, etc.) */
  FAILED = "FAILED",
}

/**
 * Unique identifier for a runtime asset handle.
 */
export type RuntimeAssetHandleId = string;

/**
 * Unique identifier for a runtime asset binding.
 */
export type RuntimeAssetBindingId = string;

/**
 * Engine-agnostic reference to a loaded resource.
 *
 * Represents a single engine-specific resource (mesh, texture, etc.)
 * with load state and metadata.
 */
export interface RuntimeAssetHandle {
  /** Unique handle identifier */
  readonly id: RuntimeAssetHandleId;

  /** BelieveAsset identifier */
  readonly assetId: string;

  /** Optional source type (e.g., "USD", "GLTF", "UE_ASSET") */
  readonly sourceType?: string;

  /** Current load state */
  readonly loadState: RuntimeAssetLoadState;

  /** When handle was last updated */
  readonly lastUpdatedAt?: Date;

  /** Engine-specific hints (paths, options, etc.) */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Binding between assetId and one or more handles.
 *
 * Maps a logical asset (BelieveAsset) to engine resources (handles),
 * with aggregate load state and optional USD/PlanGraph references.
 */
export interface RuntimeAssetBinding {
  /** Unique binding identifier */
  readonly id: RuntimeAssetBindingId;

  /** BelieveAsset identifier */
  readonly assetId: string;

  /** Array of engine-specific handles */
  readonly handles: readonly RuntimeAssetHandle[];

  /**
   * Aggregate load state.
   *
   * - READY: All handles are READY
   * - LOADING: At least one handle is LOADING
   * - FAILED: At least one handle is FAILED
   * - UNLOADED: All handles are UNLOADED
   */
  readonly loadState: RuntimeAssetLoadState;

  /** True if no known way to resolve this asset */
  readonly missing?: boolean;

  /** Error message if FAILED */
  readonly errorMessage?: string;

  /** Optional link to USD prim (Phase 9) */
  readonly usdPrimPath?: string;

  /** Optional link to PlanGraph node (Phase 10) */
  readonly planNodeId?: PlanNodeId;

  /** Optional extensible metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Collection of bindings derived from RuntimeWorldView.
 *
 * Represents all asset bindings for a given world state.
 */
export interface RuntimeAssetBindingSet {
  /** Optional semantic version/label */
  readonly worldVersion?: string;

  /** Array of asset bindings */
  readonly bindings: readonly RuntimeAssetBinding[];
}
