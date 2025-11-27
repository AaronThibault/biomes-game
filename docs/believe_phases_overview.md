# Believe Foundation Phases Overview

## Purpose

This document serves as the canonical, chronological record of all foundational phases completed for the Believe project. Each phase represents a contract-level implementation that establishes types, interfaces, and documentation for future systems.

This file is append-only: new phases are added chronologically without modifying previous sections.

---

## Phase 1 — World Object Model & Permissions

**Completed:** 2025-11 (prior to Phase 4)

### Intent Summary

- Define the canonical representation of "spaces" inside Believe (Regions, Spaces, hierarchy)
- Establish permission model with roles (Student, Teacher, Safety Officer, Admin) and capabilities
- Create foundational types for world topology and access control
- Provide pure, stateless permission logic independent of auth/user modules
- Enable future systems to reference spaces and check permissions consistently

### Key Artifacts

**Documentation:**

- `docs/world_space_model.md` — World hierarchy and space properties
- `docs/permissions_model.md` — Roles, capabilities, and permission logic

**Shared Types:**

- `src/shared/world/space.ts` — Space, Region, SpaceType, AccessMode types
- `src/shared/world/permissions.ts` — Role, Capability enums and permission functions

### Notes / Constraints

**Design Constraints:**

- No database or persistence implementation
- No runtime/ECS integration
- Pure TypeScript types and functions only

**Non-Goals:**

- Actual space storage or retrieval
- Runtime spawning or streaming
- User authentication or session management

**Integration Boundaries:**

- Permissions module imports Space types but no user/auth modules
- Access control logic is pure and stateless

### Completion Notes

- Established right-handed, Y-up coordinate system convention
- Permission checks designed for future role-based access control
- Space hierarchy supports nested spaces via `parentId`
- Optional geo-referencing for digital twin support

---

## Phase 2 — Asset Pipeline Core

**Completed:** 2025-11 (prior to Phase 4)

### Intent Summary

- Define unified asset ingestion pipeline for diverse sources (DCC tools, scans, AI, NERFs)
- Establish asset processing stages: RAW → IMPORTED → NORMALIZED → STYLIZED → READY
- Create `BelieveAsset` type as canonical representation of assets in the pipeline
- Document pipeline flow and separation from placement/runtime systems
- Provide stub ingest API for future implementation

### Key Artifacts

**Documentation:**

- `docs/asset_pipeline_model.md` — Pipeline stages and asset processing flow
- `docs/art_style_spec.md` — Art style specification and rendering profile

**Shared Types:**

- `src/shared/assets/types.ts` — BelieveAsset, AssetSourceType, AssetProcessingStage, AssetStatus
- `src/shared/assets/ingest.ts` — Ingest API surface (stub)

**Tools:**

- `tools/asset-ingest/` — CLI tool (stub)

### Notes / Constraints

**Design Constraints:**

- Asset pipeline is independent of placement system
- No actual file processing or conversion logic
- Stub implementations only (no real ingestion)

**Non-Goals:**

- Runtime asset loading or streaming
- Actual stylization or LOD generation
- Integration with specific DCC tools or SDKs

**Stub-Only Restrictions:**

- `ingestAsset()` returns placeholder BelieveAsset with generated ID
- No file I/O, no external process calls
- Pure metadata builders only

### Completion Notes

- Asset pipeline explicitly separated from world placement
- Source types support scan captures (photogrammetry, LIDAR, NERFs)
- Processing stages are linear and deterministic
- Error handling via `errorMessage` field in BelieveAsset

---

## Phase 3 — UGC Asset Lifecycle & Placement Foundation

**Completed:** 2025-11 (prior to Phase 4)

### Intent Summary

- Define how BelieveAssets are placed into the world (Regions/Spaces)
- Create `AssetPlacement` type linking assets to locations with transforms
- Establish coordinate system and transform representation
- Extend UGC contribution model to link contributions to assets and placements
- Document workflow from contribution → asset → placement

### Key Artifacts

**Documentation:**

- `docs/asset_placement_model.md` — Placement model and transform system
- `docs/contributions_asset_link.md` — Contribution-to-asset linking workflow

**Shared Types:**

- `src/shared/world/placement.ts` — AssetPlacement, Transform, PlacementId types
- `src/shared/world/placement.ts` — AssetPlacementRegistry interface (contract)

**Platform Extensions (gamebridge-platform):**

- Extended `Contribution` model with `assetId`, `targetRegionId`, `targetSpaceId`, `placementTags`, `isPublished`
- Added `POST /contributions/:id/publish` endpoint

### Notes / Constraints

**Design Constraints:**

- Placements are declarative metadata, not runtime instances
- No actual placement storage or registry implementation
- Cross-repo coordination (biomes-game + gamebridge-platform)

**Non-Goals:**

- Runtime spawning or entity instantiation
- Placement validation or collision detection
- Actual publish workflow implementation

**Integration Boundaries:**

- AssetPlacement references BelieveAsset via ID only
- Platform contribution links to placement hints (no direct placement creation)
- Future: publish endpoint will trigger actual placement registration

### Completion Notes

- Transform uses right-handed, Y-up coordinate system (consistent with Phase 1)
- Placements can target region-level (coarse) or space-level (fine-grained)
- Optional LOD hints and priority for streaming optimization
- Contribution publish endpoint is stub (no actual asset ingest or placement)

---

## Phase 4 — Scanning & Reconstruction Foundation

**Completed:** 2025-11-25

### Intent Summary

- Define scan pipeline: Scan Capture → Scan Session → Reconstruction → BelieveAsset → Placement
- Create types for scan sessions, frames, and reconstruction workflow
- Establish viewer modes (real-time and time-lapse) for scan visualization
- Provide stub reconstruction API that produces BelieveAssets from scans
- Document quality/coverage metrics for scan frames

### Key Artifacts

**Documentation:**

- `docs/scan_pipeline_model.md` — Scan pipeline flow and key concepts
- `docs/scan_viewer_mode.md` — Real-time and time-lapse viewer modes

**Shared Types:**

- `src/shared/scan/types.ts` — ScanSession, ScanFrame, ScanSourceType, ScanStage
- `src/shared/scan/reconstruction.ts` — ReconstructionRequest, ReconstructionResult, reconstructScan()
- `src/shared/scan/viewer.ts` — ScanTimelinePoint, buildScanTimeline()

### Notes / Constraints

