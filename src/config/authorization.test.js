import { describe, expect, it } from "vitest";
import {
  PERMISSIONS,
  ROLES,
  roleHasPermission,
  rolesForPermission,
} from "./authorization";

describe("authorization policy", () => {
  it("keeps technicians out of the management portal", () => {
    expect(roleHasPermission(ROLES.TECHNICIAN, PERMISSIONS.ADMIN_PORTAL)).toBe(
      false,
    );
    expect(roleHasPermission(ROLES.LEAD_TECH, PERMISSIONS.ADMIN_PORTAL)).toBe(
      true,
    );
  });

  it("restricts approvals and settings to administrators", () => {
    for (const permission of [
      PERMISSIONS.APPROVALS_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
    ]) {
      expect(rolesForPermission(permission)).toEqual([
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
      ]);
      expect(roleHasPermission(ROLES.AOM, permission)).toBe(false);
    }
  });

  it("allows only the approved management hierarchy to manage users", () => {
    expect(rolesForPermission(PERMISSIONS.USERS_MANAGE)).toEqual([
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.AOM,
      ROLES.SUPERVISOR,
    ]);
  });

  it("limits assignment and compliance operations to accountable managers", () => {
    expect(rolesForPermission(PERMISSIONS.TRAINING_MANAGE)).toEqual([
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.AOM,
      ROLES.SUPERVISOR,
    ]);
    expect(
      roleHasPermission(ROLES.LEAD_TECH, PERMISSIONS.TRAINING_MANAGE),
    ).toBe(false);
  });

  it("denies unknown roles and permissions by default", () => {
    expect(roleHasPermission("unknown", PERMISSIONS.ADMIN_PORTAL)).toBe(false);
    expect(roleHasPermission(ROLES.SUPER_ADMIN, "unknown.permission")).toBe(
      false,
    );
  });
});
