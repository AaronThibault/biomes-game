# Region Streaming Model

## Overview

This document defines the region streaming model for Believe. The Region Streaming Model provides snapshot and delta contracts for runtime consumption, enabling engines, editors, and analytics tools to stream world state efficiently.

This is a contract-level specification defining types and service interfaces. No networking, no persistence, no ECS integration, and no Biomes-specific runtime hooks.

## Purpose

### Snapshot & Delta Contracts

The Region Streaming Model enables efficient world state distribution:

**Key Characteristics:**

- **Snapshot-Based**: Complete region/world state at a point in time
- **Delta-Based**: Incremental changes between snapshots
- **Cursor-Driven**: Opaque position in change history (not timestamps)
- **Runtime-Friendly**: Structured for engine/runtime consumption
- **Transport-Agnostic**: No assumptions about networking or storage

### Use Cases

**Engine Streaming:**

- Stream regions as player moves through world
- Apply deltas for incremental updates
- Minimize bandwidth and processing

**Editor Preview:**

- Snapshot world state for preview
- Show changes before commit
- Validate placement updates

**Analytics:**

- Track world evolution over time
- Analyze placement density
- Monitor region activity

## Core Concepts

### StreamingCursor

Opaque position in change history.

**Type:**

```typescript
type StreamingCursor = string;
```

**Properties:**

- Opaque string identifier
- Not a timestamp (may be version number, hash, or sequence ID)
- Used to request snapshots/deltas "since cursor X"
- Deterministic ordering (cursor A < cursor B implies A happened before B)

### RegionSnapshot

Complete state of a single region at a point in time.

**Structure:**

```typescript
interface RegionSnapshot {
  readonly id: RegionSnapshotId;
  readonly regionId: string;
  readonly cursor: StreamingCursor;
  readonly placements: readonly RuntimePlacementView[];
  readonly createdAt: Date;
  readonly metadata?: Record<string, unknown>;
}
```

**Properties:**

- **id**: Unique snapshot identifier
- **regionId**: Region this snapshot represents
- **cursor**: Position in change history
- **placements**: All placements in region at this cursor
- **createdAt**: When snapshot was created
- **metadata**: Optional extensible data

### WorldSnapshot

Complete state of multiple regions at a point in time.

**Structure:**

```typescript
interface WorldSnapshot {
  readonly id: WorldSnapshotId;
  readonly cursor: StreamingCursor;
  readonly regions: readonly RegionSnapshot[];
  readonly createdAt: Date;
  readonly metadata?: Record<string, unknown>;
}
```

**Properties:**

- **id**: Unique snapshot identifier
- **cursor**: Global position in change history
- **regions**: Array of region snapshots
- **createdAt**: When snapshot was created
- **metadata**: Optional extensible data

### RegionDelta

Changes to a single region between two cursors.

**Structure:**

```typescript
interface RegionDelta {
  readonly regionId: string;
  readonly fromCursor: StreamingCursor;
  readonly toCursor: StreamingCursor;
  readonly added: readonly RuntimePlacementView[];
  readonly updated: readonly RuntimePlacementView[];
  readonly removed: readonly PlacementId[];
  readonly metadata?: Record<string, unknown>;
}
```

**Properties:**

- **regionId**: Region this delta applies to
- **fromCursor**: Starting position
- **toCursor**: Ending position
- **added**: Placements added since fromCursor
- **updated**: Placements modified since fromCursor
- **removed**: Placement IDs removed since fromCursor
- **metadata**: Optional extensible data

### WorldDelta

Changes to multiple regions between two cursors.

**Structure:**

```typescript
interface WorldDelta {
  readonly fromCursor: StreamingCursor;
  readonly toCursor: StreamingCursor;
  readonly regions: readonly RegionDelta[];
  readonly metadata?: Record<string, unknown>;
}
```

**Properties:**

- **fromCursor**: Global starting position
- **toCursor**: Global ending position
- **regions**: Array of region deltas
- **metadata**: Optional extensible data

## Inputs

### RuntimeWorldView (from Phase 11-12)

**Input:** `RuntimeWorldView`

**Usage:**

- Source of placements for snapshots
- Provides current world state
- Enables snapshot generation

## Outputs

### Snapshots

**RegionSnapshot:**

- Complete region state at cursor
- All placements in region
- Suitable for initial load or full refresh

**WorldSnapshot:**