**Design Constraints:**

- Device-agnostic (no specific scanner SDK dependencies)
- No actual reconstruction implementation (NERFs, photogrammetry, etc.)
- No scan hardware integration or capture logic

**Non-Goals:**

- Actual scan capture or device drivers
- Real reconstruction pipeline (meshing, NERF training)
- Viewer UI/UX implementation
- Real-time streaming infrastructure

**Stub-Only Restrictions:**

- `reconstructScan()` returns placeholder BelieveAsset with `SCAN_CAPTURE` source type
- `buildScanTimeline()` creates minimal timeline from session metadata
- No file I/O, no processing, pure metadata builders

**Integration Boundaries:**

- ScanFrame uses Transform from placement.ts
- ScanSession links to BelieveAsset via assetId
- Reconstruction produces assets compatible with asset pipeline

### Completion Notes

- Scan stages: CAPTURED → RECONSTRUCTING → RECONSTRUCTED → STYLIZED → PUBLISHED
- Quality and coverage scores (0.0–1.0) for operator feedback
- Timeline visualization supports both real-time monitoring and post-capture review
- Extensible metadata fields for future device-specific data

---

## Phase 5 — UGC Editing & Placement Tools (Contract Layer)

**Completed:** 2025-11-25

### Intent Summary

- Define editing layer for safely proposing placement changes before committing to live world
- Create types for editing sessions, draft placements, and edit operations
- Establish operation types: ADD, UPDATE_TRANSFORM, UPDATE_TAGS, REMOVE
- Provide stub editing service API for session management
- Extend permissions with EDIT_PLACEMENTS capability

### Key Artifacts

**Documentation:**

- `docs/placement_editing_model.md` — Editing sessions and draft placement model

**Shared Types:**

- `src/shared/world/editing.ts` — PlacementEditSession, DraftPlacement, PlacementEditOperation types
- `src/shared/world/editing_service.ts` — PlacementEditingService interface and stub implementations

**Permissions Extension:**

- `src/shared/world/permissions.ts` — Added `EDIT_PLACEMENTS` capability

### Notes / Constraints

**Design Constraints:**

- Session-based editing (all changes within bounded sessions)
- Draft-first approach (changes exist as drafts before publish)
- Operation history for audit trail and undo/redo support
- No UI, no persistence, no runtime integration

**Non-Goals:**

- Actual editing service implementation with database
- Editor UI/UX or in-game editing tools
- Publish/commit workflow (draft → live)
- Validation logic (collision detection, bounds checking)

**Stub-Only Restrictions:**

- `createPlacementEditSessionStub()` creates in-memory session with generated ID
- `applyPlacementEditOperationStub()` records operation but doesn't update draft placements
- No persistence, no side effects, pure metadata builders

**Integration Boundaries:**

- DraftPlacement contains AssetPlacement as `base` property (composition pattern)
- Edit operations reference both live PlacementIds and DraftPlacementIds
- User IDs are plain strings (no auth/user module imports)
- EDIT_PLACEMENTS capability added to permissions (additive only)

### Completion Notes

- Editing sessions target exactly one region and/or space
- Operations are immutable and append-only (audit trail)
- Session participants tracked for collaborative editing support
- Stub implementations follow immutable patterns (return new objects)
- Future work: actual draft state management, publish workflow, validation

---

## Appendix: Cross-Phase Relationships

### Asset Flow

1. **Phase 2**: Asset created via ingestion pipeline → BelieveAsset
2. **Phase 3**: BelieveAsset referenced in AssetPlacement
3. **Phase 4**: Scan reconstruction produces BelieveAsset
4. **Phase 5**: DraftPlacement contains AssetPlacement (editing layer)

### Permission Flow

1. **Phase 1**: Roles and capabilities defined
2. **Phase 5**: EDIT_PLACEMENTS capability added for editing permissions

### World Topology

1. **Phase 1**: Regions and Spaces defined
2. **Phase 3**: Placements target Regions/Spaces
3. **Phase 5**: Edit sessions target Regions/Spaces

### Coordinate System

- **Consistent across all phases**: Right-handed, Y-up
- **Phase 1**: Established in world model
- **Phase 3**: Used in Transform for placements
- **Phase 4**: Used in ScanFrame transforms

---

## Phase 6 — Draft → Commit Workflow & Conflict Resolution (Contract Layer)

**Completed:** 2025-11-25

### Intent Summary

- Define commit workflow for transforming draft placements into live asset placements
- Establish conflict detection model for identifying incompatible changes
- Create types for commit plans, placement changes, and conflicts
- Provide stub commit service API for preparing and applying commits
- Extend permissions with MANAGE_COMMITS capability for commit approval
- Document atomic commit application and rollback support (future)

### Key Artifacts

**Documentation:**

- `docs/commit_workflow_model.md` — Commit workflow and conflict model

**Shared Types:**

- `src/shared/world/commit.ts` — CommitPlan, PlacementChange, CommitConflict, CommitResult types
- `src/shared/world/commit_service.ts` — CommitService interface and stub implementations

**Permissions Extension:**

- `src/shared/world/permissions.ts` — Added `MANAGE_COMMITS` capability

### Notes / Constraints

**Design Constraints:**

- Contract-only, no persistence or runtime integration
- Stub commit behavior (no real conflict detection)
- Atomic commits (all changes apply together or none apply)
- No spatial validation or collision checking

**Non-Goals:**

- Actual conflict detection logic (transform comparison, spatial overlap)
- Placement registry persistence
- Rollback and undo implementation
- Conflict resolution UI or policies

**Stub-Only Restrictions:**

- `prepareCommitStub()` treats all drafts as ADD changes
- No conflicts detected in stub (conflicts array always empty)
- `applyCommitStub()` echoes back plan changes without persistence
- No validation against live state

**Integration Boundaries:**

- CommitPlan references PlacementEditSession from Phase 5
- PlacementChange uses AssetPlacement from Phase 3
- Conflicts reference both live PlacementIds and DraftPlacementIds
- MANAGE_COMMITS capability added to permissions (additive only)

### Completion Notes

- Commit pipeline: Session → Prepare → Detect Conflicts → Plan → Apply → Result
- Conflict types: TRANSFORM, DELETION, TAG, PERMISSION, UNKNOWN
- Change types: ADD, UPDATE, REMOVE (normalized from draft operations)
- Commit status: PENDING → READY → APPLIED or REJECTED
- `isResolvableAutomatically` flag for auto-merge support (future)
- Stub implementations follow immutable patterns (return new objects)
- Future work: actual conflict detection, spatial validation, persistence, rollback

