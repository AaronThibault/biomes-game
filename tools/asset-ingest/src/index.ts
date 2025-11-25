/**
 * Asset Ingest CLI
 *
 * Minimal command-line tool for ingesting assets into the Believe pipeline.
 * Currently a stub that creates and logs a BelieveAsset without actual processing.
 */

import { ingestAsset } from "../../../src/shared/assets/ingest";
import { AssetSourceType } from "../../../src/shared/assets/types";

/**
 * Main entry point for the asset ingest CLI.
 */
async function main() {
  // Parse command-line arguments
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: asset-ingest <asset-path>");
    console.log("");
    console.log("Example:");
    console.log("  asset-ingest ./models/building.fbx");
    console.log("");
    console.log("This is a stub implementation that creates a BelieveAsset");
    console.log("metadata object without performing actual file processing.");
    process.exit(1);
  }

  const assetPath = args[0];

  console.log(`Asset Ingest CLI - Believe Pipeline`);
  console.log(`===================================`);
  console.log("");
  console.log(`Ingest request received for: ${assetPath}`);
  console.log("");

  try {
    // Call the stub ingest function
    // In production, this would detect the source type from the file extension
    // For now, we default to DCC_TOOL
    const result = await ingestAsset({
      sourceType: AssetSourceType.DCC_TOOL,
      sourcePath: assetPath,
      tags: ["cli-import"],
    });

    console.log("Stub BelieveAsset created:");
    console.log("-------------------------");
    console.log(JSON.stringify(result.asset, null, 2));
    console.log("");
    console.log("Note: This is a stub implementation.");
    console.log("No actual file processing has occurred.");
    console.log("");
    console.log("Future implementation will:");
    console.log("  1. Validate and read the source file");
    console.log("  2. Extract metadata (dimensions, format, etc.)");
    console.log("  3. Queue normalization job");
    console.log("  4. Queue stylization job");
    console.log("  5. Generate LODs and collision meshes");
    console.log("  6. Publish to asset storage");
  } catch (error) {
    console.error("Error during asset ingestion:");
    console.error(error);
    process.exit(1);
  }
}

// Run the CLI
main().catch((error) => {
  console.error("Unhandled error:");
  console.error(error);
  process.exit(1);
});
