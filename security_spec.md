# Firebase Security Specification

## 1. Data Invariants
- `users/{userId}`: A user profile can only be read and written by the authenticated owner of the profile (`request.auth.uid == userId`).
- `classes/{classId}`: Class records can be read, created, updated, and deleted by authenticated users who own or manage the record. Public read is denied. Any anonymous / unauthenticated attempts are blocked.
- Path variables: `isValidId(userId)` and `isValidId(classId)` must be validated to prevent ID injection.
- String and payload constraints: All string lengths must be bounded to prevent Denial of Wallet resource attacks.

## 2. The "Dirty Dozen" Threat Payloads
1. **Unauthenticated Read on /users**: Reading `/users/user_123` with `request.auth == null` -> `PERMISSION_DENIED`.
2. **User Profile Hijacking**: User B updating `/users/user_A` with `request.auth.uid == 'user_B'` -> `PERMISSION_DENIED`.
3. **Ghost Field Injection**: Adding an unverified or unauthorized arbitrary admin field `isAdmin: true` -> `PERMISSION_DENIED`.
4. **Oversized String Bomb**: Writing a 2MB string into `schoolName` or `className` -> `PERMISSION_DENIED`.
5. **Path Traversal / Malicious ID**: Using document ID `../../system/hack` -> `PERMISSION_DENIED` (fails `isValidId`).
6. **Negative Student Count**: Writing `maleCount: -5` -> `PERMISSION_DENIED`.
7. **Invalid Semester Value**: Writing `semester: 'Triwulan'` -> `PERMISSION_DENIED`.
8. **Tampered Owner ID**: User B creating a class with `userId: 'user_A'` -> `PERMISSION_DENIED`.
9. **Blanket Query List by Unauthenticated Client**: Querying `/classes` without authentication -> `PERMISSION_DENIED`.
10. **Malicious Document Payload**: Inserting non-object array element in `students` or `generalDocuments` -> `PERMISSION_DENIED`.
11. **Deletion by Non-Owner**: User B deleting `/classes/class_A` owned by User A -> `PERMISSION_DENIED`.
12. **Tampered CreatedAt Timestamp**: Client injecting falsified historical timestamps without valid format -> `PERMISSION_DENIED`.