---

## Phase 7 — Placement & Commit Validation (Contract Layer)

**Completed:** 2025-11-25

### Intent Summary

- Define validation subsystem for ensuring safe placement and commit operations
- Establish validation categories: spatial, permission, structural, referential
- Create types for validation issues and results with severity levels (WARNING, ERROR)
- Provide stub validation service API for draft placements, commit plans, and placement changes
- Extend permissions with VALIDATE_PLACEMENTS capability
- Document pre-runtime, engine-independent validation workflow

### Key Artifacts

**Documentation:**

- `docs/validation_model.md` — Validation model and categories

**Shared Types:**

- `src/shared/world/validation/validation.ts` — ValidationIssue, ValidationResult, input types
- `src/shared/world/validation/validation_service.ts` — ValidationService interface and stub implementations

**Permissions Extension:**

- `src/shared/world/permissions.ts` — Added `VALIDATE_PLACEMENTS` capability

### Notes / Constraints

**Design Constraints:**

- Contract-only, no runtime or physics engine dependencies
- No spatial math libraries or actual collision detection
- No persistence or database access
- Structured results (not booleans) for detailed feedback

**Non-Goals:**

- Actual validation logic (bounds checking, collision detection)
- Asset/region/space registry integration for referential checks
- Permission verification implementation
- Spatial indexing or optimization

**Stub-Only Restrictions:**

- All stub functions return empty `issues` array
- `isBlocking` always set to `false` in stubs
- No real validation performed (placeholder only)
- Deterministic, immutable results

**Integration Boundaries:**

- ValidationIssue references PlacementId and DraftPlacementId
- DraftPlacementValidationInput uses DraftPlacement from Phase 5
- CommitPlanValidationInput uses CommitPlan from Phase 6
- VALIDATE_PLACEMENTS capability added to permissions (additive only)

### Completion Notes

- Validation categories: SPATIAL, PERMISSION, STRUCTURAL, REFERENTIAL, UNKNOWN
- Severity levels: WARNING (informational), ERROR (blocking)
- Three validation entry points: draft placements, commit plans, placement changes
- `ValidationResult` aggregates issues with `isBlocking` flag
- Validation is pre-runtime and engine-independent
- Future work: actual validation logic, spatial checks, referential validation, permission verification

---

## Phase 8 — Collaborative Editing & Session Events (Contract Layer)

**Completed:** 2025-11-25

### Intent Summary

- Define collaborative editing subsystem for multi-user placement editing sessions
- Establish session event types for tracking all editing activity
- Create presence state tracking for showing active users and their focus
- Provide event stream model with monotonic ordering and replay capability
- Extend permissions with MANAGE_COLLABORATION capability
- Document connection-agnostic event model compatible with any transport layer

### Key Artifacts

**Documentation:**

- `docs/collaborative_editing_model.md` — Collaborative editing concepts and flows

**Shared Types:**

- `src/shared/world/collab.ts` — CollabSessionEvent, EditDelta, PresenceState types
- `src/shared/world/collab_service.ts` — CollaborativeEditingService interface and stub implementations

**Permissions Extension:**

- `src/shared/world/permissions.ts` — Added `MANAGE_COLLABORATION` capability

### Notes / Constraints

**Design Constraints:**

- Contract-only, no networking or WebSocket implementation
- Event stream modeled but not persisted
- No real-time transport layer
- Presence representation device- and engine-agnostic

**Non-Goals:**

- Actual event persistence (database, event store)
- Real-time transport (WebSocket, Server-Sent Events)
- Presence aggregation and broadcast
- Conflict detection and resolution
- Collaborative editing UI (cursors, highlights, avatars)

**Stub-Only Restrictions:**

- `recordEventStub()` generates timestamp-based IDs and positions
- `getEventsStub()` returns empty batch
- `getPresenceSnapshotStub()` returns empty presence array
- No side effects, no persistence, deterministic results

**Integration Boundaries:**

- CollabSessionEvent references PlacementEditSessionId from Phase 5
- EditDelta wraps PlacementEditOperation from Phase 5
- Event stream enables replay of session state
- MANAGE_COLLABORATION capability added to permissions (additive only)

### Completion Notes

- Event types: SESSION_STARTED, SESSION_CLOSED, USER_JOINED, USER_LEFT, PRESENCE_UPDATED, OPERATION_APPLIED, SYSTEM_MESSAGE
- Stream positions are monotonically increasing for ordered event fetching
- Presence state tracks user activity, focus (region/space), and optional hints
- Event batching supports pagination via `nextPosition`
- Connection-agnostic design works with any transport layer (WebSocket, HTTP, etc.)
- Future work: event persistence, real-time transport, presence aggregation, conflict resolution

---

## Phase 9 — OpenUSD World Schema & Layer Mapping (Contract Layer)

**Completed:** 2025-11-25

### Intent Summary

- Define OpenUSD as the canonical layered world state for Believe
- Establish mappings from Regions, Spaces, Placements to USD prims and layers
- Document USD layer roles for each Believe phase (BASE, DRAFT, COMMIT, VALIDATION, COLLAB)
- Create USD prim path and metadata naming conventions
- Provide stub mapping functions and USD service API
- Enable long-term archival and interoperability with industry tools

### Key Artifacts

**Documentation:**

- `docs/usd_integration_model.md` — USD integration model and layer mapping

**Shared Types:**

- `src/shared/usd/usd_types.ts` — USD identifiers, metadata, layer roles, prim descriptors
- `src/shared/usd/usd_mapping.ts` — Believe → USD mapping functions (stubs)
- `src/shared/usd/usd_service.ts` — UsdStageService interface and stub implementations

**Permissions Extension:**

- `src/shared/world/permissions.ts` — Added `MANAGE_USD_INTEGRATION` capability

### Notes / Constraints

**Design Constraints:**

- Contract-only, no USD SDK calls
- No file I/O or runtime integration
- Pure TypeScript contracts and stub functions
- USD as authoritative source of truth

**Non-Goals:**

- Actual USD file generation
- USD SDK integration
- Layer composition implementation
- Runtime USD consumption
- Hydra rendering pipeline

**Stub-Only Restrictions:**

