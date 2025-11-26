/**
 * PlanGraph service API surface for Believe's design-intent layer.
 *
 * This module defines the interface for creating and managing PlanFiles,
 * upserting changes, and querying PlanGraph. It provides stub implementations
 * for testing and serves as a contract for future persistence and tooling.
 *
 * This phase provides stub implementations only — actual .plan file I/O,
 * serialization, and persistence will be added in future phases.
 */

import type {
  PlanChangeRecord,
  PlanFile,
  PlanFileId,
  PlanFileVersionId,
  PlanNodeId,
} from "@/shared/plan/plan_types";

/**
 * Input parameters for upserting a PlanFile.
 */
export interface UpsertPlanFileInput {
  /** Node ID for the plan file */
  readonly nodeId: PlanNodeId;

  /** Array of changes to add to the plan file */
  readonly changes: readonly PlanChangeRecord[];

  /** Optional user ID of the author */
  readonly createdByUserId?: string;
}

/**
 * Input parameters for getting a PlanFile.
 */
export interface GetPlanFileInput {
  /** Node ID to retrieve plan file for */
  readonly nodeId: PlanNodeId;
}

/**
 * Service interface for PlanGraph operations.
 *
 * This interface defines the contract for creating, updating, and querying
 * PlanFiles. Future implementations will provide actual .plan file I/O,
 * serialization, and persistence.
 */
export interface PlanGraphService {
  /**
   * Upsert a PlanFile (create or update).
   *
   * Future implementations will:
   * - Create new PlanFile if doesn't exist
   * - Add new PlanFileVersion with changes
   * - Serialize to .plan file on disk
   * - Update PlanGraph index
   *
   * @param input - Upsert parameters
   * @returns Promise resolving to the updated PlanFile
   */
  upsertPlanFile(input: UpsertPlanFileInput): Promise<PlanFile>;

  /**
   * Get a PlanFile by node ID.
   *
   * Future implementations will:
   * - Load .plan file from disk
   * - Parse and deserialize
   * - Return null if doesn't exist
   *
   * @param input - Get parameters
   * @returns Promise resolving to PlanFile or null
   */
  getPlanFile(input: GetPlanFileInput): Promise<PlanFile | null>;

  /**
   * List all PlanFiles.
   *
   * Future implementations will:
   * - Scan .plan files directory
   * - Load and parse all files
   * - Return array of PlanFiles
   *
   * @returns Promise resolving to array of PlanFiles
   */
  listPlanFiles(): Promise<readonly PlanFile[]>;
}

/**
 * Upsert a PlanFile (stub implementation).
 *
 * This is a pure stub that creates a placeholder PlanFile.
 * Future implementations will:
 * - Check if PlanFile exists for nodeId
 * - Create new PlanFile or add version to existing
 * - Serialize to .plan file (YAML, JSON, or custom format)
 * - Update PlanGraph index
 * - Validate change records
 *
 * @param input - Upsert parameters
 * @returns Promise resolving to placeholder PlanFile
 */
export async function upsertPlanFileStub(
  input: UpsertPlanFileInput
): Promise<PlanFile> {
  // TODO: Replace with real PlanFile persistence.
  // For now, create a placeholder PlanFile with a single version.

  const fileId: PlanFileId = `planfile-${input.nodeId}`;
  const versionId: PlanFileVersionId = `version-${Date.now()}`;

  const planFile: PlanFile = {
    id: fileId,
    nodeId: input.nodeId,
    versions: [
      {
        id: versionId,
        nodeId: input.nodeId,
        createdAt: new Date(),
        createdByUserId: input.createdByUserId,
        changes: input.changes,
        metadata: {},
      },
    ],
  };

  return planFile;
}

/**
 * Get a PlanFile by node ID (stub implementation).
 *
 * This is a pure stub that returns null.
 * Future implementations will:
 * - Look up .plan file by nodeId
 * - Load file from disk
 * - Parse and deserialize
 * - Return PlanFile or null if not found
 *
 * @param input - Get parameters
 * @returns Promise resolving to null (stub always returns null)
 */
export async function getPlanFileStub(
  _input: GetPlanFileInput
): Promise<PlanFile | null> {
  // TODO: Replace with real PlanFile retrieval.
  // For now, always return null (file not found).

  return null;
}

/**
 * List all PlanFiles (stub implementation).
 *
 * This is a pure stub that returns an empty array.
 * Future implementations will:
 * - Scan .plan files directory
 * - Load and parse all .plan files
 * - Build array of PlanFiles
 * - Support filtering and pagination
 *
 * @returns Promise resolving to empty array (stub)
 */
export async function listPlanFilesStub(): Promise<readonly PlanFile[]> {
  // TODO: Replace with real PlanFile listing.
  // For now, return empty array.

  return [];
}
