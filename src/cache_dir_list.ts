export const cacheDirList = async (): Promise<Map<string, string>> => {
  try {
    const cmd = new Deno.Command(Deno.execPath(), {
      cwd: Deno.cwd(),
      args: ["info"],
      stdout: "piped",
      stderr: "piped",
    }).spawn();

    const { code, stdout, stderr } = await cmd.output();

    if (code === 0) {
      const denoInfoLines = new TextDecoder().decode(stdout);
      const cache_dirs = new Map<string, string>();
      for (let line of denoInfoLines.split("\n")) {
        // deno-lint-ignore no-control-regex
        const asciiRegex = new RegExp(
          // deno-lint-ignore no-control-regex
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/,
          "g",
        );
        line = line.replace(asciiRegex, "").trim();
        if (line !== "") {
          const dotIndex = line.indexOf(":");
          const key = line.substring(0, dotIndex).toLowerCase().trim().replace(
            /\s/gm,
            "_",
          );
          const val = line.substring(line.indexOf(":") + 1, line.length).trim();
          cache_dirs.set(key, val);
        }
      }

      return cache_dirs;
    } else {
      throw new TextDecoder().decode(stderr);
    }
  } catch (error) {
    console.error(new Error(error));
    return new Map<string, string>();
  }
};
