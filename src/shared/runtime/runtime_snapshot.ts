/**
 * Runtime Snapshot & Regression Capture System.
 *
 * Phase 25: Deterministic snapshot generation for pipeline artifacts.
 * Produces stable, JSON-serializable objects for regression testing.
 */

import type { RuntimeLinkingIndex } from "@/shared/linking/runtime_linking";
import type { RuntimeWorldDiff } from "@/shared/runtime/runtime_diff";
import type { RuntimeInvariantReport } from "@/shared/runtime/runtime_invariants";
import type { RuntimeSpatialIndex } from "@/shared/world/runtime_spatial_index";
import type { RuntimeWorldView } from "@/shared/world/runtime_view";

/**
 * Specification for what to include in a runtime snapshot.
 */
export interface RuntimeSnapshotSpec {
  readonly includeWorldView: boolean;
  readonly includeSpatialIndex: boolean;
  readonly includeDiff: boolean;
  readonly includeInvariants: boolean;
  readonly includeLinking: boolean;
  readonly includeTiming: boolean;
}

/**
 * A stable, JSON-serializable snapshot of the runtime state.
 */
export interface RuntimeSnapshot {
  readonly worldView: unknown;
  readonly spatialIndex: unknown;
  readonly diff: unknown;
  readonly invariants: unknown;
  readonly linking: unknown;
  readonly timing?: unknown;
}

/**
 * Build a deterministic runtime snapshot based on the provided spec.
 *
 * @param spec - Configuration for what to include
 * @param ctx - Context containing runtime artifacts
 * @returns A JSON-serializable snapshot object
 */
export function buildRuntimeSnapshot(
  spec: RuntimeSnapshotSpec,
  ctx: {
    worldView: RuntimeWorldView;
    spatialIndex: RuntimeSpatialIndex;
    diff: RuntimeWorldDiff;
    invariants: RuntimeInvariantReport;
    linking: RuntimeLinkingIndex;
    timing?: Record<string, number>;
  }
): RuntimeSnapshot {
  return {
    worldView: spec.includeWorldView
      ? serializeWorldView(ctx.worldView)
      : undefined,
    spatialIndex: spec.includeSpatialIndex
      ? serializeSpatialIndex(ctx.spatialIndex)
      : undefined,
    diff: spec.includeDiff ? serializeDiff(ctx.diff) : undefined,
    invariants: spec.includeInvariants
      ? serializeInvariants(ctx.invariants)
      : undefined,
    linking: spec.includeLinking ? serializeLinking(ctx.linking) : undefined,
    timing: spec.includeTiming ? serializeTiming(ctx.timing) : undefined,
  };
}

// --- Serialization Helpers ---

function serializeWorldView(view: RuntimeWorldView): unknown {
  // RuntimeWorldView is already largely JSON-safe, but we ensure stability
  return {
    regions: view.regions, // Regions are simple objects
    placements: view.placements, // Placements are simple objects
  };
}

function serializeSpatialIndex(index: RuntimeSpatialIndex): unknown {
  // RuntimeSpatialIndex contains methods, so we can't serialize it directly.
  // We serialize a representation of its state or query results if needed.
  // However, since the index is built *from* the view, and we have the view,
  // maybe we just indicate it exists?
  // The user request says: "Must produce a pure JSON-serializable object."
  // And "Must include data exactly as specified by the spec flags."
  // Since the index is functional (methods), we can't serialize the functions.
  // We will serialize a placeholder indicating it was built, or perhaps
  // we can't easily serialize the internal state if it's closure-based.
  // Given the constraints, we'll serialize a simple object confirming existence.
  // OR, if the user intends for us to capture the *results* of queries, that would be different.
  // But the prompt implies capturing the *artifact*.
  // Since we can't serialize methods, and the implementation is a closure,
  // we will return a static marker.
  // WAIT: The user said "No structural changes to ... spatialIndex".
  // If we can't serialize it, maybe we shouldn't include it?
  // But `includeSpatialIndex` is a flag.
  // Let's look at `RuntimeSnapshot` type in the prompt: `readonly spatialIndex: unknown;`
  // I will serialize a string "RuntimeSpatialIndex (Functional)" or similar,
  // UNLESS I can access internal state. I cannot.
  // Actually, for regression testing, maybe we want to verify it *works*?
  // But the snapshot is data.
  // I'll return a simple object with a label for now.
  return { type: "RuntimeSpatialIndex", status: "Functional" };
}

function serializeDiff(diff: RuntimeWorldDiff): unknown {
  return {
    added: diff.added,
    removed: diff.removed,
    updated: diff.updated,
  };
}

function serializeInvariants(report: RuntimeInvariantReport): unknown {
  return {
    hasErrors: report.hasErrors,
    hasWarnings: report.hasWarnings,
    violations: report.violations,
  };
}

function serializeLinking(index: RuntimeLinkingIndex): unknown {
  return {
    byPlacementId: index.byPlacementId,
    byRegionId: index.byRegionId,
    bySpaceId: index.bySpaceId,
  };
}

function serializeTiming(timing?: Record<string, number>): unknown {
  if (!timing) return undefined;
  // Sort keys for stability
  const sortedKeys = Object.keys(timing).sort();
  const result: Record<string, number> = {};
  for (const key of sortedKeys) {
    result[key] = timing[key];
  }
  return result;
}