- All mapping functions return placeholder descriptors
- No actual USD prim or layer creation
- No file writes or USD API calls
- Deterministic, immutable results

**Integration Boundaries:**

- USD Stage represents entire Believe world
- Regions → Xform prims at /World/Regions/{regionId}
- Spaces → Xform prims at /World/Regions/{regionId}/Spaces/{spaceId}
- Placements → Xform/Reference prims with transforms
- Each Believe phase maps to specific USD layer role
- MANAGE_USD_INTEGRATION capability added to permissions (additive only)

### Completion Notes

- USD layer roles: BASE, DRAFT, COMMIT, VALIDATION, COLLAB
- Prim path convention: /World/Regions/{regionId}/Spaces/{spaceId}/Placements/Placement\_{placementId}
- Metadata namespace: `believe:` prefix for all Believe-specific metadata
- USD composition arcs: references (asset instancing), payloads (lazy loading), overs (non-destructive edits), variant sets (alternate configs)
- Draft layers represent PlacementEditSession changes
- Commit layers represent applied CommitPlan changes
- Validation layers store ValidationResult metadata
- Collaboration layers store presence and event metadata
- Future work: USD SDK integration, file generation, layer composition, runtime consumption

---

## Phase 10 — PlanGraph & .plan Integration (Contract Layer)

**Completed:** 2025-11-25

### Intent Summary

- Define PlanGraph and .plan contracts as the design-intent and semantic history layer for Believe
- Link all major Believe systems (Regions, Spaces, Assets, Placements, Commits, Validation, Collaboration) to PlanNodes
- Establish PlanChangeRecord types for documenting modifications with reasoning
- Create PlanFile versioning for append-only history
- Complement USD's "what exists" with PlanGraph's "why it exists"
- Enable communication between devs, modders, teachers, students, and AI tools

### Key Artifacts

**Documentation:**

- `docs/plan_graph_model.md` — PlanGraph model and .plan concepts

**Shared Types:**

- `src/shared/plan/plan_types.ts` — PlanNodeId, PlanChangeRecord, PlanFile, PlanGraph types
- `src/shared/plan/plan_mapping.ts` — Believe → PlanGraph mapping functions (stubs)
- `src/shared/plan/plan_service.ts` — PlanGraphService interface and stub implementations

**Permissions Extension:**

- `src/shared/world/permissions.ts` — Added `MANAGE_PLAN_GRAPH` capability

### Notes / Constraints

**Design Constraints:**

- Contract-only, no .plan file I/O or serialization
- No persistence or database integration
- No runtime/engine hooks
- All changes additive-only
- Stub implementations only

**Non-Goals:**

- Actual .plan file reading/writing
- .plan serialization format (YAML, JSON, etc.)
- PlanGraph persistence
- PlanGraph query and traversal APIs
- Diff and merge tools
- AI integration for intent extraction
- UI for viewing/editing .plan files

**Stub-Only Restrictions:**

- All mapping functions return placeholder values
- No actual PlanFile creation or storage
- No .plan file I/O
- Deterministic, immutable results

**Integration Boundaries:**

- PlanNodeId derived for Regions, Spaces, Placements, Commits, Scans
- PlanChangeRecords map from Commits, Drafts, Validation, Collaboration
- PlanFiles link to USD prims via usdPrimPath
- MANAGE_PLAN_GRAPH capability added to permissions (additive only)

### Completion Notes

- PlanChangeType: CREATE, UPDATE, DELETE, INTENT, LINK, UNLINK, OTHER
- PlanNodeId mapping: `region-{id}`, `space-{id}`, `placement-{id}`, `commit-{id}`, `scan-{path}`
- PlanFile versioning: append-only, immutable history
- PlanGraph complements USD: USD = "what exists", PlanGraph = "why it exists"
- Change records capture reasoning, authorship, timestamps
- Lifecycle: node creation, editing sessions, commits, validation, collaboration
- Future work: .plan file I/O, serialization, persistence, query APIs, AI integration, UI

---

## Phase 11 — Runtime Placement View (Read-Only Vertical Slice)

**Completed:** 2025-11-25

### Intent Summary

- Define runtime-facing read model for Believe world state
- Flatten hierarchical structures (Regions → Spaces → Placements) for engine consumption
- Provide validity flags from validation results
- Create pure builder function for constructing runtime view
- No ECS, networking, or Biomes runtime integration in this phase

### Key Artifacts

**Documentation:**

- `docs/runtime_view_model.md` — Runtime view model and use cases

**Shared Types:**

- `src/shared/world/runtime_view.ts` — RuntimePlacementView and RuntimeWorldView types
- `src/shared/world/runtime_view_builder.ts` — buildRuntimeWorldView function (stub logic)

### Notes / Constraints

**Design Constraints:**

- Contract-only, no engine/runtime integration
- No ECS or Biomes server wiring
- Stub builder logic only
- Pure, deterministic functions

**Non-Goals:**

- ECS integration
- Chunk streaming or spatial indexing
- Networking or serialization
- Persistence or caching
- Biomes-specific runtime hooks

**Stub-Only Restrictions:**

- commitPlan input accepted but not applied
- validationResult input accepted but not applied
- All placements marked as valid (isValid: true, hasWarnings: false)
- No filtering or derived properties

**Integration Boundaries:**

- Builds from Regions (Phase 1), AssetPlacements (Phase 3)
- Accepts CommitPlan (Phase 6) and ValidationResult (Phase 7) for future use
- Outputs flattened RuntimePlacementView array

### Completion Notes

- RuntimePlacementView includes placementId, assetId, transform, tags, validity flags
- RuntimeWorldView provides flattened placements array and regions array
- buildRuntimeWorldView is pure function with no side effects
- Stub logic: all placements valid, no commit/validation logic applied
- Future work: apply commit plan, apply validation results, spatial indexing, LOD selection, incremental updates, Biomes runtime integration

---

## Phase 12 — Runtime View Commit & Validation Application (Contracts Only)

**Completed:** 2025-11-25

### Intent Summary

- Evolve runtime view to reflect effective placements after commit application
- Surface validation status per placement with accurate validity flags
- Enable commit preview and validation preview use cases
- Maintain pure, deterministic builder logic
- No ECS, networking, or Biomes runtime integration

### Key Artifacts

**Documentation:**

- `docs/runtime_view_model.md` — Extended with Phase 12 section on commit & validation behavior

**Shared Types (Enhanced):**

