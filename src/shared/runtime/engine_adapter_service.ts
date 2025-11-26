/**
 * Runtime engine adapter service for Believe's engine integration system.
 *
 * This module defines the engine adapter interface and a no-op stub
 * implementation. Phase 16 provides stub only — actual engine integrations
 * (Biomes ECS, UE, Unity, etc.) will be added in future phases.
 *
 * No Biomes imports, no ECS, no engine SDKs, no I/O, no networking.
 */

import type {
  EngineAdapterId,
  EngineApplyOptions,
  EngineApplyResult,
} from "@/shared/runtime/engine_adapter";
import type { RuntimeWorldView } from "@/shared/world/runtime_view";

/**
 * Engine-agnostic adapter interface for consuming RuntimeWorldView.
 *
 * Implementations provide engine-specific logic for applying world state
 * to Biomes ECS, Unreal Engine, Unity, WebGL, or other platforms.
 */
export interface RuntimeEngineAdapter {
  /** Unique adapter identifier */
  readonly id: EngineAdapterId;

  /**
   * Get human-readable description of this adapter.
   *
   * Examples:
   * - "Biomes ECS adapter"
   * - "UE5 bridge"
   * - "No-op adapter"
   *
   * @returns Description string
   */
  describe(): string;

  /**
   * Apply a RuntimeWorldView to the engine.
   *
   * Mode and filters are controlled via options. Default mode is FULL
   * (rebuild all instances). Use INCREMENTAL for diff-based updates.
   *
   * Future implementations will:
   * - Spawn/update/remove engine instances
   * - Load assets and apply properties
   * - Track instance lifecycle
   *
   * @param world - RuntimeWorldView to apply
   * @param options - Optional apply configuration
   * @returns Promise resolving to apply result
   */
  applyWorldView(
    world: RuntimeWorldView,
    options?: EngineApplyOptions
  ): Promise<EngineApplyResult>;

  /**
   * Compute diff between two views and optionally apply it.
   *
   * For Phase 16, this is contracts-only; no real diffing required.
   * Future implementations will:
   * - Compute placement diffs (added/updated/removed)
   * - Apply diffs incrementally
   * - Optimize for minimal engine updates
   *
   * @param previous - Previous RuntimeWorldView
   * @param next - Next RuntimeWorldView
   * @param options - Optional apply configuration
   * @returns Promise resolving to apply result
   */
  computeDiff(
    previous: RuntimeWorldView,
    next: RuntimeWorldView,
    options?: EngineApplyOptions
  ): Promise<EngineApplyResult>;
}

/**
 * Create a no-op engine adapter stub.
 *
 * This is a pure stub that returns empty results without modifying any
 * engine state. Useful for testing, tools, and contract validation.
 *
 * Future implementations will create real adapters:
 * - createBiomesECSAdapter()
 * - createUE5BridgeAdapter()
 * - createWebGLRendererAdapter()
 *
 * @param id - Optional adapter ID (default: "noop")
 * @returns No-op RuntimeEngineAdapter
 */
export function createNoopEngineAdapter(
  id: EngineAdapterId = "noop"
): RuntimeEngineAdapter {
  return {
    id,

    describe(): string {
      return "No-op runtime engine adapter stub";
    },

    async applyWorldView(
      world: RuntimeWorldView,
      options?: EngineApplyOptions
    ): Promise<EngineApplyResult> {
      // No-op: return empty result
      return {
        adapterId: id,
        appliedWorldVersion: options?.dryRun ? "dry-run" : "noop",
        instances: [],
        added: [],
        updated: [],
        removed: [],
        diagnostics: {
          notes:
            "No-op adapter: applyWorldView did not modify any engine state.",
          metadata: {
            worldPlacementCount: world.placements.length,
            options,
          },
        },
      };
    },

    async computeDiff(
      previous: RuntimeWorldView,
      next: RuntimeWorldView,
      options?: EngineApplyOptions
    ): Promise<EngineApplyResult> {
      // No-op: return empty result
      return {
        adapterId: id,
        appliedWorldVersion: options?.dryRun ? "dry-run" : "noop",
        instances: [],
        added: [],
        updated: [],
        removed: [],
        diagnostics: {
          notes:
            "No-op adapter: computeDiff did not compute or apply any diff.",
          metadata: {
            previousPlacementCount: previous.placements.length,
            nextPlacementCount: next.placements.length,
            options,
          },
        },
      };
    },
  };
}
