/**
 * Editing service API surface for Believe's placement editing system.
 *
 * This module defines the interface for creating and managing placement
 * editing sessions. It provides stub implementations for testing and
 * serves as a contract for future service implementations.
 *
 * This phase provides stub implementations only — actual persistence,
 * validation, and networking will be added in future phases.
 */

import type {
  DraftPlacement,
  DraftPlacementId,
  PlacementEditOperation,
  PlacementEditOperationType,
  PlacementEditSession,
  PlacementEditSessionId,
  PlacementEditSessionStatus,
} from "@/shared/world/editing";
import type { PlacementId, Transform } from "@/shared/world/placement";

/**
 * Input parameters for creating a new placement editing session.
 */
export interface CreatePlacementEditSessionInput {
  /**
   * Optional target region ID for this editing session.
   * If specified, the session will edit placements in this region.
   */
  readonly regionId?: string;

  /**
   * Optional target space ID for this editing session.
   * If specified, the session will edit placements in this space.
   */
  readonly spaceId?: string;

  /**
   * User ID of the person creating this session.
   * Plain string identifier; no user model import.
   */
  readonly createdByUserId: string;

  /** Optional tags for categorization */
  readonly tags?: readonly string[];

  /** Optional notes or description */
  readonly notes?: string;
}

/**
 * Input parameters for applying an edit operation to a session.
 */
export interface PlacementEditOperationInput {
  /** Type of operation to perform */
  readonly type: PlacementEditOperationType;

  /**
   * Target placement ID for UPDATE or REMOVE operations on live placements.
   * Used when modifying an existing placement.
   */
  readonly targetPlacementId?: PlacementId;

  /**
   * Target draft ID for operations on draft placements.
   * Used when modifying a draft created in this session.
   */
  readonly targetDraftId?: DraftPlacementId;

  /**
   * New placement data for ADD operations.
   * Contains the complete draft placement to be added.
   */
  readonly newPlacement?: DraftPlacement;

  /**
   * New transform for UPDATE_TRANSFORM operations.
   * Only the transform is updated.
   */
  readonly newTransform?: Transform;

  /**
   * New tags for UPDATE_TAGS operations.
   * Replaces existing tags.
   */
  readonly newTags?: readonly string[];

  /**
   * User ID of the person performing this operation.
   * Plain string identifier; no user model import.
   */
  readonly createdByUserId: string;

  /** Optional notes or description of this operation */
  readonly notes?: string;
}

/**
 * Service interface for placement editing operations.
 *
 * This interface defines the contract for creating and managing editing sessions.
 * Future implementations will provide persistence, validation, and networking.
 */
export interface PlacementEditingService {
  /**
   * Create a new placement editing session.
   *
   * @param input - Session creation parameters
   * @returns Promise resolving to the created session
   */
  createSession(
    input: CreatePlacementEditSessionInput
  ): Promise<PlacementEditSession>;

  /**
   * Get an existing editing session by ID.
   *
   * @param id - Session identifier
   * @returns Promise resolving to the session, or null if not found
   */
  getSession(id: PlacementEditSessionId): Promise<PlacementEditSession | null>;

  /**
   * Apply an edit operation to a session.
   *
   * @param sessionId - Target session identifier
   * @param operation - Operation to apply
   * @returns Promise resolving to the updated session
   */
  applyOperation(
    sessionId: PlacementEditSessionId,
    operation: PlacementEditOperationInput
  ): Promise<PlacementEditSession>;

  /**
   * Close an editing session.
   *
   * @param id - Session identifier
   * @returns Promise resolving to the closed session
   */
  closeSession(id: PlacementEditSessionId): Promise<PlacementEditSession>;
}

/**
 * Create a new placement editing session (stub implementation).
 *
 * This is a pure in-memory stub that creates a minimal session object.
 * Future implementations will:
 * - Validate region/space existence
 * - Check user permissions
 * - Persist session to database
 * - Load existing placements into session
 *
 * @param input - Session creation parameters
 * @returns Promise resolving to the created session
 */
export async function createPlacementEditSessionStub(
  input: CreatePlacementEditSessionInput
): Promise<PlacementEditSession> {
  // TODO: Replace with real implementation.
  // For now, return a minimal in-memory session object with a generated id.

  const now = new Date();
  const sessionId = `session-${now.getTime()}`;

  const session: PlacementEditSession = {
    id: sessionId,
    regionId: input.regionId,
    spaceId: input.spaceId,
    status: "ACTIVE" as PlacementEditSessionStatus,
    createdAt: now,
    updatedAt: now,
    createdByUserId: input.createdByUserId,
    participants: [input.createdByUserId],
    draftPlacements: [],
    operations: [],
    tags: input.tags ?? [],
    notes: input.notes,
  };

  return session;
}

/**
 * Apply an edit operation to a session (stub implementation).
 *
 * This is a pure in-memory stub that records the operation without persistence.
 * Future implementations will:
 * - Validate operation parameters
 * - Check user permissions
 * - Update draft placements based on operation type
 * - Persist changes to database
 * - Broadcast updates to collaborators
 *
 * @param session - Current session state
 * @param op - Operation to apply
 * @returns Promise resolving to updated session
 */
export async function applyPlacementEditOperationStub(
  session: PlacementEditSession,
  op: PlacementEditOperationInput
): Promise<PlacementEditSession> {
  // TODO: Replace with real implementation.
  // For now, return a new session object that records the operation in-memory
  // and updates updatedAt, without any I/O.

  const now = new Date();
  const operationId = `op-${now.getTime()}`;

  const operation: PlacementEditOperation = {
    id: operationId,
    sessionId: session.id,
    type: op.type,
    targetPlacementId: op.targetPlacementId,
    targetDraftId: op.targetDraftId,
    newPlacement: op.newPlacement,
    newTransform: op.newTransform,
    newTags: op.newTags,
    createdAt: now,
    createdByUserId: op.createdByUserId,
    notes: op.notes,
  };

  // Create updated session with new operation
  // In a real implementation, this would also update draftPlacements based on operation type
  const updatedSession: PlacementEditSession = {
    ...session,
    updatedAt: now,
    operations: [...session.operations, operation],
    // Add user to participants if not already present
    participants: session.participants.includes(op.createdByUserId)
      ? session.participants
      : [...session.participants, op.createdByUserId],
  };

  return updatedSession;
}
