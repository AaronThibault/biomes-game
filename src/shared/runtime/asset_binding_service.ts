/**
 * Runtime asset binding service for Believe's asset loading system.
 *
 * This module defines the service interface for creating and inspecting
 * asset bindings. Phase 17 provides stub implementations only — actual
 * asset loading and caching will be added in future phases.
 *
 * No engine SDK integration, no I/O, no persistence.
 */

import type { BelieveAsset } from "@/shared/assets/types";
import type {
  RuntimeAssetBinding,
  RuntimeAssetBindingId,
  RuntimeAssetBindingSet,
  RuntimeAssetHandle,
} from "@/shared/runtime/asset_binding";
import { RuntimeAssetLoadState as LoadState } from "@/shared/runtime/asset_binding";
import type { RuntimeWorldView } from "@/shared/world/runtime_view";

/**
 * Input parameters for building runtime asset bindings.
 */
export interface BuildRuntimeAssetBindingsInput {
  /** RuntimeWorldView to build bindings from */
  readonly worldView: RuntimeWorldView;

  /** Optional known assets for validation */
  readonly knownAssets?: readonly BelieveAsset[];
}

/**
 * Input parameters for getting binding by ID.
 */
export interface GetAssetBindingByIdInput {
  /** Binding identifier */
  readonly bindingId: RuntimeAssetBindingId;
}

/**
 * Input parameters for getting binding by asset ID.
 */
export interface GetAssetBindingByAssetIdInput {
  /** Asset identifier */
  readonly assetId: string;
}

/**
 * Service interface for runtime asset binding operations.
 *
 * Provides binding creation, lookup, and inspection for asset loading.
 * Future implementations will integrate with asset cache and streaming.
 */
export interface RuntimeAssetBindingService {
  /**
   * Build asset bindings from RuntimeWorldView.
   *
   * Future implementations will:
   * - Resolve asset paths from BelieveAsset metadata
   * - Create handles for each engine/platform
   * - Track loading state per handle
   *
   * @param input - Build parameters
   * @returns Promise resolving to binding set
   */
  buildBindings(
    input: BuildRuntimeAssetBindingsInput
  ): Promise<RuntimeAssetBindingSet>;

  /**
   * Get binding by binding ID.
   *
   * Future implementations will:
   * - Query from binding registry
   * - Return cached binding if available
   *
   * @param input - Get parameters
   * @returns Promise resolving to binding or null
   */
  getBindingById(
    input: GetAssetBindingByIdInput
  ): Promise<RuntimeAssetBinding | null>;

  /**
   * Get binding by asset ID.
   *
   * Future implementations will:
   * - Query from binding registry
   * - Return cached binding if available
   *
   * @param input - Get parameters
   * @returns Promise resolving to binding or null
   */
  getBindingByAssetId(
    input: GetAssetBindingByAssetIdInput
  ): Promise<RuntimeAssetBinding | null>;

  /**
   * Get missing or failed bindings from binding set.
   *
   * Filters bindings for those with missing=true or loadState=FAILED.
   *
   * @param bindings - Binding set to filter
   * @returns Promise resolving to problematic bindings
   */
  getMissingOrFailedBindings(
    bindings: RuntimeAssetBindingSet
  ): Promise<readonly RuntimeAssetBinding[]>;
}

/**
 * Build runtime asset bindings (stub implementation).
 *
 * This is a pure stub that creates UNLOADED bindings for each unique assetId.
 * Future implementations will:
 * - Resolve asset paths from BelieveAsset metadata
 * - Create handles for each engine/platform
 * - Track loading state per handle
 *
 * @param input - Build parameters
 * @returns Promise resolving to binding set
 */
export async function buildRuntimeAssetBindingsStub(
  input: BuildRuntimeAssetBindingsInput
): Promise<RuntimeAssetBindingSet> {
  // Extract unique assetIds from placements
  const assetIds = new Set<string>();
  for (const placement of input.worldView.placements) {
    assetIds.add(placement.assetId);
  }

  // Create binding for each unique assetId
  const bindings: RuntimeAssetBinding[] = [];
  for (const assetId of assetIds) {
    const handleId = `handle-${assetId}-${Date.now()}`;
    const bindingId = `binding-${assetId}-${Date.now()}`;

    const handle: RuntimeAssetHandle = {
      id: handleId,
      assetId,
      loadState: LoadState.UNLOADED,
      metadata: {
        stub: true,
        message: "Stub handle - no actual resource loaded",
      },
    };

    const binding: RuntimeAssetBinding = {
      id: bindingId,
      assetId,
      handles: [handle],
      loadState: LoadState.UNLOADED,
      missing: false,
      metadata: {
        stub: true,
        message: "Stub binding - no actual asset resolution",
      },
    };

    bindings.push(binding);
  }

  return {
    worldVersion: `stub-${Date.now()}`,
    bindings,
  };
}

/**
 * Get binding by ID (stub implementation).
 *
 * This is a pure stub that always returns null (no internal storage).
 * Future implementations will:
 * - Query from binding registry
 * - Return cached binding if available
 *
 * @param _input - Get parameters (unused in stub)
 * @returns Promise resolving to null
 */
export async function getBindingByIdStub(
  _input: GetAssetBindingByIdInput
): Promise<RuntimeAssetBinding | null> {
  // TODO: Replace with real binding lookup
  return null;
}

/**
 * Get binding by asset ID (stub implementation).
 *
 * This is a pure stub that always returns null (no internal storage).
 * Future implementations will:
 * - Query from binding registry
 * - Return cached binding if available
 *
 * @param _input - Get parameters (unused in stub)
 * @returns Promise resolving to null
 */
export async function getBindingByAssetIdStub(
  _input: GetAssetBindingByAssetIdInput
): Promise<RuntimeAssetBinding | null> {
  // TODO: Replace with real binding lookup
  return null;
}

/**
 * Get missing or failed bindings (stub implementation).
 *
 * Filters bindings for those with missing=true or loadState=FAILED.
 *
 * @param bindings - Binding set to filter
 * @returns Promise resolving to problematic bindings
 */
export async function getMissingOrFailedBindingsStub(
  bindings: RuntimeAssetBindingSet
): Promise<readonly RuntimeAssetBinding[]> {
  return bindings.bindings.filter(
    (b) => b.missing === true || b.loadState === LoadState.FAILED
  );
}
