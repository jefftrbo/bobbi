# API Documentation - Version 3.1

**Release Date:** June 18, 2026  
**Base URL:** `http://localhost:8080/api`

---

## Overview

Version 3.1 introduces powerful new features for the CRUD Contact Manager:

- **Full-Text Search** - Search contacts by name or address
- **Contact Groups** - Organize contacts into categories
- **Audit Trail** - Track all changes to contacts
- **Advanced Filtering** - Filter by group, date range, and sort options
- **Backup/Restore** - Export and import contacts as JSON

---

## Table of Contents

1. [Contacts Endpoints](#contacts-endpoints)
2. [Groups Endpoints](#groups-endpoints)
3. [Audit Log Endpoints](#audit-log-endpoints)
4. [Backup/Restore Endpoints](#backuprestore-endpoints)
5. [Statistics Endpoint](#statistics-endpoint)
6. [Response Formats](#response-formats)
7. [Error Handling](#error-handling)
8. [Examples](#examples)

---

## Contacts Endpoints

### GET /api/contacts

Get all contacts with optional filtering and search.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Full-text search query | `?search=Smith` |
| `group_id` | integer | Filter by group ID | `?group_id=1` |
| `from_date` | string | Filter by creation date (ISO 8601) | `?from_date=2026-01-01` |
| `to_date` | string | Filter by creation date (ISO 8601) | `?to_date=2026-12-31` |
| `sort` | string | Sort field: `id`, `name`, `created_at`, `updated_at` | `?sort=name` |
| `order` | string | Sort order: `ASC` or `DESC` | `?order=DESC` |

**Response:**

```json
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "address": "123 Maple Street, Springfield, IL 62701",
    "created_at": "2026-06-18T20:33:42.781Z",
    "updated_at": "2026-06-18T22:51:12.053Z",
    "groups": [
      {
        "id": 1,
        "name": "Family"
      }
    ]
  }
]
```

**Examples:**

```bash
# Get all contacts
curl http://localhost:8080/api/contacts

# Search for "Smith"
curl "http://localhost:8080/api/contacts?search=Smith"

# Get contacts in "Family" group
curl "http://localhost:8080/api/contacts?group_id=1"

# Sort by name descending
curl "http://localhost:8080/api/contacts?sort=name&order=DESC"

# Combine filters
curl "http://localhost:8080/api/contacts?search=John&group_id=1&sort=name"
```

---

### GET /api/contacts/:id

Get a single contact by ID with associated groups.

**Parameters:**

- `id` (path parameter) - Contact ID

**Response:**

```json
{
  "id": 1,
  "name": "Alice Johnson",
  "address": "123 Maple Street, Springfield, IL 62701",
  "created_at": "2026-06-18T20:33:42.781Z",
  "updated_at": "2026-06-18T22:51:12.053Z",
  "groups": [
    {
      "id": 1,
      "name": "Family"
    }
  ]
}
```

**Example:**

```bash
curl http://localhost:8080/api/contacts/1
```

---

### POST /api/contacts

Create a new contact with optional group assignments.

**Request Body:**

```json
{
  "name": "John Doe",
  "address": "456 Oak Street, Portland, OR 97201",
  "group_ids": [1, 2]  // Optional: array of group IDs
}
```

**Response:** (201 Created)

```json
{
  "id": 27,
  "name": "John Doe",
  "address": "456 Oak Street, Portland, OR 97201",
  "created_at": "2026-06-18T22:57:27.034Z",
  "updated_at": "2026-06-18T22:57:27.034Z",
  "groups": [
    {
      "id": 1,
      "name": "Family"
    },
    {
      "id": 2,
      "name": "Friends"
    }
  ]
}
```

**Example:**

```bash
curl -X POST http://localhost:8080/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "address": "456 Oak Street",
    "group_ids": [1, 2]
  }'
```

---

### PUT /api/contacts/:id

Update an existing contact and optionally update group assignments.

**Parameters:**

- `id` (path parameter) - Contact ID

**Request Body:**

```json
{
  "name": "John Doe Updated",
  "address": "789 New Street, Seattle, WA 98101",
  "group_ids": [1, 3]  // Optional: replaces all groups
}
```

**Response:**

```json
{
  "id": 27,
  "name": "John Doe Updated",
  "address": "789 New Street, Seattle, WA 98101",
  "created_at": "2026-06-18T22:57:27.034Z",
  "updated_at": "2026-06-18T23:00:00.000Z",
  "groups": [
    {
      "id": 1,
      "name": "Family"
    },
    {
      "id": 3,
      "name": "Work"
    }
  ]
}
```

**Example:**

```bash
curl -X PUT http://localhost:8080/api/contacts/27 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "address": "789 New Street",
    "group_ids": [1, 3]
  }'
```

---

### DELETE /api/contacts/:id

Delete a contact. This also removes all group associations.

**Parameters:**

- `id` (path parameter) - Contact ID

**Response:**

```json
{
  "message": "Contact deleted successfully"
}
```

**Example:**

```bash
curl -X DELETE http://localhost:8080/api/contacts/27
```

---

### GET /api/contacts/:id/history

Get the audit history for a specific contact.

**Parameters:**

- `id` (path parameter) - Contact ID

**Response:**

```json
[
  {
    "id": 1,
    "table_name": "contacts",
    "record_id": 27,
    "action": "INSERT",
    "old_data": null,
    "new_data": {
      "id": 27,
      "name": "Test Contact",
      "address": "123 Test St"
    },
    "changed_by": "system",
    "changed_at": "2026-06-18T22:57:27.034Z"
  },
  {
    "id": 2,
    "table_name": "contacts",
    "record_id": 27,
    "action": "UPDATE",
    "old_data": {
      "id": 27,
      "name": "Test Contact",
      "address": "123 Test St"
    },
    "new_data": {
      "id": 27,
      "name": "Updated Contact",
      "address": "456 New St"
    },
    "changed_by": "system",
    "changed_at": "2026-06-18T23:00:00.000Z"
  }
]
```

**Example:**

```bash
curl http://localhost:8080/api/contacts/27/history
```

---

## Groups Endpoints

### GET /api/groups

Get all groups with contact counts.

**Response:**

```json
[
  {
    "id": 1,
    "name": "Family",
    "description": "Family members and relatives",
    "created_at": "2026-06-18T22:51:12.084Z",
    "updated_at": "2026-06-18T22:51:12.084Z",
    "contact_count": "5"
  }
]
```

**Example:**

```bash
curl http://localhost:8080/api/groups
```

---

### GET /api/groups/:id

Get a single group by ID with contact count.

**Parameters:**

- `id` (path parameter) - Group ID

**Response:**

```json
{
  "id": 1,
  "name": "Family",
  "description": "Family members and relatives",
  "created_at": "2026-06-18T22:51:12.084Z",
  "updated_at": "2026-06-18T22:51:12.084Z",
  "contact_count": "5"
}
```

**Example:**

```bash
curl http://localhost:8080/api/groups/1
```

---

### POST /api/groups

Create a new group.

**Request Body:**

```json
{
  "name": "Colleagues",
  "description": "Work colleagues"  // Optional
}
```

**Response:** (201 Created)

```json
{
  "id": 5,
  "name": "Colleagues",
  "description": "Work colleagues",
  "created_at": "2026-06-18T23:00:00.000Z",
  "updated_at": "2026-06-18T23:00:00.000Z"
}
```

**Example:**

```bash
curl -X POST http://localhost:8080/api/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Colleagues",
    "description": "Work colleagues"
  }'
```

---

### PUT /api/groups/:id

Update an existing group.

**Parameters:**

- `id` (path parameter) - Group ID

**Request Body:**

```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:**

```json
{
  "id": 5,
  "name": "Updated Name",
  "description": "Updated description",
  "created_at": "2026-06-18T23:00:00.000Z",
  "updated_at": "2026-06-18T23:05:00.000Z"
}
```

**Example:**

```bash
curl -X PUT http://localhost:8080/api/groups/5 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description"
  }'
```

---

### DELETE /api/groups/:id

Delete a group. This removes all contact associations but does not delete contacts.

**Parameters:**

- `id` (path parameter) - Group ID

**Response:**

```json
{
  "message": "Group deleted successfully"
}
```

**Example:**

```bash
curl -X DELETE http://localhost:8080/api/groups/5
```

---

## Audit Log Endpoints

### GET /api/audit

Get audit log entries with optional filtering.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `table_name` | string | Filter by table name | `?table_name=contacts` |
| `record_id` | integer | Filter by record ID | `?record_id=27` |
| `action` | string | Filter by action: INSERT, UPDATE, DELETE | `?action=UPDATE` |
| `limit` | integer | Number of results (default: 100) | `?limit=50` |
| `offset` | integer | Pagination offset (default: 0) | `?offset=100` |

**Response:**

```json
[
  {
    "id": 1,
    "table_name": "contacts",
    "record_id": 27,
    "action": "INSERT",
    "old_data": null,
    "new_data": {
      "id": 27,
      "name": "Test Contact",
      "address": "123 Test St"
    },
    "changed_by": "system",
    "changed_at": "2026-06-18T22:57:27.034Z"
  }
]
```

**Examples:**

```bash
# Get last 10 audit entries
curl "http://localhost:8080/api/audit?limit=10"

# Get all updates to contacts
curl "http://localhost:8080/api/audit?table_name=contacts&action=UPDATE"

# Get audit log for specific contact
curl "http://localhost:8080/api/audit?table_name=contacts&record_id=27"
```

---

## Backup/Restore Endpoints

### GET /api/export/contacts

Export all contacts as JSON file.

**Response:**

```json
{
  "exported_at": "2026-06-18T22:57:53.953Z",
  "version": "3.1",
  "contact_count": 26,
  "contacts": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "address": "123 Maple Street",
      "created_at": "2026-06-18T20:33:42.781Z",
      "updated_at": "2026-06-18T22:51:12.053Z",
      "groups": ["Family", "Friends"]
    }
  ]
}
```

**Example:**

```bash
# Download export file
curl -O http://localhost:8080/api/export/contacts

# Save with custom name
curl http://localhost:8080/api/export/contacts > my-contacts-backup.json
```

---

### POST /api/import/contacts

Import contacts from JSON file.

**Request Body:**

```json
{
  "contacts": [
    {
      "name": "Imported Contact",
      "address": "123 Import St"
    }
  ],
  "merge": false  // Optional: if true, updates existing contacts by ID
}
```

**Response:**

```json
{
  "message": "Import completed",
  "imported": 10,
  "skipped": 2,
  "total": 12,
  "errors": [
    {
      "contact": {"name": "", "address": ""},
      "reason": "Missing name or address"
    }
  ]
}
```

**Example:**

```bash
curl -X POST http://localhost:8080/api/import/contacts \
  -H "Content-Type: application/json" \
  -d @contacts-backup.json
```

---

## Statistics Endpoint

### GET /api/stats

Get application statistics.

**Response:**

```json
{
  "total_contacts": "26",
  "total_groups": "5",
  "total_audit_entries": "15",
  "contacts_last_week": "3",
  "contacts_last_month": "26"
}
```

**Example:**

```bash
curl http://localhost:8080/api/stats
```

---

## Response Formats

### Success Response

All successful responses return appropriate HTTP status codes:

- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST

### Error Response

All errors return JSON with an error message:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**

- `400 Bad Request` - Invalid input data
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource (e.g., group name)
- `500 Internal Server Error` - Server error

---

## Error Handling

### Common Errors

**400 Bad Request:**

```json
{
  "error": "Name and address are required"
}
```

**404 Not Found:**

```json
{
  "error": "Contact not found"
}
```

**409 Conflict:**

```json
{
  "error": "Group name already exists"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Failed to fetch contacts"
}
```

---

## Examples

### Complete Workflow Example

```bash
# 1. Create a new group
GROUP_ID=$(curl -s -X POST http://localhost:8080/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"VIP Clients","description":"Important clients"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

# 2. Create a contact in that group
CONTACT_ID=$(curl -s -X POST http://localhost:8080/api/contacts \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Jane Doe\",\"address\":\"789 Main St\",\"group_ids\":[$GROUP_ID]}" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

# 3. Search for the contact
curl "http://localhost:8080/api/contacts?search=Jane"

# 4. Get contacts in the VIP group
curl "http://localhost:8080/api/contacts?group_id=$GROUP_ID"

# 5. Update the contact
curl -X PUT "http://localhost:8080/api/contacts/$CONTACT_ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe Updated","address":"999 New Address"}'

# 6. View contact history
curl "http://localhost:8080/api/contacts/$CONTACT_ID/history"

# 7. Export all contacts
curl http://localhost:8080/api/export/contacts > backup.json

# 8. Get statistics
curl http://localhost:8080/api/stats

# 9. Delete the contact
curl -X DELETE "http://localhost:8080/api/contacts/$CONTACT_ID"
```

### Full-Text Search Examples

```bash
# Search by name
curl "http://localhost:8080/api/contacts?search=Smith"

# Search by address
curl "http://localhost:8080/api/contacts?search=Portland"

# Search with multiple words
curl "http://localhost:8080/api/contacts?search=John+Portland"

# Combine search with group filter
curl "http://localhost:8080/api/contacts?search=Smith&group_id=1"
```

### Advanced Filtering Examples

```bash
# Get contacts created in the last week
curl "http://localhost:8080/api/contacts?from_date=2026-06-11"

# Get contacts in date range
curl "http://localhost:8080/api/contacts?from_date=2026-01-01&to_date=2026-06-30"

# Sort by name ascending
curl "http://localhost:8080/api/contacts?sort=name&order=ASC"

# Sort by creation date descending
curl "http://localhost:8080/api/contacts?sort=created_at&order=DESC"

# Combine all filters
curl "http://localhost:8080/api/contacts?search=John&group_id=1&from_date=2026-01-01&sort=name&order=ASC"
```

---

## Rate Limiting

Currently, there are no rate limits. For production use, consider implementing rate limiting.

---

## Authentication

Currently, the API does not require authentication. For production use, implement authentication (JWT, OAuth, etc.).

---

## Versioning

API Version: **3.1**

The version is included in export files and can be used for compatibility checking.

---

## Support

For issues or questions:
1. Check the logs: `podman logs crud-contact-manager`
2. Verify database connection: `podman exec postgres-db psql -U contacts_user -d contacts_db`
3. Review the POSTGRESQL-MIGRATION.md for troubleshooting

---

**Made with Bob - v3.1 API Documentation**