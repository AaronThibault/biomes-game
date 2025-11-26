# Runtime Asset Binding Model

## Overview

This document defines the runtime asset binding and resource loading model for Believe. The Runtime Asset Binding Model bridges `BelieveAsset` and `RuntimeWorldView` to engine-facing asset handles, providing a stable, engine-neutral surface for asset loading without integrating with specific engine SDKs or performing actual I/O.

This is a contract-level specification defining types and service interfaces. No engine code, no disk/network access, no Biomes runtime imports.

## Purpose

### Asset-to-Handle Bridge

The Runtime Asset Binding Model enables consistent asset loading across engines:

**Key Characteristics:**

- **Engine-Agnostic**: Works with Biomes, UE, Unity, WebGL, or custom engines
- **Load State Visibility**: Clear visibility into loading state and failures
- **Logical-to-Physical**: Maps logical assets (BelieveAsset) to engine resources (handles)
- **Failure Handling**: Structured representation of missing or failed assets
- **Metadata-Rich**: Optional USD and PlanGraph references for debugging

### Use Cases

**Biomes ECS Integration:**

- Map assetIds to Biomes entity templates
- Track loading state for entities
- Handle missing asset fallbacks

**Unreal Engine Integration:**

- Map assetIds to UE asset paths
- Load assets asynchronously
- Track loading progress

**WebGL/Three.js Integration:**

- Map assetIds to GLTF/texture URLs
- Load resources via fetch
- Display loading indicators

**Editor Preview:**

- Show loading state for assets
- Identify missing or failed assets
- Provide fallback representations

## Core Concepts

### RuntimeAssetHandle

Engine-agnostic reference to a loaded resource.

**Structure:**

```typescript
interface RuntimeAssetHandle {
  readonly id: RuntimeAssetHandleId;
  readonly assetId: string;
  readonly sourceType?: string;
  readonly loadState: RuntimeAssetLoadState;
  readonly lastUpdatedAt?: Date;
  readonly metadata?: Record<string, unknown>;
}
```

**Properties:**

- **id**: Unique handle identifier
- **assetId**: BelieveAsset identifier
- **sourceType**: Optional source type (e.g., "USD", "GLTF", "UE_ASSET")
- **loadState**: Current load state (UNLOADED, LOADING, READY, FAILED)
- **lastUpdatedAt**: When handle was last updated
- **metadata**: Engine-specific hints (paths, options, etc.)

**Examples:**

- USD handle: `{ sourceType: "USD", metadata: { usdPath: "/assets/tree.usd" } }`
- GLTF handle: `{ sourceType: "GLTF", metadata: { url: "https://cdn.../tree.gltf" } }`
- UE handle: `{ sourceType: "UE_ASSET", metadata: { assetPath: "/Game/Assets/Tree" } }`

### RuntimeAssetLoadState

Current state of asset loading.

**Enum:**

```typescript
enum RuntimeAssetLoadState {
  UNLOADED = "UNLOADED",
  LOADING = "LOADING",
  READY = "READY",
  FAILED = "FAILED",
}
```

**Values:**

- **UNLOADED**: Asset not yet requested
- **LOADING**: Asset loading in progress
- **READY**: Asset loaded and ready for use
- **FAILED**: Asset loading failed (missing, corrupt, etc.)

### RuntimeAssetBinding

Binding between assetId and one or more handles.

**Structure:**

```typescript
interface RuntimeAssetBinding {
  readonly id: RuntimeAssetBindingId;
  readonly assetId: string;
  readonly handles: readonly RuntimeAssetHandle[];
  readonly loadState: RuntimeAssetLoadState;
  readonly missing?: boolean;
  readonly errorMessage?: string;
  readonly usdPrimPath?: string;
  readonly planNodeId?: PlanNodeId;
  readonly metadata?: Record<string, unknown>;
}
```

**Properties:**

- **id**: Unique binding identifier
- **assetId**: BelieveAsset identifier
- **handles**: Array of engine-specific handles
- **loadState**: Aggregate load state (READY if all handles READY)
- **missing**: True if no known way to resolve this asset
- **errorMessage**: Error message if FAILED
- **usdPrimPath**: Optional link to USD (Phase 9)
- **planNodeId**: Optional link to PlanGraph (Phase 10)
- **metadata**: Optional extensible data

**Aggregate Load State:**

- READY: All handles are READY
- LOADING: At least one handle is LOADING
- FAILED: At least one handle is FAILED
- UNLOADED: All handles are UNLOADED

### RuntimeAssetBindingSet

Collection of bindings derived from RuntimeWorldView.

**Structure:**

```typescript
interface RuntimeAssetBindingSet {
  readonly worldVersion?: string;
  readonly bindings: readonly RuntimeAssetBinding[];
}
```

**Properties:**

- **worldVersion**: Optional semantic version/label
- **bindings**: Array of asset bindings

### Logical Asset vs Engine Resource

**Logical Asset (BelieveAsset):**

- Abstract asset definition
- Engine-agnostic metadata
- Unique assetId

**Engine Resource (RuntimeAssetHandle):**

- Engine-specific representation
- Actual loaded resource (mesh, texture, etc.)
- Load state and metadata

**Binding:**

- Maps logical asset to engine resources
- One asset may have multiple handles (LOD levels, platform variants)
- Tracks aggregate load state

## Relationships

### BelieveAsset (Phase 2)

**Input:** `BelieveAsset`

