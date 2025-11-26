# Scan Viewer Mode

## Overview

This document defines the viewer modes for visualizing scan sessions and reconstruction progress in Believe. The viewer provides two primary modes: real-time streaming during active capture, and time-lapse replay for completed sessions.

This document defines the **data contracts** needed for viewer implementation, not the UI or rendering details.

## Viewer Modes

### Real-Time Mode

**Purpose**: Visualize scan frames as they arrive during an active ScanSession.

**Visual Contract**: "Stream of frames over time"

**Data Requirements:**

- Live ScanSession with incrementally added frames
- Each frame includes:
  - Timestamp
  - Transform (position/pose of capture device)
  - Quality score (optional)
  - Coverage score (optional)

**Use Cases:**

- Monitor scan quality during capture
- Identify coverage gaps in real-time
- Provide operator feedback (move slower, capture this area again, etc.)
- Visualize sensor position and orientation

**Implementation Notes:**

- Viewer consumes frames as they are added to the session
- No reconstruction is performed in real-time mode
- Focus is on raw capture data and coverage visualization
- Quality/coverage hints guide the operator

### Time-Lapse Mode

**Purpose**: Replay a completed ScanSession and visualize reconstruction pipeline stages.

**Visual Contract**: "Timeline of scan state changes"

**Pipeline Stages Visualized:**

1. **CAPTURED**: Raw scan data collected
2. **RECONSTRUCTING**: Processing in progress
3. **RECONSTRUCTED**: Mesh/NERF generated
4. **STYLIZED**: Art style applied
5. **PUBLISHED**: Asset ready for placement

**Data Requirements:**

- Completed ScanSession with all frames
- Timeline of stage transitions (timestamps + stages)
- Optional per-frame metadata (quality, coverage, notes)
- Link to resulting BelieveAsset (if available)

**Use Cases:**

- Review completed scans before reconstruction
- Monitor reconstruction progress
- Identify problematic frames or areas
- Compare raw capture to final asset
- Educational/demonstration purposes

**Implementation Notes:**

- Viewer can scrub through timeline
- Stage transitions are discrete events
- Frames can be played back in sequence
- Quality/coverage visualization helps identify issues

## Timeline Representation

A **ScanTimeline** is a sequence of **ScanTimelinePoints**, each representing a significant event in the scan lifecycle.

### ScanTimelinePoint

**Properties:**

- Timestamp (when the event occurred)
- Stage (which pipeline stage)
- Optional frame ID (if event relates to a specific frame)
- Optional notes (human-readable description)

**Example Timeline:**

```
[
  { timestamp: "2025-11-25T10:00:00Z", stage: "CAPTURED", notes: "Scan started" },
  { timestamp: "2025-11-25T10:00:01Z", stage: "CAPTURED", frameId: "frame-001" },
  { timestamp: "2025-11-25T10:00:02Z", stage: "CAPTURED", frameId: "frame-002" },
  ...
  { timestamp: "2025-11-25T10:05:00Z", stage: "CAPTURED", notes: "Scan completed" },
  { timestamp: "2025-11-25T10:05:30Z", stage: "RECONSTRUCTING", notes: "Reconstruction started" },
  { timestamp: "2025-11-25T10:15:00Z", stage: "RECONSTRUCTED", notes: "Mesh generated" },
  { timestamp: "2025-11-25T10:20:00Z", stage: "STYLIZED", notes: "Art style applied" },
  { timestamp: "2025-11-25T10:25:00Z", stage: "PUBLISHED", notes: "Asset ready" }
]
```

## Quality and Coverage Hints

Both viewer modes benefit from quality and coverage metadata attached to frames.

### Quality Score

**Range**: 0.0 (poor) to 1.0 (excellent)

**Factors:**

- Lighting conditions
- Motion blur
- Sensor noise
- Occlusions
- Alignment confidence

**Visualization:**

- Color-coded frames (red = poor, yellow = acceptable, green = good)
- Aggregate quality metrics for the entire session
- Warnings when quality drops below threshold

### Coverage Score

**Range**: 0.0 (no coverage) to 1.0 (complete coverage)

**Factors:**

- Spatial overlap with previous frames
- Surface area captured
- Viewing angles diversity
- Gap detection

**Visualization:**

- Heat maps showing covered vs. uncovered areas
- 3D coverage visualization (point cloud density)
- Recommendations for additional capture passes

## Data Contracts

### For Real-Time Mode

**Input:**

- Active ScanSession (mutable, frames being added)
- Stream of new ScanFrames

**Output:**

- Visual representation of capture progress
- Quality/coverage feedback to operator

### For Time-Lapse Mode

**Input:**

- Completed ScanSession (immutable)
- ScanTimeline (derived from session)
- Optional BelieveAsset (if reconstruction complete)

**Output:**

- Playback controls (play, pause, scrub)
- Stage transition visualization
- Frame-by-frame inspection

## Design Principles

1. **Data-Driven**: Viewer consumes structured data, not raw sensor streams
2. **Stage-Aware**: Clearly visualizes pipeline progression
3. **Operator-Friendly**: Provides actionable feedback during capture
4. **Retrospective**: Supports post-capture analysis and review
5. **Extensible**: Metadata fields allow for future visualization enhancements

## Future Considerations

- **Multi-Session Comparison**: View multiple scans side-by-side
- **Collaborative Viewing**: Multiple users viewing the same session
- **AR Overlay**: Project coverage visualization onto real-world space
- **Automatic Annotations**: AI-generated notes on quality issues
- **Export/Sharing**: Share timelines and visualizations with collaborators

## Relationship to Other Systems

### Scan Pipeline

The viewer consumes data produced by the scan pipeline but does not modify it. See [scan_pipeline_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/scan_pipeline_model.md) for pipeline details.

### Asset Pipeline

Once reconstruction is complete, the resulting BelieveAsset follows the standard asset pipeline. The viewer may display asset processing stages but does not control them. See [asset_pipeline_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/asset_pipeline_model.md) for details.

### World Placement

The viewer does not handle asset placement. Once an asset is published, it can be placed using the placement system. See [asset_placement_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/asset_placement_model.md) for details.

## Implementation Scope

**This Phase (Phase 4):**

- Define data contracts (ScanSession, ScanFrame, ScanTimeline)
- Specify viewer modes and requirements
- Document quality/coverage metadata

**Future Phases:**

- Implement actual viewer UI/UX
- Integrate with scan hardware
- Build rendering and visualization components
- Add real-time streaming infrastructure
