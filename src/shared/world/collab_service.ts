/**
 * Collaborative editing service API surface for Believe's placement editing system.
 *
 * This module defines the interface for recording and fetching session events,
 * managing presence, and supporting collaborative editing workflows. It provides
 * stub implementations for testing and serves as a contract for future service
 * implementations.
 *
 * This phase provides stub implementations only — actual event persistence,
 * real-time transport, and presence aggregation will be added in future phases.
 */

import type {
  CollabEventBatch,
  CollabSessionEvent,
  CollabSessionEventType,
  CollabStreamPosition,
  EditDelta,
  PresenceState,
  SessionPresenceSnapshot,
} from "@/shared/world/collab";
import type { PlacementEditSessionId } from "@/shared/world/editing";

/**
 * Input parameters for recording a session event.
 */
export interface RecordEventInput {
  /** Session ID where the event occurred */
  readonly sessionId: PlacementEditSessionId;

  /** Type of event to record */
  readonly type: CollabSessionEventType;

  /**
   * Optional user ID of the actor for this event.
   * Required for USER_JOINED, USER_LEFT, PRESENCE_UPDATED, OPERATION_APPLIED.
   */
  readonly userId?: string;

  /**
   * Optional edit delta for OPERATION_APPLIED events.
   * Contains the operation and metadata.
   */
  readonly editDelta?: EditDelta;

  /**
   * Optional presence state for PRESENCE_UPDATED events.
   * Contains the user's current activity and focus.
   */
  readonly presence?: PresenceState;

  /**
   * Optional message for SYSTEM_MESSAGE events or notes.
   * Human-readable description of the event.
   */
  readonly message?: string;

  /**
   * Optional metadata for extensible event data.
   * Can include device-specific or custom information.
   */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Input parameters for fetching session events.
 */
export interface GetEventsInput {
  /** Session ID to fetch events for */
  readonly sessionId: PlacementEditSessionId;

  /**
   * Optional starting stream position.
   * If provided, only events after this position are returned.
   * If omitted, events from the beginning are returned.
   */
  readonly fromPosition?: CollabStreamPosition;

  /**
   * Optional maximum number of events to return.
   * If omitted, a default limit is applied.
   */
  readonly limit?: number;
}

/**
 * Input parameters for fetching presence snapshot.
 */
export interface GetPresenceSnapshotInput {
  /** Session ID to fetch presence for */
  readonly sessionId: PlacementEditSessionId;
}

/**
 * Service interface for collaborative editing operations.
 *
 * This interface defines the contract for recording events, fetching event history,
 * and retrieving presence snapshots. Future implementations will provide actual
 * event persistence, real-time transport, and presence aggregation.
 */
export interface CollaborativeEditingService {
  /**
   * Record a new session event.
   *
   * Persists the event to the event stream and assigns a stream position.
   * In a real implementation, this would also broadcast to connected clients.
   *
   * @param input - Event recording parameters
   * @returns Promise resolving to the recorded event
   */
  recordEvent(input: RecordEventInput): Promise<CollabSessionEvent>;

  /**
   * Fetch session events from the event stream.
   *
   * Returns events in order, optionally starting from a specific position.
   * Supports pagination via nextPosition in the result.
   *
   * @param input - Event fetching parameters
   * @returns Promise resolving to batch of events
   */
  getEvents(input: GetEventsInput): Promise<CollabEventBatch>;

  /**
   * Get current presence snapshot for a session.
   *
   * Returns all active users and their current presence state.
   *
   * @param input - Presence snapshot parameters
   * @returns Promise resolving to presence snapshot
   */
  getPresenceSnapshot(
    input: GetPresenceSnapshotInput
  ): Promise<SessionPresenceSnapshot>;
}

/**
 * Record a session event (stub implementation).
 *
 * This is a pure stub that generates an event with timestamp-based ID and position.
 * Future implementations will:
 * - Persist event to database or event store
 * - Assign monotonically increasing stream position
 * - Broadcast event to connected clients via WebSocket
 * - Update presence aggregation if applicable
 * - Validate event payload and permissions
 *
 * @param input - Event recording parameters
 * @returns Promise resolving to the recorded event
 */
export async function recordEventStub(
  input: RecordEventInput
): Promise<CollabSessionEvent> {
  // TODO: Replace with real event persistence and stream position management.
  // For now:
  // - Generate an event id and streamPosition using timestamps.
  // - Echo back the payload with a current timestamp.

  const now = new Date();
  const timestamp = now.getTime();
  const eventId = `evt-${timestamp}`;
  const streamPosition = timestamp.toString();

  const event: CollabSessionEvent = {
    id: eventId,
    sessionId: input.sessionId,
    type: input.type,
    timestamp: now,
    streamPosition,
    userId: input.userId,
    editDelta: input.editDelta,
    presence: input.presence,
    message: input.message,
    metadata: input.metadata,
  };

  return event;
}

/**
 * Fetch session events (stub implementation).
 *
 * This is a pure stub that returns an empty batch.
 * Future implementations will:
 * - Query event store for events in the specified session
 * - Filter by fromPosition if provided
 * - Apply limit and return nextPosition for pagination
 * - Support efficient range queries on stream position
 *
 * @param input - Event fetching parameters
 * @returns Promise resolving to batch of events (always empty in stub)
 */
export async function getEventsStub(
  _input: GetEventsInput
): Promise<CollabEventBatch> {
  // TODO: Replace with real event retrieval.
  // For now:
  // - Return an empty batch with no nextPosition.

  const batch: CollabEventBatch = {
    events: [],
    nextPosition: undefined,
  };

  return batch;
}

/**
 * Get presence snapshot (stub implementation).
 *
 * This is a pure stub that returns an empty presence snapshot.
 * Future implementations will:
 * - Aggregate presence from recent PRESENCE_UPDATED events
 * - Filter out inactive users (based on lastSeenAt threshold)
 * - Compute current presence state for each active user
 * - Support real-time presence updates via WebSocket
 *
 * @param input - Presence snapshot parameters
 * @returns Promise resolving to presence snapshot (always empty in stub)
 */
export async function getPresenceSnapshotStub(
  input: GetPresenceSnapshotInput
): Promise<SessionPresenceSnapshot> {
  // TODO: Replace with real presence computation.
  // For now:
  // - Return an empty presences array with current asOf timestamp.

  const snapshot: SessionPresenceSnapshot = {
    sessionId: input.sessionId,
    presences: [],
    asOf: new Date(),
  };

  return snapshot;
}
