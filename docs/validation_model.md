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

---

## Phase 19 — Baseline Validation Rules

### Purpose

Phase 19 introduces **real, deterministic validation logic** to replace the stub implementations from Phase 7. The baseline rules provide a minimal but useful set of checks that are clearly correct and serve as the foundation for more sophisticated validation in future phases.

### Scope

**Baseline validation includes:**

1. **Structural Rules** - Data integrity and sanity checks
2. **Referential Rules** - Entity existence verification
3. **Spatial Rules** - Simple point-based overlap detection

**Explicitly out-of-scope:**

- Real collision/overlap detection (distance thresholds, volumes, AABBs)
- Per-capability/permission-based validation
- Performance tuning (batching, early exit, caching)
- Configuration-driven rule sets
- PlanGraph-aware intent validation
- Rich debug events for validation issues

### Baseline Validation Context

```typescript
interface BaselineValidationContext {
  readonly regions: readonly Region[];
  readonly placements: readonly AssetPlacement[];
}
```

The context provides the minimal world state needed for validation without requiring engine, ECS, or runtime dependencies.

### Validation Functions

#### validatePlacementsBaseline

Validates a collection of placements using baseline rules.

**Checks:**

- Structural sanity (missing IDs, transform validity, scale bounds)
- Referential integrity (region existence)
- Spatial overlap (point-based)

**Returns:** `ValidationResult` with all detected issues

#### validateCommitPlanBaseline

Validates a commit plan against current world state.

**Checks:**

- All placement changes in the plan
- ADD: No duplicate placementId
- UPDATE: Referenced placement exists
- REMOVE: Referenced placement exists

**Returns:** `ValidationResult` with aggregated issues from all changes

#### validatePlacementChangeBaseline

Validates a single placement change (ADD, UPDATE, or REMOVE).

**Returns:** `ValidationResult` for the specific change

### Baseline Rules

#### Structural Rules (ValidationType.STRUCTURAL)

| Check                 | Severity | Description                                |
| --------------------- | -------- | ------------------------------------------ |
| Missing placementId   | ERROR    | Placement has missing or empty `id`        |
| Missing assetId       | ERROR    | Placement has missing or empty `assetId`   |
| Position NaN/Infinity | ERROR    | Transform position contains invalid values |
| Rotation NaN/Infinity | ERROR    | Transform rotation contains invalid values |
| Scale NaN/Infinity    | ERROR    | Transform scale contains invalid values    |
| Scale ≤ 0             | ERROR    | Transform scale must be positive           |
| Scale > 1000          | WARNING  | Transform scale unusually large            |

#### Referential Rules (ValidationType.REFERENTIAL)

| Check                   | Severity | Description                                    |
| ----------------------- | -------- | ---------------------------------------------- |
| Region existence        | ERROR    | Placement references nonexistent `regionId`    |
| Commit UPDATE reference | ERROR    | UPDATE change references nonexistent placement |
| Commit REMOVE reference | ERROR    | REMOVE change references nonexistent placement |
| Commit ADD duplicate    | ERROR    | ADD change uses duplicate `placementId`        |

#### Spatial Rules (ValidationType.SPATIAL)

| Check         | Severity | Description                               |
| ------------- | -------- | ----------------------------------------- |
| Point overlap | WARNING  | Multiple placements at identical position |

**Note:** Spatial validation is intentionally simple (exact position match only). Future phases will add distance thresholds, bounding volumes, and proper collision detection.

### Integration with ValidationService

Phase 19 wires the baseline rules into the existing validation service:

```typescript
// validation_service.ts
export async function validateDraftPlacementStub(
  input: DraftPlacementValidationInput
): Promise<ValidationResult> {
  const ctx: BaselineValidationContext = {
    regions: [],
    placements: [...(input.livePlacements ?? []), input.draft.base],
  };
  return validatePlacementsBaseline(ctx);
}
```

All three service functions (`validateDraftPlacementStub`, `validateCommitPlanStub`, `validatePlacementChangeStub`) now use baseline validation instead of returning empty results.

### Runtime Playground Integration

The runtime playground (Phase 18) now exercises real validation:

1. Build world fixture (regions, placements, commit plan)
2. **Run baseline validation** on placements and commit plan
3. Merge validation results
4. Pass merged result to `buildRuntimeWorldView`
5. Continue with spatial index, streaming, debug, asset binding, engine adapter

The playground JSON output now includes actual validation issues detected by baseline rules.

### Design Principles

1. **Pure Functions**: All validation logic is pure with no side effects
2. **Deterministic**: Same input always produces same output
3. **Engine-Agnostic**: No runtime, physics, or ECS dependencies
4. **Context-Based**: Dependencies explicit via `BaselineValidationContext`
5. **Minimal but Useful**: Small set of clearly correct rules
6. **Composable**: Validate placements, changes, or entire commit plans

### Artifacts

**New Files:**

- `src/shared/world/validation/baseline_rules.ts` - Baseline validation implementation

**Modified Files:**

- `src/shared/world/validation/validation_service.ts` - Wired to baseline rules
- `tools/runtime_playground/world_fixture.ts` - Removed synthetic validation
- `tools/runtime_playground/playground.ts` - Uses real validation

### Future Enhancements

Phase 19 establishes the foundation for more sophisticated validation:

- **Advanced Spatial**: Distance thresholds, bounding volumes, AABBs
- **Permission Checks**: Capability-based validation
- **Asset Validation**: Verify assetId references exist in asset registry
- **Space Validation**: Verify spaceId references exist
- **Performance**: Batching, caching, early exit optimizations
- **Configuration**: Rule sets, validation profiles
- **PlanGraph Integration**: Intent-aware validation
- **Debug Events**: Rich validation issue reporting
