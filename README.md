# Overfished

**A doorman simulator about illegal, unreported, and unregulated (IUU) fishing.**

You're the inspector at the Port of San Diego. Ships come in one at a time, each with a fishing report saying what it caught and how, plus its fishing license. Check every report against the port's current regulations, then **accept** or **reject** the ship. Each decision affects the ocean, the local fishing industry, and what seafood costs, and those effects build up month after month.

> Built by Group 8 for SYN 100.

---


## Gameplay

### Core loop
1. A ship arrives and hands over its **fishing report** and **fishing license**.
2. Check them against the **regulations in force that day**. From Day 4, spend limited inspections to verify suspicious reports.
3. **Accept** or **reject** the ship.
4. Repeat until the shift ends, then pay the port's operating expense, review the day's ledger, and shop for upgrades.

The game takes place in **2026** and lasts up to **12 days**, one for each month: Day 1 is 1 January 2026 and Day 12 is 1 December 2026. Each day is a timed shift: the clock runs from **9:00 AM to 5:00 PM** in 30-minute steps over **3 real minutes**, and the player inspects as many ships as they can. At 5 PM the ship at the booth is sent away and the day ends.

### Fishing reports
Say **what** a ship caught and **how**. Reports are randomly generated from pools of options:

| Field | Values |
| --- | --- |
| Vessel name | "The *Adjective* *Noun*" |
| Fishing region | One region |
| Catches | 1–3 entries, each with species, amount, minimum size (in), and the gear used |
| Bait carried | One bait type, or none |

Species: giant sea bass, red abalone, white shark, skipjack tuna, blue shark, yellowtail, leopard shark, white seabass, ocean salmon, California sheepshead, plus the coastal pelagics (anchovy, Pacific sardine, jack mackerel, Pacific mackerel), which are counted by weight.

- Some reports openly show illegal activity.
- From Day 4, some reports are **falsified** to hide violations (see below).

### Fishing licenses
Every license has the same fields: **vessel name**, **expiration date**, **license number**, and **permits** (HMS, General Gill/Trammel Net). Licenses always look the same, but what's on the reports changes day by day.

### Regulations
Rules come into force one or two at a time (see `src/data/regulations.ts`). What was legal last month may not be legal today, and seasonal rules give each species' open fishing season.

| Day (month) | New rule |
| --- | --- |
| 1 (Jan) | Must have fished in San Diego waters |
| 1 (Jan) | Off limits: giant sea bass, red abalone, white shark |
| 2 (Feb) | California sheepshead: fishing season March – December, 13 in minimum |
| 3 (Mar) | Ocean salmon: fishing season May – September, 27 in minimum |
| 4 (Apr) | White seabass: fishing season June 16 – March 14 |
| 5 (May) | Skipjack tuna and blue shark require an HMS permit |
| 6 (Jun) | Yellowtail: 28 in minimum |
| 7 (Jul) | Gill/trammel nets require a permit |
| 7 (Jul) | Ocean salmon, leopard shark, sheepshead, skipjack tuna, blue shark may not be netted |
| 8 (Aug) | Leopard shark: rod and reel only, 36 in minimum |
| 9 (Sep) | No tilapia as bait |
| 10 (Oct) | Coastal pelagics closed while Marine Biodiversity ≤ 30% |

### Marine Biodiversity
A single **Marine Biodiversity** bar acts as the ocean's health (tuned in `src/data/start.ts`):

- Starts at **100%**.
- Each **illegal vessel accepted** costs **10%**, and a **ticket** explains what the player should have noticed.
- It does **not** recover on its own. Only **Habitat Restoration** (shop) brings it back, a little each day.
- At or below **30%** the bar turns red, and coastal pelagic fishing closes.

### Port budget
Money is the port's operating budget (tuned in `src/data/economy.ts`). It pushes the player to accept vessels even when they're unsure.

| Event | Effect |
| --- | --- |
| Start | $200 |
| Accept any vessel | +$30 port fees (an illegal one also costs biodiversity) |
| Reject a legal vessel | −$20 industry complaint, plus a ticket |
| Reject an illegal vessel | $0 |
| Inspection | First 3 each day are free, then $10 each |
| End of each day | −$100 operating expense. If the port can't pay, it shuts down |

