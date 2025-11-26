# Runtime Spatial Index Model

## Overview

This document defines the spatial indexing layer for Believe's runtime. The Runtime Spatial Index provides fast spatial queries over placements without requiring physics engines, ECS systems, or complex spatial data structures.

This is a contract-level specification defining types and query interfaces. No quadtree/octree, no voxel grids, no physics integration, and no Biomes-specific runtime hooks.

## Purpose

### Fast Spatial Queries

The Runtime Spatial Index enables efficient lookup of placements based on spatial criteria:

**Key Characteristics:**

- **Pure TypeScript**: No external dependencies or engine math libraries
- **Deterministic**: Same input always produces same output
- **Contract-Only**: Stub implementations for Phase 13, real algorithms in future phases
- **Engine-Agnostic**: No assumptions about physics or rendering systems

### Use Cases

**Region-Based Queries:**

- Find all placements in a specific region
- Enable region-based streaming and LOD

**Space-Based Queries:**

- Find all placements in a specific space
- Support classroom/room-based filtering

**Bounding Box Queries:**

- Find placements within an axis-aligned bounding box (AABB)
- Enable frustum culling and spatial filtering

**Nearest Queries:**

- Find N nearest placements to a point
- Support selection tools and proximity detection

**Overlap Queries:**

- Find placements overlapping a bounding box
- Enable collision detection and spatial validation

## Inputs

### RuntimeWorldView (from Phase 12)

**Input:** `RuntimeWorldView`

**Usage:**

- Source of all placements for indexing
- Provides placement positions via `transform.position`
- Includes region/space IDs for filtering

## Outputs

### RuntimeSpatialIndex

The spatial index interface for querying placements.

**Structure:**

```typescript
interface RuntimeSpatialIndex {
  getPlacementsInRegion(regionId: string): readonly RuntimePlacementView[];
  getPlacementsInSpace(spaceId: string): readonly RuntimePlacementView[];
  getPlacementsInAABB(aabb: AABB): readonly RuntimePlacementView[];
  getNearestPlacements(
    position: { x: number; y: number; z: number },
    limit?: number
  ): readonly RuntimePlacementView[];
  getOverlappingPlacements(aabb: AABB): readonly RuntimePlacementView[];
}
```

**Methods:**

- **getPlacementsInRegion**: Filter by region ID
- **getPlacementsInSpace**: Filter by space ID
- **getPlacementsInAABB**: Filter by axis-aligned bounding box
- **getNearestPlacements**: Find N nearest placements to a point
- **getOverlappingPlacements**: Find placements overlapping a bounding box

### Supporting Types

**AABB (Axis-Aligned Bounding Box):**

```typescript
interface AABB {
  readonly min: { x: number; y: number; z: number };
  readonly max: { x: number; y: number; z: number };
}
```

**RuntimeSpatialQuery (Future):**

```typescript
interface RuntimeSpatialQuery {
  readonly regions?: readonly string[];
  readonly spaces?: readonly string[];
  readonly aabb?: AABB;
  readonly position?: { x: number; y: number; z: number };
  readonly nearestLimit?: number;
}
```

## Builder Function

### buildRuntimeSpatialIndex

Pure function that constructs `RuntimeSpatialIndex` from `RuntimeWorldView`.

**Signature:**

```typescript
function buildRuntimeSpatialIndex(
  worldView: RuntimeWorldView
): RuntimeSpatialIndex;
```

**Phase 13 Behavior (Stub Implementation):**

**Region Queries:**

- Filter placements where `placement.regionId === regionId`
- Return matching placements

**Space Queries:**

- Filter placements where `placement.spaceId === spaceId`
- Return matching placements

**AABB Queries:**

- Extract position from `placement.transform.position`
- Check if position is within AABB bounds:
  - `min.x <= pos.x <= max.x`
  - `min.y <= pos.y <= max.y`
  - `min.z <= pos.z <= max.z`
- No orientation or bounding box handling
- Treat placements as points

**Nearest Queries:**

