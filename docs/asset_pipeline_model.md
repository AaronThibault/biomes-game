# Asset Pipeline Model

## Overview

This document defines the asset ingestion and normalization pipeline for Believe. The pipeline transforms assets from diverse sources into a unified format suitable for the Believe world.

## Pipeline Stages

The asset pipeline follows a linear flow with distinct stages:

**Source → Import → Normalize → Stylize/Bake → LOD/Collision → Publish → Runtime**

### 1. Source

Assets originate from various sources:

- **DCC Tools**: Blender, Unreal Engine, Unity, Houdini
- **Capture Devices**: Photogrammetry rigs, LIDAR scanners
- **Neural Representations**: NERFs (Neural Radiance Fields)
- **AI Generation**: Meshy, procedural generators
- **Manual Creation**: Hand-crafted models and textures

### 2. Import

Raw asset files are ingested into the pipeline:

- File format detection and validation
- Metadata extraction (source type, creation date, etc.)
- Initial asset registration in the system
- Creation of `BelieveAsset` record with `RAW` processing stage

### 3. Normalize

Assets are transformed to a consistent coordinate system and scale:

- **Axis Alignment**: Convert to Believe's coordinate system (Y-up, right-handed)
- **Scale Normalization**: Apply consistent unit scaling (meters)
- **Mesh Cleanup**: Remove degenerate geometry, fix normals, weld vertices
- **Hierarchy Flattening**: Simplify node hierarchies where appropriate

### 4. Stylize/Bake

Assets are processed to match Believe's art style:

- **Material Mapping**: Map source materials to Believe's material palette
- **Texture Processing**: Apply stylization filters (posterization, color grading, etc.)
- **Baking**: Bake lighting, AO, or other effects into textures if needed
- **Silhouette Consistency**: Ensure visual coherence with existing assets

### 5. LOD/Collision

Generate runtime optimization data:

- **LOD Chain**: Create multiple levels of detail for performance
- **Collision Meshes**: Generate simplified collision geometry
- **Occlusion Data**: Compute occlusion volumes for culling

### 6. Publish

Finalize and package the asset:

- **Validation**: Ensure asset meets all technical requirements
- **Packaging**: Bundle meshes, textures, and metadata
- **Versioning**: Assign version numbers and track changes
- **Registration**: Mark asset as `READY` and available for use

### 7. Runtime

Asset is available for placement and streaming:

- **Streaming**: Load assets on-demand based on player proximity
- **Instancing**: Efficiently render multiple copies
- **Material Application**: Apply runtime materials and shaders

## Key Concepts

### BelieveAsset

The canonical representation of an asset in the pipeline. Contains:

- Unique identifier
- Source type and original path
- Processing stage and status
- Metadata and tags
- Error information (if processing failed)

### ProcessingStage

An enumeration tracking where an asset is in the pipeline:

- `RAW`: Initial import, no processing
- `IMPORTED`: File parsed and validated
- `NORMALIZED`: Coordinate system and scale corrected
- `STYLIZED`: Art style applied
- `READY`: Fully processed and available for use

### Separation of Concerns

**Asset Ingest vs. World Placement**:

- The asset pipeline handles **asset preparation** (this document)
- World placement handles **where assets go** in spaces (later phases)
- Assets are prepared independently of their eventual use in the world

## Source Type Details

### DCC Tools (Blender, Unreal, Unity, Houdini)

- **Input Formats**: FBX, glTF, OBJ, USD
- **Considerations**:
  - Different coordinate systems and units
  - Material translation required
  - May include animations or rigs (handle separately)

### Scan Captures (Photogrammetry, LIDAR)

- **Input Formats**: Point clouds, mesh reconstructions
- **Considerations**:
  - High polygon counts requiring decimation
  - Real-world scale and orientation
  - Texture quality varies by capture method

### NERFs (Neural Radiance Fields)

- **Input Formats**: Trained neural network weights, rendered meshes
- **Considerations**:
  - May require conversion to traditional mesh
  - Lighting baked into representation
  - Novel view synthesis capabilities

### AI-Generated Meshes (Meshy, etc.)

- **Input Formats**: glTF, OBJ, FBX
- **Considerations**:
  - Variable quality and topology
  - May need cleanup and optimization
  - Licensing and attribution tracking

## Design Principles

1. **Idempotent**: Re-running pipeline stages produces consistent results
2. **Traceable**: Each stage logs its operations for debugging
3. **Extensible**: New source types and processing steps can be added
4. **Fail-Safe**: Errors at any stage are captured and reported
5. **Asynchronous**: Long-running operations don't block other work

## Future Considerations

- **Batch Processing**: Process multiple assets in parallel
- **Incremental Updates**: Re-process only changed portions of assets
- **Quality Metrics**: Automated quality checks at each stage
- **Preview Generation**: Create thumbnails and previews for browsing
- **Dependency Tracking**: Handle assets that reference other assets
