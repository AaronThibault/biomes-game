# OpenUSD Integration Model

## Overview

This document defines OpenUSD (Universal Scene Description) as the canonical world state representation for Believe. USD provides authoritative, non-destructive, layered storage for all Regions, Spaces, and AssetPlacements, with full support for long-term archival, transmedia workflows, and interoperability with industry-standard tools.

This is a contract-level specification defining how Believe's placement, editing, commit, validation, and collaboration systems map to USD schemas, prims, layers, and composition arcs. No runtime USD SDK integration is included in this phase.

## Why OpenUSD for Believe

### Authoritative World State

USD serves as the single source of truth for Believe's world:

- **Hierarchical Structure**: Natural representation of World → Region → Space → Placements
- **Metadata Rich**: Store all Believe-specific data (IDs, tags, permissions, validation results)
- **Version Control Friendly**: Text-based format enables git/diff workflows
- **Scalable**: Efficient handling of large worlds with millions of placements

### Non-Destructive Layering

USD's composition arcs enable non-destructive editing:

- **Draft Layers**: Edits are new layers, never modify base data
- **Commit Layers**: Commits add higher-priority layers to the stack
- **Validation Layers**: Analysis results stored separately from geometry
- **Collaboration Layers**: Presence and events as metadata layers

### Long-Term Archival

USD is designed for archival and transmedia use:

- **Industry Standard**: Pixar-developed, widely adopted (Disney, Apple, NVIDIA)
- **Future-Proof**: Stable format with backward compatibility guarantees
- **Self-Describing**: Schema definitions embedded in USD files
- **Asset Interchange**: Move assets between projects and tools seamlessly

### Interoperability

USD integrates with industry-standard tools:

- **Blender**: USD import/export for 3D modeling
- **Houdini**: Procedural generation and simulation
- **Unreal Engine**: Real-time rendering and game development
- **Unity**: Game engine integration
- **NVIDIA Omniverse**: Collaborative 3D workflows
- **Maya, 3ds Max, etc.**: Full DCC tool support

## USD Stage = Believe World State

### Stage Structure

A single **USD Stage** represents the entire Believe world:

```
/World (Xform)
  /Regions (Scope)
    /{regionId} (Xform)
      metadata: believe:regionId, believe:accessMode
      /Spaces (Scope)
        /{spaceId} (Xform)
          metadata: believe:spaceId, believe:tags
          /Placements (Scope)
            /Placement_{placementId} (Xform or Reference)
              metadata: believe:placementId, believe:sourceAssetId
```

### Hierarchical Prim Mapping

**World Root:**

- Prim: `/World` (Xform)
- Purpose: Top-level container for all Believe content

**Regions:**

- Prim: `/World/Regions/{regionId}` (Xform)
- Metadata: `believe:regionId`, `believe:accessMode`
- Purpose: Coarse-grained spatial partitioning

**Spaces:**

- Prim: `/World/Regions/{regionId}/Spaces/{spaceId}` (Xform)
- Metadata: `believe:spaceId`, `believe:tags`, `believe:accessMode`
- Purpose: Fine-grained spatial containers

**Placements:**

- Prim: `/World/Regions/{regionId}/Spaces/{spaceId}/Placements/Placement_{placementId}` (Xform or Reference)
- Metadata: `believe:placementId`, `believe:sourceAssetId`, `believe:createdByUserId`
- Transform: Position, rotation, scale from `AssetPlacement.transform`
- Reference: Points to asset USD file (if using references)

## USD Prim Mapping

### Region → USD Prim

**Type:** `Xform`

**Path:** `/World/Regions/{regionId}`

**Metadata:**

- `believe:regionId` (string): Unique region identifier
- `believe:accessMode` (string): Access control mode
- `believe:tags` (string[]): Classification tags
- `believe:notes` (string): Optional description

**Transform:** Identity (regions are logical containers)

### Space → USD Prim

**Type:** `Xform`

**Path:** `/World/Regions/{regionId}/Spaces/{spaceId}`

**Metadata:**

- `believe:spaceId` (string): Unique space identifier
- `believe:regionId` (string): Parent region ID
- `believe:accessMode` (string): Access control mode
- `believe:tags` (string[]): Classification tags
- `believe:notes` (string): Optional description

**Transform:** Identity or offset from region origin

### AssetPlacement → USD Prim

**Type:** `Xform` (with optional `Reference`)

**Path:** `/World/Regions/{regionId}/Spaces/{spaceId}/Placements/Placement_{placementId}`

