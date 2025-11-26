# Asset Placement Model

## Overview

This document defines how Believe assets are placed into the world. Asset placement connects the asset pipeline (what assets exist) with the world topology (where they can go).

## Core Concept: AssetPlacement

An **AssetPlacement** is the canonical representation of an asset instance in the world. It links:

- A **BelieveAsset** (what to place)
- A **Region** and/or **Space** (where to place it)
- A **Transform** (how to orient it)

## Placement Targets

Assets can be placed at two levels of granularity:

### Region-Level Placement (Coarse)

- **Target**: A Region (e.g., "Science Building", "West Campus")
- **Use Case**: Large-scale assets, environmental elements, landmarks
- **Precision**: General area placement
- **Example**: A statue in the campus courtyard region

### Space-Level Placement (Fine-Grained)

- **Target**: A specific Space (e.g., "Room 101", "Main Arena")
- **Use Case**: Precise placement within a defined area
- **Precision**: Exact position within a space
- **Example**: A desk in a specific classroom

### Hybrid Placement

Assets can specify both `regionId` and `spaceId`:

- The region provides context and streaming boundaries
- The space provides precise location and access control
- Example: A lab equipment asset in "Science Building" region, "Chemistry Lab" space

## AssetPlacement Properties

Each placement has the following properties:

### Core Identity

- **id** (PlacementId): Unique identifier for this placement instance
- **assetId** (BelieveAssetId): Reference to the asset being placed

### Location

- **regionId** (string, optional): Target region for this placement
- **spaceId** (string, optional): Target space for this placement
- At least one of `regionId` or `spaceId` should be specified

### Transform

- **transform** (Transform): Position, rotation, and scale in world coordinates
  - `position`: { x, y, z } in meters
  - `rotation`: { x, y, z } in degrees (Euler angles)
  - `scale`: { x, y, z } as multipliers (1.0 = original size)

### Metadata

- **tags** (string[]): Arbitrary tags for classification
  - Examples: ["interactive", "physics-enabled", "student-created"]
  - Used for filtering, gameplay logic, or editor organization

### Optimization Hints (Optional)

- **lodHint** (string, optional): Hint for level-of-detail selection

  - Examples: "high", "medium", "low", "auto"
  - Rendering system may use this to optimize performance

- **priority** (number, optional): Loading/rendering priority
  - Higher values load first
  - Used for streaming optimization

## Transform Coordinate System

Believe uses a **right-handed, Y-up coordinate system**:

- **X-axis**: Right (positive) / Left (negative)
- **Y-axis**: Up (positive) / Down (negative)
- **Z-axis**: Forward (positive) / Backward (negative)

Rotations are specified as **Euler angles** in degrees:

- **X-rotation**: Pitch (nodding)
- **Y-rotation**: Yaw (turning)
- **Z-rotation**: Roll (tilting)

## Asset Placement Registry

The **AssetPlacementRegistry** is an interface defining how placement data is stored and retrieved. It is **not implemented in this phase** — it serves as a contract for future systems.

### Registry Operations

```typescript
interface AssetPlacementRegistry {
  // List all placements in a region
  listPlacementsForRegion(regionId: string): Promise<readonly AssetPlacement[]>;

  // Get a specific placement by ID
  getPlacementById(id: PlacementId): Promise<AssetPlacement | null>;

  // Register a new placement
  registerPlacement(placement: AssetPlacement): Promise<AssetPlacement>;
}
```

Future implementations might:

- Store placements in a database
- Cache placements for streaming
- Validate placement transforms
- Enforce space capacity limits

## Separation of Concerns

### Asset Pipeline vs. Placement

- **Asset Pipeline** (Phase 2): Prepares assets for use

  - Ingestion, normalization, stylization
  - Produces ready-to-use BelieveAssets
  - No knowledge of where assets will be placed

- **Placement System** (Phase 3): Places assets in the world
  - References existing BelieveAssets
  - Defines location and transform
  - No knowledge of how assets were created

### Placement vs. Runtime Spawning

- **Placement** (this document): Metadata about where assets should be

  - Stored as data (database, config files, etc.)
  - Defines intent, not actual instances

- **Runtime Spawning** (future phase): Actual instantiation in the game
  - Reads placement data
  - Creates entities in the ECS
  - Handles streaming, LOD, physics, etc.

## Workflow: From Contribution to Placement

This is the intended flow (not all implemented yet):

1. **User Creates Content**: UGC contribution in gamebridge-platform
2. **Contribution Approved**: Platform marks contribution as approved
3. **Publish**: Platform records intended placement hints (region, space)
4. **Asset Ingest**: Contribution becomes a BelieveAsset via pipeline
5. **Placement Registration**: AssetPlacement created linking asset to location
6. **Runtime Spawning**: Game reads placement and instantiates asset

**Current Phase**: Steps 1-3 are being established. Steps 4-6 are future work.

## Design Principles

1. **Declarative**: Placements describe "what" and "where", not "how"
2. **Immutable**: Placement records should be treated as immutable once created
3. **Versioned**: Future implementations may track placement history
4. **Validated**: Placements should be validated before registration
5. **Streamable**: Placement data should support efficient spatial queries

## Future Considerations

- **Placement Validation**: Check for collisions, bounds, permissions
- **Placement Templates**: Pre-defined placement patterns for common scenarios
- **Placement Groups**: Collections of related placements (e.g., a furniture set)
- **Placement Constraints**: Rules for valid placement locations
- **Placement Persistence**: How placements are saved and loaded
- **Placement Replication**: Synchronizing placements across clients
- **Placement Editing**: In-game tools for adjusting placements
- **Placement Permissions**: Who can place what, where
