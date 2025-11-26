/**
 * Runtime engine adapter types for Believe's engine integration system.
 *
 * This module defines contracts for engine-agnostic consumption of
 * RuntimeWorldView, enabling Biomes, Unreal Engine, Unity, WebGL, and
 * other engines to integrate with Believe's world state.
 *
 * Phase 16: Contract-level types only, no engine integration.
 */

import type { DebugEvent } from "@/shared/runtime/debug";
import type { PlacementId } from "@/shared/world/placement";

/**
 * Unique identifier for a given adapter implementation.
 *
 * Examples: "biomes-ecs", "ue5-bridge", "webgl-renderer", "noop"
 */
export type EngineAdapterId = string;

/**
 * How to apply world view to engine.
 */
export enum EngineApplyMode {
  /** Full rebuild/re-apply of view (clear and recreate all instances) */
  FULL = "FULL",

  /** Apply only diffs (add/update/remove changed placements) */
  INCREMENTAL = "INCREMENTAL",
}

/**
 * Mapping of Believe placement to engine instance.
 *
 * Tracks the relationship between a placement and its corresponding
 * engine-specific instance (entity, actor, mesh, etc.).
 */
export interface EnginePlacementInstanceRef {
  /** Believe placement identifier */
  readonly placementId: PlacementId;

  /** Engine-specific instance identifier (entity ID, actor ID, etc.) */
  readonly instanceId: string;

  /** Optional region context */
  readonly regionId?: string;

  /** Optional space context */
  readonly spaceId?: string;
}

/**
 * Configuration for world view application.
 *
 * Controls how and what to apply when consuming RuntimeWorldView.
 */
export interface EngineApplyOptions {
  /** Apply mode (FULL or INCREMENTAL, default: FULL) */
  readonly mode?: EngineApplyMode;

  /** Filter by region IDs (only apply placements in these regions) */
  readonly onlyRegions?: readonly string[];

  /** Filter by space IDs (only apply placements in these spaces) */
  readonly onlySpaces?: readonly string[];

  /** Filter by placement tags (only apply placements with these tags) */
  readonly onlyTags?: readonly string[];

  /** Only apply valid placements (skip invalid placements) */
  readonly onlyValid?: boolean;

  /** Compute result without applying to engine (preview mode) */
  readonly dryRun?: boolean;
}

/**
 * Diagnostic information from apply operation.
 *
 * Provides debug events, notes, and metadata for troubleshooting.
 */
export interface EngineApplyDiagnostics {
  /** Optional debug events (Phase 15) */
  readonly debugEvents?: readonly DebugEvent[];

  /** Human-readable notes */
  readonly notes?: string;

  /** Optional extensible metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Result of applying world view to engine.
 *
 * Contains instance refs, change tracking, and optional diagnostics.
 */
export interface EngineApplyResult {
  /** Adapter that produced this result */
  readonly adapterId: EngineAdapterId;

  /** Optional semantic version/label of applied world */
  readonly appliedWorldVersion?: string;

  /** All current instances after apply */
  readonly instances: readonly EnginePlacementInstanceRef[];

  /** Instances added during apply */
  readonly added: readonly EnginePlacementInstanceRef[];

  /** Instances updated during apply */
  readonly updated: readonly EnginePlacementInstanceRef[];

  /** Instances removed during apply */
  readonly removed: readonly EnginePlacementInstanceRef[];

  /** Optional diagnostic information */
  readonly diagnostics?: EngineApplyDiagnostics;
}
