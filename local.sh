#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${BLUE}🔍 $1${NC}"; }
warn() { echo -e "${YELLOW}⏳ $1${NC}"; }

# ── Ensure .env exists ────────────────────────────────────────────────────────
if [ ! -f "$ROOT/.env" ]; then
  echo "📝 Creating .env from .env.example..."
  cp "$ROOT/.env.example" "$ROOT/.env"
  # Replace placeholder secrets with random dev secrets
  if command -v openssl &>/dev/null; then
    ACCESS_SECRET=$(openssl rand -hex 32)
    REFRESH_SECRET=$(openssl rand -hex 32)
    sed -i '' "s/change-me-access-secret-key-vttm/$ACCESS_SECRET/" "$ROOT/.env" 2>/dev/null \
      || sed -i "s/change-me-access-secret-key-vttm/$ACCESS_SECRET/" "$ROOT/.env"
    sed -i '' "s/change-me-refresh-secret-key-vttm/$REFRESH_SECRET/" "$ROOT/.env" 2>/dev/null \
      || sed -i "s/change-me-refresh-secret-key-vttm/$REFRESH_SECRET/" "$ROOT/.env"
  fi
  log ".env created with random JWT secrets"
fi

# Copy .env to apps/api for NestJS ConfigModule
cp "$ROOT/.env" "$ROOT/apps/api/.env"

# ── Ensure OrbStack / Docker is running ──────────────────────────────────────
if ! docker info &>/dev/null; then
  echo "🚀 Starting OrbStack..."
  open -a OrbStack 2>/dev/null || open -a Docker 2>/dev/null || true
  warn "Waiting for Docker daemon..."
  until docker info &>/dev/null; do sleep 2; done
  log "Docker ready"
fi

# ── Infra: only start containers that aren't already running ─────────────────
RUNNING=$(docker compose -f "$ROOT/docker-compose.infra.yml" ps --services --filter status=running 2>/dev/null || true)

start_if_not_running() {
  local svc=$1
  if echo "$RUNNING" | grep -q "^$svc$"; then
    echo "  ✅ $svc already running"
  else
    echo "  🐳 Starting $svc..."
    docker compose -f "$ROOT/docker-compose.infra.yml" up -d "$svc"
  fi
}

info "Checking infrastructure services..."
start_if_not_running postgres
start_if_not_running redis
start_if_not_running minio

warn "Waiting for Postgres to be ready..."
until docker compose -f "$ROOT/docker-compose.infra.yml" exec -T postgres pg_isready -U vttm 2>/dev/null; do
  sleep 2
done
log "Postgres ready"

# ── Install dependencies if needed ───────────────────────────────────────────
if [ ! -d "$ROOT/node_modules" ]; then
  info "Installing dependencies..."
  cd "$ROOT" && yarn install
  log "Dependencies installed"
fi

# ── Build shared package ─────────────────────────────────────────────────────
info "Building @vttm/shared..."
cd "$ROOT/packages/shared" && yarn build
log "Shared package built"

# ── Run migrations ───────────────────────────────────────────────────────────
info "Running database migrations..."
cd "$ROOT/apps/api" && npx ts-node -r tsconfig-paths/register src/database/run-migrations.ts 2>&1 | grep -E "(completed|already)" || true
log "Migrations up to date"

# ── Seed data (idempotent) ───────────────────────────────────────────────────
SEED_COUNT=$(docker compose -f "$ROOT/docker-compose.infra.yml" exec -T postgres psql -U vttm -d vttm -t -c "SELECT count(*) FROM provinces" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$SEED_COUNT" -lt "10" ] 2>/dev/null; then
  info "Seeding database..."
  cd "$ROOT/apps/api" && npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts 2>&1 | grep -v "^\[" | head -10
  log "Database seeded"
else
  log "Database already seeded ($SEED_COUNT provinces)"
fi

# ── Kill any stale app processes on dev ports ─────────────────────────────────
for PORT in 3000 3001 3002; do
  PIDS=$(lsof -ti tcp:$PORT 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "  🔪 Killing stale process(es) on :$PORT..."
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
  fi
done
sleep 1

# ── Start apps ────────────────────────────────────────────────────────────────
run_app() {
  local name=$1
  local dir=$2
  local cmd=$3
  (cd "$dir" && $cmd 2>&1 | sed "s/^/[$name] /") &
}

echo ""
echo "🚀 Starting all apps..."
echo ""

run_app "api         " "$ROOT/apps/api"          "npx nest start --watch"
run_app "admin       " "$ROOT/apps/admin"        "npx next dev -p 3001"
run_app "user-portal " "$ROOT/apps/user-portal"  "npx vite --port 3002"

echo ""
echo -e "  ${BLUE}API${NC}          → http://localhost:3000/api/v1"
echo -e "  ${BLUE}API Docs${NC}     → http://localhost:3000/api/docs"
echo -e "  ${BLUE}Admin${NC}        → http://localhost:3001"
echo -e "  ${BLUE}User Portal${NC}  → http://localhost:3002"
echo -e "  ${BLUE}MinIO Console${NC} → http://localhost:9001"
echo ""
echo -e "  ${GREEN}Login${NC}: admin@vttm.local / Admin@123"
echo ""
echo "Press Ctrl+C to stop apps (infra keeps running)."
echo "To stop infra:  docker compose -f docker-compose.infra.yml down"
echo "To run tests:   yarn test"
echo ""

# ── Wait for all background processes ─────────────────────────────────────────
cleanup() {
  echo ""
  echo "🛑 Stopping apps..."
  kill $(jobs -p) 2>/dev/null || true
  wait 2>/dev/null || true
  echo "✅ Apps stopped. Infrastructure still running."
}

trap cleanup SIGINT SIGTERM
wait
