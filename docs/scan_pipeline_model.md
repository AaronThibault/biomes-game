# Scan Pipeline Model

## Overview

This document defines the high-level scan pipeline for Believe, describing how physical spaces are captured, reconstructed, and integrated into the world as placeable assets.

The scan pipeline is a contract for future systems (scan tools, reconstruction pipeline, viewer) and does not specify implementation details or specific SDKs/devices.

## Pipeline Flow

The scan pipeline follows a linear flow:

**Scan Capture → Scan Session → Reconstruction → BelieveAsset → Placement**

### 1. Scan Capture

Physical spaces or objects are captured using various devices and methods:

- **Depth Cameras**: Real-time depth sensing (e.g., RealSense, Kinect)
- **LIDAR**: High-precision laser scanning
- **RGBD**: Combined RGB + depth capture
- **Mobile AR**: Smartphone-based scanning (ARKit, ARCore)
- **Drone Capture**: Aerial photogrammetry
- **Other**: Custom or specialized capture methods

Each capture produces a stream of **ScanFrames** — time-stamped snapshots containing spatial data (point clouds, depth frames, RGBD frames, etc.).

### 2. Scan Session

A **ScanSession** represents a single continuous capture session from a device or source. It contains:

- Unique identifier
- Source type (which capture method was used)
- Collection of ScanFrames with timestamps and transforms
- Current processing stage
- Optional link to resulting BelieveAsset
- Metadata and tags for organization

**Key Properties:**

- Sessions are immutable once capture is complete
- Frames are ordered chronologically
- Each frame includes position/pose information (Transform)
- Quality and coverage metrics may be attached to frames

### 3. Reconstruction

**Reconstruction** is the process that turns one or more ScanSessions into a BelieveAsset (mesh, NERF, point cloud, etc.).

Reconstruction may involve:

- Point cloud processing and meshing
- Photogrammetry alignment and texturing
- NERF training and rendering
- Mesh decimation and optimization
- Material extraction and mapping

The reconstruction process is asynchronous and may take significant time depending on the complexity and target quality.

### 4. BelieveAsset

The output of reconstruction is a **BelieveAsset** — a normalized, stylized asset ready for placement in the world.

The asset follows the standard asset pipeline stages:

- IMPORTED → NORMALIZED → STYLIZED → READY

See [asset_pipeline_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/asset_pipeline_model.md) for details on asset processing.

### 5. Placement

Once a BelieveAsset is ready, it can be placed into Regions and Spaces using the placement system.

See [asset_placement_model.md](file:///c:/Gamebridge/Dev/biomes-game/docs/asset_placement_model.md) for details on asset placement.

## Key Concepts

### ScanSession

A **ScanSession** represents a single continuous capture session.

**Properties:**

- Unique session ID
- Source type (device/method used)
- Creation and update timestamps
- Current stage in the pipeline
- Optional reference to resulting BelieveAsset
- Collection of ScanFrames
- Tags for categorization
- Extensible metadata

**Lifecycle:**

1. Session created when capture begins
2. Frames added as capture progresses
3. Session marked complete when capture ends
4. Reconstruction process begins
5. Session linked to resulting BelieveAsset

### ScanFrame

A **ScanFrame** is a time-stamped snapshot from a scan session.

**Properties:**

- Unique frame ID
- Parent session ID
- Timestamp
- Transform (position, rotation, scale in world coordinates)
- Optional quality score (0–1 range)
- Optional coverage score (0–1 range)
- Optional notes or metadata

**Purpose:**

- Represents a single moment in the capture process
- Provides spatial context (where the camera/sensor was)
- Enables timeline visualization and playback
- Supports quality assessment and coverage analysis

### Reconstruction

**Reconstruction** is the process of converting scan data into usable assets.

**Inputs:**

- One or more ScanSessions
- Target resolution (LOW, MEDIUM, HIGH)
- Target format (MESH, NERF, POINT_CLOUD)
- Processing parameters and tags

**Outputs:**

- BelieveAsset with appropriate source type
- Processing stage and status information
- Link back to source ScanSession(s)

## Relationships

### ScanSession ↔ BelieveAsset

- A ScanSession may produce zero or one BelieveAsset
- A BelieveAsset may be derived from one or more ScanSessions
- The relationship is tracked via `assetId` field in ScanSession
- Assets track their source via `sourceType = SCAN_CAPTURE`

### ScanSession ↔ AssetPlacement

- ScanSessions do not directly reference placements
- Once a BelieveAsset is created, it can be placed independently
- Placement metadata may reference the original scan for provenance

### ScanFrame ↔ ScanSession

- Frames belong to exactly one ScanSession
- Sessions may contain zero or more frames
- Frames are ordered chronologically within a session

## Design Principles

1. **Device-Agnostic**: Pipeline works with any capture source, not tied to specific hardware
2. **Asynchronous**: Reconstruction is a long-running background process
3. **Traceable**: Sessions and frames maintain full provenance chain
4. **Extensible**: Metadata fields allow for future expansion
5. **Quality-Aware**: Quality and coverage metrics guide reconstruction

## Future Considerations

- **Multi-Session Reconstruction**: Combine multiple sessions for better coverage
- **Incremental Reconstruction**: Update assets as new frames arrive
- **Real-Time Preview**: Generate low-quality previews during capture
- **Automatic Quality Assessment**: AI-driven quality scoring
- **Collaborative Scanning**: Multiple users scanning the same space simultaneously
