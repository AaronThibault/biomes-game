# PlanGraph Model

## Overview

This document defines the PlanGraph and `.plan` file contracts for Believe. PlanGraph serves as the design-intent and semantic change history layer, complementing USD's role as the canonical world state. Together, USD and PlanGraph provide a complete picture: USD describes **what exists** (geometry, placements, layers), while PlanGraph describes **why it exists** and **how it changed** (intent, reasoning, history).

This is a contract-level specification defining types and relationships. No file I/O, serialization, or persistence is included in this phase.

## Purpose of .plan in Believe

### Historical Context

The `.plan` file concept originates from early internet culture, where developers and community members would maintain `.plan` files to communicate their current work, thoughts, and intentions. In Believe, we generalize this concept to structured design-intent and reasoning attached to world elements.

### Modern Application

In Believe, `.plan` files serve as:

- **Design Intent Documentation**: Why a region, space, or placement exists
- **Semantic Change History**: How elements evolved over time with reasoning
- **Communication Layer**: Between devs, modders, teachers, students, and AI tools
- **Context Preservation**: Maintain understanding across time and contributors
- **AI Integration**: Provide structured context for AI-assisted world building

### Target Audiences

- **Developers**: Document design decisions and technical constraints
- **Modders**: Understand intent behind world structure for extensions
- **Teachers**: Explain educational goals and lesson plans
- **Students**: Learn from documented reasoning and contribute ideas
- **AI Tools**: Consume structured intent for intelligent assistance

## Relationship to USD & Believe Phases

### USD vs. PlanGraph

**USD (Universal Scene Description):**

- **Role**: Canonical world state
- **Content**: Geometry, transforms, materials, layers
- **Question**: "What exists in the world?"
- **Format**: Hierarchical prims, composition arcs, metadata

**PlanGraph:**

- **Role**: Design intent and semantic history
- **Content**: Reasoning, change records, relationships, observations
- **Question**: "Why does it exist? How did it change?"
- **Format**: Nodes, versions, change records, links

### Integration with Believe Phases

PlanGraph nodes link to all major Believe systems:

**Phase 1 (Regions & Spaces):**

- Each Region has a PlanNode documenting purpose and design intent
- Each Space has a PlanNode explaining educational goals or gameplay purpose

**Phase 2-3 (Assets & Placements):**

- Assets have PlanNodes describing creation context and intended use
- Placements have PlanNodes explaining why asset was placed at specific location

**Phase 5 (Edit Sessions):**

- Draft sessions generate PlanChangeRecords documenting editing intent
- Session notes and reasoning captured in PlanFile versions

**Phase 6 (Commits):**

- Commits create new PlanFileVersions with change summaries
- CommitPlans map to PlanChangeRecords explaining what changed and why

**Phase 7 (Validation):**

- Validation results append observations to PlanFiles
- Issues and resolutions documented as change records

**Phase 8 (Collaboration):**

- Collaborative events contribute to PlanHistory
- Presence and activity inform design evolution

**Phase 9 (USD Integration):**

- Each USD prim can link to a PlanNodeId
- USD describes composition, PlanGraph describes intent

## Core Concepts

### PlanNodeId

A **PlanNodeId** is a stable identifier for a world concept.

**Examples:**

- `region-forest` (for a Region)
- `space-classroom-101` (for a Space)
- `placement-tree-oak-42` (for an AssetPlacement)
- `commit-abc123` (for a Commit)
- `asset-character-npc-guard` (for an Asset)

**Properties:**

- Stable across versions
- Unique within PlanGraph
- Human-readable when possible
- Links to corresponding Believe entity

### PlanFile

A **PlanFile** is an abstract representation of a `.plan` file for a node.

**Structure:**

- **id**: Unique file identifier
- **nodeId**: Links to PlanNode
- **versions**: Ordered list of PlanFileVersions

**Purpose:**

- Container for all historical versions of a node's plan
- Append-only: versions never deleted, only added
- Complete history of design intent and changes

### PlanFileVersion

A **PlanFileVersion** represents a snapshot of a PlanFile at a point in time.

**Structure:**

- **id**: Unique version identifier
- **nodeId**: Links to PlanNode
- **createdAt**: Timestamp
- **createdByUserId**: Author
- **changes**: Array of PlanChangeRecords
- **metadata**: Extensible data (AI observations, tags, etc.)

**Purpose:**

- Immutable snapshot of plan state
- Records who made changes and when
- Aggregates related changes into versions

### PlanChangeRecord

A **PlanChangeRecord** is a typed change entry documenting a specific modification.

**Structure:**

- **id**: Unique change identifier
- **nodeId**: Links to PlanNode
- **type**: PlanChangeType (CREATE, UPDATE, DELETE, INTENT, LINK, UNLINK, OTHER)
- **summary**: Human-readable description
- **createdAt**: Timestamp
- **createdByUserId**: Author
- **metadata**: Extensible data

