# Commit Workflow Model

## Overview

This document defines the commit workflow for Believe's placement editing system. The commit workflow transforms draft placements from editing sessions into live asset placements in the world, with conflict detection and resolution.

Commits represent the transition from the editing layer (Phase 5) to the live world, ensuring that proposed changes can be safely applied without breaking existing placements.

## Purpose

The commit workflow serves several critical needs:

1. **Safe Publication**: Validate draft changes before applying them to the live world
2. **Conflict Detection**: Identify situations where drafts conflict with current live state
3. **Atomic Application**: Apply all changes together or reject the entire commit
4. **Audit Trail**: Record what changed, when, and by whom
5. **Rollback Support**: Enable reverting commits if needed (future work)

## Commit Pipeline

The high-level commit pipeline follows this flow:

**PlacementEditSession → Commit Preparation → Conflict Detection → Commit Plan → Apply Commit → Updated Live AssetPlacements**

### Pipeline Stages

1. **Gather Session State**: Collect all draft placements and operations from the editing session
2. **Compare Against Live**: Fetch current live placements for the target region/space
3. **Detect Conflicts**: Identify situations where drafts cannot be cleanly applied
4. **Build Commit Plan**: Create a structured plan of changes and conflicts
5. **Apply or Reject**: Execute the plan to update live placements, or reject if unresolvable

## Key Concepts

### Commit

A **Commit** is a proposed set of changes from draft placements to live placements.

**Properties:**

- Unique commit identifier
- Reference to source editing session
- Target region and/or space
- User who requested the commit
- Timestamp

**Lifecycle:**

1. Commit requested from an editing session
2. Commit plan prepared (changes computed, conflicts detected)
3. Commit applied (if no conflicts) or rejected (if conflicts exist)
4. Result recorded with applied changes and any conflicts

### CommitPlan

A **CommitPlan** is a structured description of what will change and what conflicts exist.

**Properties:**

- Commit context (ID, session, region/space, user, timestamp)
- List of placement changes (ADD, UPDATE, REMOVE)
- List of conflicts detected
- Flag indicating if conflicts can be resolved automatically

**Purpose:**

- Provides preview of what will happen before applying commit
- Enables review and approval workflow
- Documents conflicts for manual resolution
- Can be stored for audit purposes

### PlacementChange

A **PlacementChange** is a normalized description of one change to placements.

**Change Types:**

- **ADD**: Create a new live placement from a draft
- **UPDATE**: Modify an existing live placement based on a draft
- **REMOVE**: Delete an existing live placement

**Properties:**

- Change type (ADD, UPDATE, REMOVE)
- Placement ID (for existing live placements)
- Draft placement ID (for draft source)
- Before state (previous live placement, if applicable)
- After state (resulting live placement, if applicable)

### Conflict

A **Conflict** is a situation where a draft change cannot be cleanly applied.

**Conflict Types:**

- **TRANSFORM_CONFLICT**: Another edit has moved the same placement
- **DELETION_CONFLICT**: Placement was deleted after draft was created
- **TAG_CONFLICT**: Tags were modified by another edit
- **PERMISSION_CONFLICT**: User lacks permission to apply this change
- **UNKNOWN**: Other conflict type

**Properties:**

- Unique conflict identifier
- Conflict type
- Affected placement and/or draft IDs
- Human-readable message
- Optional resolution hint

**Resolution:**

- Some conflicts may be auto-resolvable (e.g., non-overlapping tag changes)
- Others require manual intervention (e.g., transform conflicts)
- Resolution policies are defined separately from conflict detection

### CommitResult

A **CommitResult** is the outcome of applying a commit plan.

**Properties:**

- Commit context (same as plan)
- Status (PENDING, READY, APPLIED, REJECTED)
- List of changes that were applied
- List of conflicts encountered
- Completion timestamp

**Statuses:**

- **PENDING**: Commit created but not yet prepared
- **READY**: Plan prepared, ready to apply
- **APPLIED**: Successfully applied to live placements
- **REJECTED**: Could not be applied due to conflicts

## Commit Workflow Steps

### Step 1: Gather Session State

Collect all information from the `PlacementEditSession`:

- Draft placements (new or modified)
- Edit operations (history of changes)
- Session metadata (region, space, participants)

### Step 2: Compare Against Live

Fetch current live `AssetPlacement` records for the target region/space:

