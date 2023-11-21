import { emptyDir } from "std/fs/empty_dir.ts";
import { cacheDirList } from "./src/cache_dir_list.ts";
import { isReadableDir } from "./src/dir.ts";

export const clearCaches = async () => {
  try {
    const cacheDirs = await cacheDirList();
    if (cacheDirs.size > 0) {
      for (const [key, dir] of cacheDirs.entries()) {
        const readableDir = await isReadableDir(dir);

        if (!readableDir) {
          console.info("This folder directory is not readable! Dir : ", dir);
          continue;
        }

        if (key.endsWith("cache") && readableDir) {
          await emptyDir(dir);
          console.log(
            `>> The inside of the folder is clear!\n> Key : ${key}\n> Dir : ${dir}`,
          );
        }
      }
    }
  } catch (error) {
    console.error(new Error(error));
  }
};
