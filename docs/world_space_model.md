# World Space Model

## Overview

This document defines the canonical representation of "spaces" inside Believe, built on top of Biomes' streaming substrate.

## Hierarchy

The world is organized as:

**World → Region → Space**

- **World**: The entire game universe
- **Region**: A collection of related spaces with shared metadata (e.g., a school building, a campus area)
- **Space**: An individual room, area, or zone within a region

## Space Properties

Each **Space** has the following properties:

### Core Identity

- **id** (string): Unique identifier for the space
- **name** (string): Human-readable name (e.g., "Room 101", "Main Hallway")
- **type** (SpaceType): Classification of the space

### Topology

- **parentId** (string | null): Optional parent space ID for nested spaces
- **tags** (string[]): Arbitrary tags for filtering and organization (e.g., ["physics", "lab", "ground-floor"])

### Access Control

- **accessMode** (AccessMode): Determines who can enter and interact with the space
  - `OPEN`: Anyone can enter
  - `TEACHER_CONTROLLED`: Teachers control access
  - `RESTRICTED`: Limited access based on permissions
  - `ADMIN_ONLY`: Only administrators can enter

### Geospatial (Optional)

- **geoReference** (GeoReference | null): Optional real-world location data for digital twin support
  - `lat` (number): Latitude
  - `lon` (number): Longitude
  - `alt` (number): Altitude in meters
  - `heading` (number): Compass heading in degrees
  - `scale` (number): Scale factor for mapping virtual to real-world dimensions

## Space Types

Spaces are classified by purpose:

- **CLASSROOM**: Educational space for instruction
- **HALLWAY**: Transitional corridor or passage
- **ARENA**: Large open area for events or activities
- **LAB**: Specialized workspace (science, computer, maker space, etc.)
- **GENERIC**: Unclassified or multi-purpose space

## Region Properties

A **Region** represents a collection of spaces with shared characteristics:

- **id** (string): Unique identifier
- **name** (string): Human-readable name (e.g., "Science Building", "West Campus")
- **spaces** (string[]): Array of space IDs contained in this region
- **metadata** (Record<string, unknown>): Extensible metadata for region-specific data

## Design Principles

1. **Extensible**: Tags and metadata allow for future expansion without schema changes
2. **Hierarchical**: Parent-child relationships support complex spatial organization
3. **Permission-aware**: Access modes integrate with the permission system
4. **Digital-twin ready**: Optional geo-referencing supports real-world mapping
5. **Simple**: Core model is minimal and practical, not over-engineered

## Future Considerations

- Spaces may eventually reference Biomes chunk IDs for streaming boundaries
- Regions may map to specific world coordinates or chunk ranges
- Additional space types can be added as needed
- Metadata can store custom properties for specific use cases (e.g., capacity, equipment lists)
