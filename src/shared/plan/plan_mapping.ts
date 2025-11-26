/**
 * PlanGraph mapping functions for Believe data structures.
 *
 * This module provides pure TypeScript mapping helpers that translate existing
 * Believe entities (Regions, Spaces, Placements, Commits, etc.) into PlanGraph
 * primitives. These are stub implementations that return structured placeholder values.
 *
 * No file I/O, serialization, or persistence is performed in this module.
 */

import type {
  PlanChangeRecord,
  PlanChangeType,
  PlanNodeId,
} from "@/shared/plan/plan_types";
import type { CollabSessionEvent } from "@/shared/world/collab";
import type { CommitPlan } from "@/shared/world/commit";
import type { DraftPlacement } from "@/shared/world/editing";
import type { AssetPlacement } from "@/shared/world/placement";
import type { Region, Space } from "@/shared/world/space";
import type { ValidationResult } from "@/shared/world/validation/validation";

/**
 * Derive a PlanNodeId for a Region (stub implementation).
 *
 * Future implementations may:
 * - Use more sophisticated ID generation
 * - Include namespace prefixes
 * - Support custom ID schemes
 *
 * @param region - The Believe region
 * @returns PlanNodeId for the region
 */
export function derivePlanNodeIdForRegion(region: Region): PlanNodeId {
  return `region-${region.id}`;
}

/**
 * Derive a PlanNodeId for a Space (stub implementation).
 *
 * Future implementations may:
 * - Include parent region in ID
 * - Use hierarchical naming
 * - Support custom ID schemes
 *
 * @param space - The Believe space
 * @returns PlanNodeId for the space
 */
export function derivePlanNodeIdForSpace(space: Space): PlanNodeId {
  return `space-${space.id}`;
}

/**
 * Derive a PlanNodeId for an AssetPlacement (stub implementation).
 *
 * Future implementations may:
 * - Include parent space/region in ID
 * - Use hierarchical naming
 * - Support custom ID schemes
 *
 * @param placement - The asset placement
 * @returns PlanNodeId for the placement
 */
export function derivePlanNodeIdForPlacement(
  placement: AssetPlacement
): PlanNodeId {
  return `placement-${placement.id}`;
}

/**
 * Derive a PlanNodeId for a CommitPlan (stub implementation).
 *
 * Future implementations may:
 * - Include session ID in commit node
 * - Link to affected placements
 * - Support custom ID schemes
 *
 * @param plan - The commit plan
 * @returns PlanNodeId for the commit
 */
export function derivePlanNodeIdForCommit(plan: CommitPlan): PlanNodeId {
  return `commit-${plan.context.id}`;
}

/**
 * Derive a PlanNodeId for a scanned prim (stub implementation).
 *
 * Future implementations may:
 * - Parse USD prim path for meaningful ID
 * - Link to scan session
 * - Support custom ID schemes
 *
 * @param primPath - USD prim path
 * @returns PlanNodeId for the scanned prim
 */
