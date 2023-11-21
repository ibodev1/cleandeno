import { clearCaches } from "./mod.ts";
import { permissionCheck } from "./src/permission.ts";

const permissions = await permissionCheck();

if (import.meta.main && permissions) {
  await clearCaches();
}
