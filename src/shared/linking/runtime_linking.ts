/**
 * Runtime Linking Module for USD ↔ PlanGraph ↔ Runtime introspection.
 *
 * This module provides pure TypeScript functions to derive and index linkages
 * between runtime placements and their corresponding:
 * - USD prim paths (OpenUSD canonical state)
 * - PlanGraph node IDs (design intent / .plan history)
 *
 * This is introspection-only: no USD SDK calls, no .plan file I/O, no persistence.
 * All functions are pure, deterministic, and side-effect-free.
 *
 * **Convention References:**
 * - USD prim path conventions from `docs/usd_integration_model.md`
 * - PlanGraph node ID conventions from `src/shared/plan/plan_mapping.ts`
 *
 * Phase 20: USD ↔ PlanGraph ↔ Runtime Linkage (Introspection Wiring Only)
 */

import type { PlanNodeId } from "@/shared/plan/plan_types";
import type { AssetPlacement, PlacementId } from "@/shared/world/placement";
import type { RuntimePlacementView } from "@/shared/world/runtime_view";
import type { Region } from "@/shared/world/space";

/**
 * Linkage data for a single placement.
 */
export interface PlacementLinkage {
  readonly placementId: PlacementId;
  readonly usdPrimPath: string;
  readonly planNodeId: PlanNodeId;
}

/**
 * Linkage data for a single region.
 */
export interface RegionLinkage {
  readonly regionId: string;
  readonly usdPrimPath: string;
  readonly planNodeId: PlanNodeId;
}

/**
 * Linkage data for a single space.
 */
export interface SpaceLinkage {
  readonly spaceId: string;
  readonly regionId: string;
  readonly usdPrimPath: string;
  readonly planNodeId: PlanNodeId;
}

/**
 * Index structure mapping IDs to their USD/PlanGraph linkages.
 *
 * This is a pure in-memory index built from regions and placements.
 * No persistence or external storage.
 */
export interface RuntimeLinkingIndex {
  readonly byPlacementId: Record<PlacementId, PlacementLinkage>;
  readonly byRegionId: Record<string, RegionLinkage>;
  readonly bySpaceId: Record<string, SpaceLinkage>;
}

/**
 * Linked view of a runtime placement (TOOLING/DEBUG ONLY).
 *
 * **WARNING**: This is NOT a core runtime type. It is intended solely for
 * debugging, tooling, and introspection purposes. Do not use this in
 * production runtime code or treat it as a canonical runtime type.
 *
 * This decorates RuntimePlacementView with linkage information for
 * introspection and debugging purposes only.
 */
export interface LinkedRuntimePlacementView {
  readonly runtime: RuntimePlacementView;
  readonly usdPrimPath: string;
  readonly planNodeId: PlanNodeId;
}

/**
 * Derive USD prim path for a region.
 *
 * Convention from `docs/usd_integration_model.md`:
 * `/World/Regions/{regionId}`
 *
 * @param regionId - The region ID
 * @returns USD prim path for the region
 */
export function deriveUsdPrimPathForRegion(regionId: string): string {
  return `/World/Regions/${regionId}`;
}

/**
 * Derive USD prim path for a space.
 *
 * Convention from `docs/usd_integration_model.md`:
 * `/World/Regions/{regionId}/Spaces/{spaceId}`
 *
 * @param regionId - The parent region ID
 * @param spaceId - The space ID
 * @returns USD prim path for the space
 */
export function deriveUsdPrimPathForSpace(
  regionId: string,
  spaceId: string
): string {
  return `/World/Regions/${regionId}/Spaces/${spaceId}`;
}

/**
 * Derive USD prim path for a placement.
 *
 * Convention from `docs/usd_integration_model.md`:
 * `/World/Regions/{regionId}/Spaces/{spaceId}/Placements/Placement_{placementId}`
 *
 * @param regionId - The parent region ID
 * @param spaceId - The parent space ID
 * @param placementId - The placement ID
 * @returns USD prim path for the placement
 */
export function deriveUsdPrimPathForPlacement(
  regionId: string,
  spaceId: string,
  placementId: PlacementId
): string {
  return `/World/Regions/${regionId}/Spaces/${spaceId}/Placements/Placement_${placementId}`;
}

/**
 * Derive PlanGraph node ID for a region.
 *
 * Convention from `src/shared/plan/plan_mapping.ts`:
 * `region-{regionId}`
 *
 * This matches the convention used by `derivePlanNodeIdForRegion()` in plan_mapping.ts.
 *
 * @param regionId - The region ID
 * @returns PlanGraph node ID for the region
 */
