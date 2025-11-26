/**
 * Commit service API surface for Believe's placement commit workflow.
 *
 * This module defines the interface for preparing and applying commits that
 * transform draft placements into live asset placements. It provides stub
 * implementations for testing and serves as a contract for future service
 * implementations.
 *
 * This phase provides stub implementations only — actual conflict detection,
 * spatial validation, and persistence will be added in future phases.
 */

import type {
  CommitPlan,
  CommitResult,
  CommitStatus,
  PlacementChange,
} from "@/shared/world/commit";
import type { PlacementEditSession } from "@/shared/world/editing";
import type { AssetPlacement } from "@/shared/world/placement";

/**
 * Input parameters for preparing a commit from an editing session.
 */
export interface PrepareCommitInput {
  /** The editing session containing draft placements to commit */
  readonly session: PlacementEditSession;

  /**
   * Current live placements in the target region/space.
   * Used for conflict detection.
   */
  readonly livePlacements: readonly AssetPlacement[];

  /**
   * User ID of the person requesting this commit.
   * Plain string identifier; no user model import.
   */
  readonly requestedByUserId: string;
}

/**
 * Input parameters for applying a commit plan.
 */
export interface ApplyCommitInput {
  /** The commit plan to apply */
  readonly plan: CommitPlan;

  /**
   * Current live placements in the target region/space.
   * Will be updated with the changes from the plan.
   */
  readonly livePlacements: readonly AssetPlacement[];
}

/**
 * Service interface for commit operations.
 *
 * This interface defines the contract for preparing and applying commits.
 * Future implementations will provide actual conflict detection, validation,
 * and persistence.
 */
export interface CommitService {
  /**
   * Prepare a commit plan from an editing session.
   *
   * Compares draft placements against live state, detects conflicts,
   * and builds a structured plan of changes.
   *
   * @param input - Commit preparation parameters
   * @returns Promise resolving to the prepared commit plan
   */
  prepareCommit(input: PrepareCommitInput): Promise<CommitPlan>;

  /**
   * Apply a commit plan to update live placements.
   *
   * Executes the changes in the plan, updating the live placement registry.
   * If conflicts exist, the commit may be rejected.
   *
   * @param input - Commit application parameters
   * @returns Promise resolving to the commit result
   */
  applyCommit(input: ApplyCommitInput): Promise<CommitResult>;
}

/**
 * Prepare a commit plan from an editing session (stub implementation).
 *
 * This is a pure in-memory stub that treats all drafts as ADD operations.
 * Future implementations will:
 * - Compare drafts against live placements
 * - Detect transform, deletion, tag, and permission conflicts
 * - Compute UPDATE and REMOVE changes
 * - Perform spatial overlap and collision checking
 * - Validate user permissions
 *
 * @param input - Commit preparation parameters
 * @returns Promise resolving to the prepared commit plan
 */
export async function prepareCommitStub(
  input: PrepareCommitInput
): Promise<CommitPlan> {
  // TODO: Replace with real conflict detection and change computation.
  // For now:
  // - Treat all draft placements as ADD changes.
  // - Do not detect conflicts (conflicts array is empty).
  // - Mark isResolvableAutomatically = true.

  const now = new Date();
  const commitId = `commit-${now.getTime()}`;

  // Build changes: treat all drafts as ADD operations
  const changes: PlacementChange[] = input.session.draftPlacements.map(
    (draft) => ({
      type: "ADD" as const,
      draftPlacementId: draft.draftId,
      after: draft.base,
    })
  );

  const plan: CommitPlan = {
    context: {
      id: commitId,
      sessionId: input.session.id,
      regionId: input.session.regionId,
      spaceId: input.session.spaceId,
      requestedByUserId: input.requestedByUserId,
      createdAt: now,
    },
    changes,
    conflicts: [], // No conflicts in stub
    isResolvableAutomatically: true,
  };

  return plan;
}

/**
 * Apply a commit plan to update live placements (stub implementation).
 *
 * This is a pure in-memory stub that echoes back the plan changes.
 * Future implementations will:
 * - Validate the plan against current live state
 * - Apply changes to placement registry (database)
 * - Update spatial indices
 * - Broadcast changes to connected clients
 * - Record commit history for audit and rollback
 *
 * @param input - Commit application parameters
 * @returns Promise resolving to the commit result
 */
export async function applyCommitStub(
  input: ApplyCommitInput
): Promise<CommitResult> {
  // TODO: Replace with real commit application and persistence.
  // For now:
  // - Echo back the plan changes as appliedChanges.
  // - Set status = APPLIED.
  // - Keep conflicts as in the plan (should be empty in stub).

  const now = new Date();

  const result: CommitResult = {
    context: input.plan.context,
    status: "APPLIED" as CommitStatus,
    appliedChanges: input.plan.changes,
    conflicts: input.plan.conflicts,
    completedAt: now,
  };

  return result;
}
