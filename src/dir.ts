export const isReadableDir = async (dir: string): Promise<boolean> => {
  return await exists(dir);
};

export const exists = async (path: string): Promise<boolean> => {
  try {
    const stat = await Deno.stat(path);

    if (!stat.isDirectory) return false;

    // Ref : https://deno.land/std@0.207.0/fs/exists.ts?source#L62
    if (stat.mode === null) {
      return true; // Exclusive on Non-POSIX systems
    }

    if (Deno.uid() === stat.uid) {
      return (stat.mode & 0o400) === 0o400; // User is owner and can read?
    } else if (Deno.gid() === stat.gid) {
      return (stat.mode & 0o040) === 0o040; // User group is owner and can read?
    }
    return (stat.mode & 0o004) === 0o004; // Others can read?
  } catch (error) {
    console.error(new Error(error));
    return false;
  }
};
