# Believe Development Roadmap

### Location: `docs/ROADMAP.md`

### Purpose: High-level sequence for building the multiplayer UGC world, grounded in Biomes tech

---

## 1. Overview

Believe uses Biomes’ networking and streaming substrate as a starting point, and builds a higher-fidelity, UGC-friendly, safe multiplayer world ecosystem on top of it.

This roadmap defines **what must be built first**, in **what order**, to avoid rework and to ensure the entire worldbuilding pipeline (UGC, scanning, permissions, digital twins) has a stable foundation.

This is an _architecture-first_ roadmap, not a feature wishlist.

---

# PHASE 1 — FOUNDATIONS (Absolutely Required Before Anything Else)

## 1.1 World Object Model

Define the canonical representation of “spaces” inside Believe.
This includes:

- Space / Room / Region / Chunk types
- How spaces are tagged
- How spaces connect (graph topology)
- How permissions attach to them

**Output:**

- [docs/world_space_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/world_space_model.md) — Documentation
- [src/shared/world/space.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/space.ts) — TypeScript types

---

## 1.2 Region / Chunk Runtime Layer (Biomes Integration)

Build a thin wrapper over Biomes’ streaming system that defines:

- Believe regions and space containers
- How chunks map to physical spaces
- Stream boundaries + metadata
- How asset instances live inside regions

**Output:**