export function derivePlanNodeIdForScanPrim(primPath: string): PlanNodeId {
  // Simple stub: use prim path as-is with prefix
  const sanitized = primPath.replace(/\//g, "-").replace(/^-/, "");
  return `scan-${sanitized}`;
}

/**
 * Map a CommitPlan to PlanChangeRecords (stub implementation).
 *
 * Future implementations will:
 * - Create change records for each placement change
 * - Extract commit reasoning and notes
 * - Link to validation results
 * - Preserve conflict resolution details
 *
 * @param plan - The commit plan
 * @returns Array of PlanChangeRecords
 */
export function mapCommitPlanToPlanChanges(
  plan: CommitPlan
): readonly PlanChangeRecord[] {
  // TODO: Replace with real mapping logic.
  // For now, create a single summary change record.

  const commitNodeId = derivePlanNodeIdForCommit(plan);

  const change: PlanChangeRecord = {
    id: `chg-${Date.now()}`,
    nodeId: commitNodeId,
    type: "UPDATE" as PlanChangeType,
    summary: `Commit ${plan.context.id} applied with ${plan.changes.length} changes`,
    createdAt: plan.context.createdAt,
    createdByUserId: plan.context.requestedByUserId,
    metadata: {
      commitId: plan.context.id,
      sessionId: plan.context.sessionId,
      changeCount: plan.changes.length,
      conflictCount: plan.conflicts.length,
    },
  };

  return [change];
}

/**
 * Map a DraftPlacement to a PlanChangeRecord (stub implementation).
 *
 * Future implementations will:
 * - Determine change type (CREATE vs UPDATE)
 * - Extract editing intent and notes
 * - Link to parent session
 * - Preserve operation details
 *
 * @param draft - The draft placement
 * @returns PlanChangeRecord for the draft
 */
export function mapDraftPlacementToPlanDraftChange(
  draft: DraftPlacement
): PlanChangeRecord {
  // TODO: Replace with real mapping logic.
  // For now, create a simple change record.

  const nodeId = derivePlanNodeIdForPlacement(draft.base);
  const changeType = draft.isNew ? "CREATE" : "UPDATE";

  const change: PlanChangeRecord = {
    id: `chg-${Date.now()}`,
    nodeId,
    type: changeType as PlanChangeType,
    summary: draft.isNew
      ? `Draft placement created for asset ${draft.base.assetId}`
      : `Draft placement updated for ${draft.base.id}`,
    createdAt: new Date(),
    metadata: {
      draftId: draft.draftId,
      isNew: draft.isNew,
      sourcePlacementId: draft.sourcePlacementId,
    },
  };

  return change;
}

/**
 * Map a ValidationResult to PlanChangeRecords (stub implementation).
 *
 * Future implementations will:
 * - Create change records for each validation issue
 * - Link issues to affected placements
 * - Preserve severity and resolution notes
 * - Support validation history
 *
 * @param nodeId - Node being validated
 * @param result - The validation result
 * @returns Array of PlanChangeRecords
 */
export function mapValidationResultToPlanChanges(
  nodeId: PlanNodeId,
  result: ValidationResult
): readonly PlanChangeRecord[] {
  // TODO: Replace with real mapping logic.
  // For now, create a single summary change record.

  if (result.issues.length === 0) {
    // No issues, create a success record
    const change: PlanChangeRecord = {
      id: `chg-${Date.now()}`,
      nodeId,
      type: "INTENT" as PlanChangeType,
      summary: `Validation passed with no issues`,
      createdAt: new Date(),
      metadata: {
        issueCount: 0,
        isBlocking: false,
      },
    };
    return [change];
  }

  // Create a summary change record for issues
  const change: PlanChangeRecord = {
    id: `chg-${Date.now()}`,
    nodeId,
    type: "INTENT" as PlanChangeType,
    summary: `Validation found ${result.issues.length} issue(s)${
      result.isBlocking ? " (blocking)" : ""
    }`,
    createdAt: new Date(),
    metadata: {
      issueCount: result.issues.length,
      isBlocking: result.isBlocking,
      issues: result.issues.map((issue) => ({
        id: issue.id,
        type: issue.type,
        severity: issue.severity,
        message: issue.message,
      })),
    },
  };

  return [change];
}

/**
 * Map collaborative session events to PlanChangeRecords (stub implementation).
 *
 * Future implementations will:
 * - Filter significant events (operations, not just presence)
 * - Extract collaborative reasoning
 * - Link to affected nodes
 * - Preserve event context
 *
 * @param nodeId - Node affected by events
 * @param events - Array of collaboration events
 * @returns Array of PlanChangeRecords
 */
export function mapCollabEventsToPlanChanges(
  nodeId: PlanNodeId,
  events: readonly CollabSessionEvent[]
): readonly PlanChangeRecord[] {
  // TODO: Replace with real mapping logic.
  // For now, create a single summary change record.

  if (events.length === 0) {
    return [];
  }

  const operationEvents = events.filter((e) => e.type === "OPERATION_APPLIED");

  if (operationEvents.length === 0) {
    // No significant events, return empty
    return [];
  }

  const change: PlanChangeRecord = {
    id: `chg-${Date.now()}`,
    nodeId,
    type: "UPDATE" as PlanChangeType,
    summary: `Collaborative session: ${operationEvents.length} operation(s) applied`,
    createdAt: new Date(),
    metadata: {
      sessionId: events[0]?.sessionId,
      eventCount: events.length,
      operationCount: operationEvents.length,
    },
  };

  return [change];
}