- Complete multi-region state at cursor
- All regions and their placements
- Suitable for world-wide operations

### Deltas

**RegionDelta:**

- Incremental changes to region
- Added, updated, removed placements
- Suitable for streaming updates

**WorldDelta:**

- Incremental changes to world
- Multiple region deltas
- Suitable for distributed updates

## Service Interface

### RegionStreamingService

Service interface for snapshot and delta operations.

**Methods:**

```typescript
interface RegionStreamingService {
  getRegionSnapshot(input: GetRegionSnapshotInput): Promise<RegionSnapshot>;
  getWorldSnapshot(input: GetWorldSnapshotInput): Promise<WorldSnapshot>;
  getRegionDelta(input: GetRegionDeltaInput): Promise<RegionDelta>;
  getWorldDelta(input: GetWorldDeltaInput): Promise<WorldDelta>;
}
```

**getRegionSnapshot:**

- Get complete region state at cursor
- Optional cursor parameter (defaults to latest)
- Returns RegionSnapshot

**getWorldSnapshot:**

- Get complete world state at cursor
- Optional region filter
- Returns WorldSnapshot

**getRegionDelta:**

- Get region changes between cursors
- Requires fromCursor, optional toCursor
- Returns RegionDelta

**getWorldDelta:**

- Get world changes between cursors
- Optional region filter
- Returns WorldDelta

## Design Constraints

### No Networking

- No WebSocket implementation
- No HTTP routes
- No transport layer
- Contracts only

### No Persistence

- No database queries
- No file I/O
- No caching
- Stub implementations only

### No ECS Integration

- No entity-component-system
- No Biomes runtime hooks
- No game loop integration
- Pure TypeScript contracts

## Non-Goals

This phase explicitly **does not** include:

### No Chunk Streaming

- No spatial chunking
- No chunk-based loading
- No LOD management
- Region-level only

### No Interest Management

- No player proximity filtering
- No visibility culling
- No priority queuing
- Simple region-based filtering

### No Bandwidth Optimization

- No compression
- No binary serialization
- No delta encoding
- Simple JSON-compatible structures

### No Real-Time Streaming

- No WebSocket server
- No push notifications
- No real-time updates
- Pull-based API only

## Use Cases

### Engine Streaming

**Scenario:** Game engine needs to stream regions as player moves

**Workflow:**

1. Request initial WorldSnapshot for nearby regions
2. Load placements from snapshot
3. Periodically request WorldDelta for updates
4. Apply delta changes (add/update/remove)
5. Repeat for new regions as player moves

### Editor Preview

**Scenario:** Editor needs to preview world with pending changes

**Workflow:**

1. Get current WorldSnapshot
2. Apply pending CommitPlan to get effective placements
3. Build RuntimeWorldView with changes
4. Generate preview snapshot
5. Display to user for approval

### Analytics

**Scenario:** Analytics tool tracks world evolution

**Workflow:**

1. Store initial WorldSnapshot as baseline
2. Periodically request WorldDelta
3. Analyze added/updated/removed placements
4. Generate metrics (density, activity, growth)
5. Store deltas for historical analysis

## Design Principles

1. **Cursor-Driven**: All operations use cursors, not timestamps
2. **Immutable**: All snapshots and deltas are readonly
3. **Transport-Agnostic**: No assumptions about networking
4. **Runtime-Friendly**: Structured for engine consumption
5. **Deterministic**: Same input always produces same output

## Implementation Scope

**This Phase (Phase 14):**

- Define snapshot and delta types
- Define service interface
- Implement stub service functions
- Document streaming model

**Future Phases:**

- Implement actual snapshot generation from RuntimeWorldView
- Implement delta computation between cursors
- Add cursor management and versioning
- Integrate with persistence layer
- Add networking/transport layer
- Implement chunk-based streaming
- Add interest management
- Optimize for bandwidth

## Future Considerations

- **Cursor Implementation**: Version numbers, hashes, or sequence IDs
- **Delta Compression**: Reduce delta size for large updates
- **Binary Serialization**: Efficient wire format
- **Chunk Streaming**: Spatial subdivision for large regions
- **Interest Management**: Filter by player proximity
- **Priority Queuing**: Stream important regions first
- **Incremental Loading**: Load placements progressively
- **Caching**: Cache snapshots for performance
- **Versioning**: Handle schema evolution
- **Conflict Resolution**: Handle concurrent updates