- [services/world-runtime/regionRuntime.ts](file:///c:/Gamebridge/Dev/biomes-game/services/world-runtime/regionRuntime.ts) — Runtime wrapper (stub)

---

## 1.3 Permission Model (Minimal Version)

Define:

- Roles: Student, Teacher, Safety Officer, Game Admin
- Capabilities: enter, spawn, edit, moderate, override
- Inheritance rules
- Space-level access modes (open, teacher-controlled, restricted, etc.)

This is not UI — just the underlying logic.

**Output:**

- [docs/permissions_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/permissions_model.md) — Documentation
- [src/shared/world/permissions.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/permissions.ts) — TypeScript types and logic

---

# PHASE 2 — ASSET PIPELINE CORE

## 2.1 Asset Ingestion & Normalization Pipeline

Create a unified pipeline for assets coming from:

- Blender
- Unreal / Unity
- Houdini
- Meshy / AI tools
- Photogrammetry / NERFs
- Capture devices

Pipeline handles:

- Scale + axes normalization
- Mesh cleanup
- Material mapping to Believe’s palette
- Collision generation
- LOD chain generation

**Output:**

- [docs/asset_pipeline_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/asset_pipeline_model.md) — Pipeline documentation
- [src/shared/assets/types.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/assets/types.ts) — Asset type definitions
- [src/shared/assets/ingest.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/assets/ingest.ts) — Ingest API (stub)
- [tools/asset-ingest/](file:///c:/Gamebridge/Dev/biomes-game/tools/asset-ingest/) — CLI tool (stub)

---

## 2.2 Stylization & Rendering Profile

Define the Believe look:

- Material palette rules
- Lighting model
- Post-processing ranges
- Color + silhouette consistency rules

This ensures UGC doesn’t look random.

**Output:**

- [docs/art_style_spec.md](file:///c:/Gamebridge/Dev/biomes-game/docs/art_style_spec.md) — Art style specification

---

# PHASE 3 — WORLD INTERACTION & UGC

## 3.1 Scanning → Visualization Mode

Build visualizers for:

- Real-time scanning (point clouds, coverage maps)
- Time-lapse reconstruction
- Layer views (raw → clean → stylized → chunked)

This depends on the asset pipeline being stable.

**Output:**
`services/world-editor/scan-viewer/`

---

## 3.2 UGC Editor & Placement Tools (Permissions-Aware)

Implement:

- Object placement
- Transform tools
- Region editing (only allowed for permitted roles)
- Safety boundaries (no-edit zones, teacher locked areas)

**Output:**

- [docs/asset_placement_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/asset_placement_model.md) — Placement model documentation
- [src/shared/world/placement.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/placement.ts) — Placement types and registry interface
- `services/world-editor/ugc-tools/` (future)

- integration with permission system

---

# PHASE 4 — DIGITAL TWINS & INTEROP

## 4.0 Scanning & Reconstruction Foundation

Define the scan pipeline and viewer contracts for capturing and reconstructing physical spaces.

This includes:

- Scan session and frame types
- Reconstruction API surface (stub)
- Viewer/timeline contracts for real-time and time-lapse modes
- Pipeline flow documentation

**Output:**

- [docs/scan_pipeline_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/scan_pipeline_model.md) — Scan pipeline documentation
- [docs/scan_viewer_mode.md](file:///c:/Gamebridge/Dev/biomes-game/docs/scan_viewer_mode.md) — Viewer mode documentation
- [src/shared/scan/types.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/scan/types.ts) — Scan session and frame types
- [src/shared/scan/reconstruction.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/scan/reconstruction.ts) — Reconstruction API (stub)
- [src/shared/scan/viewer.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/scan/viewer.ts) — Viewer/timeline contracts

---

## 4.1 Geo-Tagged Spaces

Add metadata for real-world linked spaces:

- lat/lon/alt
- scale
- region origin alignment
- optional real-time data channels

**Output:**
Part of `space_schema.json`

---

## 4.2 Digital Twin Mode

Support importing high-fidelity real spaces:

- Photogrammetry
- NERFs
- Blueprint floor plan conversions

Should plug into scanning visualization + topology system.

**Output:**
`services/digitaltwin/`

---

## 4.3 ATAK / Open-Source Situational Awareness Interop (Opt-In)

Once geo-tagged spaces exist and permission controls are solid, add optional bridges to:

- ATAK
- similar FOSS GPS/comms applications

Features:

- Real-world blips in-game
- Opt-in streams
- Permissions-based visibility
- No youth exposure unless authorized

**Output:**
`services/interops/atak-bridge/`

---

# PHASE 5 — POLISH & PRODUCTIONIZATION

## 5.0 UGC Editing & Placement Tools (Contract Layer)

Define the contracts for editing sessions, draft placements, and placement edit operations.

This includes:

- Editing session and draft placement types
- Edit operation types and workflows
- Editing service API surface (stub)
- Permission extension for placement editing

**Output:**

- [docs/placement_editing_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/placement_editing_model.md) — Editing sessions and draft placement model
- [src/shared/world/editing.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/editing.ts) — Editing sessions, draft placements, and operations types
- [src/shared/world/editing_service.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/editing_service.ts) — Editing service API surface (stub)
- [src/shared/world/permissions.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/permissions.ts) — Extended capabilities (EDIT_PLACEMENTS)

---

## 6.0 Draft → Commit Workflow & Conflict Resolution (Contract Layer)

Define the contracts for preparing and applying commits from editing sessions to live placements, including basic conflict modeling.

This includes:

- Commit workflow and conflict detection model
- Commit plan, change, and conflict types
- Commit service API surface (stub)
- Permission extension for commit management

**Output:**

- [docs/commit_workflow_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/commit_workflow_model.md) — Commit workflow and conflict model
- [src/shared/world/commit.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/commit.ts) — Commit and conflict types
- [src/shared/world/commit_service.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/commit_service.ts) — Commit service API surface (stubs)
- [src/shared/world/permissions.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/permissions.ts) — Extended capabilities (MANAGE_COMMITS)

---

## 7.0 Placement & Commit Validation (Contract Layer)

Define the contracts for validating placements and commits before they reach the runtime engine.

This includes:

- Validation categories (spatial, permission, structural, referential)
- Validation issue and result types
- Validation service API surface (stub)
- Permission extension for validation operations

**Output:**

- [docs/validation_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/validation_model.md) — Validation model and categories
- [src/shared/world/validation/validation.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/validation/validation.ts) — Validation types
- [src/shared/world/validation/validation_service.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/validation/validation_service.ts) — Validation service API surface (stubs)
- [src/shared/world/permissions.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/permissions.ts) — Extended capabilities (VALIDATE_PLACEMENTS)

---

## 8.0 Collaborative Editing & Session Events (Contract Layer)

Define the contracts for collaborative editing over placement sessions, including session events, edit deltas, presence, and a collaboration service API.

This includes:

- Session event types and edit deltas
- Presence state tracking
- Event stream and batch fetching
- Collaboration service API surface (stub)
- Permission extension for collaboration management

**Output:**

- [docs/collaborative_editing_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/collaborative_editing_model.md) — Collaborative editing concepts and flows
- [src/shared/world/collab.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/collab.ts) — Session event, delta, and presence types
- [src/shared/world/collab_service.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/collab_service.ts) — Collaborative editing service API (stubs)
- [src/shared/world/permissions.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/permissions.ts) — Extended capabilities (MANAGE_COLLABORATION)

---

## 9.0 OpenUSD World Schema & Layer Mapping (Contract Layer)

Define USD as the canonical world state for Believe.
Map Regions, Spaces, Placements, and all prior phases into USD schemas and layer conventions.
Introduce USD layer roles (BASE, DRAFT, COMMIT, VALIDATION, COLLAB).
Define stub mapping functions and USD service API.

This includes:

- USD stage structure and prim hierarchy
- USD layer roles for each Believe phase
- Believe → USD metadata conventions
- USD composition arcs (references, payloads, overs, variants)
- Stub mapping and service functions

**Output:**

- [docs/usd_integration_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/usd_integration_model.md) — USD integration model and layer mapping
- [src/shared/usd/usd_types.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/usd/usd_types.ts) — USD type definitions
- [src/shared/usd/usd_mapping.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/usd/usd_mapping.ts) — Believe → USD mapping functions (stubs)
- [src/shared/usd/usd_service.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/usd/usd_service.ts) — USD stage service API (stubs)
- [src/shared/world/permissions.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/permissions.ts) — Extended capabilities (MANAGE_USD_INTEGRATION)

---

## 5.1 Safety & Class Modes

- Lock/unlock classrooms
- Group teleporting
- Session sync
- AV/voice rules per space

---

## 10.0 PlanGraph & .plan Integration (Contract Layer)

Introduce PlanGraph and .plan contracts as the design-intent layer for Believe.
Link Regions, Spaces, Assets, Placements, Commits, Validation, and Collaboration
to PlanNodes and PlanFiles, parallel to USD world state layers.

This includes:

- PlanNodeId mapping for all major Believe entities
- PlanChangeRecord types and lifecycle
- PlanFile versioning and history
- PlanGraph service API surface (stub)
- Permission extension for plan management

**Output:**

- [docs/plan_graph_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/plan_graph_model.md) — PlanGraph model and .plan concepts
- [src/shared/plan/plan_types.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/plan/plan_types.ts) — PlanGraph type definitions
- [src/shared/plan/plan_mapping.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/plan/plan_mapping.ts) — Believe → PlanGraph mapping functions (stubs)
- [src/shared/plan/plan_service.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/plan/plan_service.ts) — PlanGraph service API (stubs)
- [src/shared/world/permissions.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/permissions.ts) — Extended capabilities (MANAGE_PLAN_GRAPH)

---

## 11.0 Runtime Placement View (Read-Only Vertical Slice)

Define a runtime-facing read model for Believe that flattens regions and
asset placements (optionally commit and validation results) into a
RuntimeWorldView structure suitable for engine/runtime consumption.

This includes:

- RuntimePlacementView with validity flags
- RuntimeWorldView with flattened placements
- Pure builder function for constructing runtime view
- No ECS, networking, or Biomes runtime integration

**Output:**

- [docs/runtime_view_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/runtime_view_model.md) — Runtime view documentation
- [src/shared/world/runtime_view.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/runtime_view.ts) — Runtime view types
- [src/shared/world/runtime_view_builder.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/runtime_view_builder.ts) — Runtime view builder (stubs)

---

## 12.0 Runtime View Commit & Validation Application (Contracts Only)

Evolve the runtime-facing view to reflect effective placements after commit
application and to surface validation status per placement.

This includes:

- Apply CommitPlan changes (ADD, UPDATE, REMOVE) to produce effective placements
- Apply ValidationResult to set validity flags (isValid, hasWarnings, validationIssueIds)
- Pure, deterministic builder logic with no side effects
- No ECS, networking, or Biomes runtime integration

**Output:**

- [docs/runtime_view_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/runtime_view_model.md) — Extended with commit & validation behavior
- [src/shared/world/runtime_view_builder.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/runtime_view_builder.ts) — Applies CommitPlan and ValidationResult

---

## 13.0 Runtime Spatial Index (Contracts Only)

Define a pure TypeScript spatial indexing layer for runtime queries,
including region, space, AABB, nearest, and overlap queries.
Contracts only — no physics engines, no ECS, no quadtree/octree.

This includes:

- AABB and spatial query types
- RuntimeSpatialIndex interface with query methods
- Pure TypeScript builder with stub implementations
- No external dependencies or engine math libraries

**Output:**

- [docs/runtime_spatial_index_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/runtime_spatial_index_model.md) — Spatial index model documentation
- [src/shared/world/runtime_spatial_index.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/runtime_spatial_index.ts) — Spatial index types
- [src/shared/world/runtime_spatial_index_builder.ts](file:///c:/Gamebridge/Dev/biomes-game/src/shared/world/runtime_spatial_index_builder.ts) — Spatial index builder (stubs)

---

## 5.2 Performance, LOD, and Mobile Profiles

- Device-based render scaling
- Network optimization
- Chunk preloading behavior

## 5.3 Creator Dashboard

- Asset status
- Region publishing
- Permissions management

---

# Minimum Critical Path (If You Only Read One Section)

1. Space Object Model
2. Region Runtime (Biomes wrapper)
3. Permission System
4. Asset Ingest Pipeline
5. Stylization Rules
6. Scanning Visualization
7. UGC Tools
8. Digital Twin Mode
9. ATAK Interop

You **cannot** safely implement later features without the earlier ones.

---

# Ownership (Provisional)

- World Runtime: backend + multiplayer team
- Asset Ingest Pipeline: tools team
- Stylization Rules: art/tech art
- Permissions & Teacher Control: backend + safety/policy
- Digital Twins + Interop: advanced features team
- UGC Editors: hybrid tools + front-end

---

# Versioning

This roadmap is meant to evolve.
Propose updates via PRs to `docs/ROADMAP.md`.
