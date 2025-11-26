/**
 * Runtime spatial index builder for Believe's spatial query system.
 *
 * This module provides pure functions that build a spatial index from
 * RuntimeWorldView. All queries are deterministic and engine-agnostic.
 *
 * Phase 13: Stub implementations using simple filtering and distance checks.
 * No quadtree/octree, no physics, no complex algorithms.
 */

import type {
  AABB,
  RuntimeSpatialIndex,
} from "@/shared/world/runtime_spatial_index";
import type {
  RuntimePlacementView,
  RuntimeWorldView,
} from "@/shared/world/runtime_view";

/**
 * Build a runtime spatial index from world view (stub implementation).
 *
 * This is a pure function that constructs a spatial index for fast queries.
 *
 * Phase 13 behavior:
 * - Simple filtering for region/space queries
 * - Point-in-AABB tests for bounding box queries
 * - Euclidean distance for nearest queries
 * - No spatial data structures (quadtree/octree)
 *
 * Future implementations will:
 * - Add quadtree/octree for O(log n) queries
 * - Support oriented bounding boxes (OBB)
 * - Implement spatial hashing
 * - Add frustum culling
 * - Support incremental updates
 *
 * @param worldView - Runtime world view to index
 * @returns Spatial index for querying placements
 */
export function buildRuntimeSpatialIndex(
  worldView: RuntimeWorldView
): RuntimeSpatialIndex {
  // Store placements for queries
  const placements = worldView.placements;

  // Build spatial index with stub query implementations
  const spatialIndex: RuntimeSpatialIndex = {
    getPlacementsInRegion(regionId: string): readonly RuntimePlacementView[] {
      return placements.filter((p) => p.regionId === regionId);
    },

    getPlacementsInSpace(spaceId: string): readonly RuntimePlacementView[] {
      return placements.filter((p) => p.spaceId === spaceId);
    },

    getPlacementsInAABB(aabb: AABB): readonly RuntimePlacementView[] {
      return placements.filter((p) => {
        const pos = p.transform.position;
        return (
          pos.x >= aabb.min.x &&
          pos.x <= aabb.max.x &&
          pos.y >= aabb.min.y &&
          pos.y <= aabb.max.y &&
          pos.z >= aabb.min.z &&
          pos.z <= aabb.max.z
        );
      });
    },

    getNearestPlacements(
      position: { readonly x: number; readonly y: number; readonly z: number },
      limit: number = 10
    ): readonly RuntimePlacementView[] {
      // Compute squared distance for each placement
      const withDistance = placements.map((p) => {
        const pos = p.transform.position;
        const dx = pos.x - position.x;
        const dy = pos.y - position.y;
        const dz = pos.z - position.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        return { placement: p, distSq };
      });

      // Sort by distance (ascending)
      withDistance.sort((a, b) => a.distSq - b.distSq);

      // Return top N placements
      return withDistance.slice(0, limit).map((item) => item.placement);
    },

    getOverlappingPlacements(aabb: AABB): readonly RuntimePlacementView[] {
      // Phase 13: Same as getPlacementsInAABB (treat placements as points)
      return placements.filter((p) => {
        const pos = p.transform.position;
        return (
          pos.x >= aabb.min.x &&
          pos.x <= aabb.max.x &&
          pos.y >= aabb.min.y &&
          pos.y <= aabb.max.y &&
          pos.z >= aabb.min.z &&
          pos.z <= aabb.max.z
        );
      });
    },
  };

  return spatialIndex;
}
