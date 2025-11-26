/**
 * Reconstruction API surface for Believe's scan-to-asset pipeline.
 *
 * This module defines the interface for converting scan sessions into
 * BelieveAssets through reconstruction (meshing, NERF training, etc.).
 *
 * This phase provides stub implementations only — actual reconstruction
 * logic (photogrammetry, neural rendering, etc.) will be added in future phases.
 */

import type {
  AssetProcessingStage,
  AssetSourceType,
  AssetStatus,
  BelieveAsset,
} from "@/shared/assets/types";
import type { ScanId, ScanStage } from "@/shared/scan/types";

/**
 * Request parameters for scan reconstruction.
 *
 * Specifies which scan to reconstruct and desired output characteristics.
 */
export interface ReconstructionRequest {
  /** Scan session ID to reconstruct */
  readonly scanId: ScanId;

  /**
   * Optional target resolution for reconstruction.
   * Examples: "LOW", "MEDIUM", "HIGH"
   */
  readonly targetResolution?: string;

  /**
   * Optional target format for reconstruction output.
   * Examples: "MESH", "NERF", "POINT_CLOUD"
   */
  readonly targetFormat?: string;

  /** Optional tags to apply to the resulting asset */
  readonly tags?: readonly string[];
}

/**
 * Result of a reconstruction operation.
 *
 * Contains the generated BelieveAsset and metadata about the reconstruction.
 */
export interface ReconstructionResult {
  /** The generated BelieveAsset */
  readonly asset: BelieveAsset;

  /** Source scan session ID */
  readonly scanId: ScanId;

  /** Current stage of the scan session after reconstruction */
  readonly stage: ScanStage;
}

/**
 * Reconstruct a scan session into a BelieveAsset.
 *
 * This is a stub implementation that returns a placeholder asset.
 * Future implementations will:
 * - Hook into actual reconstruction pipelines (NERFs, photogrammetry, etc.)
 * - Process scan frames into meshes or neural representations
 * - Apply stylization and optimization
 * - Store results in asset storage
 *
 * @param req - Reconstruction request parameters
 * @returns Promise resolving to reconstruction result with stub asset
 */
export async function reconstructScan(
  req: ReconstructionRequest
): Promise<ReconstructionResult> {
  // TODO: hook into actual reconstruction pipeline (NERFs, photogrammetry, etc.)
  // For now, return a stub BelieveAsset with PENDING/IMPORTED state.

  const now = new Date();
  const stubAsset: BelieveAsset = {
    id: `stub-asset-${req.scanId}`,
    sourceType: "SCAN_CAPTURE" as AssetSourceType,
    createdAt: now,
    updatedAt: now,
    processingStage: "IMPORTED" as AssetProcessingStage,
    status: "PENDING" as AssetStatus,
    tags: ["stub-reconstruction", ...(req.tags ?? [])],
  };

  return {
    asset: stubAsset,
    scanId: req.scanId,
    stage: "RECONSTRUCTING" as ScanStage,
  };
}