**Change Types:**

- **CREATE**: Node was created
- **UPDATE**: Node was modified
- **DELETE**: Node was deleted
- **INTENT**: Pure design-intent notes (no structural change)
- **LINK**: Linking nodes (e.g., asset ↔ placement)
- **UNLINK**: Removing links
- **OTHER**: Custom or unclassified changes

### PlanHistory

**PlanHistory** is the ordered list of PlanChangeRecords for a node.

**Properties:**

- Chronologically ordered
- Append-only (never modified or deleted)
- Complete audit trail
- Supports replay and analysis

### PlanGraph

**PlanGraph** is the collection of all PlanFiles and relationships between nodes.

**Structure:**

- **nodes**: Array of PlanGraphNodeRefs
- **planFiles**: Array of PlanFiles

**Purpose:**

- Global view of all design intent
- Navigate relationships between nodes
- Query history across entire world

### PlanGraphNodeRef

**PlanGraphNodeRef** links a PlanNode to other Believe systems.

**Structure:**

- **nodeId**: PlanNode identifier
- **usdPrimPath**: Optional link to USD prim
- **relatedNodeIds**: Optional links to related nodes

**Purpose:**

- Connect PlanGraph to USD
- Express relationships (parent/child, references, etc.)
- Enable graph traversal and queries

## Lifecycle

### Node Creation

When a new Believe entity is created:

1. Generate PlanNodeId (e.g., `region-{regionId}`)
2. Create initial PlanFile with version 0
3. Add CREATE change record with creation context
4. Link to USD prim if applicable

**Example:**

```typescript
// New Region created
const nodeId = `region-${region.id}`;
const createChange: PlanChangeRecord = {
  id: `chg-${Date.now()}`,
  nodeId,
  type: PlanChangeType.CREATE,
  summary: `Region '${region.id}' created for educational space`,
  createdAt: new Date(),
  createdByUserId: userId,
  metadata: { purpose: "classroom", capacity: 30 },
};
```

### Editing Sessions

When editing sessions close (Phase 5):

1. Generate PlanChangeRecords for each operation
2. Create new PlanFileVersion aggregating changes
3. Link session to affected nodes
4. Preserve session notes and reasoning

**Example:**

```typescript
// Draft session closed
const updateChange: PlanChangeRecord = {
  id: `chg-${Date.now()}`,
  nodeId: `placement-${placementId}`,
  type: PlanChangeType.UPDATE,
  summary: `Moved tree placement 5m north for better visibility`,
  createdAt: new Date(),
  createdByUserId: userId,
  metadata: { sessionId: session.id, operation: "MOVE" },
};
```

### Commits

When commits execute (Phase 6):

1. Map CommitPlan to PlanChangeRecords
2. Create new PlanFileVersion for each affected node
3. Link commit to all modified nodes
4. Preserve commit reasoning and validation results

**Example:**

```typescript
// Commit applied
const commitChange: PlanChangeRecord = {
  id: `chg-${Date.now()}`,
  nodeId: `space-${spaceId}`,
  type: PlanChangeType.UPDATE,
  summary: `Applied commit ${commitId}: Added 3 new placements`,
  createdAt: new Date(),
  createdByUserId: userId,
  metadata: { commitId, changeCount: 3 },
};
```

### Validation

When validation runs (Phase 7):

1. Append validation observations to PlanFile
2. Create INTENT change records for issues found
3. Link validation results to affected nodes
4. Preserve resolution notes when issues fixed

**Example:**

```typescript
// Validation issue found
const validationChange: PlanChangeRecord = {
  id: `chg-${Date.now()}`,
  nodeId: `placement-${placementId}`,
  type: PlanChangeType.INTENT,
  summary: `Validation: Placement overlaps with existing object`,
  createdAt: new Date(),
  metadata: {
    validationId,
    severity: "ERROR",
    resolution: "Move placement 2m east",
  },
};
```

### Collaboration

When collaborative events occur (Phase 8):

1. Map significant events to PlanChangeRecords
2. Preserve presence and activity context
3. Link events to affected nodes
4. Capture collaborative reasoning

## Append-Only and Versioned

### Append-Only Principle

PlanGraph is **append-only**:

- Change records never deleted
- Versions never modified
- History is immutable
- Complete audit trail preserved

**Benefits:**

- Full historical context
- Undo/redo support
- Blame and attribution
- Learning from evolution

### Versioning

PlanFiles use **semantic versioning**:

- Each significant change creates new version
- Versions numbered sequentially
- Version metadata tracks authorship and timing
- Versions can be compared and diffed

## Coexistence with USD

### Complementary Roles

**USD:**

- Authoritative world state
- Geometry and composition
- Rendering and simulation
- Layer-based non-destructive editing

