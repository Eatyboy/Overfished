# Overfished

**A port inspection game about illegal, unreported, and unregulated (IUU) fishing.**

You're the inspector at a busy fishing port. Ships come in one at a time, each with an arrival report saying what it caught and how. Check every report against the port's current regulations, then **accept** or **reject** the ship. Each decision affects the ocean, the local fishing industry, and what seafood costs, and those effects build up month after month.

> Built by Group 8 for SYN 100.

---

## Gameplay

### Core loop
1. A ship arrives and hands over its **fishing report**.
2. Check the report against the **regulations in force that day**.
3. **Accept** or **reject** the ship.
4. Repeat until the shift ends, then a month passes.

The game lasts up to **12 days**. Each day is the first day of a new month. Between days, the game simulates the month using your decisions.

### Fishing reports
- Say **what** a ship caught (species, weight, size) and **how** (gear, fishing zone, licence).
- Some reports openly show illegal activity.
- Some reports contain **discrepancies or contradictions** you have to catch.

### Regulations
- Rules can be **added, changed, or removed** from one day to the next (catch limits, minimum sizes, banned gear, protected zones, and so on).
- What was legal last month may not be legal today.

### Stats
Four stats track the health of the system:

| Stat | Represents |
| --- | --- |
| **Fish Population** | How many fish are left in the fishery |
| **Marine Ecosystem Health** | Damage from destructive gear, bycatch, protected zones |
| **Local Fishing Industry** | The livelihoods of legitimate local fishers |
| **Seafood Affordability** | Supply and price for consumers |

Letting IUU catch through hurts the ocean and undercuts honest fishers. Rejecting too many ships hurts the industry and drives prices up.

### Endings
- **Successful:** all four stats end at stable levels.
- **Mixed:** nothing collapsed, but some stats are still strained.
- **Collapse:** a critical system fails (for example, the fish population crashes) and the game ends early.

---

## Why this game?

Our goal is to help end IUU fishing. Research shows the main bottleneck isn't a lack of rules. Strong regulations already exist, but **ports struggle to detect and verify IUU fishing**. Overfished puts players in that role so they experience the problem through gameplay. They should come away understanding why port-state enforcement is hard and why it matters.

---

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Language | **TypeScript** | Shared types for ships, reports, and rules catch mistakes early |
| UI | **React** | The game is mostly documents, panels, and buttons, which suits DOM components better than a canvas engine |
| Build tool | **Vite** | Fast dev server, zero-config static build |
| Styling | **CSS Modules** + pixel font | Matches the Figma pixel-art look without fighting a framework |
| Game state | **Zustand** (or `useReducer`) | Small, simple store for the day, ship queue, stats, and decisions |
| Game logic | Plain TS modules in `src/game/` | Rule checking and the monthly simulation are pure functions, testable without the UI |
| Content | Data files in `src/data/` | Ships, rules, and day schedules are data, so writers can add content without touching logic |
| Testing | **Vitest** | Unit tests for rule validation and stat simulation |
| Hosting | **Vercel** or **GitHub Pages** | Free static hosting with automatic deploys from `main` |

No backend is needed. The game runs entirely in the browser, and progress can be saved to `localStorage`.

### Planned project structure

```
src/
  game/         # pure logic: rule checks, report generation, monthly simulation, endings
  data/         # ships, regulations, per-day rule changes, flavour text
  components/   # React UI: TitleScreen, InspectionDesk, ArrivalReport, Regulations, StatsPanel
  store/        # game state (current day, ship queue, stats)
  assets/       # sprites, fonts, sounds
```

---

## Getting started

Requirements: **Node.js 22+**.

```bash
git clone https://github.com/Eatyboy/Overfished.git
cd Overfished
npm install
npm run dev       # start the dev server
npm run test      # run unit tests
npm run build     # production build in dist/
npm run lint      # lint with oxlint
```

Every screen is laid out on a fixed **1440×900 stage** (the Figma frame size) that scales to fit the window, so positions can be copied straight from Figma.

---

## Roadmap

- **Week 6:** research, design, and a basic prototype
- **Week 7:** finish the MVP and do detail-specific research
- **Week 8:** playtesting, bug fixing, and polish

---

## Team

| Member | Focus |
| --- | --- |
| Ethan | Programming, design |
| Ian | Research, writing |
| Jaydan | Research, writing |
| Yuval | Programming, DevOps |

---

## References

- Shliakhovchuk, Elena, et al. "A Longitudinal Study of Video Games' Influence on Climate Change Concerns, Climate Refugee Awareness, and Environmental Behaviour Activism." *Simulation & Gaming*, vol. 57, no. 1, Aug. 2025, pp. 32–56. https://doi.org/10.1177/10468781251362482
- The Pew Charitable Trusts, et al. *Port State Performance: Putting Illegal, Unreported and Unregulated Fishing on the Radar.* The Pew Charitable Trusts, 2010. [PDF](https://www.pew.org/-/media/post-launch-images/2015/04/2015_april_pew_port-state-performance--putting-iuu-on-radar(1).pdf)
