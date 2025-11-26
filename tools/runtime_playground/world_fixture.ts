/**
 * Runtime playground world fixture for Believe's golden path harness.
 *
 * This module provides a minimal, deterministic world fixture for testing
 * the entire runtime pipeline without engine integration or I/O.
 *
 * Phase 18: Self-contained, deterministic end-to-end runtime harness.
 */

import type { CommitPlan, PlacementChange } from "@/shared/world/commit";
import type {
  AssetPlacement,
  PlacementId,
  Transform,
} from "@/shared/world/placement";
import type { Region, Space } from "@/shared/world/space";

/**
 * Runtime playground fixture containing deterministic world data.
 *
 * Phase 19: ValidationResult removed - now computed by baseline rules.
 */
export interface RuntimePlaygroundFixture {
  /** Regions in the world */
  readonly regions: readonly Region[];

  /** Asset placements */
  readonly placements: readonly AssetPlacement[];

  /** Commit plan with ADD/UPDATE/REMOVE changes */
  readonly commitPlan: CommitPlan;
}

/**
 * Build a minimal, deterministic world fixture for the runtime playground.
 *
 * Creates:
 * - 1 region (region-main)
 * - 2 spaces (space-hub, space-classroom)
 * - 5 placements with fixed IDs, assets, transforms, tags
 * - CommitPlan with ADD, UPDATE, REMOVE changes
 * - ValidationResult with WARNING and ERROR issues
 *
 * @returns RuntimePlaygroundFixture
 */
export function buildRuntimePlaygroundFixture(): RuntimePlaygroundFixture {
  // Create region
  const region: Region = {
    id: "region-main",
    name: "Main Region",
    metadata: {
      description: "Primary region for playground",
    },
  };

  // Create spaces
  const spaceHub: Space = {
    id: "space-hub",
    regionId: "region-main",
    name: "Hub",
    metadata: {
      description: "Central hub area",
    },
  };

  const spaceClassroom: Space = {
    id: "space-classroom",
    regionId: "region-main",
    name: "Classroom",
    metadata: {
      description: "Classroom area",
    },
  };

  // Create deterministic transforms
  const transform1: Transform = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 1, y: 1, z: 1 },
  };

  const transform2: Transform = {
    position: { x: 10, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 1, y: 1, z: 1 },
  };

  const transform3: Transform = {
    position: { x: 0, y: 0, z: 10 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 1, y: 1, z: 1 },
  };

  const transform4: Transform = {
    position: { x: 10, y: 0, z: 10 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 1, y: 1, z: 1 },
  };

  const transform5: Transform = {
    position: { x: 5, y: 0, z: 5 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 2, y: 2, z: 2 },
  };

  // Create placements
  const placements: AssetPlacement[] = [
    {
      id: "placement-001" as PlacementId,
      assetId: "asset-tree",
      regionId: "region-main",
      spaceId: "space-hub",
      transform: transform1,
      tags: ["nature", "outdoor"],
      metadata: {
        name: "Oak Tree",
      },
    },
    {
      id: "placement-002" as PlacementId,
      assetId: "asset-bench",
      regionId: "region-main",
      spaceId: "space-hub",
      transform: transform2,
      tags: ["furniture", "outdoor"],
      metadata: {
        name: "Park Bench",
      },
    },
    {
      id: "placement-003" as PlacementId,
      assetId: "asset-desk",
      regionId: "region-main",
      spaceId: "space-classroom",
      transform: transform3,
      tags: ["furniture", "indoor"],
      metadata: {
        name: "Student Desk",
      },
    },
    {
      id: "placement-004" as PlacementId,
      assetId: "asset-chair",
      regionId: "region-main",
      spaceId: "space-classroom",
      transform: transform4,
      tags: ["furniture", "indoor"],
      metadata: {
        name: "Student Chair",
      },
    },
    {
      id: "placement-005" as PlacementId,
      assetId: "asset-whiteboard",
      regionId: "region-main",
      spaceId: "space-classroom",
      transform: transform5,
      tags: ["equipment", "indoor"],
      metadata: {
        name: "Whiteboard",
      },
    },
  ];

  // Create commit plan with ADD, UPDATE, REMOVE
  const placementChanges: PlacementChange[] = [
    {
      type: "ADD",
      after: {
        id: "placement-006" as PlacementId,
        assetId: "asset-lamp",
        regionId: "region-main",
        spaceId: "space-classroom",
        transform: {
          position: { x: 15, y: 2, z: 5 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 },
        },
        tags: ["lighting", "indoor"],
        metadata: { name: "Ceiling Lamp" },
      },
    },
    {
      type: "UPDATE",
      placementId: "placement-002" as PlacementId,
      after: {
        id: "placement-002" as PlacementId,
        assetId: "asset-bench",
        regionId: "region-main",
        spaceId: "space-hub",
        transform: {
          position: { x: 12, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 },
        },
        tags: ["furniture", "outdoor", "updated"],
        metadata: { name: "Park Bench (Moved)" },
      },
    },
    {
      type: "REMOVE",
      placementId: "placement-001" as PlacementId,
    },
  ];

  const commitPlan: CommitPlan = {
    id: "commit-playground",
    changes: placementChanges,
    metadata: {
      description: "Playground commit plan",
    },
  };

  return {
    regions: [region],
    placements,
    commitPlan,
  };
}
