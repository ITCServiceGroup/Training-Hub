export const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  AOM: "aom",
  SUPERVISOR: "supervisor",
  LEAD_TECH: "lead_tech",
  TECHNICIAN: "technician",
});

export const PERMISSIONS = Object.freeze({
  ADMIN_PORTAL: "admin_portal.access",
  CONTENT_MANAGE: "content.manage",
  TRAINING_MANAGE: "training.manage",
  USERS_MANAGE: "users.manage",
  APPROVALS_MANAGE: "approvals.manage",
  SETTINGS_MANAGE: "settings.manage",
});

/** @type {Readonly<Record<string, readonly string[]>>} */
const PERMISSION_ROLES = Object.freeze({
  [PERMISSIONS.ADMIN_PORTAL]: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.AOM,
    ROLES.SUPERVISOR,
    ROLES.LEAD_TECH,
  ],
  [PERMISSIONS.CONTENT_MANAGE]: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.AOM,
    ROLES.SUPERVISOR,
    ROLES.LEAD_TECH,
  ],
  [PERMISSIONS.TRAINING_MANAGE]: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.AOM,
    ROLES.SUPERVISOR,
  ],
  [PERMISSIONS.USERS_MANAGE]: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.AOM,
    ROLES.SUPERVISOR,
  ],
  [PERMISSIONS.APPROVALS_MANAGE]: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  [PERMISSIONS.SETTINGS_MANAGE]: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
});

/** @param {string} permission */
export const rolesForPermission = (permission) =>
  PERMISSION_ROLES[permission] || [];

/** @param {string | undefined | null} role @param {string} permission */
export const roleHasPermission = (role, permission) =>
  Boolean(role && rolesForPermission(permission).includes(role));
