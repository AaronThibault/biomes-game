/**
 * Runtime spatial index types for Believe's spatial query system.
 *
 * This module defines the spatial indexing interface for querying placements
 * by region, space, bounding box, proximity, and overlap. All queries are
 * pure, deterministic, and engine-agnostic.
 *
 * No physics engine, no ECS, no complex spatial data structures in Phase 13.
 */

import type { RuntimePlacementView } from "@/shared/world/runtime_view";

/**
 * Axis-Aligned Bounding Box (AABB).
 *
 * Represents a rectangular volume aligned with the world axes.
 */
export interface AABB {
  /** Minimum corner (lower-left-back) */
  readonly min: { readonly x: number; readonly y: number; readonly z: number };

  /** Maximum corner (upper-right-front) */
  readonly max: { readonly x: number; readonly y: number; readonly z: number };
}

/**
 * Spatial query parameters (future use).
 *
 * Unified query interface for complex spatial queries.
 */
export interface RuntimeSpatialQuery {
  /** Filter by region IDs */
  readonly regions?: readonly string[];

  /** Filter by space IDs */
  readonly spaces?: readonly string[];

  /** Filter by axis-aligned bounding box */
  readonly aabb?: AABB;

  /** Query point for nearest neighbor search */
  readonly position?: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };

  /** Maximum number of results for nearest queries */
  readonly nearestLimit?: number;
}

/**
 * Runtime spatial index for querying placements.
 *
 * Provides fast spatial queries over placements without requiring physics
 * engines or complex spatial data structures.
 *
 * Phase 13: Stub implementations using simple filtering and distance checks.
 * Future phases will add quadtree/octree and advanced spatial algorithms.
 */
export interface RuntimeSpatialIndex {
  /**
   * Get all placements in a specific region.
   *
   * @param regionId - Region identifier
   * @returns Placements in the region
   */
  getPlacementsInRegion(regionId: string): readonly RuntimePlacementView[];

  /**
   * Get all placements in a specific space.
   *
   * @param spaceId - Space identifier
   * @returns Placements in the space
   */
  getPlacementsInSpace(spaceId: string): readonly RuntimePlacementView[];

  /**
   * Get placements within an axis-aligned bounding box.
   *
   * Phase 13: Treats placements as points (uses transform.position).
   * Future: Will support actual bounding box overlap tests.
   *
   * @param aabb - Bounding box to query
   * @returns Placements inside the AABB
   */
  getPlacementsInAABB(aabb: AABB): readonly RuntimePlacementView[];

  /**
   * Get N nearest placements to a point.
   *
   * Phase 13: Uses simple Euclidean distance (squared).
   * Future: Will support k-d tree or spatial hash for efficiency.
   *
   * @param position - Query point
   * @param limit - Maximum number of results (default: 10)
   * @returns Nearest placements, sorted by distance
   */
  getNearestPlacements(
    position: { readonly x: number; readonly y: number; readonly z: number },
    limit?: number
  ): readonly RuntimePlacementView[];

  /**
   * Get placements overlapping a bounding box.
   *
   * Phase 13: Same as getPlacementsInAABB (treats placements as points).
   * Future: Will support actual bounding box overlap tests.
   *
   * @param aabb - Bounding box to test
   * @returns Overlapping placements
   */
  getOverlappingPlacements(aabb: AABB): readonly RuntimePlacementView[];
}
