import { clearAllDenoCaches, permissionCheck } from "./helpers.ts";

const permissions = await permissionCheck();

if (import.meta.main && permissions) {
  await clearAllDenoCaches();
}
