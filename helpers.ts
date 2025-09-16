import { exists } from "@std/fs/exists";
import { emptyDir } from "@std/fs/empty-dir";

export const permissionCheck = async () => {
  const read = await Deno.permissions.request({ name: "read" });
  const write = await Deno.permissions.request({ name: "write" });
  const run = await Deno.permissions.request({ name: "run" });
  return read.state === "granted" && run.state === "granted" &&
    write.state == "granted";
};

interface DenoInfo {
  version: number;
  denoVersion: string;
  denoDir: string;
  modulesCache: string;
  npmCache: string;
  typescriptCache: string;
  registryCache: string;
  originStorage: string;
  webCacheStorage: string;
}

interface CacheInfo {
  modulesCache: string;
  npmCache: string;
  typescriptCache: string;
  registryCache: string;
  webCacheStorage: string;
}

/**
 * Retrieves Deno cache directories
 */
async function getCacheDirectories(): Promise<CacheInfo> {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["info", "--json"],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();

  if (code !== 0) {
    const errorText = new TextDecoder().decode(stderr);
    throw new Error(`Deno info command failed: ${errorText}`);
  }

  const output = new TextDecoder().decode(stdout);
  const cacheInfo = JSON.parse(output) as DenoInfo;

  return {
    modulesCache: cacheInfo.modulesCache,
    npmCache: cacheInfo.npmCache,
    typescriptCache: cacheInfo.typescriptCache,
    registryCache: cacheInfo.registryCache,
    webCacheStorage: cacheInfo.webCacheStorage,
  };
}

/**
 * Safely clears the given directory
 */
async function safeClearDirectory(
  path: string,
  name: string,
): Promise<boolean> {
  try {
    const dirExists = await exists(path);
    if (!dirExists) {
      console.warn(`${name}: Directory not found (${path})`);
      return false;
    }

    try {
      const stat = await Deno.stat(path);
      if (!stat.isDirectory) {
        console.warn(`${name}: Not a directory (${path})`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.warn(`${name}: Access error - ${errorMessage}`);
      return false;
    }

    await emptyDir(path);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${name}: Could not clear - ${errorMessage}`);
    return false;
  }
}

/**
 * Main cache cleanup function
 */
export async function clearAllDenoCaches(): Promise<void> {
  console.log("Starting Deno cache cleanup...");

  try {
    const cacheInfo = await getCacheDirectories();

    if (Object.keys(cacheInfo).length === 0) {
      console.log("No cache directories found.");
      return;
    }

    for (const [key, path] of Object.entries(cacheInfo)) {
      const success = await safeClearDirectory(path, key);
      if (success) {
        console.log(`${key}: Cleared`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error during cache cleanup:", errorMessage);
  }
}
