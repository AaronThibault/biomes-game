# Collaborative Editing Model

## Overview

This document defines the collaborative editing subsystem for Believe's placement editing system. Collaborative editing enables multiple users to work together in the same `PlacementEditSession`, with shared visibility into who is active, what changes are happening, and a complete event stream that can be replayed to reconstruct session state.

This is a contract-level specification for event types, presence tracking, and service interfaces. No networking, transport layer, or persistence implementation is included in this phase.

## Purpose

The collaborative editing layer serves several critical needs:

1. **Multi-User Editing**: Enable multiple users to work in the same editing session simultaneously
2. **Shared Visibility**: Provide real-time awareness of who is active and what changes are being made
3. **Event Stream**: Record all session activity as discrete events for replay and synchronization
4. **Presence Tracking**: Show where each user is focused (region, space, selection)
5. **Conflict Avoidance**: Help users see what others are editing to avoid conflicting changes
6. **Audit Trail**: Maintain complete history of session activity for debugging and review

## Key Concepts

### Session Event

A **Session Event** is a discrete occurrence during an editing session.

**Event Types:**

- `SESSION_STARTED`: Session was created
- `SESSION_CLOSED`: Session was closed
- `USER_JOINED`: User joined the session
- `USER_LEFT`: User left the session
- `PRESENCE_UPDATED`: User's presence state changed (focus, activity)
- `OPERATION_APPLIED`: A `PlacementEditOperation` was applied
- `SYSTEM_MESSAGE`: System-generated message or notification

**Properties:**

- Unique event ID
- Session ID
- Event type
- Timestamp
- Stream position (monotonic ordering)
- Optional user ID (actor)
- Optional payload (delta, presence, message)

### Edit Delta

An **Edit Delta** is an event representing the application of a `PlacementEditOperation`.

**Properties:**

- Operation ID
- Session ID
- The full `PlacementEditOperation` (from Phase 5)
- Applied timestamp
- User who applied the operation

**Purpose:**

- Wraps operations with metadata for event stream
- Enables replay of all editing actions
- Links operations to specific users and timestamps

### Presence State

**Presence State** is a lightweight representation of a user's current activity and focus within a session.

**Properties:**

- User ID
- Active flag (is user currently active?)
- Last seen timestamp
- Optional region ID (where user is focused)
- Optional space ID (where user is focused)
- Optional focus hint (e.g., "selection", "camera", "placement-123")
- Optional metadata (extensible for device-specific data)

**Purpose:**

- Show who is currently active in the session
- Indicate where each user is working (region/space)
- Provide hints about what each user is doing
- Enable UI to highlight active areas and avoid conflicts

### Stream Position

A **Stream Position** is a monotonically increasing marker used to fetch events in order.

**Properties:**

- String representation (implementation-agnostic)
- Monotonically increasing (later events have higher positions)
- Opaque to clients (internal format can change)

**Purpose:**

- Enable clients to fetch events incrementally
- Support resuming from last known position
- Allow efficient pagination of event history

## Collaborative Editing Flow

### 1. Session Creation

- User creates a `PlacementEditSession` (Phase 5)
- System records `SESSION_STARTED` event
- Session is now available for collaboration

### 2. Users Join

- Additional users join the session
- System records `USER_JOINED` event for each
- Each user receives current session state and event history

### 3. Presence Updates

- Users update their presence as they navigate and work
- System records `PRESENCE_UPDATED` events
- Other participants see where each user is focused

### 4. Operations Applied

- Users apply `PlacementEditOperation` objects (Phase 5)
- Each operation becomes an `OPERATION_APPLIED` event with `EditDelta`
- Other participants consume events and update their local view
- Session's `draftPlacements` and `operations` arrays grow

### 5. Validation & Commit

- Eventually, session owner prepares commit (Phase 6)
- Validation runs on draft placements (Phase 7)
- If valid, commit is applied to live placements
- Session can be closed with `SESSION_CLOSED` event

## Event Stream Model

### Event Ordering

Events are ordered by `streamPosition`:

- Positions are monotonically increasing
- Events with lower positions occurred earlier
- Clients can fetch events from a specific position onward

### Event Replay

The event stream can be replayed to reconstruct session state:

1. Start with empty session
2. Apply `SESSION_STARTED` event
3. Apply each `USER_JOINED` event
4. Apply each `OPERATION_APPLIED` event (rebuild `operations` and `draftPlacements`)
5. Apply `PRESENCE_UPDATED` events (rebuild current presence)
6. Result: complete session state at any point in time

### Event Batching

Events can be fetched in batches:

- Client requests events from position X
- Server returns batch of events
- Server includes `nextPosition` for pagination
- Client can request next batch starting from `nextPosition`

## Presence Model

### Presence Lifecycle

1. **User Joins**: Initial presence created with `isActive: true`
2. **User Navigates**: Presence updated with new `regionId`/`spaceId`
3. **User Focuses**: Presence updated with `focusHint` (e.g., "placement-123")
4. **User Idle**: Presence updated with `isActive: false`
5. **User Leaves**: Presence removed or marked inactive

### Presence Snapshot

A **Presence Snapshot** is a point-in-time view of all active users:

- Session ID
- Array of `PresenceState` objects
- Timestamp (`asOf`)

**Purpose:**

- Quickly show who is currently in the session
- Display user avatars or indicators in UI
- Highlight regions/spaces where users are working

## Relationship to Other Systems

### Phase 5: Edit Sessions

- Collaborative editing builds on `PlacementEditSession`
- Operations from Phase 5 become `EditDelta` events
- Session participants tracked via presence

### Phase 6: Commit Workflow

- Collaborative sessions eventually produce commits
- Event stream provides audit trail for commit
- Multiple users can collaborate before commit

### Phase 7: Validation

- Validation can run on collaborative session state
- Validation results can be shared via events
- Helps users catch issues before commit

### Permissions System

- `MANAGE_COLLABORATION` capability controls who can manage sessions
- `EDIT_PLACEMENTS` still required to apply operations
- Presence visibility may be permission-gated (future)

## Design Principles

1. **Connection-Agnostic**: Event model works with any transport (WebSocket, HTTP, etc.)
2. **Replayable**: Complete event stream enables state reconstruction
3. **Presence-Aware**: Users see who else is active and where
4. **Ordered**: Stream positions ensure consistent event ordering
5. **Extensible**: Metadata fields allow device-specific data
6. **Audit-Friendly**: All actions recorded with user and timestamp

## Implementation Scope

**This Phase (Phase 8):**

- Define event and presence contracts (types and interfaces)
- Specify collaboration service API
- Document collaborative editing concepts and flows
- Provide stub implementations for testing

**Future Phases:**

- Implement real-time event transport (WebSocket, Server-Sent Events)
- Add event persistence (database, event store)
- Build presence aggregation and broadcast
- Implement conflict detection and resolution
- Add collaborative editing UI (cursors, highlights, avatars)
- Integrate with authentication and permissions

## Future Considerations

- **Conflict Resolution**: Operational transformation or CRDTs for concurrent edits
- **Offline Support**: Queue events locally and sync when reconnected
- **Event Compaction**: Compress event history for long-running sessions
- **Presence Throttling**: Rate-limit presence updates to reduce traffic
- **Selective Sync**: Only sync events for visible regions/spaces
- **Event Filtering**: Allow clients to subscribe to specific event types
- **Presence Expiry**: Auto-mark users inactive after timeout
- **Session Forking**: Create new session from existing event stream
