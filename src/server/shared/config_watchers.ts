import { DEFAULT_CONFIG_LOOKUP_PATHS } from "@/server/shared/config";
import type { Watcher } from "@/server/shared/file_watcher";
import { makeFilesWatcher } from "@/server/shared/file_watcher";
import { log } from "@/shared/logging";
import * as yaml from "js-yaml";
import { isEmpty, isObject } from "lodash";

async function startGlobalConfigWatcher(): Promise<Watcher | undefined> {
  // Safely load config override from environment.
  let override: Record<string, any> = {};

  const rawOverride = process.env.BIOMES_CONFIG_OVERRIDE;
  if (rawOverride) {
    try {
      override = JSON.parse(rawOverride);
      if (!isEmpty(override)) {
        log.warn("Using config override from BIOMES_CONFIG_OVERRIDE", {
          override,
        });
      }
    } catch (err) {
      log.error("Invalid JSON in BIOMES_CONFIG_OVERRIDE. Ignoring override.", {
        error: (err as Error).message,
      });
    }
  }

  const watcher = makeFilesWatcher(
    DEFAULT_CONFIG_LOOKUP_PATHS,
    (content, path) => {
      const config = yaml.load(content, {
        onWarning: (warning: yaml.YAMLException) => {
          log.warn(`Warning parsing config: ${warning.toString()}`);
        },
      });
      if (!isObject(config)) {
        log.error(`Invalid biomes config: ${path}`);
        return false;
      }

      // Local dev guard: if CONFIG or CONFIG_EVENTS are not defined
      // (e.g., in shim or other limited server environments),
      // skip applying the config instead of crashing.
      if (
        typeof CONFIG === "undefined" ||
        typeof CONFIG_EVENTS === "undefined"
      ) {
        log.warn(
          "CONFIG or CONFIG_EVENTS not defined; skipping server-only config update",
          { path }
        );
        return true;
      }

      Object.assign(CONFIG, config);
      Object.assign(CONFIG, override);
      CONFIG_EVENTS.emit("changed");

      return true;
    }
  );

  if (!(await watcher.reload())) {
    await watcher.close();
    return;
  }

  return {
    ...watcher,
    close: async () => {
      await watcher.close();
      CONFIG_EVENTS.removeAllListeners();
    },
  };
}

function makeCloseAllConfigs(watchers: Watcher[]): {
  close: () => Promise<void>;
} {
  return {
    close: async () => {
      await Promise.all(watchers.map((w) => w.close()));
    },
  };
}

export async function startConfigWatchers(): Promise<
  { close: () => Promise<void> } | undefined
> {
  const maybeWatchers = await Promise.allSettled([startGlobalConfigWatcher()]);

  const watchers: Watcher[] = [];
  for (const maybeWatcher of maybeWatchers) {
    if (
      maybeWatcher.status === "fulfilled" &&
      maybeWatcher.value !== undefined
    ) {
      watchers.push(maybeWatcher.value);
    }
  }
  // We might do an initial load for some watchers, and that might fail. If so,
  // close all watchers that succeeded and return failure.
  if (watchers.length != maybeWatchers.length) {
    await Promise.all(watchers.map((w) => w.close()));
    return;
  }

  return makeCloseAllConfigs(watchers);
}