**Metadata:**

- `believe:placementId` (string): Unique placement identifier
- `believe:sourceAssetId` (string): Reference to BelieveAsset
- `believe:regionId` (string): Parent region ID
- `believe:spaceId` (string): Parent space ID
- `believe:tags` (string[]): Classification tags
- `believe:lodHint` (string): Level-of-detail hint
- `believe:priority` (number): Loading priority
- `believe:createdByUserId` (string): Creator user ID

**Transform:** Position, rotation, scale from `AssetPlacement.transform`

**Reference (optional):**

- Target: Asset USD file (e.g., `@assets/{assetId}.usd@`)
- Purpose: Instance asset geometry without duplication

## USD Layers for Believe Edit Operations

### Base Layer

**Role:** Authoritative world definition

**Content:**

- All regions and static placements
- Canonical transform and metadata
- No draft or temporary data

**File Convention:** `world_base.usda`

**Priority:** Lowest (foundation layer)

### Draft Layer (Phase 5)

**Role:** Represent `PlacementEditSession` changes

**Content:**

- All `DraftPlacement` objects as overrides or new prims
- Operations represented as layer edits:
  - `ADD_PLACEMENT`: New prim in draft layer
  - `UPDATE_PLACEMENT`: Override existing prim transform/metadata
  - `REMOVE_PLACEMENT`: Deactivate prim in draft layer

**File Convention:** `draft_{sessionId}.usda`

**Priority:** Higher than base (overrides base placements)

**Metadata:**

- `believe:sessionId`: Parent editing session
- `believe:createdByUserId`: Session creator
- `believe:createdAt`: Session creation timestamp

### Commit Layer (Phase 6)

**Role:** Represent applied `CommitPlan`

**Content:**

- All placement changes from commit plan
- Flattened from draft layer (no longer draft-specific)
- Becomes part of authoritative state

**File Convention:** `commit_{commitId}.usda`

**Priority:** Higher than base, replaces corresponding draft layer

**Metadata:**

- `believe:commitId`: Unique commit identifier
- `believe:sessionId`: Source editing session
- `believe:appliedByUserId`: User who applied commit
- `believe:appliedAt`: Commit application timestamp

### Validation Layer (Phase 7)

**Role:** Store validation results as metadata

**Content:**

- Validation issues as metadata on affected prims
- No geometry or transform changes
- Analysis-only layer

**File Convention:** `validation_{validationId}.usda`

