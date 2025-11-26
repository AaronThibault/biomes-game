/**
 * Region streaming service API for Believe's snapshot and delta system.
 *
 * This module defines the service interface for snapshot and delta operations.
 * Phase 14 provides stub implementations only — actual snapshot generation
 * and delta computation will be added in future phases.
 *
 * No networking, no persistence, no ECS integration.
 */

import type {
  RegionDelta,
  RegionSnapshot,
  StreamingCursor,
  WorldDelta,
  WorldSnapshot,
} from "@/shared/world/region_streaming";

/**
 * Input parameters for getting a region snapshot.
 */
export interface GetRegionSnapshotInput {
  /** Region identifier */
  readonly regionId: string;

  /** Optional cursor position (defaults to latest) */
  readonly cursor?: StreamingCursor;
}

/**
 * Input parameters for getting a world snapshot.
 */
export interface GetWorldSnapshotInput {
  /** Optional region filter (if omitted, all regions) */
  readonly regionIds?: readonly string[];

  /** Optional cursor position (defaults to latest) */
  readonly cursor?: StreamingCursor;
}

/**
 * Input parameters for getting a region delta.
 */
export interface GetRegionDeltaInput {
  /** Region identifier */
  readonly regionId: string;

  /** Starting cursor position */
  readonly fromCursor: StreamingCursor;

  /** Optional ending cursor position (defaults to latest) */
  readonly toCursor?: StreamingCursor;
}

/**
 * Input parameters for getting a world delta.
 */
export interface GetWorldDeltaInput {
  /** Optional region filter (if omitted, all regions) */
  readonly regionIds?: readonly string[];

  /** Starting cursor position */
  readonly fromCursor: StreamingCursor;

  /** Optional ending cursor position (defaults to latest) */
  readonly toCursor?: StreamingCursor;
}

/**
 * Service interface for region streaming operations.
 *
 * Provides snapshot and delta queries for runtime consumption.
 * Future implementations will integrate with RuntimeWorldView and
 * persistence layer.
 */
export interface RegionStreamingService {
  /**
   * Get complete region state at cursor.
   *
   * Future implementations will:
   * - Load region from RuntimeWorldView
   * - Filter placements by region
   * - Generate snapshot at specified cursor
   *
   * @param input - Get parameters
   * @returns Promise resolving to RegionSnapshot
   */
  getRegionSnapshot(input: GetRegionSnapshotInput): Promise<RegionSnapshot>;

  /**
   * Get complete world state at cursor.
   *
   * Future implementations will:
   * - Load all regions from RuntimeWorldView
   * - Filter by regionIds if specified
   * - Generate snapshots for each region
   *
   * @param input - Get parameters
   * @returns Promise resolving to WorldSnapshot
   */
  getWorldSnapshot(input: GetWorldSnapshotInput): Promise<WorldSnapshot>;

  /**
   * Get region changes between cursors.
   *
   * Future implementations will:
   * - Load region state at fromCursor and toCursor
   * - Compute diff (added, updated, removed)
   * - Return delta
   *
   * @param input - Get parameters
   * @returns Promise resolving to RegionDelta
   */
  getRegionDelta(input: GetRegionDeltaInput): Promise<RegionDelta>;

  /**
   * Get world changes between cursors.
   *
   * Future implementations will:
   * - Load world state at fromCursor and toCursor
   * - Compute deltas for each region
   * - Return world delta
   *
   * @param input - Get parameters
   * @returns Promise resolving to WorldDelta
   */
  getWorldDelta(input: GetWorldDeltaInput): Promise<WorldDelta>;
}

/**
 * Get region snapshot (stub implementation).
 *
 * This is a pure stub that returns a placeholder snapshot.
 * Future implementations will:
 * - Load region from RuntimeWorldView
 * - Filter placements by region
 * - Generate snapshot at specified cursor
 *
 * @param input - Get parameters
 * @returns Promise resolving to placeholder RegionSnapshot
 */
export async function getRegionSnapshotStub(
  input: GetRegionSnapshotInput
): Promise<RegionSnapshot> {
  // TODO: Replace with real snapshot generation
  const syntheticCursor = input.cursor || `cursor-${Date.now()}`;

  const snapshot: RegionSnapshot = {
    id: `snapshot-${input.regionId}-${Date.now()}`,
    regionId: input.regionId,
    cursor: syntheticCursor,
    placements: [], // Empty list (stub)
    createdAt: new Date(),
    metadata: {
      stub: true,
      message: "Stub implementation - no actual placements",
    },
  };

  return snapshot;
}

/**
 * Get world snapshot (stub implementation).
 *
 * This is a pure stub that returns a placeholder snapshot.
 * Future implementations will:
 * - Load all regions from RuntimeWorldView
 * - Filter by regionIds if specified
 * - Generate snapshots for each region
 *
 * @param input - Get parameters
 * @returns Promise resolving to placeholder WorldSnapshot
 */
export async function getWorldSnapshotStub(
  input: GetWorldSnapshotInput
): Promise<WorldSnapshot> {
  // TODO: Replace with real snapshot generation
  const syntheticCursor = input.cursor || `cursor-${Date.now()}`;

  const snapshot: WorldSnapshot = {
    id: `world-snapshot-${Date.now()}`,
    cursor: syntheticCursor,
    regions: [], // Empty list (stub)
    createdAt: new Date(),
    metadata: {
      stub: true,
      message: "Stub implementation - no actual regions",
      requestedRegions: input.regionIds,
    },
  };

  return snapshot;
}

/**
 * Get region delta (stub implementation).
 *
 * This is a pure stub that returns an empty delta.
 * Future implementations will:
 * - Load region state at fromCursor and toCursor
 * - Compute diff (added, updated, removed)
 * - Return delta
 *
 * @param input - Get parameters
 * @returns Promise resolving to placeholder RegionDelta
 */
export async function getRegionDeltaStub(
  input: GetRegionDeltaInput
): Promise<RegionDelta> {
  // TODO: Replace with real delta computation
  const syntheticToCursor = input.toCursor || `cursor-${Date.now()}`;

  const delta: RegionDelta = {
    regionId: input.regionId,
    fromCursor: input.fromCursor,
    toCursor: syntheticToCursor,
    added: [], // Empty (stub)
    updated: [], // Empty (stub)
    removed: [], // Empty (stub)
    metadata: {
      stub: true,
      message: "Stub implementation - no actual changes",
    },
  };

  return delta;
}

/**
 * Get world delta (stub implementation).
 *
 * This is a pure stub that returns an empty delta.
 * Future implementations will:
 * - Load world state at fromCursor and toCursor
 * - Compute deltas for each region
 * - Return world delta
 *
 * @param input - Get parameters
 * @returns Promise resolving to placeholder WorldDelta
 */
export async function getWorldDeltaStub(
  input: GetWorldDeltaInput
): Promise<WorldDelta> {
  // TODO: Replace with real delta computation
  const syntheticToCursor = input.toCursor || `cursor-${Date.now()}`;

  const delta: WorldDelta = {
    fromCursor: input.fromCursor,
    toCursor: syntheticToCursor,
    regions: [], // Empty (stub)
    metadata: {
      stub: true,
      message: "Stub implementation - no actual region deltas",
      requestedRegions: input.regionIds,
    },
  };

  return delta;
}