- Compute squared distance for each placement:
  - `dx = placement.x - position.x`
  - `dy = placement.y - position.y`
  - `dz = placement.z - position.z`
  - `distSq = dx*dx + dy*dy + dz*dz`
- Sort by `distSq` ascending
- Return top `limit` placements (default: 10)

**Overlapping Queries:**

- Same as AABB queries (treat placements as points)
- Check if placement position is inside AABB
- No advanced collision detection

**Future Behavior:**

- Spatial data structures (quadtree, octree, spatial hash)
- Actual bounding box overlap tests
- Orientation-aware queries
- Frustum culling
- Dynamic updates

## Supported Queries

### getPlacementsInRegion

Find all placements in a specific region.

**Parameters:**

- `regionId: string` - Region identifier

**Returns:**

- `readonly RuntimePlacementView[]` - Placements in region

**Use Cases:**

- Region-based streaming
- Region-specific validation
- LOD selection by region

### getPlacementsInSpace

Find all placements in a specific space.

**Parameters:**

- `spaceId: string` - Space identifier

**Returns:**

- `readonly RuntimePlacementView[]` - Placements in space

**Use Cases:**

- Classroom/room filtering
- Space-specific rendering
- Space-based collision detection

### getPlacementsInAABB

Find placements within an axis-aligned bounding box.

**Parameters:**

- `aabb: AABB` - Bounding box with min/max corners

**Returns:**

- `readonly RuntimePlacementView[]` - Placements inside AABB

**Use Cases:**

- Frustum culling
- Spatial filtering
- Area-based selection

### getNearestPlacements

Find N nearest placements to a point.

**Parameters:**

- `position: { x, y, z }` - Query point
- `limit?: number` - Maximum results (default: 10)

**Returns:**

- `readonly RuntimePlacementView[]` - Nearest placements, sorted by distance

**Use Cases:**

- Selection tools
- Proximity detection
- Nearest neighbor queries

### getOverlappingPlacements

Find placements overlapping a bounding box.

**Parameters:**

- `aabb: AABB` - Bounding box to test

**Returns:**

- `readonly RuntimePlacementView[]` - Overlapping placements

**Use Cases:**

- Collision detection
- Spatial validation
- Overlap testing

## Non-Goals

This phase explicitly **does not** include:

### No Complex Spatial Structures

- No quadtree or octree implementation
- No voxel grids
- No spatial hashing
- No k-d trees

### No Physics Integration

- No physics engine
- No collision system
- No rigid body dynamics
- No raycasting

### No Dynamic Streaming

- No chunk-based loading
- No incremental updates
- No spatial streaming
- No LOD management

### No Engine Dependencies

- No engine math libraries
- No WebGPU or graphics APIs
- No ECS integration
- No Biomes runtime hooks

## Design Principles

1. **Pure Functions**: All queries are pure, deterministic, no side effects
2. **Immutable**: All outputs are readonly
3. **Primitive Math**: Only basic arithmetic, no complex algorithms
4. **Engine-Agnostic**: No assumptions about runtime architecture
5. **Stub-First**: Simple implementations now, optimizations later

## Implementation Scope

**This Phase (Phase 13):**

- Define `RuntimeSpatialIndex` interface
- Define `AABB` and query types
- Implement `buildRuntimeSpatialIndex` with stub queries
- Document spatial index model

**Future Phases:**

- Implement quadtree/octree for efficient queries
- Add spatial hashing for dynamic updates
- Support oriented bounding boxes (OBB)
- Add frustum culling support
- Implement raycasting
- Add incremental index updates
- Optimize for large worlds

## Future Considerations

- **Spatial Data Structures**: Quadtree, octree, spatial hash for O(log n) queries
- **Bounding Box Overlap**: Proper AABB/OBB intersection tests
- **Frustum Culling**: Camera frustum queries for rendering
- **Raycasting**: Ray-AABB and ray-mesh intersection
- **Dynamic Updates**: Incremental index updates on placement changes
- **Parallel Queries**: Multi-threaded spatial queries
- **GPU Acceleration**: Compute shader-based spatial queries
- **Streaming Integration**: Coordinate with chunk streaming system
