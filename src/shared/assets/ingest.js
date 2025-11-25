"use strict";
/**
 * Asset ingestion API for Believe.
 *
 * This module provides the core API surface for ingesting assets into the
 * Believe pipeline. Currently contains stub implementations that will be
 * wired to actual processing logic in future iterations.
 *
 * All functions in this module are pure and stateless, with no side effects,
 * file I/O, database access, or network calls.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestAsset = ingestAsset;
const types_1 = require("./types");
/**
 * Ingest an asset into the Believe pipeline.
 *
 * This is currently a stub implementation that creates a BelieveAsset
 * metadata object without performing actual file processing.
 *
 * TODO: Wire this to actual asset processing pipeline:
 * 1. Validate and read the source file
 * 2. Extract metadata (dimensions, format, etc.)
 * 3. Queue normalization job
 * 4. Queue stylization job
 * 5. Generate LODs and collision meshes
 * 6. Publish to asset storage
 * 7. Update asset status throughout the process
 *
 * @param req - Ingestion request with source information
 * @returns Promise resolving to the ingestion result
 */
async function ingestAsset(req) {
    // Generate a stub asset ID (in production, this would come from a DB or UUID generator)
    const assetId = `asset_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    // Create a stub BelieveAsset with initial metadata
    const asset = {
        id: assetId,
        sourceType: req.sourceType,
        originalPath: req.sourcePath,
        createdAt: new Date(),
        updatedAt: new Date(),
        processingStage: types_1.AssetProcessingStage.IMPORTED,
        status: types_1.AssetStatus.PENDING,
        tags: req.tags ? [...req.tags] : [],
    };
    // In production, this would:
    // - Validate the source file exists and is readable
    // - Queue background jobs for normalization and stylization
    // - Store the asset metadata in a database
    // - Return immediately while processing continues asynchronously
    return { asset };
}
