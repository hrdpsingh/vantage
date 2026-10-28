# Vantage — GitHub Repository Intelligence Dashboard

**Vantage** is a comprehensive, production-grade analytics and telemetry dashboard for GitHub repositories, powered directly by the GitHub REST API v3. It transforms public repository data into actionable engineering intelligence, featuring interactive commit heatmaps, velocity bar charts, issue velocity breakdowns, community health audits, and side-by-side repository benchmarking.

---

## Features

### 1. Repository Discovery & Quick Presets
- **Fast Search**: Search repositories dynamically via the GitHub Search API or jump directly to any `owner/repo` or full GitHub URL.
- **Curated Presets**: 1-click access to major open-source projects including React, Next.js, Tailwind CSS, Linux, and uv.
- **Local History**: Automatically saves recently inspected repositories to browser storage for instant navigation.

### 2. Visual Analytics & Charts
- **Commit Density Heatmap**:
  - **Calendar View**: 5-tier intensity color matrix showing day-by-day commit cadence with interactive cell hover tooltips.
  - **Punch Card View**: $7\text{ days} \times 24\text{ hours}$ temporal matrix mapping push times to identify peak team work hours and release cycles.
- **Commit Velocity Bar Chart**:
  - **Day-of-Week Distribution**: Quantifies commit volume across Sunday through Saturday.
  - **Weekly Velocity**: Chronological weekly commit trend line with dynamic Y-axis scales and peak markers.
  - **Top Contributor Volume**: Comparative commit distribution across the top repository contributors.
- **Language Stack**: Proportional stacked color bar and tabular breakdown mapped to official GitHub language color specifications.

### 3. Repository Health & Intelligence Tabs
- **Overview**:
  - Six tabular KPI counters: Stars, Forks, Open Issues & PRs, Watchers/Subscribers, Disk Size, and Community Health score.
  - Repository pulse indicators: Freshness of last push, creation age, default branch, and platform feature enablement (Wiki, Discussions, Projects, Pages).
- **Issues & Pull Requests**:
  - Segmented filters for `All`, `Issues`, and `Pull Requests`.
  - State toggles for `Open` and `Closed` items.
  - Live search by title, number, or author with color-matched labels and comment counts.
- **Contributors & Community Standards**:
  - Ranked contributor leaderboard with commit volumes and relative contribution percentages.
  - Open-source compliance audit verifying presence of README, License, Contributing Guidelines, Code of Conduct, Issue Templates, and PR Templates.
- **Releases & Distribution**:
  - Changelog logs, pre-release tags, and downloadable binaries with exact file sizes and download counters.

### 4. Repository Comparison Tool
- Benchmark any two repositories side-by-side (e.g., `facebook/react` vs. `vuejs/core`).
- Compares stars, forks, open issues, language, license, creation date, push frequency, and highlights superior metrics.

### 5. Dossier Export & Shields Badges
- Export repository intelligence in one click:
  - Formatted **Markdown Summary** ready for engineering reports and documentation.
  - Raw **JSON Telemetry** payload.
  - Embeddable **Shields.io Markdown Badges**.
- Direct clipboard copy and instant file download (`.md` / `.json`).

### 6. Rate Limit & Personal Access Token Management
- Real-time rate limit tracker in the top bar showing remaining requests (60 req/hr unauthenticated, 5,000 req/hr with token).
- In-browser token configuration modal: paste any classic or fine-grained GitHub token (no extra scopes needed for public repositories).
- In-memory and session caching to prevent duplicate API consumption when navigating tabs.

---

## Tech Stack

- **Framework**: React 19 (TypeScript, functional hooks)
- **Bundler & Tooling**: Vite 8, Tailwind CSS v4, tsx
- **Icons & Motion**: Lucide React, Motion
- **Markdown Rendering**: Marked
- **API**: GitHub REST API v3

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vantage

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will start at `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm run preview
```

---

## File Structure

```text
├── index.html                  # HTML entry point with typography fonts
├── metadata.json               # Applet configuration
├── package.json                # Project dependencies and build scripts
├── src/
│   ├── App.tsx                 # Core application controller and tab routing
│   ├── main.tsx                # React DOM entry point
│   ├── index.css               # Tailwind CSS imports and markdown styling
│   ├── types/
│   │   └── github.ts           # TypeScript interfaces for GitHub API entities
│   ├── services/
│   │   └── githubApi.ts        # GitHub API client with rate limits and caching
│   ├── utils/
│   │   └── formatters.ts       # Tabular numerals, relative time, and colors
│   └── components/
│       ├── Header.tsx          # Top Bar with quick search and rate limits
│       ├── RepoHeader.tsx      # Repository metadata identity strip
│       ├── OverviewTab.tsx     # Primary KPI grid and pulse telemetry
│       ├── CommitHeatmap.tsx   # Calendar and Punch Card commit heatmap
│       ├── CommitBarChart.tsx  # Day-of-week and weekly velocity bar chart
│       ├── IssuesTab.tsx       # Issues and PRs activity tracking
│       ├── ContributorsTab.tsx # Contributor leaderboard and health audit
│       ├── ReleasesTab.tsx     # Releases log and binary asset metrics
│       ├── CompareModal.tsx    # Side-by-side repository comparison matrix
│       ├── ExportModal.tsx     # Markdown and JSON report generator
│       ├── RepoSearchModal.tsx # Search modal with autocomplete and history
│       └── TokenModal.tsx      # GitHub Personal Access Token settings
```

---

## License

Apache-2.0
