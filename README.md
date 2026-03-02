# Project 300: Pulse — AI-Powered Fitness App

## Students
| Name | Student ID | Programme |
|---|---|---|
| Tadhg Dowdall | S00250843 | SG_KCMPU_H08_Y3 |
| Garry Ledwith | S00256356 | SG_KCMPU_H08_Y3 |
| Mikolaj Makoszewski | S00254903 | SG_KCMPU_H08_Y3 |
| Calvin Regan | S00250043 | SG_KCMPU_H08_Y3 |

---

## Overview
Pulse is a web-based fitness app that lets users build and track their workout routines their way. Users can manually create their own routines or have AI generate a personalised one based on their goals, weight, height, experience, available equipment, and lifestyle details. Pulse adapts routines over time, tracks progress, and keeps users motivated through gamification.

## Problem Statement
Current fitness apps provide generic, static workout routines that don't adapt to a user's progress or circumstances (injuries, schedule changes, etc.). Beginners feel overwhelmed, and experienced lifters lack ongoing personalisation.

## Core Features
- **AI Workout Planner**: Generates, adapts, and explains custom workout routines via OpenAI (GPT-4o-mini), orchestrated by a FastAPI service
- **Progress Tracking**: Monitors workout sessions and key metrics with visual charts
- **Calendar**: Select any date to view workouts and progress data
- **Gamification**: Streaks, badges, and milestones to keep users motivated
- **Achievements**: Badges awarded automatically based on workout consistency and milestones

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (React), Tailwind CSS, Recharts |
| **Backend API** | Express + TypeScript (Node.js) |
| **AI Orchestrator** | FastAPI (Python), OpenAI API |
| **Rate Limiting** | Redis Cloud (sliding-window per-user) |
| **Database & Auth** | Supabase (Postgres + RLS, Auth) |
| **Shared types** | TypeScript (`packages/types`) |
| **Monorepo** | pnpm workspaces |
| **Hosting** | Vercel (web), Railway (api + ai-orchestrator) |

---

## Monorepo Structure
```
apps/
  web/               # Next.js frontend (Vercel)

services/
  api/               # Express API — routines, badges, workouts (Railway)
  ai-orchestrator/   # FastAPI — AI routine generation/adaptation (Railway)

packages/
  types/             # Shared TypeScript types

scheduler/           # Background job skeleton (node-cron) — not yet deployed

docs/
  archeticture/      # Architecture diagrams (data-flow, system-architecture)
```

---

## Local Development

### Prerequisites
- Node.js 18+
- pnpm 9+
- Python 3.11+

### Setup
```bash
git clone <repo-url>
cd atu-project-300
cp .env.example .env   # fill in Supabase + OpenAI + Redis credentials
pnpm install
```

### Environment Variables (`.env`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
OPENAI_API_KEY=
REDIS_URL=
```

### Run Services

**AI Orchestrator** (start first):
```bash
cd services/ai-orchestrator
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

**API** (from repo root):
```bash
pnpm --filter api dev
```

**Web app** (from repo root):
```bash
pnpm --filter web dev
```

### Local Access
| Service | URL |
|---|---|
| Web | http://localhost:3000 |
| API | http://localhost:8000/health |
| AI Orchestrator | http://localhost:8001/health |
| AI Orchestrator docs | http://localhost:8001/docs |

---

## Production Deployments

| Service | Platform | URL |
|---|---|---|
| Web | Vercel | TBD |
| API | Railway | https://api-production-b77d.up.railway.app |
| AI Orchestrator | Railway | https://ai-orchestrator-production-59cd.up.railway.app |

### Required Railway Environment Variables

**api service:**
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
AI_ORCHESTRATOR_URL
```

**ai-orchestrator service:**
```
OPENAI_API_KEY
REDIS_URL
```

### Required Vercel Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL=https://api-production-b77d.up.railway.app
```

---

## Git Conventions

### Commit Message Types
| Type | Use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no feature/fix |
| `test` | Adding or fixing tests |
| `chore` | Build process, tooling |
| `perf` | Performance improvements |
| `ci` | CI/CD changes |
| `revert` | Reverting a previous commit |

### Branch Strategy
| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | New features, e.g. `feature/add-login` |
| `fix/*` | Bug fixes, e.g. `fix/badge-award` |
| `hotfix/*` | Critical production fixes |
| `release/*` | Release preparation |
