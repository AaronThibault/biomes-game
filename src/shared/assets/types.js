"use strict";
/**
 * Core type definitions for Believe's asset ingestion and management system.
 *
 * This module defines the canonical representation of assets in the pipeline,
 * from initial import through processing stages to final publication.
 * These types are foundational and remain independent of auth, user, or
 * runtime-specific implementation details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetStatus = exports.AssetProcessingStage = exports.AssetSourceType = void 0;
/**
 * Classification of asset source types.
 * Indicates where the asset originated from.
 */
var AssetSourceType;
(function (AssetSourceType) {
    /** Digital Content Creation tools (Blender, Unreal, Unity, Houdini, etc.) */
    AssetSourceType["DCC_TOOL"] = "DCC_TOOL";
    /** Photogrammetry or LIDAR scan captures */
    AssetSourceType["SCAN_CAPTURE"] = "SCAN_CAPTURE";
    /** Neural Radiance Field (NERF) representation */
    AssetSourceType["NERF"] = "NERF";
    /** AI-generated mesh (Meshy, procedural generators, etc.) */
    AssetSourceType["AI_MESH"] = "AI_MESH";
    /** Other or unknown source type */
    AssetSourceType["OTHER"] = "OTHER";
})(AssetSourceType || (exports.AssetSourceType = AssetSourceType = {}));
/**
 * Processing stage in the asset pipeline.
 * Tracks where an asset is in the ingestion workflow.
 */
var AssetProcessingStage;
(function (AssetProcessingStage) {
    /** Initial import, no processing applied */
    AssetProcessingStage["RAW"] = "RAW";
    /** File parsed and validated */
    AssetProcessingStage["IMPORTED"] = "IMPORTED";
    /** Coordinate system and scale corrected */
    AssetProcessingStage["NORMALIZED"] = "NORMALIZED";
    /** Art style and materials applied */
    AssetProcessingStage["STYLIZED"] = "STYLIZED";
    /** Fully processed and ready for use */
    AssetProcessingStage["READY"] = "READY";
})(AssetProcessingStage || (exports.AssetProcessingStage = AssetProcessingStage = {}));
/**
 * Current status of asset processing.
 * Indicates whether processing is ongoing, completed, or failed.
 */
var AssetStatus;
(function (AssetStatus) {
    /** Awaiting processing */
    AssetStatus["PENDING"] = "PENDING";
    /** Currently being processed */
    AssetStatus["PROCESSING"] = "PROCESSING";
    /** Processing failed with errors */
    AssetStatus["FAILED"] = "FAILED";
    /** Processing completed successfully */
    AssetStatus["COMPLETED"] = "COMPLETED";
})(AssetStatus || (exports.AssetStatus = AssetStatus = {}));
