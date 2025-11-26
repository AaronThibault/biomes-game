/**
 * Runtime debug types for Believe's debug and introspection system.
 *
 * This module defines contracts for debug events, probes, and snapshots,
 * enabling runtime systems to expose structured debug information without
 * logging backends, persistence, or engine hooks.
 *
 * Phase 15: Contract-level types only, no implementation.
 */

import type { PlanNodeId } from "@/shared/plan/plan_types";
import type { PlacementId } from "@/shared/world/placement";
import type { RuntimeWorldView } from "@/shared/world/runtime_view";

/**
 * Debug event severity levels.
 */
export enum DebugSeverity {
  /** Informational message */
  INFO = "INFO",
  /** Warning that may indicate a problem */
  WARNING = "WARNING",
  /** Error that requires attention */
  ERROR = "ERROR",
}

/**
 * Debug event types for classification.
 */
export enum DebugEventType {
  /** Validation error or warning */
  VALIDATION_ISSUE = "VALIDATION_ISSUE",
  /** Commit successfully applied */
  COMMIT_APPLIED = "COMMIT_APPLIED",
  /** Commit rejected due to conflicts */
  COMMIT_REJECTED = "COMMIT_REJECTED",
  /** Preview of pending placement changes */
  PLACEMENT_CHANGE_PREVIEW = "PLACEMENT_CHANGE_PREVIEW",
  /** General runtime state observation */
  RUNTIME_STATE_NOTE = "RUNTIME_STATE_NOTE",
  /** Performance metric or warning */
  PERFORMANCE_NOTE = "PERFORMANCE_NOTE",
  /** System-level notification */
  SYSTEM_MESSAGE = "SYSTEM_MESSAGE",
  /** Unclassified event */
  OTHER = "OTHER",
}

/**
 * Unique identifier for a debug event.
 */
export type DebugEventId = string;

/**
 * Unique identifier for a debug probe.
 */
export type DebugProbeId = string;

/**
 * Unique identifier for a debug snapshot.
 */
export type DebugSnapshotId = string;

/**
 * Contextual references for debug events.
 *
 * Links events to placements, regions, validation issues, PlanGraph nodes,
 * and USD prims for multi-layer introspection.
 */
export interface DebugEventContext {
  /** Reference to RuntimePlacementView (Phase 11-12) */
  readonly placementId?: PlacementId;

  /** Region identifier */
  readonly regionId?: string;

  /** Space identifier */
  readonly spaceId?: string;

  /** Asset identifier */
  readonly assetId?: string;

  /** Related validation issue IDs (Phase 7, 12) */
  readonly validationIssueIds?: readonly string[];

  /** PlanGraph node reference (Phase 10) */
  readonly planNodeId?: PlanNodeId;

  /** USD prim path reference (Phase 9) */
  readonly usdPrimPath?: string;
}

/**
 * Atomic debug record tied to placements, regions, or assets.
 *
 * Represents a single debug observation with severity, type, and context.
 */
export interface DebugEvent {
  /** Unique event identifier */
  readonly id: DebugEventId;

  /** Event classification */
  readonly type: DebugEventType;

  /** Severity level */
  readonly severity: DebugSeverity;

  /** Human-readable description */
  readonly message: string;

  /** When event occurred */
  readonly timestamp: Date;

  /** Optional contextual references */
  readonly context?: DebugEventContext;

  /** Optional extensible metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Configured interest in specific entities, regions, or tags.
 *
 * Used to filter debug events by spatial, entity, or classification criteria.
 */
export interface DebugProbe {
  /** Unique probe identifier */
  readonly id: DebugProbeId;

  /** When probe was created */
  readonly createdAt: Date;

  /** Optional user who created probe */
  readonly createdByUserId?: string;

  /** Filter by region IDs */
  readonly regions?: readonly string[];

  /** Filter by space IDs */
  readonly spaces?: readonly string[];

  /** Filter by specific placement IDs */
  readonly placementIds?: readonly PlacementId[];

  /** Filter by placement tags */
  readonly tags?: readonly string[];

  /** Filter by severity levels */
  readonly severities?: readonly DebugSeverity[];

  /** Filter by event types */
  readonly eventTypes?: readonly DebugEventType[];

  /** Optional extensible metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Summarized view of current debug-relevant state.
 *
 * Captures RuntimeWorldView with associated debug events for offline analysis.
 */
export interface DebugSnapshot {
  /** Unique snapshot identifier */
  readonly id: DebugSnapshotId;

  /** When snapshot was created */
  readonly createdAt: Date;

  /** Complete RuntimeWorldView (Phase 11-12) */
  readonly worldView: RuntimeWorldView;

  /** Debug events relevant to this snapshot */
  readonly events: readonly DebugEvent[];

  /** Optional probe used to filter events */
  readonly probe?: DebugProbe;

  /** Optional extensible metadata */
  readonly metadata?: Record<string, unknown>;
}
