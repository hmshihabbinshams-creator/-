# Security Specification - RS Khamar Admin Panel

## Data Invariants
1. **Ownership**: Every document must have an `ownerId` field that strictly matches the `request.auth.uid`.
2. **Entity Integrity**: Document IDs must be alphanumeric strings and match the `id` field within the document.
3. **Data Types**: All fields must conform to the types and constraints (maxLength, enums) defined in the blueprint.
4. **Timestamps**: `createdAt` and `updatedAt` (if used) must be server-side timestamps.
5. **Relational Safety**: A `FeedLog` or `HealthLog` must reference a valid `animalId` (enforced by application logic and basic rule checks).

## The "Dirty Dozen" Payloads

### 1. Identity Spoofing (Livestock)
Attempt to create a livestock item for another user.
```json
{
  "id": "malicious-1",
  "name": "Stolen Cow",
  "type": "গরু (Cattle)",
  "ownerId": "victim_uid_123"
}
```
**Expected**: PERMISSION_DENIED (ownerId mismatch)

### 2. Privilege Escalation (Profile)
Attempt to modify the `ownerId` of an existing institution profile.
```json
{
  "ownerId": "attacker_uid_456",
  "name": "Hacked Farm"
}
```
**Expected**: PERMISSION_DENIED (immutable ownerId)

### 3. Resource Poisoning (Long Strings)
Attempt to inject a 1MB string into the `name` field of a livestock item.
```json
{
  "id": "poison-1",
  "name": "A".repeat(1000000),
  "type": "গরু (Cattle)",
  "ownerId": "current_user_uid"
}
```
**Expected**: PERMISSION_DENIED (maxLength exceeded)

### 4. Malicious Document ID
Attempt to use a document ID containing path injection characters.
```json
// Path: livestock/../../other_collection/secret_doc
{
  "id": "../../secret",
  "name": "Injection",
  "ownerId": "current_user_uid"
}
```
**Expected**: PERMISSION_DENIED (isValidId regex check)

### 5. Schema Violation (Invalid Enum)
Attempt to set an invalid `healthCondition`.
```json
{
  "id": "invalid-enum-1",
  "name": "Sick Cow",
  "healthCondition": "Dead",
  "ownerId": "current_user_uid"
}
```
**Expected**: PERMISSION_DENIED (enum check)

### 6. Orphaned Feed Log
Attempt to create a feed log without a valid animalId reference (logical check).
```json
{
  "id": "orphan-1",
  "animalId": "",
  "ownerId": "current_user_uid"
}
```
**Expected**: PERMISSION_DENIED (required field or size check)

### 7. Unauthorized Read (PII)
Attempt to read another user's `institution_profile`.
**Expected**: PERMISSION_DENIED (resource.data.ownerId == request.auth.uid)

### 8. Shadow Field Injection
Attempt to add a `isAdmin` field to a profile.
```json
{
  "ownerId": "current_user_uid",
  "name": "My Farm",
  "isAdmin": true
}
```
**Expected**: PERMISSION_DENIED (hasOnly keys check)

### 9. Type Mismatch (Weight)
Attempt to set `currentWeight` as a string.
```json
{
  "id": "type-mismatch-1",
  "currentWeight": "too heavy",
  "ownerId": "current_user_uid"
}
```
**Expected**: PERMISSION_DENIED (type check)

### 10. Bulk Query Scrape
Attempt to list all livestock without an owner filter.
**Expected**: PERMISSION_DENIED (Query must include where('ownerId', '==', uid))

### 11. Historical Data Tampering
Attempt to update `purchasePrice` after creation.
```json
{
  "id": "C-101",
  "purchasePrice": 1,
  "ownerId": "current_user_uid"
}
```
**Expected**: PERMISSION_DENIED (immutability check for specific fields)

### 12. Cross-User Delete
Attempt to delete another user's livestock item.
**Expected**: PERMISSION_DENIED (resource.data.ownerId == request.auth.uid)
