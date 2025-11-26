# Runtime Engine Adapter Model

## Overview

This document defines the runtime engine adapter model for Believe. The Runtime Engine Adapter Model provides a stable, engine-agnostic interface for consuming `RuntimeWorldView` in game engines, enabling Biomes, Unreal Engine, Unity, custom WebGL engines, and other platforms to integrate with Believe's world state without coupling to Believe's internal implementation.

This is a contract-level specification defining types and service interfaces. No actual engine integration, no ECS, no networking.

## Purpose

### Engine-Agnostic Integration

The Runtime Engine Adapter Model enables consistent world state consumption across engines:

**Key Characteristics:**

- **Stable Contract**: Engines consume `RuntimeWorldView` through a consistent interface
- **Engine-Agnostic**: Works with Biomes, UE, Unity, WebGL, or custom engines
- **Separation of Concerns**: World semantics (Believe) separate from engine implementation
- **Incremental Updates**: Support for full rebuild or incremental diff application
- **Diagnostic-Friendly**: Optional debug events and diagnostics for troubleshooting

### Use Cases

**Biomes Integration:**

- Apply `RuntimeWorldView` to Biomes ECS
- Map placements to entity instances
- Track instance lifecycle (add/update/remove)

**Unreal Engine Integration:**

- Apply `RuntimeWorldView` to UE scene
- Spawn actors for placements
- Update transforms and properties

**Custom WebGL Engine:**

- Apply `RuntimeWorldView` to WebGL scene
- Create mesh instances for placements
- Manage scene graph updates

**Editor Preview:**

- Dry-run apply to validate changes
- Preview placement updates without committing
- Generate diagnostics for validation

## Core Concepts

### EngineAdapterId

Unique identifier for a given adapter implementation.

**Type:**

```typescript
type EngineAdapterId = string;
```

**Examples:**

- `"biomes-ecs"`: Biomes ECS adapter
- `"ue5-bridge"`: Unreal Engine 5 bridge
- `"webgl-renderer"`: Custom WebGL renderer
- `"noop"`: No-op stub for testing

### EnginePlacementInstanceRef

Mapping of Believe placement to engine instance.

**Structure:**

```typescript
interface EnginePlacementInstanceRef {
  readonly placementId: PlacementId;
  readonly instanceId: string;
  readonly regionId?: string;
  readonly spaceId?: string;
}
```

**Properties:**

- **placementId**: Believe placement identifier
- **instanceId**: Engine-specific instance identifier (entity ID, actor ID, etc.)
- **regionId**: Optional region context
- **spaceId**: Optional space context

**Use Cases:**

- Track placement-to-instance mapping
- Enable instance lookup by placement ID
- Support instance cleanup on removal

### EngineApplyMode

How to apply world view to engine.

**Enum:**

```typescript
enum EngineApplyMode {
  FULL = "FULL",
  INCREMENTAL = "INCREMENTAL",
}
```

**Values:**

- **FULL**: Full rebuild/re-apply of view (clear and recreate all instances)
- **INCREMENTAL**: Apply only diffs (add/update/remove changed placements)

### EngineApplyOptions

Configuration for world view application.

**Structure:**

```typescript
interface EngineApplyOptions {
  readonly mode?: EngineApplyMode;
  readonly onlyRegions?: readonly string[];
  readonly onlySpaces?: readonly string[];
  readonly onlyTags?: readonly string[];
  readonly onlyValid?: boolean;
  readonly dryRun?: boolean;
}
```

**Properties:**

- **mode**: Apply mode (FULL or INCREMENTAL, default: FULL)
- **onlyRegions**: Filter by region IDs
- **onlySpaces**: Filter by space IDs
- **onlyTags**: Filter by placement tags
- **onlyValid**: Only apply valid placements (skip invalid)
- **dryRun**: Compute result without applying to engine

**Use Cases:**

- Preview changes without applying
- Apply only specific regions for streaming
- Filter invalid placements
- Incremental updates for performance

### EngineApplyDiagnostics

Diagnostic information from apply operation.

**Structure:**

```typescript
interface EngineApplyDiagnostics {
  readonly debugEvents?: readonly DebugEvent[];
  readonly notes?: string;
  readonly metadata?: Record<string, unknown>;
}
```

**Properties:**

- **debugEvents**: Optional debug events (Phase 15)
- **notes**: Human-readable notes
- **metadata**: Optional extensible data

### EngineApplyResult

Result of applying world view to engine.

**Structure:**

```typescript
interface EngineApplyResult {
  readonly adapterId: EngineAdapterId;
  readonly appliedWorldVersion?: string;
  readonly instances: readonly EnginePlacementInstanceRef[];
  readonly added: readonly EnginePlacementInstanceRef[];
  readonly updated: readonly EnginePlacementInstanceRef[];
  readonly removed: readonly EnginePlacementInstanceRef[];
  readonly diagnostics?: EngineApplyDiagnostics;
}
```

**Properties:**

- **adapterId**: Adapter that produced this result
- **appliedWorldVersion**: Optional semantic version/label
- **instances**: All current instances after apply
- **added**: Instances added during apply
- **updated**: Instances updated during apply
- **removed**: Instances removed during apply
- **diagnostics**: Optional diagnostic information

