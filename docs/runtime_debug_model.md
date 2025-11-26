# Runtime Debug Model

## Overview

This document defines the runtime debug and introspection model for Believe. The Runtime Debug Model provides structured, queryable debug information about the live world state, enabling engine-side tooling, editor overlays, and diagnostics.

This is a contract-level specification defining types and service interfaces. No logging backend, no persistence, no transport, and no engine hooks.

## Purpose

### Structured Debug Information

The Runtime Debug Model enables comprehensive introspection of world state:

**Key Characteristics:**

- **Event-Based**: Atomic debug records tied to placements, regions, and assets
- **Probe-Driven**: Configured interest in specific entities, regions, or tags
- **Snapshot-Capable**: Summarized views of current debug-relevant state
- **Multi-Layer**: Bridges validation, commits, PlanGraph, and USD integration
- **Runtime-Friendly**: Structured for engine/tooling consumption

### Use Cases

**Engine-Side Tooling:**

- Debug overlays showing placement issues
- Performance monitoring and profiling
- State inspection and validation

**Editor Diagnostics:**

- Real-time validation feedback
- Commit preview with debug annotations
- Asset placement conflict detection

**System Monitoring:**

- Track world state evolution
- Monitor validation failures
- Analyze commit patterns

## Core Concepts

### DebugEvent

Atomic debug record tied to placements, regions, or assets.

**Structure:**

```typescript
interface DebugEvent {
  readonly id: DebugEventId;
  readonly type: DebugEventType;
  readonly severity: DebugSeverity;
  readonly message: string;
  readonly timestamp: Date;
  readonly context?: DebugEventContext;
  readonly metadata?: Record<string, unknown>;
}
```

**Properties:**

- **id**: Unique event identifier
- **type**: Event classification (validation issue, commit applied, etc.)
- **severity**: INFO, WARNING, or ERROR
- **message**: Human-readable description
- **timestamp**: When event occurred
- **context**: Optional placement/region/asset references
- **metadata**: Optional extensible data

**Event Types:**

- `VALIDATION_ISSUE`: Validation error or warning
- `COMMIT_APPLIED`: Commit successfully applied
- `COMMIT_REJECTED`: Commit rejected due to conflicts
- `PLACEMENT_CHANGE_PREVIEW`: Preview of pending changes
- `RUNTIME_STATE_NOTE`: General runtime state observation
- `PERFORMANCE_NOTE`: Performance metric or warning
- `SYSTEM_MESSAGE`: System-level notification
- `OTHER`: Unclassified event

### DebugEventContext

Contextual references for debug events.

**Structure:**

```typescript
interface DebugEventContext {
  readonly placementId?: PlacementId;
  readonly regionId?: string;
  readonly spaceId?: string;
  readonly assetId?: string;
  readonly validationIssueIds?: readonly string[];
  readonly planNodeId?: PlanNodeId;
  readonly usdPrimPath?: string;
}
```

**Properties:**

- **placementId**: Reference to RuntimePlacementView (Phase 11-12)
- **regionId/spaceId**: Spatial context
- **assetId**: Asset reference
- **validationIssueIds**: Related validation issues (Phase 7, 12)
- **planNodeId**: PlanGraph node reference (Phase 10)
- **usdPrimPath**: USD prim path reference (Phase 9)

### DebugProbe

Configured interest in specific entities, regions, or tags.

**Structure:**

```typescript
interface DebugProbe {
  readonly id: DebugProbeId;
  readonly createdAt: Date;
  readonly createdByUserId?: string;
  readonly regions?: readonly string[];
  readonly spaces?: readonly string[];
  readonly placementIds?: readonly PlacementId[];
  readonly tags?: readonly string[];
  readonly severities?: readonly DebugSeverity[];
  readonly eventTypes?: readonly DebugEventType[];
  readonly metadata?: Record<string, unknown>;
}
```

**Properties:**

- **id**: Unique probe identifier
- **createdAt**: When probe was created
- **createdByUserId**: Optional user who created probe
- **regions/spaces**: Spatial filters
- **placementIds**: Specific placement filters
- **tags**: Tag-based filters
- **severities**: Severity filters (INFO, WARNING, ERROR)
- **eventTypes**: Event type filters
- **metadata**: Optional extensible data

**Use Cases:**

- Filter events by region for debugging specific areas
- Monitor specific placements for changes
- Track validation issues by severity
- Focus on commit-related events

### DebugSnapshot

Summarized view of current debug-relevant state.

**Structure:**

```typescript
interface DebugSnapshot {
  readonly id: DebugSnapshotId;
  readonly createdAt: Date;
  readonly worldView: RuntimeWorldView;
  readonly events: readonly DebugEvent[];
  readonly probe?: DebugProbe;
  readonly metadata?: Record<string, unknown>;
}
```

**Properties:**

- **id**: Unique snapshot identifier
- **createdAt**: When snapshot was created
- **worldView**: Complete RuntimeWorldView (Phase 11-12)
- **events**: Debug events relevant to this snapshot
- **probe**: Optional probe used to filter events
- **metadata**: Optional extensible data

**Use Cases:**

- Capture world state for offline analysis
- Compare snapshots to track evolution
- Export debug data for bug reports

