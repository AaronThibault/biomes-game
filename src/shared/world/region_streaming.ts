/**
 * Region streaming types for Believe's snapshot and delta system.
 *
 * This module defines contracts for region/world snapshots and deltas,
 * enabling runtime systems to stream world state efficiently without
 * networking, persistence, or ECS integration.
 *
 * Phase 14: Contract-level types only, no implementation.
 */

import type { PlacementId } from "@/shared/world/placement";
import type { RuntimePlacementView } from "@/shared/world/runtime_view";

/**
 * Opaque position in change history.
 *
 * Not a timestamp — may be version number, hash, or sequence ID.
 * Used to request snapshots/deltas "since cursor X".
 */
export type StreamingCursor = string;

/**
 * Unique identifier for a region snapshot.
 */
export type RegionSnapshotId = string;

/**
 * Unique identifier for a world snapshot.
 */
export type WorldSnapshotId = string;

/**
 * Complete state of a single region at a point in time.
 *
 * Contains all placements in the region at the specified cursor.
 */
export interface RegionSnapshot {
  /** Unique snapshot identifier */
  readonly id: RegionSnapshotId;

  /** Region this snapshot represents */
  readonly regionId: string;

  /** Position in change history */
  readonly cursor: StreamingCursor;

  /** All placements in region at this cursor */
  readonly placements: readonly RuntimePlacementView[];

  /** When this snapshot was created */
  readonly createdAt: Date;

  /** Optional extensible metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Complete state of multiple regions at a point in time.
 *
 * Contains snapshots for all requested regions at the specified cursor.
 */
export interface WorldSnapshot {
  /** Unique snapshot identifier */
  readonly id: WorldSnapshotId;

  /** Global position in change history */
  readonly cursor: StreamingCursor;

  /** Array of region snapshots */
  readonly regions: readonly RegionSnapshot[];

  /** When this snapshot was created */
  readonly createdAt: Date;

  /** Optional extensible metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Changes to a single region between two cursors.
 *
 * Contains added, updated, and removed placements since fromCursor.
 */
export interface RegionDelta {
  /** Region this delta applies to */
  readonly regionId: string;

  /** Starting position in change history */
  readonly fromCursor: StreamingCursor;

  /** Ending position in change history */
  readonly toCursor: StreamingCursor;

  /** Placements added since fromCursor */
  readonly added: readonly RuntimePlacementView[];

  /** Placements modified since fromCursor */
  readonly updated: readonly RuntimePlacementView[];

  /** Placement IDs removed since fromCursor */
  readonly removed: readonly PlacementId[];

  /** Optional extensible metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Changes to multiple regions between two cursors.
 *
 * Contains deltas for all requested regions.
 */
export interface WorldDelta {
  /** Global starting position in change history */
  readonly fromCursor: StreamingCursor;

  /** Global ending position in change history */
  readonly toCursor: StreamingCursor;

  /** Array of region deltas */
  readonly regions: readonly RegionDelta[];

  /** Optional extensible metadata */
  readonly metadata?: Record<string, unknown>;
}