### RuntimeEngineAdapter

Engine-agnostic adapter interface.

**Interface:**

```typescript
interface RuntimeEngineAdapter {
  readonly id: EngineAdapterId;
  describe(): string;
  applyWorldView(
    world: RuntimeWorldView,
    options?: EngineApplyOptions
  ): Promise<EngineApplyResult>;
  computeDiff(
    previous: RuntimeWorldView,
    next: RuntimeWorldView,
    options?: EngineApplyOptions
  ): Promise<EngineApplyResult>;
}
```

**Methods:**

**describe:**

- Returns human-readable description
- Example: "Biomes ECS adapter", "UE5 bridge"

**applyWorldView:**

- Apply `RuntimeWorldView` to engine
- Mode and filters controlled via options
- Returns result with instance refs and diagnostics

**computeDiff:**

- Compute diff between two views
- Optionally apply diff to engine
- Returns result with added/updated/removed instances

## Relationships

### RuntimeWorldView (Phase 11-12)

**Input:** `RuntimeWorldView`

**Usage:**

- Source of placements to apply
- Provides current world state
- Enables full or incremental apply

### DebugEvent (Phase 15)

**Integration:** Optional debug events in diagnostics

**Usage:**

- Record apply operations as debug events
- Track instance lifecycle events
- Diagnose apply failures

### USD Integration (Phase 9)

**Relationship:** Separate but complementary

**Distinction:**

- USD: Authoring and interchange format
- Engine Adapter: Runtime consumption interface
- USD prims may map to placements, which map to instances

### Region Streaming (Phase 14)

**Relationship:** Works alongside streaming

**Integration:**

- Streaming provides snapshots/deltas
- Adapter applies snapshots to engine
- Incremental mode supports delta application

## Design Constraints

### No Engine-Specific Imports

- No Biomes runtime/ECS imports
- No Unreal Engine SDK imports
- No Unity imports
- Pure TypeScript contracts

### No I/O or Networking

- No file system access
- No network requests
- No database queries
- Pure in-memory operations

### No Persistence

- No state storage
- No instance registry persistence
- Adapter implementations handle persistence

### Stubs Only (Phase 16)

- No actual engine calls
- No-op stub for testing
- Real implementations in future phases

## Non-Goals

This phase explicitly **does not** include:

### No Biomes Runtime Integration

- No ECS system integration
- No entity spawning
- No component updates
- Contracts only

### No Asset Loading

- No asset pipeline integration
- No mesh loading
- No texture loading
- Adapter implementations handle assets

### No Physics or Rendering

- No physics simulation
- No rendering setup
- No material application
- Adapter implementations handle these

### No Lifecycle Management

- No engine start/stop
- No scene management
- No memory management
- Adapter implementations handle lifecycle

## Use Cases

### Biomes ECS Integration

**Scenario:** Apply `RuntimeWorldView` to Biomes ECS

**Workflow:**

1. Create Biomes ECS adapter
2. Call `applyWorldView` with `RuntimeWorldView`
3. Adapter spawns entities for placements
4. Returns instance refs mapping placements to entities
5. Track instances for future updates

### Unreal Engine Integration

**Scenario:** Apply `RuntimeWorldView` to UE scene

**Workflow:**

1. Create UE5 bridge adapter
2. Call `applyWorldView` with `RuntimeWorldView`
3. Adapter spawns actors for placements
4. Returns instance refs mapping placements to actors
5. Update transforms and properties

### Incremental Updates

**Scenario:** Apply only changed placements

**Workflow:**

1. Store previous `RuntimeWorldView`
2. Get next `RuntimeWorldView` from streaming
3. Call `computeDiff(previous, next, { mode: INCREMENTAL })`
4. Adapter computes diff and applies changes
5. Returns added/updated/removed instances

### Dry-Run Preview

**Scenario:** Preview changes without applying

**Workflow:**

1. Get candidate `RuntimeWorldView` with pending changes
2. Call `applyWorldView(world, { dryRun: true })`
3. Adapter computes what would change
4. Returns result without modifying engine
5. Display preview to user for approval

## Design Principles

1. **Engine-Agnostic**: No coupling to specific engines
2. **Stable Contract**: Consistent interface across implementations
3. **Incremental-Friendly**: Support for full and incremental updates
4. **Diagnostic-Rich**: Optional debug events and diagnostics
5. **Filter-Capable**: Spatial and validity filtering

## Implementation Scope

**This Phase (Phase 16):**

- Define engine adapter types
- Define adapter interface
- Implement no-op stub adapter
- Document adapter model

**Future Phases:**

- Implement Biomes ECS adapter
- Implement UE/Unity bridges
- Add asset loading integration
- Add physics and rendering setup
- Implement lifecycle management
- Add performance optimization
- Implement instance pooling

## Future Considerations

- **Instance Pooling**: Reuse instances for performance
- **Asset Preloading**: Preload assets before apply
- **Batch Operations**: Batch instance creation for efficiency
- **Async Application**: Apply in chunks to avoid blocking
- **Error Recovery**: Handle apply failures gracefully
- **Metrics**: Track apply performance and diagnostics
- **Hot Reload**: Support runtime adapter swapping
- **Multi-Engine**: Support multiple adapters simultaneously
