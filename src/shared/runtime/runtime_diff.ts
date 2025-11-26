/**
 * Runtime Diff Engine for deterministic RuntimeWorldView comparison.
 *
 * This module provides pure TypeScript functions to compute structural diffs
 * between two RuntimeWorldView instances. All functions are deterministic,
 * side-effect-free, and produce canonically ordered results.
 *
 * **Design Principles:**
 * - Pure functions only (no side effects)
 * - Deterministic output (same inputs → same output)
 * - Canonical ordering (sorted by placementId ascending)
 * - Strict structural equality (no epsilon tolerances)
 * - No I/O, networking, or persistence
 *
 * Phase 21: Deterministic Runtime Diff Engine (Engine Adapter v2)
 */

import type { PlacementId } from "@/shared/world/placement";
import type {
  RuntimePlacementView,
  RuntimeWorldView,
} from "@/shared/world/runtime_view";

/**
 * Diff result for a single placement.
 *
 * Represents a placement that was added, removed, or updated between
 * two RuntimeWorldView snapshots.
 */
export interface RuntimePlacementDiff {
  /** The placement ID */
  readonly placementId: PlacementId;

  /** Placement state before (undefined if added) */
  readonly before?: RuntimePlacementView;

  /** Placement state after (undefined if removed) */
  readonly after?: RuntimePlacementView;
}

/**
 * Diff result for an entire RuntimeWorldView.
 *
 * Contains all added, removed, and updated placements with canonical ordering.
 */
export interface RuntimeWorldDiff {
  /** Placements that were added (not in before, present in after) */
  readonly added: readonly RuntimePlacementDiff[];

  /** Placements that were removed (present in before, not in after) */
  readonly removed: readonly RuntimePlacementDiff[];

  /** Placements that were updated (present in both, but differ structurally) */
  readonly updated: readonly RuntimePlacementDiff[];

  /** Optional world version before diff */
  readonly worldVersionBefore?: string;

  /** Optional world version after diff */
  readonly worldVersionAfter?: string;
}

/**
 * Compare two Vec3-like objects for exact equality.
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns true if all components are exactly equal
 */
function areVec3Equal(
  a: { readonly x: number; readonly y: number; readonly z: number },
  b: { readonly x: number; readonly y: number; readonly z: number }
): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

/**
 * Compare two arrays for exact equality (order matters).
 *
 * @param a - First array
 * @param b - Second array
 * @returns true if arrays have same length and all elements are equal
 */
function areArraysEqual<T>(
  a: readonly T[] | undefined,
  b: readonly T[] | undefined
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

/**
 * Compare two RuntimePlacementView instances for structural equality.
 *
 * Performs deep comparison of all fields:
 * - placementId
 * - assetId
 * - regionId
 * - spaceId
 * - transform (position, rotation, scale)
 * - tags
 * - isValid
 * - hasWarnings
 * - validationIssueIds
 *
 * Uses exact equality for all comparisons (no epsilon tolerances).
 *
 * @param a - First placement view
 * @param b - Second placement view
 * @returns true if placements are structurally identical
 */
export function areRuntimePlacementsEqual(
  a: RuntimePlacementView,
  b: RuntimePlacementView
): boolean {
  // Compare primitive fields
  if (a.placementId !== b.placementId) return false;
  if (a.assetId !== b.assetId) return false;
  if (a.regionId !== b.regionId) return false;
  if (a.spaceId !== b.spaceId) return false;
  if (a.isValid !== b.isValid) return false;
  if (a.hasWarnings !== b.hasWarnings) return false;

  // Compare transform (position, rotation, scale)
  if (!areVec3Equal(a.transform.position, b.transform.position)) return false;
  if (!areVec3Equal(a.transform.rotation, b.transform.rotation)) return false;
  if (!areVec3Equal(a.transform.scale, b.transform.scale)) return false;

  // Compare tags array
  if (!areArraysEqual(a.tags, b.tags)) return false;

  // Compare validationIssueIds array
  if (!areArraysEqual(a.validationIssueIds, b.validationIssueIds)) return false;

  return true;
}

/**
 * Compute a deterministic diff between two RuntimeWorldView instances.
 *
 * **Diff Rules:**
 * - **Added**: placementId in `after` but not in `before`
 * - **Removed**: placementId in `before` but not in `after`
 * - **Updated**: placementId in both, but `!areRuntimePlacementsEqual()`
 *
 * **Canonical Ordering:**
 * All result arrays are sorted by `placementId` in ascending lexicographic order.
 *
 * **Determinism:**
 * Same inputs always produce the same output. No randomness, timestamps, or
 * external state.
 *
 * @param before - The previous world state
 * @param after - The new world state
 * @returns RuntimeWorldDiff with added, removed, and updated placements
 */
export function diffRuntimeWorldViews(
  before: RuntimeWorldView,
  after: RuntimeWorldView
): RuntimeWorldDiff {
  // Build maps for O(1) lookup
  const beforeMap = new Map<PlacementId, RuntimePlacementView>();
  const afterMap = new Map<PlacementId, RuntimePlacementView>();

  for (const placement of before.placements) {
    beforeMap.set(placement.placementId, placement);
  }

  for (const placement of after.placements) {
    afterMap.set(placement.placementId, placement);
  }

  const added: RuntimePlacementDiff[] = [];
  const removed: RuntimePlacementDiff[] = [];
  const updated: RuntimePlacementDiff[] = [];

  // Identify added and updated
  for (const [placementId, afterPlacement] of afterMap) {
    const beforePlacement = beforeMap.get(placementId);

    if (!beforePlacement) {
      // Added: in after but not in before
      added.push({
        placementId,
        after: afterPlacement,
      });
    } else {
      // Check if updated
      if (!areRuntimePlacementsEqual(beforePlacement, afterPlacement)) {
        updated.push({
          placementId,
          before: beforePlacement,
          after: afterPlacement,
        });
      }
    }
  }

  // Identify removed
  for (const [placementId, beforePlacement] of beforeMap) {
    if (!afterMap.has(placementId)) {
      // Removed: in before but not in after
      removed.push({
        placementId,
        before: beforePlacement,
      });
    }
  }

  // Sort all arrays by placementId ascending (canonical ordering)
  const sortByPlacementId = (
    a: RuntimePlacementDiff,
    b: RuntimePlacementDiff
  ) => a.placementId.localeCompare(b.placementId);

  added.sort(sortByPlacementId);
  removed.sort(sortByPlacementId);
  updated.sort(sortByPlacementId);

  return {
    added,
    removed,
    updated,
  };
}
