/**
 * Runtime debug service API for Believe's debug and introspection system.
 *
 * This module defines the service interface for debug event recording,
 * querying, and snapshot creation. Phase 15 provides stub implementations
 * only — actual event storage and querying will be added in future phases.
 *
 * No logging backend, no persistence, no transport, no engine hooks.
 */

import type {
  DebugEvent,
  DebugEventId,
  DebugProbe,
  DebugSnapshot,
} from "@/shared/runtime/debug";
import type { RuntimeWorldView } from "@/shared/world/runtime_view";

/**
 * Input parameters for recording a debug event.
 */
export interface RecordDebugEventInput {
  /** Debug event to record */
  readonly event: DebugEvent;
}

/**
 * Input parameters for querying debug events.
 */
export interface GetDebugEventsInput {
  /** Optional probe to filter events */
  readonly probe?: DebugProbe;

  /** Optional cursor for pagination (events after this ID) */
  readonly sinceId?: DebugEventId;

  /** Maximum number of events to return */
  readonly limit?: number;
}

/**
 * Input parameters for creating a debug snapshot.
 */
export interface CreateDebugSnapshotInput {
  /** RuntimeWorldView to snapshot */
  readonly worldView: RuntimeWorldView;

  /** Optional probe to filter events */
  readonly probe?: DebugProbe;
}

/**
 * Service interface for runtime debug operations.
 *
 * Provides event recording, querying, and snapshot creation for runtime
 * introspection. Future implementations will integrate with logging
 * infrastructure and persistence layer.
 */
export interface RuntimeDebugService {
  /**
   * Record a debug event.
   *
   * Future implementations will:
   * - Validate event structure
   * - Store event in persistence layer
   * - Trigger real-time notifications
   *
   * @param input - Record parameters
   * @returns Promise resolving to recorded event
   */
  recordEvent(input: RecordDebugEventInput): Promise<DebugEvent>;

  /**
   * Query debug events with optional probe filter.
   *
   * Future implementations will:
   * - Filter events by probe criteria
   * - Support pagination via sinceId
   * - Query from persistence layer
   *
   * @param input - Query parameters
   * @returns Promise resolving to matching events
   */
  getEvents(input: GetDebugEventsInput): Promise<readonly DebugEvent[]>;

  /**
   * Create debug snapshot of current world state.
   *
   * Future implementations will:
   * - Capture RuntimeWorldView
   * - Filter events by probe
   * - Store snapshot in persistence layer
   *
   * @param input - Snapshot parameters
   * @returns Promise resolving to debug snapshot
   */
  createSnapshot(input: CreateDebugSnapshotInput): Promise<DebugSnapshot>;
}

/**
 * Record debug event (stub implementation).
 *
 * This is a pure stub that ensures event has ID and timestamp.
 * Future implementations will:
 * - Validate event structure
 * - Store event in persistence layer
 * - Trigger real-time notifications
 *
 * @param input - Record parameters
 * @returns Promise resolving to event with ID and timestamp
 */
export async function recordDebugEventStub(
  input: RecordDebugEventInput
): Promise<DebugEvent> {
  // Ensure event has ID and timestamp
  const event = input.event;
  const id = event.id || `dbg-${Date.now()}`;
  const timestamp = event.timestamp || new Date();

  const recordedEvent: DebugEvent = {
    ...event,
    id,
    timestamp,
  };

  return recordedEvent;
}

/**
 * Get debug events (stub implementation).
 *
 * This is a pure stub that returns an empty array.
 * Future implementations will:
 * - Filter events by probe criteria
 * - Support pagination via sinceId
 * - Query from persistence layer
 *
 * @param _input - Query parameters (unused in stub)
 * @returns Promise resolving to empty array
 */
export async function getDebugEventsStub(
  _input: GetDebugEventsInput
): Promise<readonly DebugEvent[]> {
  // TODO: Replace with real event querying
  return [];
}

/**
 * Create debug snapshot (stub implementation).
 *
 * This is a pure stub that returns a snapshot with empty events.
 * Future implementations will:
 * - Capture RuntimeWorldView
 * - Filter events by probe
 * - Store snapshot in persistence layer
 *
 * @param input - Snapshot parameters
 * @returns Promise resolving to debug snapshot
 */
export async function createDebugSnapshotStub(
  input: CreateDebugSnapshotInput
): Promise<DebugSnapshot> {
  // Generate snapshot ID
  const id = `snap-${Date.now()}`;

  const snapshot: DebugSnapshot = {
    id,
    createdAt: new Date(),
    worldView: input.worldView,
    events: [], // Empty (stub)
    probe: input.probe,
    metadata: {
      stub: true,
      message: "Stub implementation - no actual events",
    },
  };

  return snapshot;
}
