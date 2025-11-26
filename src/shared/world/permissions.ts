/**
 * Permission model for Believe world spaces.
 *
 * This module defines roles, capabilities, and permission logic for
 * controlling access to spaces. The implementation is pure and stateless,
 * with no dependencies on auth, user, or session modules.
 */

import { AccessMode, type Space } from "@/shared/world/space";

/**
 * User roles in the Believe system.
 */
export enum Role {
  /** Default role for learners */
  STUDENT = "STUDENT",
  /** Elevated role for educators */
  TEACHER = "TEACHER",
  /** Special role for safety and moderation */
  SAFETY_OFFICER = "SAFETY_OFFICER",
  /** Highest privilege level */
  ADMIN = "ADMIN",
}

/**
 * Specific capabilities that can be granted or checked.
 */
export enum Capability {
  /** Permission to enter a space */
  ENTER_SPACE = "ENTER_SPACE",
  /** Permission to modify space properties or contents */
  EDIT_SPACE = "EDIT_SPACE",
  /** Permission to control classroom sessions */
  MANAGE_SESSION = "MANAGE_SESSION",
  /** Permission to bypass normal access controls */
  OVERRIDE_ACCESS = "OVERRIDE_ACCESS",
  /** Permission to edit asset placements in spaces/regions */
  EDIT_PLACEMENTS = "EDIT_PLACEMENTS",
  /** Permission to approve and apply placement commits */
  MANAGE_COMMITS = "MANAGE_COMMITS",
  /** Permission to validate placements and commits */
  VALIDATE_PLACEMENTS = "VALIDATE_PLACEMENTS",
  /** Permission to manage collaborative editing sessions */
  MANAGE_COLLABORATION = "MANAGE_COLLABORATION",
  /** Permission to manage USD integration and layer composition */
  MANAGE_USD_INTEGRATION = "MANAGE_USD_INTEGRATION",
  /** Permission to manage PlanGraph and .plan files */
  MANAGE_PLAN_GRAPH = "MANAGE_PLAN_GRAPH",
}

/**
 * Context for permission checks.
 * Contains the user's role and optionally the space being accessed.
 */
export interface PermissionContext {
  /** The user's role */
  readonly role: Role;
  /** The space being accessed (optional for non-spatial checks) */
  readonly space?: Space;
}

/**
 * Check if a user can enter a space based on their role and the space's access mode.
 *
 * Rules:
 * - ADMIN and SAFETY_OFFICER: always allowed
 * - TEACHER: always allowed
 * - STUDENT: allowed only for OPEN or TEACHER_CONTROLLED spaces
 *
 * @param ctx - Permission context containing role and space
 * @returns true if the user can enter the space, false otherwise
 */
export function canEnterSpace(ctx: PermissionContext): boolean {
  if (!ctx.space) {
    // No space specified, cannot determine access
    return false;
  }

  const { role, space } = ctx;

  // ADMIN and SAFETY_OFFICER have full access
  if (role === Role.ADMIN || role === Role.SAFETY_OFFICER) {
    return true;
  }

  // TEACHER can access all spaces except ADMIN_ONLY
  if (role === Role.TEACHER) {
    return space.accessMode !== AccessMode.ADMIN_ONLY;
  }

  // STUDENT access is restricted based on accessMode
  if (role === Role.STUDENT) {
    return (
      space.accessMode === AccessMode.OPEN ||
      space.accessMode === AccessMode.TEACHER_CONTROLLED
    );
  }

  // Default deny for unknown roles
  return false;
}