## Relationships

### RuntimePlacementView (Phase 11-12)

Debug events reference placements via `context.placementId`:

- Track placement changes
- Associate validation issues with placements
- Monitor placement lifecycle

### Validation Issues (Phase 7, 12)

Debug events can reference validation issues via `context.validationIssueIds`:

- Link debug events to specific validation failures
- Track validation issue resolution
- Correlate validation with commits

### Commit Plans (Phase 6, 12)

Debug events track commit lifecycle:

- `COMMIT_APPLIED`: Successful commit application
- `COMMIT_REJECTED`: Commit rejection with conflicts
- `PLACEMENT_CHANGE_PREVIEW`: Preview of pending changes

### PlanGraph (Phase 10)

Debug events reference PlanGraph nodes via `context.planNodeId`:

- Track design intent changes
- Associate events with plan history
- Link runtime state to design decisions

### USD Integration (Phase 9)

Debug events reference USD prims via `context.usdPrimPath`:

- Track USD layer changes
- Associate events with USD composition
- Link runtime state to USD scene graph

## Service Interface

### RuntimeDebugService

Service interface for debug event recording and querying.

**Methods:**

```typescript
interface RuntimeDebugService {
  recordEvent(input: RecordDebugEventInput): Promise<DebugEvent>;
  getEvents(input: GetDebugEventsInput): Promise<readonly DebugEvent[]>;
  createSnapshot(input: CreateDebugSnapshotInput): Promise<DebugSnapshot>;
}
```

**recordEvent:**

- Record a new debug event
- Ensures event has ID and timestamp
- Returns recorded event

**getEvents:**

- Query debug events with optional probe filter
- Optional pagination via sinceId and limit
- Returns matching events

**createSnapshot:**

- Create debug snapshot of current world state
- Includes RuntimeWorldView and filtered events
- Returns snapshot with unique ID

## Design Constraints

### No Logging Backend

- No log file writing
- No log aggregation
- No log rotation
- Contracts only

### No Persistence

- No database storage
- No event history
- No snapshot storage
- Stub implementations only

### No Transport

- No WebSocket streaming
- No HTTP endpoints
- No network protocols
- Pure TypeScript contracts

### No Engine Hooks

- No game loop integration
- No rendering hooks
- No ECS integration
- Runtime-agnostic

## Non-Goals

This phase explicitly **does not** include:

### No Logging Infrastructure

- No logging backend
- No log levels configuration
- No log formatters
- Simple event recording only

### No Persistence Layer

- No event storage
- No snapshot persistence
- No query optimization
- In-memory only

### No Real-Time Streaming

- No WebSocket server
- No push notifications
- No live updates
- Pull-based API only

### No Performance Profiling

- No CPU profiling
- No memory profiling
- No frame timing
- Simple performance notes only

## Use Cases

### Engine Debug Overlay

**Scenario:** Game engine needs to show debug info for placements

**Workflow:**

1. Create DebugProbe for current region
2. Query debug events via getEvents
3. Filter events by severity (ERROR, WARNING)
4. Display overlay with placement issues
5. Update periodically

### Editor Validation Feedback

**Scenario:** Editor needs real-time validation feedback

**Workflow:**

1. Record validation issues as debug events
2. Associate events with placementIds
3. Query events for current space
4. Display validation markers in editor
5. Update on placement changes

### Commit Preview Diagnostics

**Scenario:** Preview commit with debug annotations

**Workflow:**

1. Create CommitPlan
2. Record PLACEMENT_CHANGE_PREVIEW events
3. Build RuntimeWorldView with commit applied
4. Create DebugSnapshot with preview events
5. Display preview with annotations

### System Monitoring

**Scenario:** Monitor world state health

**Workflow:**

1. Create DebugProbe for all regions
2. Record SYSTEM_MESSAGE events
3. Query events periodically
4. Analyze event patterns
5. Alert on ERROR severity events

## Design Principles

1. **Event-Based**: All debug info as discrete events
2. **Immutable**: All events and snapshots are readonly
3. **Queryable**: Probe-based filtering and pagination
4. **Multi-Layer**: References validation, commits, PlanGraph, USD
5. **Runtime-Friendly**: Structured for engine consumption

## Implementation Scope

**This Phase (Phase 15):**

- Define debug event, probe, and snapshot types
- Define service interface
- Implement stub service functions
- Document debug model
- Extend permissions with VIEW_RUNTIME_DEBUG

**Future Phases:**

- Implement actual event recording and storage
- Add event querying with probe filters
- Implement snapshot generation from RuntimeWorldView
- Add persistence layer for events and snapshots
- Integrate with logging infrastructure
- Add real-time event streaming
- Implement performance profiling
- Add visualization tools

## Future Considerations

- **Event Storage**: Persistent event history with retention policies
- **Event Aggregation**: Summarize events for analytics
- **Real-Time Streaming**: WebSocket-based event streaming
- **Performance Profiling**: CPU, memory, and frame timing
- **Visualization**: Debug overlay rendering
- **Export**: Export snapshots for bug reports
- **Filtering**: Advanced probe filters and queries
- **Correlation**: Link events across layers (validation, commits, USD)
