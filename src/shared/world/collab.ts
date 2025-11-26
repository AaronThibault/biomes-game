/**
 * Collaborative editing types for Believe's placement editing system.
 *
 * This module defines the canonical representation of session events, edit deltas,
 * and presence state for collaborative editing. These types enable multiple users
 * to work together in the same PlacementEditSession with shared visibility into
 * activity and changes.
 *
 * These types are contracts for future collaboration systems and remain
 * independent of networking, transport layers, and persistence.
 */

import type {
  PlacementEditOperation,
  PlacementEditSessionId,
} from "@/shared/world/editing";

/**
 * Types of events that can occur during a collaborative editing session.
 */
export enum CollabSessionEventType {
  /** Session was created */
  SESSION_STARTED = "SESSION_STARTED",
  /** Session was closed */
  SESSION_CLOSED = "SESSION_CLOSED",
  /** User joined the session */
  USER_JOINED = "USER_JOINED",
  /** User left the session */
  USER_LEFT = "USER_LEFT",
  /** User's presence state was updated */
  PRESENCE_UPDATED = "PRESENCE_UPDATED",
  /** A placement edit operation was applied */
  OPERATION_APPLIED = "OPERATION_APPLIED",
  /** System-generated message or notification */
  SYSTEM_MESSAGE = "SYSTEM_MESSAGE",
}

/**
 * Unique identifier for a collaborative session event.
 */
export type CollabSessionEventId = string;

/**
 * Stream position marker for ordering and fetching events.
 * Monotonically increasing; later events have higher positions.
 */
export type CollabStreamPosition = string;

/**
 * Presence state representing a user's current activity and focus.
 *
 * Tracks where a user is working and what they're focused on within
 * a collaborative editing session.
 */
export interface PresenceState {
  /** User ID */
  readonly userId: string;

  /** Flag indicating if user is currently active */
  readonly isActive: boolean;

  /** Timestamp of last activity */
  readonly lastSeenAt: Date;

  /**
   * Optional region ID where user is currently focused.
   * Used to show which region the user is viewing or editing.
   */
  readonly regionId?: string;

  /**
   * Optional space ID where user is currently focused.
   * Used to show which space the user is viewing or editing.
   */
  readonly spaceId?: string;

  /**
   * Optional focus hint describing what user is doing.
   * Examples: "selection", "camera", "placement-123", "editing-transform"
   */
  readonly focusHint?: string;

  /**
   * Optional metadata for device-specific or custom presence data.
   * Can include camera position, selection state, etc.
   */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Edit delta representing the application of a placement edit operation.
 *
 * Wraps a PlacementEditOperation with metadata for the event stream,
 * enabling replay and synchronization of editing actions.
 */
export interface EditDelta {
  /** Unique identifier for the operation */
  readonly operationId: string;

  /** Parent session ID */
  readonly sessionId: PlacementEditSessionId;

  /** The placement edit operation that was applied */
  readonly operation: PlacementEditOperation;

  /** Timestamp when the operation was applied */
  readonly appliedAt: Date;

  /**
   * User ID of the person who applied this operation.
   * Plain string identifier; no user model import.
   */
  readonly appliedByUserId: string;
}

/**
 * A single event in a collaborative editing session.
 *
 * Represents a discrete occurrence (user joined, operation applied, etc.)
 * with ordering information for replay and synchronization.
 */
export interface CollabSessionEvent {
  /** Unique identifier for this event */
  readonly id: CollabSessionEventId;

  /** Parent session ID */
  readonly sessionId: PlacementEditSessionId;

  /** Type of event */
  readonly type: CollabSessionEventType;

  /** Timestamp when the event occurred */
  readonly timestamp: Date;

  /**
   * Stream position for ordering events.
   * Monotonically increasing; used for fetching events in order.
   */
  readonly streamPosition: CollabStreamPosition;

  /**
   * Optional user ID of the actor for this event.
   * Set for USER_JOINED, USER_LEFT, PRESENCE_UPDATED, OPERATION_APPLIED.
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
 * A batch of collaborative session events.
 *
 * Used for fetching events incrementally with pagination support.
 */
export interface CollabEventBatch {
  /** Array of events in this batch */
  readonly events: readonly CollabSessionEvent[];

  /**
   * Optional next stream position for pagination.
   * If present, more events are available starting from this position.
   * If undefined, this is the last batch.
   */
  readonly nextPosition?: CollabStreamPosition;
}

/**
 * A point-in-time snapshot of all presence states in a session.
 *
 * Provides a quick view of who is currently active and where they're working.
 */
export interface SessionPresenceSnapshot {
  /** Session ID */
  readonly sessionId: PlacementEditSessionId;

  /** Array of presence states for all users in the session */
  readonly presences: readonly PresenceState[];

  /** Timestamp when this snapshot was taken */
  readonly asOf: Date;
}
