/**
 * Core type definitions for Believe's world space model.
 *
 * This module defines the canonical representation of spaces, regions,
 * and their properties. These types are foundational and should remain
 * independent of auth, user, or Biomes-specific implementation details.
 */

/**
 * Classification of space types by purpose.
 */
export enum SpaceType {
  /** Educational space for instruction */
  CLASSROOM = "CLASSROOM",
  /** Transitional corridor or passage */
  HALLWAY = "HALLWAY",
  /** Large open area for events or activities */
  ARENA = "ARENA",
  /** Specialized workspace (science, computer, maker space, etc.) */
  LAB = "LAB",
  /** Unclassified or multi-purpose space */
  GENERIC = "GENERIC",
}

/**
 * Access control mode for a space.
 * Determines who can enter based on their role.
 */
export enum AccessMode {
  /** Anyone can enter */
  OPEN = "OPEN",
  /** Teachers control access (may lock at runtime) */
  TEACHER_CONTROLLED = "TEACHER_CONTROLLED",
  /** Limited access based on permissions */
  RESTRICTED = "RESTRICTED",
  /** Only administrators can enter */
  ADMIN_ONLY = "ADMIN_ONLY",
}

/**
 * Optional geospatial reference for digital twin support.
 * Links a virtual space to a real-world location.
 */
export interface GeoReference {
  /** Latitude in decimal degrees */
  readonly lat: number;
  /** Longitude in decimal degrees */
  readonly lon: number;
  /** Altitude in meters */
  readonly alt: number;
  /** Compass heading in degrees (0-360) */
  readonly heading: number;
  /** Scale factor for mapping virtual to real-world dimensions */
  readonly scale: number;
}

/**
 * A Space represents an individual room, area, or zone within a region.
 */
export interface Space {
  /** Unique identifier for the space */
  readonly id: string;
  /** Human-readable name (e.g., "Room 101", "Main Hallway") */
  readonly name: string;
  /** Classification of the space */
  readonly type: SpaceType;
  /** Optional parent space ID for nested spaces */
  readonly parentId: string | null;
  /** Arbitrary tags for filtering and organization */
  readonly tags: readonly string[];
  /** Access control mode */
  readonly accessMode: AccessMode;
  /** Optional real-world location data for digital twin support */
  readonly geoReference: GeoReference | null;
}

/**
 * A Region represents a collection of related spaces with shared metadata.
 * Examples: a school building, a campus area, a game zone.
 */
export interface Region {
  /** Unique identifier for the region */
  readonly id: string;
  /** Human-readable name (e.g., "Science Building", "West Campus") */
  readonly name: string;
  /** Array of space IDs contained in this region */
  readonly spaces: readonly string[];
  /** Extensible metadata for region-specific data */
  readonly metadata: Readonly<Record<string, unknown>>;
}
