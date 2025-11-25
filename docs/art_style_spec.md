# Art Style Specification

## Overview

This document defines the stylization intent for Believe assets. The goal is to ensure a **unified visual look** across all user-generated content (UGC) while maintaining creative flexibility.

This is a **living specification** that will evolve with input from art and tech-art teams.

## Core Principles

### 1. Unified Look Across UGC

All assets in Believe should feel like they belong to the same world:

- **Consistent Visual Language**: Assets from different sources should blend seamlessly
- **Coherent Aesthetics**: Avoid jarring style clashes between user-created content
- **Recognizable Identity**: Believe should have a distinct visual signature

### 2. Constrained Material Palette

Assets must map to a **limited set of material slots**:

- **Material Categories**:
  - Base materials (wood, metal, stone, plastic, fabric, glass)
  - Special materials (emissive, transparent, reflective)
- **Shader Consistency**: All materials use the same underlying shader system
- **Parameter Ranges**: Material properties (roughness, metallic, etc.) stay within defined bounds

### 3. Scale and Silhouette Consistency

Assets should maintain visual coherence in form:

- **Proportional Scale**: Objects maintain realistic relative sizes
- **Readable Silhouettes**: Clear, recognizable shapes from a distance
- **Detail Levels**: Appropriate detail for the asset's typical viewing distance

## Stylization Pipeline

### Material Mapping

Source materials are mapped to Believe's material palette:

- **Automatic Mapping**: Heuristics map common material types
- **Manual Override**: Creators can specify material assignments
- **Fallback Materials**: Unknown materials default to sensible choices

### Texture Processing

Textures may be processed to fit the style:

- **Color Grading**: Adjust color palettes to match Believe's aesthetic
- **Posterization**: Optional reduction of color gradients for stylized look
- **Contrast Adjustment**: Ensure textures are readable at runtime
- **Resolution Normalization**: Standardize texture sizes for performance

### Mesh Processing

Geometry may be adjusted for visual consistency:

- **Silhouette Preservation**: Maintain recognizable shapes during optimization
- **Edge Sharpening**: Emphasize important edges for clarity
- **Smoothing Groups**: Consistent normal handling across assets

## Material Slot Requirements

### Base Material Slots

Assets should use materials from these categories:

1. **Diffuse Materials**

   - Matte surfaces with minimal reflection
   - Examples: painted wood, rough stone, fabric

2. **Metallic Materials**

   - Reflective, conductive surfaces
   - Examples: steel, aluminum, gold

3. **Dielectric Materials**

   - Non-metallic, potentially reflective
   - Examples: plastic, ceramic, polished wood

4. **Transparent Materials**

   - Glass, water, clear plastic
   - Requires special handling for rendering

5. **Emissive Materials**
   - Self-illuminated surfaces
   - Examples: screens, lights, glowing elements

### Material Properties

Each material slot has constrained parameters:

- **Albedo/Base Color**: RGB values within acceptable range
- **Roughness**: 0.0 (smooth) to 1.0 (rough)
- **Metallic**: 0.0 (dielectric) or 1.0 (metal), no in-between
- **Emissive Intensity**: Controlled to avoid over-bright scenes

## Shader and Rendering

**Note**: Actual shader implementation lives in the rendering system, not the asset pipeline.

However, assets must be prepared with these rendering constraints in mind:

- **PBR Workflow**: Physically-based rendering materials
- **Texture Channels**: Albedo, Normal, Roughness, Metallic, AO
- **Texture Formats**: Compressed formats for runtime efficiency
- **Draw Call Optimization**: Minimize material variations per asset

## Quality Guidelines

### Visual Coherence

Assets should:

- Match the overall art direction (to be defined by art team)
- Avoid photorealistic textures unless part of digital twin mode
- Use consistent lighting assumptions (neutral lighting in textures)

### Technical Constraints

Assets must:

- Stay within polygon budgets (to be defined per asset type)
- Use texture resolutions appropriate for their size
- Avoid excessive transparency or overdraw
- Support LOD transitions smoothly

## Iteration and Evolution

This specification is **not final**:

- **Art Direction**: Will be refined as the visual style is established
- **Technical Limits**: May change based on performance requirements
- **Creator Feedback**: Will incorporate input from content creators
- **Platform Constraints**: May adapt for different target platforms

## Future Considerations

- **Style Presets**: Pre-defined style templates for common asset types
- **Procedural Stylization**: Automated style transfer for certain asset categories
- **Creator Tools**: In-editor previews of stylization effects
- **Style Validation**: Automated checks for style compliance
- **Regional Variations**: Support for different aesthetic themes in different spaces
