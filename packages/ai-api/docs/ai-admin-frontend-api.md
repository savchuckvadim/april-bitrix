# AI Admin API Documentation (Frontend)

This document describes all backend endpoints and integration rules needed to build the frontend for domain-based AI prompt and RAG documents administration.

## 1) Base URL and routing

- Backend prefix from app: `/api/v1/helper`
- AI admin module prefix: `/ai-admin`
- Runtime AI endpoints prefix: `/ai`

Final base for admin endpoints:

- `{{API_BASE}}/api/v1/helper/ai-admin`

Examples in this doc use:

- `{{API_BASE}}` (for example `https://api.example.com`)
- `{{DOMAIN}}` (for example `gsr.bitrix24.ru`)

---

## 2) Authentication for AI admin endpoints

All `/ai-admin/**` endpoints require these headers:

- `X-Admin-Ts`: unix timestamp (seconds)
- `X-Admin-Token`: hex HMAC-SHA256 signature

### Signature algorithm

- Payload string: `"{domain}:{ts}"`
- Secret: backend env `AI_ADMIN_SIGNED_TOKEN_SECRET`
- Signature: `HMAC_SHA256(secret, payload)` in lowercase hex

### TTL

- Backend checks `abs(now - ts) <= AI_ADMIN_SIGNED_TOKEN_TTL_SECONDS`
- Default TTL is `900` seconds

### Domain allowlist

- If backend env `AI_ADMIN_DOMAIN_ALLOWLIST` is not empty, domain must exist in this list.
- If domain is not allowed -> `403 Domain is not allowed`

### JS example (browser or node)

```ts
async function buildAdminHeaders(domain: string, secretFromYourTrustedBackend: string) {
  const ts = Math.floor(Date.now() / 1000);
  const payload = `${domain}:${ts}`;

  // Use Web Crypto (browser)
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretFromYourTrustedBackend),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const token = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    "X-Admin-Ts": String(ts),
    "X-Admin-Token": token,
  };
}
```

Important: do not store signing secret in public frontend. Usually a trusted backend/BFF signs requests.

---

## 3) Domain storage model

Backend stores data per domain:

- `portal_data/{domain}/resume/prompt.txt`
- `portal_data/{domain}/resume/retrive/...`
- `portal_data/{domain}/recomendation/prompt.txt`
- `portal_data/{domain}/recomendation/retrive/...`

`kind` is one of:

- `resume`
- `recomendation`

---

## 4) Prompt reference syntax (for validation)

When editing prompt text, you can reference retrive folders/paths:

- `[[folder:objections]]`
- `[[path:objections/new_clients]]`

On `PUT prompt`, backend validates all references:

- referenced path must exist inside `retrive`
- no path traversal (`..`, absolute paths)
- `folder` tag must point to a directory

If validation fails, backend returns structured issues.

---

## 5) Admin API endpoints

## 5.1 Get domain tree

- Method: `GET`
- URL: `/api/v1/helper/ai-admin/{domain}/tree`
- Auth: required (`X-Admin-*`)

### Response 200

```json
{
  "domain": "gsr.bitrix24.ru",
  "root": {
    "name": "gsr.bitrix24.ru",
    "path": ".",
    "type": "dir",
    "children": [
      {
        "name": "resume",
        "path": "resume",
        "type": "dir",
        "children": [
          { "name": "prompt.txt", "path": "resume/prompt.txt", "type": "file", "size": 1234 },
          { "name": "retrive", "path": "resume/retrive", "type": "dir", "children": [] }
        ]
      },
      {
        "name": "recomendation",
        "path": "recomendation",
        "type": "dir",
        "children": []
      }
    ]
  }
}
```

Use this endpoint to build file tree UI.

---

## 5.2 Get prompt

- Method: `GET`
- URL: `/api/v1/helper/ai-admin/{domain}/prompt/{kind}`
- Auth: required
- `kind`: `resume | recomendation`

### Response 200

```json
{
  "domain": "gsr.bitrix24.ru",
  "kind": "resume",
  "source": "portal",
  "prompt": "Prompt text ...",
  "contentHash": "sha256...",
  "updatedAt": 1712670000.123
}
```

Notes:

- If domain prompt does not exist, backend returns default prompt with `source: "default"` and `updatedAt: null`.

---

## 5.3 Update prompt

- Method: `PUT`
- URL: `/api/v1/helper/ai-admin/{domain}/prompt/{kind}`
- Auth: required
- Body:

```json
{
  "prompt": "Your prompt text with optional refs like [[folder:objections]]"
}
```

### Success response 200

```json
{
  "status": "ok",
  "validationPassed": true,
  "issues": [],
  "contentHash": "sha256..."
}
```

### Validation error response 200

```json
{
  "status": "validation_error",
  "validationPassed": false,
  "issues": [
    {
      "tag": "folder",
      "path": "missing-folder",
      "reason": "Referenced path does not exist"
    }
  ],
  "contentHash": null
}
```

Frontend rule: treat `validationPassed=false` as save failure and show issues in UI.

---

## 5.4 Upload files to retrive

- Method: `POST`
- URL: `/api/v1/helper/ai-admin/{domain}/upload/{kind}`
- Auth: required
- Content-Type: `multipart/form-data`
- Query params:
  - `targetPath` (optional): subfolder inside `retrive`
  - `overwrite` (optional, default `false`)

Form field:

- `files`: multiple files

### Example

