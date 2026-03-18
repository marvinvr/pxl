# pxl

Self-hosted email open tracking. Create pixels, embed them in emails, get notified when they're opened.

Single Docker container, two HTTP servers:

| Server | Default Port | Purpose |
|---|---|---|
| Management UI | 4000 | Create/manage pixels and providers |
| Pixel Server | 4001 | Serves tracking pixels (public) |

## Quick Start

```bash
cp .env.example .env
# edit .env — set PXL_BASE_URL to your public pixel server URL
docker compose up -d
```

Management UI at `http://localhost:4000`.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PXL_DATA_DIR` | `./data` | SQLite database location |
| `PXL_MGMT_PORT` | `3000` | Management UI port |
| `PXL_TRACKER_PORT` | `3001` | Pixel server port |
| `PXL_BASE_URL` | **required** | Public URL for pixel links |

## Notification Providers

Telegram, ntfy, Discord, Slack, and generic webhook. All just `fetch()` calls — no libraries.

## Stack

Bun, Hono, Drizzle ORM, SQLite, HTMX, Tailwind CSS (CDN).
