# Pxl - Self-Hosted Email Tracking Pixel

Lightweight, self-hosted email open tracker. Create pixels, embed them in emails, get notified when they're opened.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Bun | Fast, native SQLite driver, built-in test runner |
| Framework | Hono | Minimal, fast, works great on Bun, built-in JSX for server-rendered views |
| ORM | Drizzle | Type-safe, lightweight, works with `bun:sqlite` driver |
| Database | SQLite | Zero config, single file, plenty for this volume |
| Frontend | Hono JSX + HTMX + Tailwind (CDN) | No build step, server-rendered, dynamic where it matters |
| Notifications | Custom provider pattern with `fetch()` | Telegram, ntfy, Discord, Slack, generic webhook -- all just HTTP POSTs, no library needed |

## Architecture

Single Docker container, two HTTP servers on separate ports:

| Server | Default Port | Exposure |
|---|---|---|
| Management UI | `3000` | Tailscale only |
| Pixel Server | `3001` | Public via reverse proxy |

Both are independent Hono apps. A single `entrypoint.ts` calls `Bun.serve()` twice.

The pixel server has exactly one route. No auth, no static assets, no middleware beyond what's needed to extract headers.

## Data Model

Four tables.

### `providers`

```
id            TEXT PRIMARY KEY (nanoid)
name          TEXT NOT NULL              -- "My Telegram", "Work Discord"
type          TEXT NOT NULL              -- "telegram" | "ntfy" | "discord" | "slack" | "webhook"
config        TEXT NOT NULL              -- JSON, schema depends on type
enabled       INTEGER DEFAULT 1
created_at    INTEGER NOT NULL           -- unix ms
updated_at    INTEGER NOT NULL           -- unix ms
```

**Config schemas by type:**

- `telegram`: `{ "bot_token": "...", "chat_id": "..." }`
- `ntfy`: `{ "url": "https://ntfy.sh/your-topic" }` or self-hosted URL
- `discord`: `{ "webhook_url": "..." }`
- `slack`: `{ "webhook_url": "..." }`
- `webhook`: `{ "url": "...", "method": "POST", "headers": {} }`

### `pixels`

```
id                   TEXT PRIMARY KEY (nanoid)
tracking_id          TEXT UNIQUE NOT NULL     -- uuid4, used in URL path
name                 TEXT NOT NULL            -- "Follow-up to $person"
provider_id          TEXT REFERENCES providers(id) ON DELETE SET NULL
recipient_hint       TEXT                     -- optional, just for your reference
notes                TEXT
notify_on_every_open INTEGER DEFAULT 0        -- 0 = first open only
created_at           INTEGER NOT NULL         -- unix ms
```

### `opens`

```
id              TEXT PRIMARY KEY (nanoid)
pixel_id        TEXT NOT NULL REFERENCES pixels(id) ON DELETE CASCADE
timestamp       INTEGER NOT NULL             -- unix ms
ip              TEXT
user_agent      TEXT
ua_browser      TEXT                         -- parsed
ua_os           TEXT                         -- parsed
ua_device       TEXT                         -- parsed (desktop/mobile/tablet/bot)
referer         TEXT
accept_language TEXT
raw_headers     TEXT                         -- full request headers as JSON
raw_url         TEXT                         -- full request URL as received
raw_method      TEXT                         -- HTTP method
```

Parsed fields (`ua_browser`, `ua_os`, `ua_device`) are best-effort convenience columns. The raw data (`user_agent`, `raw_headers`, `raw_url`, `raw_method`) is the source of truth and is always stored regardless of whether parsing succeeds.

### `unmatched_requests`

Captures every hit to the pixel server that doesn't resolve to a known pixel. No notifications, just logging.

```
id              TEXT PRIMARY KEY (nanoid)
timestamp       INTEGER NOT NULL             -- unix ms
requested_path  TEXT NOT NULL                -- the full path that was requested
ip              TEXT
user_agent      TEXT
referer         TEXT
raw_headers     TEXT                         -- full request headers as JSON
```

Useful for spotting scanners, misconfigured pixels, or someone probing the endpoint.

### Indexes

- `pixels.tracking_id` (unique) -- hot path lookup on every pixel request
- `opens.pixel_id` -- listing opens per pixel
- `opens.timestamp` -- sorting
- `unmatched_requests.timestamp` -- browsing/cleanup

## Project Structure

```
pxl/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── drizzle/                    # Generated migrations
├── src/
│   ├── entrypoint.ts           # Two Bun.serve() calls
│   ├── config.ts               # Env-based config
│   ├── db/
│   │   ├── client.ts           # Drizzle + bun:sqlite setup
│   │   └── schema.ts           # Drizzle table definitions
│   │
│   ├── management/             # Port 3000
│   │   ├── app.ts              # Hono app
│   │   ├── routes/
│   │   │   ├── dashboard.ts
│   │   │   ├── pixels.ts
│   │   │   ├── providers.ts
│   │   │   ├── opens.ts
│   │   │   └── unmatched.ts
│   │   └── views/              # Hono JSX components
│   │       ├── layout.tsx      # Base HTML shell (Tailwind CDN, HTMX)
│   │       ├── dashboard.tsx
│   │       ├── pixels/
│   │       │   ├── list.tsx
│   │       │   ├── create.tsx
│   │       │   └── detail.tsx
│   │       ├── providers/
│   │       │   ├── list.tsx
│   │       │   └── form.tsx
│   │       ├── opens/
│   │       │   └── detail.tsx
│   │       └── unmatched/
│   │           ├── list.tsx
│   │           └── detail.tsx
│   │
│   ├── tracker/                # Port 3001
│   │   └── app.ts              # Hono app, pixel route + catch-all for unmatched
│   │
│   └── services/
│       ├── notify.ts           # Provider dispatch (fetch-based)
│       └── ua.ts               # UA string parsing
│
└── data/                       # Volume mount
    └── pxl.db
```