**PlanGraph:**

- Design intent and reasoning
- Semantic change history
- Communication and documentation
- Relationship and context

### Linking Mechanism

Each USD prim can link to a PlanNodeId:

```usd
def Xform "Region_forest" (
    custom string believe:planNodeId = "region-forest"
)
{
    # USD prim content
}
```

Each PlanGraphNodeRef can link to USD prim path:

```typescript
const nodeRef: PlanGraphNodeRef = {
  nodeId: "region-forest",
  usdPrimPath: "/World/Regions/region-forest",
  relatedNodeIds: ["space-clearing", "space-pond"],
};
```

### Both Required

To fully understand the world:

- **USD alone**: Shows what exists but not why
- **PlanGraph alone**: Shows intent but not actual state
- **USD + PlanGraph**: Complete picture of state and reasoning

## Design Principles

1. **Intent-Focused**: Capture why, not just what
2. **Append-Only**: Never delete history
3. **Versioned**: Track evolution over time
4. **Linked**: Connect to USD and all Believe systems
5. **Human-Readable**: Summaries and notes in plain language
6. **Machine-Readable**: Structured for AI and tooling
7. **Extensible**: Metadata for custom data

## Implementation Scope

**This Phase (Phase 10):**

- Define PlanGraph contracts (types and interfaces)
- Specify mapping from Believe entities to PlanNodes
- Document lifecycle and versioning
- Provide stub implementations

**Future Phases:**

- Implement .plan file serialization (YAML, JSON, or custom format)
- Add .plan file I/O and persistence
- Build PlanGraph query and traversal APIs
- Implement diff and merge tools
- Add AI integration for intent extraction
- Build UI for viewing and editing .plan files

## Runtime Introspection (Phase 20)

### Purpose

Phase 20 enables runtime introspection by linking runtime placements to their PlanGraph node IDs. This allows debugging tools, analytics, and AI systems to trace runtime state back to design intent without requiring actual .plan file I/O.

### Linkage Model

Every runtime placement can be linked to its PlanGraph node ID using pure derivation functions:

**Placement → PlanNodeId:**

```typescript
// Example linkage
placementId: "placement-005"
→ planNodeId: "placement-placement-005"
```

**Region → PlanNodeId:**

```typescript
// Example linkage
regionId: "region-main"
→ planNodeId: "region-region-main"
```

**Space → PlanNodeId:**

```typescript
// Example linkage
spaceId: "space-classroom"
→ planNodeId: "space-space-classroom"
```

### Derivation Functions

The linking module (`src/shared/linking/runtime_linking.ts`) provides pure functions to derive PlanGraph node IDs:

```typescript
// Derive PlanGraph node ID for a placement
function derivePlanNodeIdForPlacement(placementId: PlacementId): PlanNodeId {
  return `placement-${placementId}`;
}

// Derive PlanGraph node ID for a region
function derivePlanNodeIdForRegion(regionId: string): PlanNodeId {
  return `region-${regionId}`;
}

// Derive PlanGraph node ID for a space
function derivePlanNodeIdForSpace(spaceId: string): PlanNodeId {
  return `space-${spaceId}`;
}
```

### Use Cases

**Debug Tooling:**

- Trace runtime placement back to PlanGraph node for intent lookup
- Display design reasoning in debug UI
- Cross-reference validation issues with design intent

**Analytics:**

- Track which placements are most frequently modified
- Analyze design intent vs. actual usage patterns
- Measure alignment between intent and implementation

**AI Integration:**

- Provide design context to AI assistants
- Enable intent-aware suggestions and modifications
- Support automated design documentation

**Cross-Layer Analysis:**

- Link runtime state to PlanGraph history
- Analyze how design intent evolved over time
- Debug discrepancies between intent and implementation

### Design Constraints

- **Introspection Only**: No actual .plan file I/O or persistence
- **Pure Derivation**: All linkages derived from IDs, no external data
- **Deterministic**: Same input always produces same PlanNodeId
- **No Breaking Changes**: Linkage is additive, doesn't modify existing types

### Future Enhancements

- **Actual .plan File Reading**: Load design intent from .plan files
- **Intent Validation**: Verify runtime state matches design intent
- **Intent-Aware Debugging**: Show design reasoning in debug tools
- **AI Intent Extraction**: Generate design intent from runtime behavior

## Future Considerations

- **AI-Generated Intent**: Extract design intent from commits and edits
- **Intent Validation**: Check if changes align with stated intent
- **Intent Search**: Query PlanGraph for specific reasoning
- **Intent Visualization**: Graph view of relationships and history
- **Intent Templates**: Common patterns for regions, spaces, placements
- **Intent Inheritance**: Child nodes inherit parent intent
- **Intent Conflicts**: Detect contradictory design goals
- **Intent Metrics**: Measure alignment between intent and implementation
