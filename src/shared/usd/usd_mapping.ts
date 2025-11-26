/**
 * USD mapping functions for Believe data structures.
 *
 * This module provides pure TypeScript mapping helpers that describe the intent
 * of converting Believe entities (Regions, Spaces, Placements, etc.) to USD prims
 * and layers. These are stub implementations that return structured placeholder values.
 *
 * No USD SDK calls or file I/O are performed in this module.
 */

import type {
  UsdLayerDescriptor,
  UsdLayerRole,
  UsdPrimDescriptor,
} from "@/shared/usd/usd_types";
import type { CollabSessionEvent } from "@/shared/world/collab";
import type { CommitPlan } from "@/shared/world/commit";
import type { PlacementEditSession } from "@/shared/world/editing";
import type { AssetPlacement } from "@/shared/world/placement";
import type { Region, Space } from "@/shared/world/space";
import type { ValidationResult } from "@/shared/world/validation/validation";

/**
 * Map a Believe Region to a USD prim descriptor (stub implementation).
 *
 * Future implementations will:
 * - Create Xform prim at /World/Regions/{regionId}
 * - Set believe:regionId metadata
 * - Set believe:accessMode metadata
 * - Add child Spaces prim container
 *
 * @param region - The Believe region to map
 * @returns USD prim descriptor for the region
 */
export function mapRegionToUsdPrim(region: Region): UsdPrimDescriptor {
  // TODO: Replace with real USD prim creation.
  // For now, return a placeholder descriptor.

  const prim: UsdPrimDescriptor = {
    path: `/World/Regions/${region.id}`,
    type: "Xform",
    metadata: {
      regionId: region.id,
      accessMode: region.accessMode,
      tags: region.tags,
      notes: region.description,
    },
    children: [
      {
        path: `/World/Regions/${region.id}/Spaces`,
        type: "Scope",
      },
    ],
  };

  return prim;
}

/**
 * Map a Believe Space to a USD prim descriptor (stub implementation).
 *
 * Future implementations will:
 * - Create Xform prim at /World/Regions/{regionId}/Spaces/{spaceId}
 * - Set believe:spaceId and believe:regionId metadata
 * - Set believe:accessMode metadata
 * - Add child Placements prim container
 *
 * @param space - The Believe space to map
 * @returns USD prim descriptor for the space
 */
export function mapSpaceToUsdPrim(space: Space): UsdPrimDescriptor {
  // TODO: Replace with real USD prim creation.
  // For now, return a placeholder descriptor.

  const prim: UsdPrimDescriptor = {
    path: `/World/Regions/${space.regionId}/Spaces/${space.id}`,
    type: "Xform",
    metadata: {
      spaceId: space.id,
      regionId: space.regionId,
      accessMode: space.accessMode,
      tags: space.tags,
      notes: space.description,
    },
    children: [
      {
        path: `/World/Regions/${space.regionId}/Spaces/${space.id}/Placements`,
        type: "Scope",
      },
    ],
  };

  return prim;
}

/**
 * Map a Believe AssetPlacement to a USD prim descriptor (stub implementation).
 *
 * Future implementations will:
 * - Create Xform prim at /World/Regions/{regionId}/Spaces/{spaceId}/Placements/Placement_{placementId}
 * - Set transform from placement.transform (position, rotation, scale)
 * - Set believe:placementId and believe:sourceAssetId metadata
 * - Add reference to asset USD file if applicable
 *
 * @param placement - The Believe asset placement to map
 * @returns USD prim descriptor for the placement
 */
export function mapPlacementToUsdPrim(
  placement: AssetPlacement
): UsdPrimDescriptor {
  // TODO: Replace with real USD prim creation.
  // For now, return a placeholder descriptor.

  const regionId = placement.regionId || "default";
  const spaceId = placement.spaceId || "default";

  const prim: UsdPrimDescriptor = {
    path: `/World/Regions/${regionId}/Spaces/${spaceId}/Placements/Placement_${placement.id}`,
    type: "Xform",
    metadata: {
      placementId: placement.id,
      sourceAssetId: placement.assetId,
      regionId: placement.regionId,
      spaceId: placement.spaceId,
      tags: placement.tags,
    },
  };

  return prim;
}