- `src/shared/world/runtime_view_builder.ts` — Enhanced with applyCommitPlan and applyValidationResult helpers

### Notes / Constraints

**Design Constraints:**

- Contract-only, no engine/runtime integration
- No ECS or Biomes server wiring
- Pure, deterministic functions with no side effects
- Backward compatible (no type changes to runtime_view.ts)

**Non-Goals:**

- ECS integration
- Chunk streaming or spatial indexing
- Networking or serialization
- Persistence or caching
- Biomes-specific runtime hooks

**Implementation Details:**

- applyCommitPlan: Processes ADD/UPDATE/REMOVE changes sequentially
- applyValidationResult: Sets isValid, hasWarnings, validationIssueIds based on issues
- buildRuntimeWorldView: Applies commit plan then validation result

---

## Phase 22 — Runtime Invariant Checks & Consistency Harness

**Completed:** 2025-11-26

### Intent Summary

- Implement a pure, deterministic invariant checker for the runtime stack
- Verify consistency across WorldView, SpatialIndex, Diff, Validation, and Linking
- Ensure "crash early" detection of impossible states or data corruption
- Integrate into the golden path playground for continuous verification

### Key Artifacts

**Documentation:**

- `docs/runtime_playground_model.md` — Updated with invariant check step

**Shared Types:**

- `src/shared/runtime/runtime_invariants.ts` — Invariant types and check logic

**Tools:**

- `tools/runtime_playground/playground.ts` — Integrated invariant checks

### Notes / Constraints

**Design Constraints:**

- Pure functions only (no side effects)
- Deterministic output
- No I/O or external dependencies
- Additive-only changes

**Invariant Categories:**

- **WorldView**: Placement ID uniqueness, region/space existence
- **Spatial Index**: Region/space query consistency
- **Diff**: Disjoint added/removed/updated sets
- **Validation**: Referential integrity (issues reference existing placements)
- **Linking**: Key existence and non-empty strings

### Completion Notes

- Implemented `checkRuntimeInvariants` with comprehensive checks
- Integrated into playground pipeline after diff/linking steps
- Populated `invariantSummary` in playground result
- Verified all checks are additive and non-breaking

---

## Phase 23 — Runtime Scenario Generator (Fixture Factory)

**Completed:** 2025-11-26

### Intent Summary

- Replace hard-coded world fixture with a deterministic scenario generator
- Enable configurable complexity for future stress testing
- Preserve existing "Golden Path" scenario for regression testing
- Ensure all generated data is deterministic and reproducible

### Key Artifacts

**Documentation:**

- `docs/runtime_playground_model.md` — Updated with scenario generator details

**Shared Types:**

- `src/shared/runtime/runtime_scenario_generator.ts` — Generator module

**Tools:**

- `tools/runtime_playground/playground.ts` — Integrated generator

### Notes / Constraints

**Design Constraints:**

- Additive-only (no changes to public runtime types)
- Pure, deterministic functions (no I/O, no random)
- No synthetic validation generation (relies on Phase 19 baseline)
- Consistent ordering of arrays (Regions, Spaces, Placements)

### Completion Notes

- Implemented `generateRuntimeScenario` and `generateGoldenPathScenario`
- Replaced hard-coded fixture in playground with generator call
- Verified determinism and correct ID generation
- Verified no regression in playground output structure

---

## Phase 24 — Runtime Performance Sweep & Scaling Harness

**Completed:** 2025-11-26

### Intent Summary

- Measure how the runtime pipeline scales with world size
- Provide a deterministic, Carmack-style benchmark harness
- Focus on measurement only, not optimization
- Output machine-readable JSON for regression tracking

### Key Artifacts

**Documentation:**

- `docs/runtime_playground_model.md` — Updated with benchmark details

**Shared Runtime:**

- `src/shared/runtime/perf_utils.ts` — Timing utilities

**Tools:**

- `tools/runtime_bench/bench.ts` — Performance harness

### Notes / Constraints

**Design Constraints:**

- Additive-only (no changes to public runtime types)
- Pure, deterministic functions (no I/O beyond console)
- Uses existing scenario generator and validation logic

### Completion Notes

- Implemented `bench.ts` with "tiny", "small", and "medium" scenarios
- Measured timings for all pipeline stages
- Verified JSON output structure

---

## Phase 25 — Runtime Snapshot & Regression Capture

**Completed:** 2025-11-27

### Intent Summary

- Provide deterministic, reproducible snapshots of runtime pipeline artifacts
- Enable regression testing by comparing snapshots across runs
- Support performance tracking with stable JSON output
- Integrate snapshot generation into playground and benchmark tools

### Key Artifacts

**Documentation:**

- `docs/runtime_playground_model.md` — Updated with snapshot details

**Shared Runtime:**

- `src/shared/runtime/runtime_snapshot.ts` — Snapshot builder module

**Tools:**

- `tools/runtime_playground/playground.ts` — Playground integration
- `tools/runtime_bench/bench.ts` — Benchmark integration

### Notes / Constraints

**Design Constraints:**

- Additive-only (no changes to public runtime types)
- Pure, deterministic functions
- JSON-serializable with stable key ordering
- No I/O beyond stdout

**Snapshot Contents:**

- `worldView`: Regions and placements
- `spatialIndex`: Functional index summary
- `diff`: Added/removed/updated placements
- `invariants`: Violation reports
- `linking`: USD ↔ PlanGraph ↔ Runtime linkages
- `timing`: (Benchmark only) Performance measurements

### Completion Notes

- Implemented `buildRuntimeSnapshot()` with configurable spec flags
- Integrated into playground (without timing) and benchmark (with timing)
- All snapshot fields are deterministic and regression-testable
- Spatial index serialized as functional summary (methods cannot be serialized)

---

## Phase 8 — Runtime WorldView Builder

**Completed:** 2025-11-24

**Intent Summary:**

- All helpers are internal (not exported)

**Integration Boundaries:**

- Consumes CommitPlan (Phase 6) and ValidationResult (Phase 7)
- Produces RuntimeWorldView with effective placements and validity flags
- No changes to RuntimePlacementView or RuntimeWorldView types

### Completion Notes

- applyCommitPlan processes changes in order: ADD inserts, UPDATE replaces, REMOVE deletes
- applyValidationResult sets isValid=false for ERROR issues, hasWarnings=true for WARNING issues
- buildRuntimeWorldView flow: apply commit → map to runtime → apply validation
- Commit preview and validation preview use cases now functional
- Combined preview (commit + validation) supported
- Future work: conflict visualization, issue filtering, incremental application, undo/redo, diff visualization

