/**
 * Viewer and timeline contracts for Believe's scan visualization system.
 *
 * This module defines the data structures needed for visualizing scan sessions
 * in both real-time and time-lapse modes. It provides timeline construction
 * utilities for tracking scan progress through pipeline stages.
 *
 * This phase provides data contracts only — actual viewer UI/rendering
 * will be implemented in future phases.
 */

import type { ScanFrameId, ScanSession, ScanStage } from "@/shared/scan/types";

/**
 * A point on the scan timeline representing a significant event.
 *
 * Timeline points track stage transitions, frame captures, and other
 * notable events during the scan lifecycle.
 */
export interface ScanTimelinePoint {
  /** Timestamp when this event occurred */
  readonly timestamp: Date;

  /** Pipeline stage at this point in time */
  readonly stage: ScanStage;

  /**
   * Optional frame ID if this event relates to a specific frame.
   * Used for frame-by-frame playback in time-lapse mode.
   */
  readonly frameId?: ScanFrameId;

  /** Optional human-readable notes about this event */
  readonly notes?: string;
}

/**
 * Build a timeline from a scan session.
 *
 * Constructs a sequence of timeline points representing the scan's
 * progression through pipeline stages and frame captures.
 *
 * This is a stub implementation that creates a minimal timeline.
 * Future implementations will:
 * - Generate per-frame timeline points
 * - Track stage transitions with precise timestamps
 * - Include quality/coverage events
 * - Support multi-session timelines
 *
 * @param session - Scan session to build timeline from
 * @returns Array of timeline points ordered chronologically
 */
export function buildScanTimeline(
  session: ScanSession
): readonly ScanTimelinePoint[] {
  // TODO: more sophisticated timeline (per-frame, per-stage events).
  // For now, return a trivial timeline with at least one point derived from session.

  const timeline: ScanTimelinePoint[] = [];

  // Add initial point for session creation
  timeline.push({
    timestamp: session.createdAt,
    stage: session.stage,
    notes: "Scan session created",
  });

  // Add points for frames if present
  if (session.frames && session.frames.length > 0) {
    // Add first frame
    const firstFrame = session.frames[0];
    timeline.push({
      timestamp: firstFrame.timestamp,
      stage: "CAPTURED" as ScanStage,
      frameId: firstFrame.id,
      notes: "First frame captured",
    });

    // Add last frame if different from first
    if (session.frames.length > 1) {
      const lastFrame = session.frames[session.frames.length - 1];
      timeline.push({
        timestamp: lastFrame.timestamp,
        stage: "CAPTURED" as ScanStage,
        frameId: lastFrame.id,
        notes: "Last frame captured",
      });
    }
  }

  // Add current stage point if updated after creation
  if (session.updatedAt > session.createdAt) {
    timeline.push({
      timestamp: session.updatedAt,
      stage: session.stage,
      notes: `Stage: ${session.stage}`,
    });
  }

  // Sort by timestamp to ensure chronological order
  return timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
