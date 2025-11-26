# Validation Model

## Overview

This document defines the validation subsystem for Believe's placement and commit systems. Validation ensures that placement operations and commits are safe and correct before they reach the runtime engine.

Validation is a pre-runtime, engine-independent layer that checks placements and commits against structural, spatial, permission, and referential constraints.

## Purpose

The validation layer serves several critical needs:

1. **Pre-Runtime Safety**: Catch errors before they reach the game engine
2. **Structured Feedback**: Provide detailed, actionable error messages
3. **Multi-Category Validation**: Check spatial, permission, structural, and referential constraints
4. **Blocking vs. Warning**: Distinguish between errors that prevent operations and warnings that inform
5. **Audit Trail**: Record validation issues for debugging and improvement

## Validation Categories

### Spatial Validation

**Purpose**: Ensure placements don't violate spatial constraints.

**Checks:**

- Bounds validation (placement within region/space boundaries)
- Collision detection (overlap with existing placements)
- Disallowed overlap (e.g., two large objects in same small space)
- Transform validity (position, rotation, scale within reasonable ranges)

**Examples:**

- Placement outside space bounds
- Two objects occupying the same position
- Scale too large for containing space
- Invalid rotation values (e.g., NaN, Infinity)

### Permission Validation

**Purpose**: Ensure user has required permissions for the operation.

**Checks:**

- User has `EDIT_PLACEMENTS` capability
- User has `MANAGE_COMMITS` capability (for commits)
- User has `VALIDATE_PLACEMENTS` capability (for validation requests)
- Space access mode allows editing
- Session participants have appropriate roles

**Examples:**

- Student attempting to edit in ADMIN_ONLY space
- User without MANAGE_COMMITS trying to apply commit
- Editing session created by user without EDIT_PLACEMENTS

### Structural Validation

**Purpose**: Ensure data structures are well-formed and complete.

**Checks:**

- Required fields present (assetId, transform, etc.)
- Field types correct (numbers are numbers, strings are strings)
- Transform components valid (position, rotation, scale)
- Enum values valid (e.g., valid AccessMode, valid CommitStatus)
- Array fields not null or undefined

**Examples:**

- Missing assetId in placement
- Transform with undefined position.x
- Invalid tag format (non-string in tags array)
- Negative scale values

### Referential Validation

**Purpose**: Ensure referenced entities exist and are valid.

**Checks:**

- AssetId references existing BelieveAsset
- RegionId references existing Region
- SpaceId references existing Space
- PlacementId references existing live placement (for updates/removes)
- SessionId references existing editing session

**Examples:**

- Placement references non-existent asset
- Commit targets non-existent region
- Update operation references deleted placement
- Draft references invalid source placement

## Validation Workflow

### Validating Draft Placements

**Input:**

- Draft placement to validate
- Optional live placements (for collision checking)
- Optional region/space context

**Process:**

1. Structural validation (check required fields, types)
2. Referential validation (verify asset, region, space exist)
3. Spatial validation (check bounds, collisions)
4. Permission validation (verify user can place in this location)

**Output:**

- `ValidationResult` with list of issues
- `isBlocking` flag (true if any ERROR severity issues)

### Validating Commit Plans

**Input:**

- Commit plan to validate
- Current live placements

**Process:**

1. Validate commit context (session exists, user has permissions)
2. Validate each placement change:
   - For ADD: validate as new draft placement
   - For UPDATE: verify source placement exists, validate new state
   - For REMOVE: verify placement exists and can be removed
3. Check for conflicts (already done in commit preparation, but re-validate)
4. Verify atomic consistency (all changes can apply together)

**Output:**

- `ValidationResult` with aggregated issues from all changes
- `isBlocking` flag (true if any change has ERROR issues)

### Validating Placement Changes

**Input:**

- Single placement change (ADD, UPDATE, or REMOVE)
- Current live placements

**Process:**

1. Validate change type and required fields
2. For ADD: validate new placement
3. For UPDATE: validate source exists and new state is valid
4. For REMOVE: validate placement exists and removal is allowed

**Output:**

- `ValidationResult` for this specific change

## Validation Issues

### ValidationIssue Structure

Each validation issue contains:

- **id**: Unique identifier for this issue
- **type**: Category (SPATIAL, PERMISSION, STRUCTURAL, REFERENTIAL, UNKNOWN)
- **severity**: WARNING or ERROR
- **message**: Human-readable description
- **placementId**: Optional reference to live placement
- **draftPlacementId**: Optional reference to draft placement
- **details**: Optional structured data for programmatic handling

### Severity Levels

**ERROR:**

- Blocks the operation from proceeding
- Must be fixed before commit can be applied
- Examples: missing required field, permission denied, collision

**WARNING:**

- Informational, does not block operation
- Should be reviewed but can be ignored
- Examples: unusual scale value, deprecated field usage, performance concern

### Issue Aggregation

`ValidationResult` aggregates all issues:

- `issues`: Array of all ValidationIssue objects
- `isBlocking`: True if any issue has severity ERROR

## Relationship to Other Systems

### Phase 3: AssetPlacement

- Validation checks AssetPlacement structure and references
- Validates transform (position, rotation, scale)
- Verifies assetId, regionId, spaceId references

### Phase 5: Edit Sessions

- Validates draft placements before they're committed
- Checks session permissions and participant roles
- Ensures drafts can be safely converted to live placements

### Phase 6: Commit Plans

- Validates commit plans before application
- Checks all placement changes for issues
- Prevents invalid commits from reaching placement registry

### Permissions System

- Uses `EDIT_PLACEMENTS`, `MANAGE_COMMITS`, `VALIDATE_PLACEMENTS` capabilities
- Checks space access modes (OPEN, TEACHER_CONTROLLED, etc.)
- Validates user roles against required permissions

## Design Principles

1. **Structured Results**: Return detailed issue objects, not booleans
2. **Multi-Category**: Check spatial, permission, structural, and referential constraints
3. **Severity-Based**: Distinguish blocking errors from informational warnings
4. **Composable**: Validate individual placements, changes, or entire commit plans
5. **Engine-Independent**: No runtime, physics, or ECS dependencies
6. **Deterministic**: Same input always produces same validation result

## Implementation Scope

**This Phase (Phase 7):**

- Define validation contracts (types and interfaces)
- Specify validation categories and workflow
- Document relationships with placement, editing, and commit systems
- Provide stub implementations for testing

**Future Phases:**

- Implement actual validation logic
- Add spatial bounds and collision checking
- Integrate with asset registry (verify assetId exists)
- Integrate with region/space registry (verify regionId/spaceId exist)
- Add permission checks (verify user capabilities)
- Implement validation caching for performance

## Future Considerations

- **Validation Caching**: Cache validation results for unchanged placements
- **Incremental Validation**: Re-validate only changed placements
- **Async Validation**: Support long-running validation (e.g., complex spatial checks)
- **Custom Validators**: Allow plugins to add custom validation rules
- **Validation Profiles**: Different validation strictness for different environments
- **Batch Validation**: Validate multiple placements efficiently
- **Validation Visualization**: Show validation issues in editor UI
- **Auto-Fix Suggestions**: Provide automated fixes for common issues