---

## Phase 13 — Runtime Spatial Index (Contracts Only)

**Completed:** 2025-11-25

### Intent Summary

- Define pure TypeScript spatial indexing layer for runtime queries
- Support region, space, AABB, nearest, and overlap queries
- Maintain deterministic, engine-agnostic implementation
- No physics engines, no ECS, no complex spatial data structures
- Enable spatial filtering for commit preview and validation

### Key Artifacts

**Documentation:**

- `docs/runtime_spatial_index_model.md` — Spatial index model and query interfaces

**Shared Types:**

- `src/shared/world/runtime_spatial_index.ts` — AABB, RuntimeSpatialQuery, RuntimeSpatialIndex types
- `src/shared/world/runtime_spatial_index_builder.ts` — buildRuntimeSpatialIndex function (stub queries)

### Notes / Constraints

**Design Constraints:**

- Contract-only, no engine integration
- Pure TypeScript with no external dependencies
- Stub implementations using simple filtering
- Deterministic, pure functions

**Non-Goals:**

- Quadtree or octree implementation
- Voxel grids or spatial hashing
- Physics integration
- Dynamic streaming
- Engine math libraries
- ECS or Biomes runtime hooks

**Stub Query Implementations:**

- getPlacementsInRegion: Filter by regionId
- getPlacementsInSpace: Filter by spaceId
- getPlacementsInAABB: Point-in-AABB test using transform.position
- getNearestPlacements: Euclidean distance sort, return top N
- getOverlappingPlacements: Same as AABB (treat placements as points)

**Integration Boundaries:**

- Consumes RuntimeWorldView (Phase 12)
- Produces RuntimeSpatialIndex for spatial queries
- No changes to existing runtime types

### Completion Notes

- AABB defined with min/max corners
- RuntimeSpatialIndex interface with 5 query methods
- buildRuntimeSpatialIndex creates index from RuntimeWorldView
- All queries use simple filtering and distance checks (no spatial data structures)
- Placements treated as points (no bounding box overlap tests)
- Future work: quadtree/octree, spatial hashing, OBB support, frustum culling, raycasting, incremental updates

---

## Phase 14 — Region Streaming & Snapshot Contracts (Contracts Only)

**Completed:** 2025-11-25

### Intent Summary

- Define snapshot and delta contracts for region/world streaming
- Support engine streaming, editor preview, and analytics use cases
- Maintain cursor-driven, transport-agnostic design
- No networking, no persistence, no ECS integration
- Enable efficient world state distribution

### Key Artifacts

**Documentation:**

- `docs/region_streaming_model.md` — Region/world snapshot & delta model

**Shared Types:**

- `src/shared/world/region_streaming.ts` — StreamingCursor, RegionSnapshot, WorldSnapshot, RegionDelta, WorldDelta types
- `src/shared/world/region_streaming_service.ts` — RegionStreamingService interface and stub implementations

### Notes / Constraints

**Design Constraints:**

- Contract-only, no implementation
- No networking or transport layer
- No persistence or database
- Stub implementations only
- Cursor-driven (not timestamp-based)

**Non-Goals:**

- Chunk streaming
- Interest management
- Bandwidth optimization
- Real-time streaming
- WebSocket server
- Binary serialization

**Stub Implementations:**

- getRegionSnapshotStub: Returns empty snapshot with synthetic cursor
- getWorldSnapshotStub: Returns empty world snapshot
- getRegionDeltaStub: Returns empty delta (no changes)
- getWorldDeltaStub: Returns empty world delta

**Integration Boundaries:**

- Builds on RuntimePlacementView (Phase 11-12)
- Provides snapshot/delta contracts for streaming
- No changes to existing runtime types

### Completion Notes

- StreamingCursor: Opaque position in change history (not timestamp)
- RegionSnapshot: Complete region state at cursor with all placements
- WorldSnapshot: Multi-region state at cursor
- RegionDelta: Incremental changes (added, updated, removed) between cursors
- WorldDelta: Multi-region deltas
- RegionStreamingService: Interface with 4 methods (snapshot/delta for region/world)
- Stub implementations return placeholder data with metadata indicating stub status
- Future work: actual snapshot generation, delta computation, cursor management, persistence integration, networking, chunk streaming, interest management

---

## Phase 15 — Runtime Debug & Introspection Contracts

**Completed:** 2025-11-25

### Intent Summary

- Define debug events, probes, and snapshots for runtime introspection
- Support engine-side tooling, editor overlays, and diagnostics
- Bridge validation, commits, PlanGraph, and USD into debug surface
- No logging backend, no persistence, no transport, no engine hooks
- Enable structured, queryable debug information

### Key Artifacts

**Documentation:**

- `docs/runtime_debug_model.md` — Runtime debug & introspection model

**Shared Types:**

- `src/shared/runtime/debug.ts` — DebugEvent, DebugProbe, DebugSnapshot types with enums
- `src/shared/runtime/debug_service.ts` — RuntimeDebugService interface and stub implementations

**Permissions:**

- `src/shared/world/permissions.ts` — Extended with VIEW_RUNTIME_DEBUG capability

### Notes / Constraints

**Design Constraints:**

- Contract-only, no implementation
- No logging backend or infrastructure
- No persistence or event storage
- No transport or streaming
- No engine hooks or integration
- Stub implementations only

**Non-Goals:**

- Logging infrastructure
- Persistence layer
- Real-time streaming
- Performance profiling
- WebSocket server
- Visualization tools

**Stub Implementations:**

- recordDebugEventStub: Ensures event has ID and timestamp, returns event
- getDebugEventsStub: Returns empty array (no persistence)
- createDebugSnapshotStub: Returns snapshot with worldView and empty events

**Integration Boundaries:**

- References RuntimePlacementView (Phase 11-12)
- References validation issues (Phase 7, 12)
- References CommitPlan (Phase 6, 12)
- References PlanNodeId (Phase 10)
- References USD prim paths (Phase 9)
- No changes to existing runtime types

### Completion Notes