`POST /api/v1/helper/ai-admin/gsr.bitrix24.ru/upload/recomendation?targetPath=objections/new_clients&overwrite=false`

### Response 200

```json
{
  "status": "ok",
  "saved": ["script1.pdf", "faq.docx"],
  "targetPath": "objections/new_clients"
}
```

### Limits and constraints

- max files per request: `MAX_FILES_PER_REQUEST` (default `20`)
- max file size: `MAX_FILE_SIZE_MB` (default `25`)
- max domain storage: `MAX_DOMAIN_STORAGE_MB` (default `500`)
- allowed extensions: `.txt`, `.pdf`, `.docx`
- path traversal blocked

---

## 5.5 Download retrive data as zip

- Method: `GET`
- URL: `/api/v1/helper/ai-admin/{domain}/download/{kind}`
- Auth: required
- Query:
  - `path` (optional) subpath inside `retrive`

If `path` is omitted, backend zips entire `retrive`.

### Response 200

- `Content-Type: application/zip`
- `Content-Disposition: attachment; filename="...zip"`

---

## 5.6 Delete file or folder in retrive

- Method: `DELETE`
- URL: `/api/v1/helper/ai-admin/{domain}/path/{kind}`
- Auth: required
- Query:
  - `path` required, relative path inside `retrive`

### Response 200

```json
{
  "status": "ok"
}
```

---

## 6) Runtime AI endpoints (for testing/usage with portal settings)

These endpoints are used by your main product flow:

- `POST /api/v1/helper/ai/resume`
- `POST /api/v1/helper/ai/recomendation`

Request body:

```json
{
  "query": "transcribed call text",
  "model": "gigachat",
  "domain": "gsr.bitrix24.ru",
  "usePortalSettings": true
}
```

If `usePortalSettings=true` and domain config is valid, backend uses domain prompt+retrive.
If invalid/missing, backend falls back to defaults.

---

## 7) Error model (common)

FastAPI default error shape:

```json
{
  "detail": "Error message"
}
```

Typical statuses:

- `400` invalid domain/path or upload format
- `401` bad signature or expired timestamp
- `403` domain not in allowlist
- `404` file/path/prompt not found
- `413` size/limit exceeded
- `500` server misconfiguration (for example missing signing secret)

---

## 8) Suggested frontend screens and flow

## 8.1 Domain workspace screen

- Input/select domain
- Build auth headers
- Call `GET /tree`
- Render two roots: `resume`, `recomendation`

## 8.2 Prompt editor screen

- Tabs: `resume`, `recomendation`
- Load current prompt via `GET /prompt/{kind}`
- Edit + save via `PUT /prompt/{kind}`
- Show validation issues list if `validationPassed=false`

## 8.3 Materials manager screen

- Show folder tree from `/tree`
- Upload files to selected folder:
  - `overwrite=false` append mode
  - `overwrite=true` replace selected folder contents
- Download folder/all via `/download/{kind}?path=...`
- Delete selected node via `DELETE /path/{kind}?path=...`

## 8.4 Test run panel (optional)

- Textarea for sample transcript/query
- Choose model
- Toggle `usePortalSettings`
- Send to `/ai/resume` or `/ai/recomendation`

---

## 9) TypeScript interfaces (ready to copy)

```ts
export type PromptKind = "resume" | "recomendation";

export interface DomainTreeNode {
  name: string;
  path: string;
  type: "dir" | "file";
  size?: number | null;
  children?: DomainTreeNode[];
}

export interface DomainTreeResponse {
  domain: string;
  root: DomainTreeNode;
}

export interface PromptGetResponse {
  domain: string;
  kind: PromptKind;
  source: "portal" | "default";
  prompt: string;
  contentHash: string;
  updatedAt: number | null;
}

export interface PromptValidationIssue {
  tag: string;
  path: string;
  reason: string;
}

export interface PromptUpdateResponse {
  status: "ok" | "validation_error";
  validationPassed: boolean;
  issues: PromptValidationIssue[];
  contentHash?: string | null;
}
```

---

## 10) Frontend implementation notes

- Keep `domain` in route/state and include it in every admin endpoint URL.
- Always regenerate timestamp/signature per request (or short-lived batch).
- Use optimistic UI for upload/delete, then refresh with `GET /tree`.
- For prompt references, provide helper chips/snippets in editor:
  - `[[folder:...]]`
  - `[[path:...]]`
- Prefer server-side signing (BFF) if frontend is public.

---

## 11) Quick curl examples

```bash
# Example only: TOKEN must be valid HMAC(domain:ts)
curl -X GET "{{API_BASE}}/api/v1/helper/ai-admin/gsr.bitrix24.ru/tree" \
  -H "X-Admin-Ts: 1712670000" \
  -H "X-Admin-Token: {{TOKEN}}"
```

```bash
curl -X PUT "{{API_BASE}}/api/v1/helper/ai-admin/gsr.bitrix24.ru/prompt/resume" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Ts: 1712670000" \
  -H "X-Admin-Token: {{TOKEN}}" \
  -d "{\"prompt\":\"Use [[folder:objections]]\"}"
```

```bash
curl -X POST "{{API_BASE}}/api/v1/helper/ai-admin/gsr.bitrix24.ru/upload/recomendation?targetPath=objections&overwrite=false" \
  -H "X-Admin-Ts: 1712670000" \
  -H "X-Admin-Token: {{TOKEN}}" \
  -F "files=@./material.pdf" \
  -F "files=@./faq.docx"
```