**Usage:**

- Source of asset metadata
- Provides assetId for binding
- Defines asset type and properties

### RuntimeWorldView (Phase 11-12)

**Input:** `RuntimeWorldView`

**Usage:**

- Source of placements with assetIds
- Determines which assets need bindings
- Provides context for asset usage

### RuntimeEngineAdapter (Phase 16)

**Output:** Asset bindings consumed by adapters

**Integration:**

- Adapters use bindings to load resources
- Track loading state per adapter
- Handle missing/failed assets gracefully

### USD Integration (Phase 9)

**Optional Metadata:** `usdPrimPath`

**Usage:**

- Link binding to USD prim for canonical geometry
- Enable USD-based asset loading
- Support USD composition

### PlanGraph (Phase 10)

**Optional Metadata:** `planNodeId`

**Usage:**

- Link binding to design intent
- Enable debugging and diagnostics
- Track asset provenance

## Service Interface

### RuntimeAssetBindingService

Service interface for creating and inspecting asset bindings.

**Methods:**

```typescript
interface RuntimeAssetBindingService {
  buildBindings(
    input: BuildRuntimeAssetBindingsInput
  ): Promise<RuntimeAssetBindingSet>;

  getBindingById(
    input: GetAssetBindingByIdInput
  ): Promise<RuntimeAssetBinding | null>;

  getBindingByAssetId(
    input: GetAssetBindingByAssetIdInput
  ): Promise<RuntimeAssetBinding | null>;

  getMissingOrFailedBindings(
    bindings: RuntimeAssetBindingSet
  ): Promise<readonly RuntimeAssetBinding[]>;
}
```

**buildBindings:**

- Build bindings from RuntimeWorldView
- Create handles for each unique assetId
- Return binding set

**getBindingById:**

- Get binding by binding ID
- Returns null if not found

**getBindingByAssetId:**

- Get binding by asset ID
- Returns null if not found

**getMissingOrFailedBindings:**

- Filter bindings for missing or failed assets
- Returns array of problematic bindings

## Design Constraints

### No Engine SDK Integration

- No Biomes runtime/ECS imports
- No Unreal Engine SDK imports
- No Unity imports
- No WebGL/Three.js imports
- Pure TypeScript contracts

### No I/O

- No filesystem access
- No network calls
- No database queries
- Pure in-memory operations

### No Asset Loading

- No actual file loading
- No streaming
- No asset cache implementation
- Stub implementations only

### Engine-Agnostic

- All engine-specific hints in metadata
- No engine-specific types
- Portable across platforms

## Non-Goals

This phase explicitly **does not** include:

### No Actual Asset Loading

- No file loading or streaming
- No asset cache
- No resource management
- Stub implementations only

### No Engine SDK Integration

- No Biomes runtime integration
- No UE/Unity integration
- No WebGL/Three.js integration
- Contracts only

### No Network/Disk I/O

- No HTTP requests
- No file system access
- No CDN integration
- Pure in-memory stubs

### No Asset Pipeline

- No asset processing
- No format conversion
- No optimization
- Metadata only

## Use Cases

### Biomes ECS Integration

**Scenario:** Load assets for Biomes entities

**Workflow:**

1. Build bindings from RuntimeWorldView
2. For each binding, create Biomes entity template
3. Track loading state per entity
4. Handle missing assets with fallbacks
5. Update entities when assets load

### Unreal Engine Integration

**Scenario:** Load UE assets for placements

**Workflow:**

1. Build bindings from RuntimeWorldView
2. For each binding, resolve UE asset path
3. Load assets asynchronously
4. Track loading progress
5. Spawn actors when assets ready

### WebGL/Three.js Integration

**Scenario:** Load GLTF models for WebGL scene

**Workflow:**

1. Build bindings from RuntimeWorldView
2. For each binding, resolve GLTF URL
3. Fetch resources via HTTP
4. Display loading indicators
5. Add meshes to scene when ready

### Missing Asset Detection

**Scenario:** Identify missing or failed assets

**Workflow:**

1. Build bindings from RuntimeWorldView
2. Call getMissingOrFailedBindings
3. Display warnings for missing assets
4. Provide fallback representations
5. Log errors for debugging

## Design Principles

1. **Engine-Agnostic**: No coupling to specific engines
2. **Load State Visibility**: Clear tracking of loading progress
3. **Failure Handling**: Structured representation of errors
4. **Metadata-Rich**: Optional USD and PlanGraph links
5. **Pure Contracts**: No side effects or I/O

## Implementation Scope

**This Phase (Phase 17):**

- Define asset binding types
- Define binding service interface
- Implement stub service functions
- Document asset binding model

**Future Phases:**

- Implement actual asset loading
- Add asset cache and streaming
- Integrate with engine SDKs
- Add asset pipeline integration
- Implement LOD and variant selection
- Add asset preloading
- Implement resource pooling
- Add performance optimization

## Future Considerations

- **Asset Cache**: Persistent cache for loaded assets
- **Streaming**: Progressive asset loading
- **LOD Selection**: Choose appropriate LOD based on distance
- **Variant Selection**: Platform-specific asset variants
- **Preloading**: Preload assets before needed
- **Resource Pooling**: Reuse loaded resources
- **Format Conversion**: Convert between asset formats
- **Compression**: Compress assets for bandwidth
- **CDN Integration**: Load assets from CDN
- **Offline Support**: Cache assets for offline use