- DebugSeverity enum: INFO, WARNING, ERROR
- DebugEventType enum: 8 event types (validation, commit, preview, state, performance, system, other)
- DebugEvent: Atomic debug record with type, severity, message, timestamp, context
- DebugEventContext: References placements, regions, validation, PlanGraph, USD
- DebugProbe: Configured interest with spatial, entity, and classification filters
- DebugSnapshot: Summarized view with RuntimeWorldView and events
- RuntimeDebugService: Interface with 3 methods (recordEvent, getEvents, createSnapshot)
- VIEW_RUNTIME_DEBUG permission added to Capability enum
- Future work: event storage, querying with probes, snapshot persistence, logging integration, real-time streaming, performance profiling, visualization

---

## Phase 16 — Runtime Engine Adapter Contracts (Biomes-Agnostic)

**Completed:** 2025-11-25

### Intent Summary

- Define stable, engine-agnostic interface for consuming RuntimeWorldView
- Enable Biomes, UE, Unity, WebGL, and other engines to integrate
- Separate world semantics (Believe) from engine implementation
- Support full rebuild and incremental diff application
- No ECS integration, no Biomes imports, no engine SDKs

### Key Artifacts

**Documentation:**

- `docs/runtime_engine_adapter_model.md` — Engine adapter concepts and flows

**Shared Types:**

- `src/shared/runtime/engine_adapter.ts` — EngineAdapterId, EngineApplyMode, instance refs, options, results
- `src/shared/runtime/engine_adapter_service.ts` — RuntimeEngineAdapter interface and no-op stub

### Notes / Constraints

**Design Constraints:**

- Contract-only, no engine integration
- No Biomes runtime/ECS imports
- No engine SDK imports (UE, Unity, etc.)
- No I/O, networking, or persistence
- Stub implementation only

**Non-Goals:**

- Biomes runtime integration
- Asset loading or pipeline
- Physics or rendering setup
- Lifecycle management (start/stop engine)
- Scene management

**Stub Implementation:**

- createNoopEngineAdapter: Returns empty results without modifying engine state
- applyWorldView: Returns empty instances with diagnostics
- computeDiff: Returns empty diff without computing actual changes

**Integration Boundaries:**

- Consumes RuntimeWorldView (Phase 11-12)
- Optionally uses DebugEvent (Phase 15) in diagnostics
- Works alongside USD (Phase 9) and RegionStreaming (Phase 14)
- No changes to existing runtime types

### Completion Notes

- EngineAdapterId: Unique identifier for adapter implementations
- EngineApplyMode enum: FULL (rebuild) or INCREMENTAL (diff)
- EnginePlacementInstanceRef: Maps placementId to engine instanceId
- EngineApplyOptions: Filters (regions, spaces, tags, validity), mode, dry-run
- EngineApplyDiagnostics: Debug events, notes, metadata
- EngineApplyResult: Adapter ID, version, instances (all/added/updated/removed), diagnostics
- RuntimeEngineAdapter interface: describe(), applyWorldView(), computeDiff()
- createNoopEngineAdapter: Factory for no-op stub adapter
- Future work: Biomes ECS adapter, UE/Unity bridges, asset loading, physics/rendering, lifecycle management, instance pooling, performance optimization

---

## Phase 17 — Runtime Asset Binding & Resource Loading Contracts (Engine-Agnostic)

**Completed:** 2025-11-25

### Intent Summary

- Bridge BelieveAsset and RuntimeWorldView to engine-facing asset handles
- Provide stable, engine-neutral surface for asset loading
- Enable load state visibility and failure handling
- Support Biomes, UE, Unity, WebGL, and custom engines
- No engine SDK integration, no I/O, no persistence

### Key Artifacts

**Documentation:**

- `docs/runtime_asset_binding_model.md` — Asset binding model and loading contracts

**Shared Types:**

- `src/shared/runtime/asset_binding.ts` — RuntimeAssetLoadState, RuntimeAssetHandle, RuntimeAssetBinding, RuntimeAssetBindingSet
- `src/shared/runtime/asset_binding_service.ts` — RuntimeAssetBindingService interface and stub implementations

### Notes / Constraints

**Design Constraints:**

- Contract-only, no engine integration
- No Biomes runtime/ECS imports
- No engine SDK imports (UE, Unity, WebGL, etc.)
- No I/O (filesystem, network, database)
- No actual asset loading or streaming
- Stub implementations only

**Non-Goals:**

- Actual asset loading or streaming
- Asset cache implementation
- Engine SDK integration
- Network/disk I/O
- Asset pipeline integration

**Stub Implementations:**

- buildRuntimeAssetBindingsStub: Creates UNLOADED bindings for each unique assetId
- getBindingByIdStub: Returns null (no internal storage)
- getBindingByAssetIdStub: Returns null (no internal storage)
- getMissingOrFailedBindingsStub: Filters bindings for missing=true or loadState=FAILED

**Integration Boundaries:**

- Consumes BelieveAsset (Phase 2)
- Consumes RuntimeWorldView (Phase 11-12)
- Provides bindings for RuntimeEngineAdapter (Phase 16)
- Optional USD prim path references (Phase 9)
- Optional PlanGraph node references (Phase 10)
- No changes to existing runtime types

### Completion Notes

- RuntimeAssetLoadState enum: UNLOADED, LOADING, READY, FAILED
- RuntimeAssetHandle: Engine-agnostic resource reference with load state
- RuntimeAssetBinding: Maps assetId to handles with aggregate load state
- RuntimeAssetBindingSet: Collection of bindings for world view
- RuntimeAssetBindingService: Interface with 4 methods (buildBindings, getBindingById, getBindingByAssetId, getMissingOrFailedBindings)
- Aggregate load state: READY if all handles READY, LOADING if any LOADING, FAILED if any FAILED, UNLOADED if all UNLOADED
- Optional metadata: sourceType, usdPrimPath, planNodeId for debugging
- Future work: actual asset loading, asset cache, streaming, engine SDK integration, LOD/variant selection, preloading, resource pooling, format conversion

---

## Phase 18 — Runtime Integration Playground & Golden Path Harness

**Completed:** 2025-11-26

### Intent Summary

- Create self-contained, deterministic end-to-end runtime harness
- Exercise entire Believe runtime pipeline (Phases 1–17)
- Validate runtime stack coherence without engine integration
- Output JSON summary to console for verification
- No ECS, no networking, no I/O beyond console logging

### Key Artifacts

**Documentation:**

- `docs/runtime_playground_model.md` — Playground model and golden path documentation

**Playground Tools:**