export function derivePlanNodeIdForRegion(regionId: string): PlanNodeId {
  return `region-${regionId}`;
}

/**
 * Derive PlanGraph node ID for a space.
 *
 * Convention from `src/shared/plan/plan_mapping.ts`:
 * `space-{spaceId}`
 *
 * This matches the convention used by `derivePlanNodeIdForSpace()` in plan_mapping.ts.
 *
 * @param spaceId - The space ID
 * @returns PlanGraph node ID for the space
 */
export function derivePlanNodeIdForSpace(spaceId: string): PlanNodeId {
  return `space-${spaceId}`;
}

/**
 * Derive PlanGraph node ID for a placement.
 *
 * Convention from `src/shared/plan/plan_mapping.ts`:
 * `placement-{placementId}`
 *
 * This matches the convention used by `derivePlanNodeIdForPlacement()` in plan_mapping.ts.
 *
 * @param placementId - The placement ID
 * @returns PlanGraph node ID for the placement
 */
export function derivePlanNodeIdForPlacement(
  placementId: PlacementId
): PlanNodeId {
  return `placement-${placementId}`;
}

/**
 * Build a runtime linking index from regions and placements.
 *
 * This is a pure function that derives all linkages in-memory.
 * No I/O, no persistence, deterministic output.
 *
 * Note: Region.spaces is an array of space IDs (strings), not Space objects.
 * We derive linkages for spaces based on their IDs, but cannot access Space metadata
 * without additional input.
 *
 * @param regions - Array of regions
 * @param placements - Array of placements
 * @returns RuntimeLinkingIndex with all linkages
 */
export function buildRuntimeLinkingIndex(
  regions: readonly Region[],
  placements: readonly AssetPlacement[]
): RuntimeLinkingIndex {
  const byPlacementId: Record<PlacementId, PlacementLinkage> = {};
  const byRegionId: Record<string, RegionLinkage> = {};
  const bySpaceId: Record<string, SpaceLinkage> = {};

  // Index regions
  for (const region of regions) {
    const regionLinkage: RegionLinkage = {
      regionId: region.id,
      usdPrimPath: deriveUsdPrimPathForRegion(region.id),
      planNodeId: derivePlanNodeIdForRegion(region.id),
    };
    byRegionId[region.id] = regionLinkage;

    // Index spaces within this region (spaces are string IDs)
    for (const spaceId of region.spaces) {
      const spaceLinkage: SpaceLinkage = {
        spaceId,
        regionId: region.id,
        usdPrimPath: deriveUsdPrimPathForSpace(region.id, spaceId),
        planNodeId: derivePlanNodeIdForSpace(spaceId),
      };
      bySpaceId[spaceId] = spaceLinkage;
    }
  }

  // Index placements
  for (const placement of placements) {
    const regionId = placement.regionId || "default";
    const spaceId = placement.spaceId || "default";

    const placementLinkage: PlacementLinkage = {
      placementId: placement.id,
      usdPrimPath: deriveUsdPrimPathForPlacement(
        regionId,
        spaceId,
        placement.id
      ),
      planNodeId: derivePlanNodeIdForPlacement(placement.id),
    };
    byPlacementId[placement.id] = placementLinkage;
  }

  return {
    byPlacementId,
    byRegionId,
    bySpaceId,
  };
}

/**
 * Create a linked runtime placement view (tooling/debug only).
 *
 * This decorates a RuntimePlacementView with linkage information.
 * Use this for introspection, debugging, or tooling purposes only.
 *
 * @param runtime - The runtime placement view
 * @param linkage - The linkage data for this placement
 * @returns LinkedRuntimePlacementView
 */
export function createLinkedPlacementView(
  runtime: RuntimePlacementView,
  linkage: PlacementLinkage
): LinkedRuntimePlacementView {
  return {
    runtime,
    usdPrimPath: linkage.usdPrimPath,
    planNodeId: linkage.planNodeId,
  };
}

/**
 * Future Enhancement: Asset Binding Enrichment
 *
 * When enriching RuntimeAssetBinding with linkage data, prefer using the
 * existing `metadata` field rather than adding new top-level fields:
 *
 * ```typescript
 * binding.metadata = {
 *   ...binding.metadata,
 *   usdPrimPath,
 *   planNodeId,
 * };
 * ```
 *
 * This keeps RuntimeAssetBinding stable and avoids interface churn.
 */
