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

## Future Phases

Future phases will be appended below in chronological order as they are completed.
