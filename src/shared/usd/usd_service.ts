/**
 * USD Stage Service API surface for Believe's OpenUSD integration.
 *
 * This module defines the interface for creating and managing USD stages,
 * adding layers, and mapping Believe world data to USD. It provides stub
 * implementations for testing and serves as a contract for future USD SDK
 * integration.
 *
 * This phase provides stub implementations only — actual USD file generation,
 * layer composition, and USD SDK calls will be added in future phases.
 */

import type {
  UsdLayerDescriptor,
  UsdPrimDescriptor,
  UsdStageIdentifier,
} from "@/shared/usd/usd_types";
import type { Region } from "@/shared/world/space";

/**
 * Service interface for USD stage operations.
 *
 * This interface defines the contract for creating stages, managing layers,
 * and mapping Believe world data to USD. Future implementations will provide
 * actual USD SDK integration and file I/O.
 */
export interface UsdStageService {
  /**
   * Create a new USD stage.
   *
   * Future implementations will:
   * - Create USD stage file
   * - Initialize root prim structure (/World, /World/Regions, etc.)
   * - Set stage metadata
   *
   * @param id - Unique stage identifier
   * @returns Promise resolving to stage identifier
   */
  createStage(id: UsdStageIdentifier): Promise<UsdStageIdentifier>;

  /**
   * Get an existing USD stage.
   *
   * Future implementations will:
   * - Open USD stage file
   * - Load all layers in composition stack
   * - Return stage identifier if exists, null otherwise
   *
   * @param id - Stage identifier to retrieve
   * @returns Promise resolving to stage identifier or null
   */
  getStage(id: UsdStageIdentifier): Promise<UsdStageIdentifier | null>;

  /**
   * Get all layers in a USD stage.
   *
   * Future implementations will:
   * - Query stage layer stack
   * - Return layer descriptors in priority order
   * - Include role and metadata for each layer
   *
   * @param stageId - Stage identifier
   * @returns Promise resolving to array of layer descriptors
   */
  getLayers(
    stageId: UsdStageIdentifier
  ): Promise<readonly UsdLayerDescriptor[]>;

  /**
   * Add a layer to a USD stage.
   *
   * Future implementations will:
   * - Create USD layer file
   * - Add layer to stage composition stack
   * - Set layer priority based on role
   *
   * @param stageId - Stage identifier
   * @param layer - Layer descriptor to add
   * @returns Promise resolving when layer is added
   */
  addLayer(
    stageId: UsdStageIdentifier,
    layer: UsdLayerDescriptor
  ): Promise<void>;

  /**
   * Map Believe world data to USD prims.
   *
   * Future implementations will:
   * - Create USD prims for all regions
   * - Create child prims for spaces and placements
   * - Set transforms and metadata
   * - Add references to asset USD files
   *
   * @param stageId - Stage identifier
   * @param regions - Array of Believe regions to map
   * @returns Promise resolving to root prim descriptor
   */
  mapWorldToUsd(
    stageId: UsdStageIdentifier,
    regions: readonly Region[]
  ): Promise<UsdPrimDescriptor>;
}

/**
 * Create a USD stage (stub implementation).
 *
 * This is a pure stub that returns the stage identifier.
 * Future implementations will:
 * - Create USD stage file on disk
 * - Initialize root prim structure
 * - Set stage metadata (up axis, units, etc.)
 * - Create base layer
 *
 * @param id - Unique stage identifier
 * @returns Promise resolving to stage identifier
 */
export async function createUsdStageStub(
  id: UsdStageIdentifier
): Promise<UsdStageIdentifier> {
  // TODO: Replace with real USD stage creation.
  // For now, just return the ID.

  return id;
}

/**
 * Get a USD stage (stub implementation).
 *
 * This is a pure stub that returns the stage identifier.
 * Future implementations will:
 * - Open USD stage file from disk
 * - Load all layers in composition stack
 * - Return null if stage doesn't exist
 *
 * @param id - Stage identifier to retrieve
 * @returns Promise resolving to stage identifier or null
 */
export async function getUsdStageStub(
  id: UsdStageIdentifier
): Promise<UsdStageIdentifier | null> {
  // TODO: Replace with real USD stage retrieval.
  // For now, just return the ID (assume it exists).

  return id;
}

/**
 * Add a layer to a USD stage (stub implementation).
 *
 * This is a pure stub that does nothing.
 * Future implementations will:
 * - Create USD layer file on disk
 * - Add layer to stage's composition stack
 * - Set layer priority based on role
 * - Write layer metadata
 *
 * @param _stageId - Stage identifier
 * @param _layer - Layer descriptor to add
 * @returns Promise resolving when layer is added
 */
export async function addUsdLayerStub(
  _stageId: UsdStageIdentifier,
  _layer: UsdLayerDescriptor
): Promise<void> {
  // TODO: Replace with real USD layer addition.
  // For now, do nothing.

  return;
}

/**
 * Map Believe world data to USD (stub implementation).
 *
 * This is a pure stub that returns a placeholder root prim.
 * Future implementations will:
 * - Create USD prims for all regions
 * - Create child prims for spaces
 * - Create child prims for placements
 * - Set transforms from placement data
 * - Set metadata (IDs, tags, access modes)
 * - Add references to asset USD files
 *
 * @param _stageId - Stage identifier
 * @param _regions - Array of Believe regions to map
 * @returns Promise resolving to root prim descriptor
 */
export async function mapWorldToUsdStub(
  _stageId: UsdStageIdentifier,
  _regions: readonly Region[]
): Promise<UsdPrimDescriptor> {
  // TODO: Replace with real USD world mapping.
  // For now, return a placeholder root prim.

  const rootPrim: UsdPrimDescriptor = {
    path: "/World",
    type: "Xform",
    children: [
      {
        path: "/World/Regions",
        type: "Scope",
      },
    ],
  };

  return rootPrim;
}