- `tools/runtime_playground/world_fixture.ts` — Deterministic world fixture
- `tools/runtime_playground/playground.ts` — Playground harness and pipeline execution

### Notes / Constraints

**Design Constraints:**

- Self-contained, no external dependencies
- Deterministic fixtures with no randomness
- Console-only output (JSON summary)
- No engine integration (Biomes, UE, Unity, WebGL)
- No I/O (filesystem, network, database)
- No build system changes

**Non-Goals:**

- Engine integration or ECS
- Filesystem or network I/O
- Randomness or non-deterministic behavior
- Build system changes

**Fixture Contents:**

- 1 region (region-main)
- 2 spaces (space-hub, space-classroom)
- 5 placements with fixed IDs, assets, transforms, tags
- CommitPlan with ADD, UPDATE, REMOVE changes
- ValidationResult with WARNING and ERROR issues

**Pipeline Steps:**

1. Build world fixture
2. Build RuntimeWorldView (with commit and validation)
3. Build RuntimeSpatialIndex
4. Region streaming stubs (snapshot creation)
5. Debug snapshot stub
6. Asset binding stubs (binding creation, missing detection)
7. No-op engine adapter (world view application)

### Completion Notes

- RuntimePlaygroundFixture: Deterministic world data (regions, placements, commit, validation)
- buildRuntimePlaygroundFixture: Creates hard-coded fixture with 5 placements
- PlaygroundResult: JSON summary with worldView, spatialIndex, streaming, debug, assets, engine summaries
- runRuntimePlayground: Executes complete pipeline and returns result
- Console output: JSON printed to stdout when run directly
- How to run: `npx ts-node tools/runtime_playground/playground.ts`
- Exit code: 0 for success, 1 for error
- Future work: performance benchmarks, visual output, scenario library, comparison tool, CI integration, property-based testing

---

## Phase 19 — Baseline Validation Rules & Playground Wiring

**Completed:** 2025-11-26

### Intent Summary

- Implement real, deterministic validation logic to replace Phase 7 stubs
- Wire validation service to use baseline validation rules
- Update runtime playground to use real validation instead of synthetic results
- Provide minimal but useful set of validation checks (structural, referential, spatial)
- Maintain pure TypeScript, engine-agnostic implementation

### Key Artifacts

**Implementation:**

- `src/shared/world/validation/baseline_rules.ts` — Baseline validation implementation

**Modified Files:**

- `src/shared/world/validation/validation_service.ts` — Wired to baseline rules
- `tools/runtime_playground/world_fixture.ts` — Removed synthetic validation
- `tools/runtime_playground/playground.ts` — Uses real validation

**Documentation:**

- `docs/validation_model.md` — Extended with Phase 19 section
- `docs/runtime_playground_model.md` — Updated for real validation

### Notes / Constraints

**Design Constraints:**

- Additive-only changes (no modifications to existing public types)
- Pure TypeScript with no side effects
- Deterministic output for same input
- No engine, ECS, or runtime dependencies
- No I/O, networking, or persistence

**Non-Goals:**

- Advanced collision/overlap detection (distance thresholds, volumes, AABBs)
- Per-capability/permission-based validation
- Performance tuning (batching, early exit, caching)
- Configuration-driven rule sets
- PlanGraph-aware intent validation
- Rich debug events for validation issues

**Baseline Validation Rules:**

**Structural (7 checks):**

- Missing placementId → ERROR
- Missing assetId → ERROR
- Position NaN/Infinity → ERROR
- Rotation NaN/Infinity → ERROR
- Scale NaN/Infinity → ERROR
- Scale ≤ 0 → ERROR
- Scale > 1000 → WARNING

**Referential (4 checks):**

- Region existence → ERROR if not found
- Commit UPDATE reference → ERROR if placement doesn't exist
- Commit REMOVE reference → ERROR if placement doesn't exist
- Commit ADD duplicate → ERROR if placementId already exists

\*\*Spatial (1 check):

- Point overlap → WARNING for placements at identical position

### Completion Notes

- BaselineValidationContext: Minimal world state (regions, placements)
- validatePlacementsBaseline: Validates collection of placements
- validateCommitPlanBaseline: Validates commit plan against world state
- validatePlacementChangeBaseline: Validates single placement change
- ValidationService wired: All three stub functions now use baseline rules
- Playground updated: Dynamically runs validation and merges results
- Playground fixture simplified: No hard-coded ValidationResult

**Linkage Derivation:**

- **USD Prim Paths**: `/World/Regions/{regionId}/Spaces/{spaceId}/Placements/Placement_{placementId}`
- **PlanGraph Node IDs**: `placement-{placementId}`, `region-{regionId}`, `space-{spaceId}`
- **Pure Functions**: All linkages derived from IDs, no external data
- **Fast Lookup**: `RuntimeLinkingIndex` provides O(1) lookup by ID

**Playground Integration:**

- New `linkingSummary` field in `PlaygroundResult`
- Sample placements and regions with full linkage data
- Demonstrates USD ↔ PlanGraph ↔ Runtime connections
- JSON output includes USD prim paths and PlanGraph node IDs

**Non-Goals:**

- Actual USD file generation or SDK integration
- Actual .plan file reading or writing
- Asset binding enrichment (kept as metadata-only)
- Debug event enrichment (future enhancement)

### Completion Notes

- `RuntimeLinkingIndex`: Fast lookup structure for placements, regions, spaces
- `LinkedRuntimePlacementView`: Tooling-only type for decorated runtime views
- Derivation functions: Pure, deterministic USD/PlanGraph ID generation
- Playground `linkingSummary`: Demonstrates 3 sample placements + 1 sample region
- All changes additive: No breaking changes to existing types
- Baseline world view (before commit) vs. world view (after commit)
- `diffSummary` in `PlaygroundResult` with counts and sample
- Demonstrates deterministic diff computation in JSON output

### Completion Notes

- `RuntimeWorldDiff`: Contains added, removed, updated arrays
- `areRuntimePlacementsEqual()`: Deep structural comparison helper
- `diffRuntimeWorldViews()`: Main diff function with O(1) lookup via Maps
- Engine adapter `computeDiff()`: Now uses real diff engine instead of stub
- Playground Step 2.5: Computes diff between baseline and final world views
- All arrays canonically ordered by placementId ascending
- Future work: Epsilon tolerances for floating-point, diff optimization, incremental diffs

---

## Future Phases

Future phases will be appended below in chronological order as they are completed.
