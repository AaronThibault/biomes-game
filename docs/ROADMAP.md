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
`services/world-editor/ugc-tools/`

- integration with permission system

---

# PHASE 4 — DIGITAL TWINS & INTEROP

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

## 5.1 Safety & Class Modes

- Lock/unlock classrooms
- Group teleporting
- Session sync
- AV/voice rules per space

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
