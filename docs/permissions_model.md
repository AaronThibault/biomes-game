# Permissions Model

## Overview

This document defines the permission model for Believe, which controls access to spaces and capabilities within the world.

This is **not** a UI specification—it defines the underlying authorization logic.

## Roles

The system recognizes four primary roles:

### STUDENT

- Default role for learners
- Limited permissions based on space access modes
- Cannot override teacher controls

### TEACHER

- Elevated permissions for educators
- Can control access to teacher-controlled spaces
- Can manage sessions and student activities

### SAFETY_OFFICER

- Special role for safety and moderation
- Full access to all spaces for monitoring
- Can override access controls when necessary

### ADMIN

- Highest privilege level
- Full access to all spaces and capabilities
- Can manage all aspects of the world

## Capabilities

Capabilities define specific actions that can be performed:

### ENTER_SPACE

- Permission to enter a space
- Governed by the space's `accessMode` and the user's role

### EDIT_SPACE

- Permission to modify space properties or contents
- Typically restricted to teachers and admins

### MANAGE_SESSION

- Permission to control classroom sessions
- Can lock/unlock spaces, teleport groups, etc.

### OVERRIDE_ACCESS

- Permission to bypass normal access controls
- Reserved for safety officers and admins

## Access Mode Interpretation

Spaces have an `accessMode` that determines entry permissions:

### OPEN

- **STUDENT**: ✅ Can enter
- **TEACHER**: ✅ Can enter
- **SAFETY_OFFICER**: ✅ Can enter
- **ADMIN**: ✅ Can enter

### TEACHER_CONTROLLED

- **STUDENT**: ✅ Can enter (teacher may lock at runtime)
- **TEACHER**: ✅ Can enter and control
- **SAFETY_OFFICER**: ✅ Can enter
- **ADMIN**: ✅ Can enter

### RESTRICTED

- **STUDENT**: ❌ Cannot enter
- **TEACHER**: ✅ Can enter
- **SAFETY_OFFICER**: ✅ Can enter
- **ADMIN**: ✅ Can enter

### ADMIN_ONLY

- **STUDENT**: ❌ Cannot enter
- **TEACHER**: ❌ Cannot enter
- **SAFETY_OFFICER**: ✅ Can enter
- **ADMIN**: ✅ Can enter

## Permission Context

Permission checks require a **PermissionContext** containing:

- **role** (Role): The user's role
- **space** (Space | null): The space being accessed (optional for non-spatial checks)

## Inheritance Rules

1. **ADMIN** and **SAFETY_OFFICER** have full access to all spaces
2. **TEACHER** can access all spaces except `ADMIN_ONLY`
3. **STUDENT** access is restricted based on `accessMode`
4. Capabilities are role-based and do not cascade

## Implementation Notes

- Permission logic is **pure and stateless**
- No dependencies on auth, user, or session modules
- Permission checks operate on role + space data only
- Future integration with auth systems will map users to roles
- Runtime session state (e.g., teacher locking a classroom) will be handled separately

## Future Considerations

- Group-based permissions (e.g., specific student groups)
- Time-based access controls (e.g., scheduled class periods)
- Dynamic permission delegation (e.g., student moderators)
- Audit logging for permission checks and overrides