**Priority:** Highest (metadata-only, doesn't affect rendering)

**Metadata:**

- `believe:validationIssues`: Array of `ValidationIssue` objects
- `believe:isBlocking`: Whether errors block operations
- `believe:validatedAt`: Validation timestamp

### Collaboration Layer (Phase 8)

**Role:** Store presence and event metadata

**Content:**

- User presence states as metadata
- Session events as timeline metadata
- No geometry changes

**File Convention:** `collab_{sessionId}.usda`

**Priority:** Highest (metadata-only)

**Metadata:**

- `believe:presences`: Array of `PresenceState` objects
- `believe:events`: Array of `CollabSessionEvent` objects
- `believe:lastUpdatedAt`: Last event timestamp

## USD Composition Arcs

### References

**Purpose:** Asset instancing

**Usage:**

- Each `AssetPlacement` references its source asset USD
- Enables efficient memory usage (single asset, many instances)
- Changes to asset propagate to all placements

**Example:**

```usd
def Xform "Placement_123" (
    prepend references = @assets/tree_oak.usd@</Tree>
)
{
    double3 xformOp:translate = (10, 0, 5)
    double3 xformOp:rotateXYZ = (0, 45, 0)
    double3 xformOp:scale = (1, 1, 1)
    uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:rotateXYZ", "xformOp:scale"]
}
```

### Payloads

**Purpose:** Lazy loading

**Usage:**

- Large regions or spaces use payloads
- Content loaded on-demand
- Improves performance for large worlds

**Example:**

```usd
def Xform "Region_forest" (
    prepend payload = @regions/forest.usd@
)
{
    custom string believe:regionId = "region-forest"
}
```

### Overs (Non-Destructive Modifications)

**Purpose:** Override properties without defining new prims

**Usage:**

- Draft layers use `over` to modify existing placements
- Preserves base layer data
- Enables non-destructive editing

**Example:**

```usd
over "Placement_123"
{
    double3 xformOp:translate = (12, 0, 6)  # Override position
}
```

### Variant Sets

**Purpose:** Alternate configurations

**Usage:**

- Class modes (OPEN, TEACHER_CONTROLLED, etc.)
- Seasonal variations
- LOD levels
- Alternate layouts

**Example:**

```usd
def Xform "Space_classroom" (
    variants = {
        string accessMode = "OPEN"
    }
)
{
    variantSet "accessMode" = {
        "OPEN" {
            custom bool believe:allowEditing = true
        }
        "TEACHER_CONTROLLED" {
            custom bool believe:allowEditing = false
        }
    }
}
```

## Believe → USD Naming Conventions

### Prim Path Conventions

**World Root:**

```
/World
```

**Region:**

```
/World/Regions/{regionId}
```

**Space:**

```
/World/Regions/{regionId}/Spaces/{spaceId}
```

**Placement:**

```
/World/Regions/{regionId}/Spaces/{spaceId}/Placements/Placement_{placementId}
```

### Metadata Key Conventions

All Believe-specific metadata uses the `believe:` namespace:

**Identifiers:**

- `believe:regionId` (string)
- `believe:spaceId` (string)
- `believe:placementId` (string)
- `believe:sourceAssetId` (string)

**Access Control:**

- `believe:accessMode` (string)
- `believe:allowEditing` (bool)

**Classification:**

- `believe:tags` (string[])
- `believe:lodHint` (string)
- `believe:priority` (number)

**Authorship:**

- `believe:createdByUserId` (string)
- `believe:createdAt` (timestamp)
- `believe:updatedByUserId` (string)
- `believe:updatedAt` (timestamp)

**Validation:**

- `believe:validationIssues` (array)
- `believe:isBlocking` (bool)

**Collaboration:**

- `believe:sessionId` (string)
- `believe:presences` (array)
- `believe:events` (array)

### File Naming Conventions

**Base Layer:**

```
world_base.usda
```

**Draft Layer:**

```
draft_{sessionId}.usda
```

**Commit Layer:**

```
commit_{commitId}.usda
```

**Validation Layer:**

```
validation_{validationId}.usda
```

**Collaboration Layer:**

```
collab_{sessionId}.usda
```

**Asset Files:**

```
assets/{assetId}.usd
```

## Future: Game Engine Extraction

### Baked Representations

The game runtime may consume baked USD representations:

- **Flattened Stage**: Compose all layers into single stage
- **Geometry Extraction**: Extract meshes, transforms, materials
- **Metadata Extraction**: Read Believe-specific metadata
- **Streaming**: Load regions/spaces on-demand via payloads

### Runtime Workflow

1. **Compose Stage**: Load base + active commit layers
2. **Filter by Region/Space**: Extract relevant prims
3. **Flatten Transforms**: Compute world-space transforms
4. **Extract Geometry**: Convert USD meshes to runtime format
5. **Apply Metadata**: Use Believe metadata for gameplay logic

### Optimization Strategies

- **Spatial Indexing**: Pre-compute bounding boxes for regions/spaces
- **LOD Selection**: Use `believe:lodHint` for level-of-detail
- **Priority Loading**: Use `believe:priority` for streaming order
- **Caching**: Cache flattened representations for performance

## Design Principles

1. **USD as Source of Truth**: All authoritative world data in USD
2. **Non-Destructive Layering**: Never modify base layers, always add new layers
3. **Metadata Rich**: Store all Believe-specific data in USD metadata
4. **Composition-Driven**: Use USD composition arcs for all operations
5. **Interoperable**: Follow USD conventions for tool compatibility
6. **Scalable**: Support large worlds with efficient loading strategies

## Implementation Scope

**This Phase (Phase 9):**

- Define USD mapping contracts (types and interfaces)
- Specify layer roles and naming conventions
- Document prim path and metadata conventions
- Provide stub mapping functions

**Future Phases:**

- Implement actual USD file generation
- Add USD SDK integration
- Build layer composition logic
- Implement runtime USD consumption
- Add USD validation and optimization tools

## Future Considerations

- **USD Schema Extensions**: Custom Believe USD schemas for validation
- **Hydra Integration**: Real-time rendering via USD Hydra
- **MaterialX**: Material definitions using MaterialX standard
- **Animation**: Timeline-based animations for dynamic placements
- **Physics**: USD Physics schema for collision and simulation
- **Lighting**: USD Lux schema for lighting and rendering
- **Camera**: USD Camera schema for viewpoints and cinematics
