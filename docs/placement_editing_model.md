# Placement Editing Model

## Overview

This document defines the editing layer for Believe's asset placement system. The editing layer enables UGC creators, teachers, and administrators to safely add, move, retag, and remove asset placements in Regions and Spaces before committing changes to the live world.

Editing happens in **sessions** and produces **draft placements** that exist only in the editing context until they are published.

## Purpose

The placement editing layer serves several critical needs:

1. **Safe Experimentation**: Users can try different arrangements without affecting the live world
2. **Collaborative Editing**: Multiple users can work together in a shared editing session
3. **Review Before Publish**: Changes can be reviewed and approved before going live
4. **Undo/Redo Support**: Edit operations are tracked and can be reversed
5. **Permission Control**: Editing capabilities are separate from viewing or entering spaces

## Key Concepts

### DraftPlacement

A **DraftPlacement** is a placement that exists only within an editing context, not yet committed to the live world.

**Properties:**

- All properties of a regular `AssetPlacement` (asset reference, transform, tags, etc.)
- Additional draft-specific metadata:
  - Unique draft identifier
  - Flag indicating if this is a new placement (vs. modification of existing)
  - Optional reference to source placement (if derived from existing)

**Lifecycle:**

1. Created during an edit operation (ADD or UPDATE)
2. Exists only within the editing session
3. Can be modified multiple times before publish
4. Either committed to live world or discarded when session closes

**Relationship to AssetPlacement:**

- DraftPlacement has the same structure as AssetPlacement
- When published, a DraftPlacement becomes an AssetPlacement
- Existing AssetPlacements can be loaded into a session as DraftPlacements for editing

### PlacementEditSession

A **PlacementEditSession** represents a bounded period where one or more users propose changes to placements in a specific Space or Region.

**Properties:**

- Unique session identifier
- Target region and/or space being edited
- Session status (ACTIVE or CLOSED)
- Creation and update timestamps
- Creator and participant user IDs
- Collection of draft placements
- History of edit operations
- Tags and notes for organization

**Lifecycle:**

1. Session created for a specific region/space
2. Users join as participants
3. Edit operations applied, creating/modifying draft placements
4. Session closed when editing complete
5. Draft placements either published or discarded

**Scope:**

- A session targets exactly one region and/or space
- Multiple sessions can exist for different regions/spaces
- Sessions are isolated — changes in one session don't affect others

### PlacementEditOperation

A **PlacementEditOperation** is a single atomic change applied within an editing session.

**Operation Types:**

- **ADD**: Create a new draft placement
- **UPDATE_TRANSFORM**: Modify position, rotation, or scale of a placement
- **UPDATE_TAGS**: Change tags on a placement
- **REMOVE**: Delete a placement (mark for removal)

**Properties:**

- Unique operation identifier
- Parent session identifier
- Operation type
- Target placement or draft identifier
- New data (placement, transform, tags, etc.)
- Timestamp and creator user ID
- Optional notes

**Purpose:**

- Provides audit trail of all changes
- Enables undo/redo functionality
- Supports collaborative editing (see who changed what)
- Can be replayed to reconstruct session state

## Relationships

### PlacementEditSession ↔ AssetPlacement

- Sessions work over existing `AssetPlacement` records from the live world
- Existing placements can be loaded into a session for editing
- When a session is published, draft placements become live `AssetPlacement` records
- The editing layer does not modify live placements directly

### DraftPlacement ↔ AssetPlacement

- `DraftPlacement` is structurally similar to `AssetPlacement`
- Draft placements reference the same `BelieveAsset` IDs
- Draft placements use the same `Transform` coordinate system
- When published, a draft placement becomes an `AssetPlacement`

### PlacementEditOperation ↔ DraftPlacement

- Operations create, modify, or remove draft placements
- Each operation records what changed and when
- Operations are ordered chronologically within a session
- The current session state is the result of applying all operations

### Editing ↔ Permissions

- The `EDIT_PLACEMENTS` capability controls who can create/modify placements
- Permission checks happen when creating sessions or applying operations
- Different roles may have different editing privileges (future work)
- Editing permissions are separate from space entry permissions

## Workflow: Editing to Publication

The intended workflow (not all implemented in this phase):

1. **Create Session**: User creates a `PlacementEditSession` for a region/space
2. **Load Existing**: Existing placements loaded as draft placements (if editing)
3. **Apply Operations**: User applies ADD, UPDATE, REMOVE operations
4. **Review Drafts**: User reviews draft placements in session
5. **Close Session**: User closes session when satisfied
6. **Publish**: Draft placements committed to live world (future phase)
7. **Cleanup**: Session and drafts archived or deleted

**Current Phase**: Steps 1-5 are contract-level only (types and stubs). Steps 6-7 are future work.

## Design Principles

1. **Session-Based**: All editing happens within bounded sessions
2. **Draft-First**: Changes exist as drafts before going live
3. **Operation-Tracked**: Every change is recorded as an operation
4. **Immutable History**: Operations are append-only, never modified
5. **Permission-Aware**: Editing capabilities are controlled by permissions
6. **Collaborative-Ready**: Sessions support multiple participants
7. **Stateless Contracts**: This phase defines types, not storage or networking

## Separation of Concerns

### Editing vs. Placement

- **Placement System** (Phase 3): Defines live placements in the world

  - `AssetPlacement` represents committed, live instances
  - Placement registry stores and retrieves live placements
  - No knowledge of how placements were created

- **Editing System** (Phase 5): Defines how placements are created/modified
  - `DraftPlacement` represents proposed changes
  - Edit sessions provide safe editing context
  - No direct modification of live placements

### Editing vs. Permissions

- **Permission System** (Phase 1): Defines who can do what

  - Roles and capabilities (EDIT_PLACEMENTS)
  - Space access control
  - No knowledge of editing workflow

- **Editing System** (Phase 5): Uses permissions to control editing
  - Checks `EDIT_PLACEMENTS` capability
  - Respects space access modes
  - No implementation of permission logic

### Editing vs. Runtime

- **Editing Layer** (this document): Metadata about proposed changes

  - Draft placements and operations
  - Session management
  - No actual world modification

- **Runtime Layer** (future): Applies published placements to game world
  - Spawns entities from placements
  - Handles streaming and LOD
  - No knowledge of editing sessions

## Future Considerations

- **Conflict Resolution**: Handling concurrent edits to the same placement
- **Session Persistence**: Saving and resuming editing sessions
- **Undo/Redo**: Reversing operations within a session
- **Branching**: Creating alternate versions of placements
- **Validation**: Checking placement constraints before publish
- **Preview**: Visualizing draft placements before commit
- **Permissions Integration**: Role-based editing restrictions
- **Audit Logging**: Tracking who edited what and when
- **Collaborative Features**: Real-time multi-user editing
- **Templates**: Pre-defined placement patterns

## Implementation Scope

**This Phase (Phase 5):**

- Define data contracts (types and interfaces)
- Specify editing workflow and concepts
- Document relationships with existing systems
- Provide stub implementations for testing

**Future Phases:**

- Implement actual editing service with persistence
- Build editor UI/UX
- Integrate with permissions system
- Add publish/commit workflow
- Implement validation and conflict resolution