### Falsified reports and verification
- **Days 1–2:** every report is true.
- **Day 3:** 40% of illegal vessels hand over paperwork that passes every rule, with no discrepancies. No verification tools exist yet, so only the blacklist can catch them.
- **Day 4:** a Port Authority bulletin warns that some vessels falsify their reports and issues **Vessel Tracking**. The first vessel that day is a guided example: its paperwork looks clean, but tracking places it outside San Diego waters.
- **Days 4–12:** more and more illegal vessels falsify their paperwork to look legal (30% of illegal vessels on Day 4, up to 60%). Each vessel has its **actual** activity (hidden) and its **reported** activity (on the documents), and decisions are judged on the actual activity.

| Lie | First day | Exposed by |
| --- | --- | --- |
| Claims to have fished in San Diego waters | 4 | Vessel Tracking (issued Day 4) |
| Leaves illegal catches or bait off the report | 5 | Catch Verification (shop) |
| Forged license claiming permits it doesn't have | 7 | License Database (shop) |

**Blacklist (Day 3 onward):** each day a separate Blacklist slip on the desk lists 5–10 known offenders to reject on sight, and the list changes every day. A third of illegal vessels (including ones whose paperwork looks legal) sail under a blacklisted name, and legal vessels never do.

**The desk:** every document (report, license, regulations, blacklist) can be dragged anywhere. Pressing one brings it to the front, and dropping it off the desk snaps it back on.

Tools show **evidence, not verdicts**: the player compares what they find with the documents and the regulations. Some legal vessels have harmless mismatches (for example, a different San Diego fishing ground), so a mismatch alone doesn't prove anything. The license card also shows the vessel's **port record** (prior violations). It's a free but imperfect hint, since liars are more likely to have prior violations.

### End-of-day shop
After each shift the player sees the day's ledger and can buy upgrades:

| Upgrade | Cost | Effect |
| --- | --- | --- |
| Catch Verification | $150 | Inspect the hold: real catches, sizes and bait |
| License Database | $200 | See which permits are really on file |
| Additional Inspector | $100 | Free inspections per day go from 3 to 5 |
| Habitat Restoration | $100, +$50 each | +2% biodiversity at the start of every later day (stacks) |

### Endings
- **Collapse:** Marine Biodiversity hits 0% and the game ends early.
- **Port closed:** the port can't pay its end-of-day operating expense.
- **Season complete:** the player makes it through all 12 days.

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
| Game state | **Zustand** (or `useReducer`) | Small, simple store for the day, shift clock, current ship, biodiversity, and decisions |
| Game logic | Plain TS modules in `src/game/` | Rule checking and the monthly simulation are pure functions, testable without the UI |
| Content | Data files in `src/data/` | Ships, rules, and day schedules are data, so writers can add content without touching logic |
| Testing | **Vitest** | Unit tests for rule validation and stat simulation |
| Hosting | **GitHub Pages**, **Cloudflare Pages**, or **Vercel** | Free static hosting with automatic deploys from `main` |

No backend is needed. The game runs entirely in the browser, and progress can be saved to `localStorage`.

### Project structure

```
src/
  game/           # pure logic: types, dates, seeded RNG, ship generation, rule checks, game loop
  data/           # content: report pools, regulations and rollout, biodiversity, economy and shop tuning, start date
  store/          # Zustand game state that the UI reads from
  components/
    Stage/          # fixed 1440×900 canvas, scaled to fit the window
    TitleScreen/    # title screen + animated harbor scene
    DaySummary/     # end-of-day ledger and upgrade shop
    GameOver/       # collapse / port-closed / season-complete screen
    InspectionDesk/ # header, harbor window, biodiversity bar, budget + verification tools, documents, regulations, accept/reject, notices
    pixel/          # shared pixel-art pieces (boat, ripples, stepped animations)
```

The UI is data-driven: every screen reads from the store, so the game loop only has to update state.

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