- Query placement registry for region/space
- Build map of live placements by ID
- Identify which drafts correspond to existing placements

### Step 3: Detect Conflicts

For each draft placement, check for conflicts:

- **For new placements (ADD)**: Check for spatial overlaps, permission issues
- **For updates (UPDATE)**: Compare draft's source placement with current live state
- **For removals (REMOVE)**: Verify placement still exists and hasn't been modified

Conflict detection compares:

- Transform changes (position, rotation, scale)
- Tag modifications
- Deletion status
- Permission requirements

### Step 4: Build Commit Plan

Create a `CommitPlan` containing:

- `CommitContext` with commit ID, session ID, user, timestamps
- List of `PlacementChange` objects (one per draft)
- List of `CommitConflict` objects (one per detected conflict)
- `isResolvableAutomatically` flag based on conflict types

### Step 5: Apply or Reject

If the plan is resolvable:

- Apply each change to the live placement registry
- Record applied changes in `CommitResult`
- Set status to `APPLIED`

If the plan has unresolvable conflicts:

- Do not modify live placements
- Record conflicts in `CommitResult`
- Set status to `REJECTED`

## Separation of Concerns

### Editing vs. Commit

- **Editing Layer** (Phase 5): Proposes changes in draft form

  - `PlacementEditSession` contains drafts and operations
  - Changes exist only in editing context
  - No validation against live world

- **Commit Layer** (Phase 6): Applies changes to live world
  - `CommitPlan` validates drafts against live state
  - Detects conflicts and builds change list
  - Atomically applies or rejects changes

### Conflict Detection vs. Resolution Policy

- **Conflict Detection** (this phase): Identifies conflicts

  - Compares draft state with live state
  - Categorizes conflicts by type
  - Provides conflict metadata

- **Resolution Policy** (future phase): Decides how to resolve
  - Auto-merge non-conflicting changes
  - Prompt user for manual resolution
  - Apply conflict resolution strategies

### Commit vs. Persistence

- **Commit Workflow** (this document): Defines what changes

  - Prepares commit plans
  - Validates changes
  - Produces commit results

- **Persistence Layer** (future phase): Stores changes
  - Writes to placement registry
  - Updates database
  - Broadcasts to clients

## Design Principles

1. **Atomic Commits**: All changes apply together or none apply
2. **Conflict-Aware**: Detect conflicts before applying changes
3. **Auditable**: Record complete history of what changed
4. **Reversible**: Commits can be rolled back (future work)
5. **Permission-Checked**: Validate user permissions before applying
6. **Idempotent**: Re-applying the same commit produces the same result

## Conflict Model

### Conflict Categories

**Spatial Conflicts:**

- Transform conflicts (overlapping positions, incompatible rotations)
- Collision conflicts (placements would intersect)

**State Conflicts:**

- Deletion conflicts (placement no longer exists)
- Modification conflicts (placement changed since draft created)

**Permission Conflicts:**

- User lacks `EDIT_PLACEMENTS` capability
- User lacks `MANAGE_COMMITS` capability
- Space access restrictions

**Metadata Conflicts:**

- Tag conflicts (tags modified by another edit)
- Region/space conflicts (target location changed)

### Conflict Resolution Strategies (Future Work)

- **Auto-Merge**: Combine non-conflicting changes
- **Last-Write-Wins**: Prefer most recent change
- **Manual Resolution**: Require user intervention
- **Reject**: Abort commit entirely

## Implementation Scope

**This Phase (Phase 6):**

- Define data contracts (types and interfaces)
- Specify commit workflow and conflict model
- Document relationships with editing and placement systems
- Provide stub implementations for testing

**Future Phases:**

- Implement actual conflict detection logic
- Add spatial overlap and collision checking
- Integrate with placement registry persistence
- Build commit approval workflow
- Implement rollback and undo functionality
- Add conflict resolution UI

## Future Considerations

- **Optimistic Locking**: Prevent concurrent commits to same placements
- **Partial Commits**: Apply non-conflicting changes, defer conflicting ones
- **Commit Batching**: Group multiple sessions into single commit
- **Commit History**: Track all commits for audit and rollback
- **Conflict Visualization**: Show conflicts in editor UI
- **Auto-Resolution**: Intelligent conflict resolution based on heuristics
- **Commit Hooks**: Trigger validation or notification on commit
- **Dry-Run Mode**: Preview commit without applying