/**
 * Create a USD layer descriptor for a draft editing session (stub implementation).
 *
 * Future implementations will:
 * - Create USD layer file: draft_{sessionId}.usda
 * - Add all draft placements as overrides or new prims
 * - Set layer metadata (sessionId, createdByUserId, etc.)
 *
 * @param session - The placement editing session
 * @returns USD layer descriptor for the draft
 */
export function createDraftUsdLayer(
  session: PlacementEditSession
): UsdLayerDescriptor {
  // TODO: Replace with real USD layer creation.
  // For now, return a placeholder descriptor.

  const layer: UsdLayerDescriptor = {
    id: `draft_${session.id}`,
    role: UsdLayerRole.DRAFT,
    description: `Draft layer for editing session ${session.id}`,
    createdAt: session.createdAt,
    createdByUserId: session.createdByUserId,
    metadata: {
      sessionId: session.id,
      regionId: session.regionId,
      spaceId: session.spaceId,
    },
  };

  return layer;
}

/**
 * Create a USD layer descriptor for a commit plan (stub implementation).
 *
 * Future implementations will:
 * - Create USD layer file: commit_{commitId}.usda
 * - Add all placement changes from commit plan
 * - Flatten draft layer into commit layer
 * - Set layer metadata (commitId, sessionId, appliedByUserId, etc.)
 *
 * @param plan - The commit plan
 * @returns USD layer descriptor for the commit
 */
export function createCommitUsdLayer(plan: CommitPlan): UsdLayerDescriptor {
  // TODO: Replace with real USD layer creation.
  // For now, return a placeholder descriptor.

  const layer: UsdLayerDescriptor = {
    id: `commit_${plan.context.id}`,
    role: UsdLayerRole.COMMIT,
    description: `Commit layer for commit ${plan.context.id}`,
    createdAt: plan.context.createdAt,
    createdByUserId: plan.context.requestedByUserId,
    metadata: {
      commitId: plan.context.id,
      sessionId: plan.context.sessionId,
      regionId: plan.context.regionId,
      spaceId: plan.context.spaceId,
      changeCount: plan.changes.length,
    },
  };

  return layer;
}

/**
 * Create a USD layer descriptor for validation results (stub implementation).
 *
 * Future implementations will:
 * - Create USD layer file: validation_{validationId}.usda
 * - Add validation issues as metadata on affected prims
 * - Set layer metadata (validationId, isBlocking, etc.)
 * - No geometry or transform changes
 *
 * @param result - The validation result
 * @returns USD layer descriptor for the validation
 */
export function createValidationUsdLayer(
  result: ValidationResult
): UsdLayerDescriptor {
  // TODO: Replace with real USD layer creation.
  // For now, return a placeholder descriptor.

  const validationId = `validation-${Date.now()}`;

  const layer: UsdLayerDescriptor = {
    id: validationId,
    role: UsdLayerRole.VALIDATION,
    description: `Validation layer with ${result.issues.length} issues`,
    createdAt: new Date(),
    metadata: {
      validationId,
      issueCount: result.issues.length,
      isBlocking: result.isBlocking,
    },
  };

  return layer;
}

/**
 * Create a USD layer descriptor for collaboration events (stub implementation).
 *
 * Future implementations will:
 * - Create USD layer file: collab_{sessionId}.usda
 * - Add presence states as metadata
 * - Add session events as timeline metadata
 * - Set layer metadata (sessionId, eventCount, etc.)
 *
 * @param events - The collaboration session events
 * @returns USD layer descriptor for the collaboration
 */
export function createCollabUsdLayer(
  events: readonly CollabSessionEvent[]
): UsdLayerDescriptor {
  // TODO: Replace with real USD layer creation.
  // For now, return a placeholder descriptor.

  const sessionId = events.length > 0 ? events[0].sessionId : "unknown";
  const collabId = `collab_${sessionId}`;

  const layer: UsdLayerDescriptor = {
    id: collabId,
    role: UsdLayerRole.COLLAB,
    description: `Collaboration layer with ${events.length} events`,
    createdAt: new Date(),
    metadata: {
      sessionId,
      eventCount: events.length,
    },
  };

  return layer;
}