## Pixel Server

### `GET /px/:trackingId.png`

Single route. Entire public-facing surface.

The tracker app also registers a catch-all route for any other path. These are logged to `unmatched_requests` and return a 404. This captures scanners, bots, or misconfigured URLs hitting the public port.

1. Capture the full raw request immediately: URL, method, all headers.
2. Look up `trackingId` in `pixels` table. Cache recently seen IDs in a `Map` with TTL (simple `setTimeout` expiry, no library).
3. **Always** return the 1x1 transparent PNG regardless of match. Don't leak pixel existence.
4. Fire-and-forget (don't `await`):
   - **If pixel exists:**
     - Parse headers (IP from `X-Forwarded-For` > `X-Real-IP` > connection IP, UA, referer, accept-language)
     - Attempt to parse UA string into browser/os/device (best-effort, store nulls on failure)
     - Insert into `opens` with all raw + parsed fields
     - Check if notification should fire (provider set + enabled + first open or `notify_on_every_open`)
     - Send notification
   - **If pixel does not exist:**
     - Insert into `unmatched_requests` with raw headers, path, IP, UA
     - No notification

**Response headers:**

```
Content-Type: image/png
Cache-Control: no-store, no-cache, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0
```

**The pixel** is a hardcoded `Uint8Array` constant. 68 bytes, transparent 1x1 PNG. No file read.

## Notification Providers

No library. Each provider type is a function that takes structured data and calls `fetch()`.

```typescript
interface NotifyPayload {
  pixelName: string
  recipientHint: string | null
  ip: string
  browser: string
  os: string
  totalOpens: number
  timestamp: string
}

type ProviderSender = (config: Record<string, any>, payload: NotifyPayload) => Promise<void>
```

Each type gets its own sender. Telegram = POST to `https://api.telegram.org/bot{token}/sendMessage`. ntfy = POST to the topic URL. Discord/Slack = POST JSON to webhook.

Adding a new provider type = one function + a config schema. No abstraction layer, just a `switch` on the type string.

## Management UI

### Dashboard (`GET /`)

- Summary stats: total pixels, total opens today, total opens all time, unmatched requests today
- Last 20 opens as a table: timestamp, pixel name, IP, browser/OS
- Quick-create pixel form (name + provider dropdown)

### Pixels (`GET /pixels`)

Table with columns: Name (clickable), Recipient, Opens (count), First Open, Last Open, Created, Actions (copy URL, delete).

### Pixel Detail (`GET /pixels/:id`)

Top section:
- Pixel info: name, tracking URL with copy button, `<img>` tag snippet ready for pasting, linked provider, creation date

Opens table for this pixel:

| # | Timestamp | IP | Browser | OS | Device |
|---|---|---|---|---|---|

Clicking a row goes to open detail.

### Open Detail (`GET /opens/:id`)

Full dump of everything collected:

- **Connection**: IP, referer
- **Client**: Browser, OS, device type, raw User-Agent string
- **Headers**: Collapsible raw headers JSON dump
- **Context**: Pixel name, timestamp, open sequence number

### Providers (`GET /providers`)

Table: Name, Type, Enabled (toggle), Actions (edit, test, delete).

Create/edit form:
- Name (text)
- Type (dropdown)
- Config fields (dynamic based on type, HTMX-swapped on type change)
- Enabled (checkbox)
- "Send Test" button with inline success/failure feedback

### Unmatched Requests (`GET /unmatched`)

Table of requests that hit the pixel server but didn't match any known tracking ID. Sortable by timestamp.

| Timestamp | Requested Path | IP | User-Agent |
|---|---|---|---|

Clicking a row shows a detail view with full raw headers. A "Clear All" or "Clear older than 30 days" button for housekeeping.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PXL_DATA_DIR` | `./data` | SQLite DB location |
| `PXL_MGMT_PORT` | `3000` | Management UI port |
| `PXL_TRACKER_PORT` | `3001` | Pixel server port |
| `PXL_BASE_URL` | (required) | Public URL for pixel links, e.g. `https://px.yourdomain.com` |

## Docker

### `Dockerfile`

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY . .
EXPOSE 3000 3001
CMD ["bun", "run", "src/entrypoint.ts"]
```

### `docker-compose.yml`

```yaml
services:
  pxl:
    build: .
    container_name: pxl
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"   # Management -- Tailscale / localhost only
      - "3001:3001"              # Pixel server -- reverse proxy this
    volumes:
      - ./data:/app/data
    environment:
      - PXL_BASE_URL=https://px.yourdomain.com
```

## Dependencies

```json
{
  "dependencies": {
    "hono": "^4",
    "drizzle-orm": "^0.39",
    "nanoid": "^5",
    "ua-parser-js": "^2"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30",
    "@types/bun": "latest"
  }
}
```

4 runtime dependencies. Bun provides SQLite, fetch, and the HTTP server natively.

