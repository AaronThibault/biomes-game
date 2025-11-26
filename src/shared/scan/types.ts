/**
 * Core type definitions for Believe's scanning and reconstruction system.
 *
 * This module defines the canonical representation of scan sessions and frames,
 * from initial capture through reconstruction to final asset publication.
 * These types are contracts for future systems (scan tools, reconstruction pipeline, viewer)
 * and remain independent of specific hardware, SDKs, or runtime implementation details.
 */

import type { BelieveAssetId } from "@/shared/assets/types";
import type { Transform } from "@/shared/world/placement";

/**
 * Classification of scan source types.
 * Indicates which capture device or method was used.
 */
export enum ScanSourceType {
  /** Depth camera (e.g., RealSense, Kinect) */
  DEPTH_CAMERA = "DEPTH_CAMERA",
  /** LIDAR scanner */
  LIDAR = "LIDAR",
  /** RGB + Depth combined capture */
  RGBD = "RGBD",
  /** Mobile AR scanning (ARKit, ARCore) */
  MOBILE_AR = "MOBILE_AR",
  /** Drone-based aerial capture */
  DRONE_CAPTURE = "DRONE_CAPTURE",
  /** Other or unknown source type */
  OTHER = "OTHER",
}

/**
 * Processing stage in the scan pipeline.
 * Tracks where a scan session is in the reconstruction workflow.
 */
export enum ScanStage {
  /** Raw scan data collected */
  CAPTURED = "CAPTURED",
  /** Reconstruction processing in progress */
  RECONSTRUCTING = "RECONSTRUCTING",
  /** Mesh/NERF/point cloud generated */
  RECONSTRUCTED = "RECONSTRUCTED",
  /** Art style and materials applied */
  STYLIZED = "STYLIZED",
  /** Asset finalized and ready for placement */
  PUBLISHED = "PUBLISHED",
}

/**
 * Unique identifier for a scan session.
 */
export type ScanId = string;

/**
 * Unique identifier for a scan frame within a session.
 */
export type ScanFrameId = string;

/**
 * A single time-stamped snapshot from a scan session.
 *
 * Represents one moment in the capture process, including the
 * position/pose of the capture device and optional quality metrics.
 */
export interface ScanFrame {
  /** Unique identifier for this frame */
  readonly id: ScanFrameId;

  /** Parent scan session ID */
  readonly scanId: ScanId;

  /** Timestamp when this frame was captured */
  readonly timestamp: Date;

  /** Position, rotation, and scale of capture device in world coordinates */
  readonly transform: Transform;

  /**
   * Optional quality score for this frame (0.0 = poor, 1.0 = excellent).
   * Factors: lighting, motion blur, sensor noise, occlusions, alignment confidence.
   */
  readonly qualityScore?: number;

  /**
   * Optional coverage score for this frame (0.0 = no coverage, 1.0 = complete).
   * Factors: spatial overlap, surface area captured, viewing angle diversity.
   */
  readonly coverageScore?: number;

  /** Optional notes or metadata about this frame */
  readonly notes?: string;
}

/**
 * A scan session representing a single continuous capture session.
 *
 * Contains metadata about the capture source, processing stage,
 * and a collection of frames captured during the session.
 */
export interface ScanSession {
  /** Unique identifier for this scan session */
  readonly id: ScanId;

  /** Source type indicating which capture device/method was used */
  readonly sourceType: ScanSourceType;

  /** Timestamp when the session was created */
  readonly createdAt: Date;

  /** Timestamp when the session was last updated */
  readonly updatedAt: Date;

  /** Current processing stage in the pipeline */
  readonly stage: ScanStage;

  /**
   * Optional reference to the resulting BelieveAsset.
   * Set once reconstruction is complete and asset is created.
   */
  readonly assetId?: BelieveAssetId;

  /**
   * Optional collection of frames captured during this session.
   * Frames are ordered chronologically.
   */
  readonly frames?: readonly ScanFrame[];

  /** Arbitrary tags for categorization and filtering */
  readonly tags: readonly string[];

  /**
   * Extensible metadata for session-specific data.
   * Examples: device model, capture settings, operator notes, etc.
   */
  readonly metadata?: Record<string, unknown>;
}
