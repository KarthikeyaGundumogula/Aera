# FrameHouse — Surge Score   Documentation

## Version 2.0 | July 2026

---

## Table of Contents

1. [Philosophy Overview](#philosophy-overview)
2. [The Surge Score](#the-surge-score)
3. [The 6-Bar Visual System](#the-6-bar-visual-system)
4. [The Resonance Signature](#the-resonance-signature)
5. [User Metrics](#user-metrics)
6. [Data Types & Calculations](#data-types--calculations)
7. [UI Implementation Guidelines](#ui-implementation-guidelines)
8. [Glossary](#glossary)

---

## Philosophy Overview

### Core Belief

> **"Every film has its audience."**

There are no "bad" movies. There are only mismatched experiences. A film that doesn't resonate with one person might be life-changing for another. Our system reflects this by tracking **personal emotional impact**, not objective quality.

### What We Don't Do

- No star ratings (1–5 or 1–10)
- No percentage scores (like Rotten Tomatoes)
- No aggregated averages as the primary metric
- No "objective" judgment of film quality

### What We Do

- Track each user's **personal peak** (their highest cinematic experience)
- Measure how much a film **moves them** relative to that peak
- Aggregate data to understand the **nature** of a film's impact on audiences

---

## The Surge Score

### Definition

**Surge** is a number from **0 to infinity** that represents how much a film moved a user.

| Element | Value | Description |
| :--- | :--- | :--- |
| **Name** | Surge | The emotional impact score |
| **Range** | 0 to ∞ | No upper limit |
| **Starting Peak** | 1000 | Every user begins here |
| **Type** | Personal | Only meaningful to the individual user |

### How It Works

1. **Every user starts with a peak of 1000.**
   - This is their personal "ceiling" — their best cinematic experience so far.

2. **When a user watches a film, they assign a Surge number.**
   - Any number from 0 to infinity.
   - No wrong answers. This is personal.

3. **If the Surge is below their peak:**
   - The film was good but didn't top their best.
   - Their peak remains unchanged.

4. **If the Surge is above their peak:**
   - The film broke their ceiling.
   - Their peak updates to this new higher number.

### Example

```
User's Peak: 1000

Film 1: Surge = 800 → Below peak. Peak stays 1000.
Film 2: Surge = 1200 → NEW PEAK! Peak becomes 1200.
Film 3: Surge = 900 → Below peak. Peak stays 1200.
Film 4: Surge = 3400 → NEW PEAK! Peak becomes 3400.
```

### What Surge Is NOT

| Not This | Because |
| :--- | :--- |
| A grade | It doesn't judge the film's quality |
| A comparison | It's not about what others think |
| Static | It changes as the user grows |
| Objective | It's entirely personal |

### User-Facing Explanation

> **Your Surge is a number from 0 to infinity. 1000 is your starting peak. The percentage shows where this film lands relative to your peak.**

---

## The 6-Bar Visual System

### Overview

The Surge score is represented visually as **5 amber bars**, with an optional **6th glowing bar** for peak-breakers.

### Visual Hierarchy

| Element | Display | Meaning |
| :--- | :--- | :--- |
| **Bars 1–5** | Amber fill | Represents the Surge relative to the user's peak (0–100%) |
| **Bar 6** | Glowing amber, pulsing | **Only appears** when Surge > 100% of peak |

### How the Bars Work

1. **The bars are always scaled to the user's current peak.**
   - This means the visual experience is consistent, even as peaks change.

2. **Bars 1–5 represent 0% to 100% of the peak.**
   - Each bar = 20% of the peak.

3. **If Surge ≤ Peak:**
   - Only bars 1–5 are shown.
   - The fill percentage = (Surge / Peak) × 100

4. **If Surge > Peak:**
   - All 5 bars are fully filled.
   - The 6th bar appears, glowing brightly.
   - The 6th bar represents the "overflow" — the Surge beyond the peak.

### Visual Examples

#### Example 1: Surge Below Peak

```
User's Peak: 1000
Surge: 700

[████░░░░] [░░░░░░░░] [░░░░░░░░] [░░░░░░░░] [░░░░░░░░]
   70%        0%         0%         0%         0%

→ No 6th bar. Bars 1–5 show 70% filled.
```

#### Example 2: Surge Matches Peak

```
User's Peak: 1000
Surge: 1000

[████████] [████████] [████████] [████████] [████████]
   100%       100%       100%       100%       100%

→ No 6th bar. All 5 bars fully filled.
```

#### Example 3: Surge Breaks Peak

```
User's Peak: 1000
Surge: 1400

[████████] [████████] [████████] [████████] [████████] [████████]
   100%       100%       100%       100%       100%       140% (overflow)

→ 6th bar appears! Glowing amber. Pulsing animation.
```

### Implementation Details

| Element | Specification |
| :--- | :--- |
| **Bar Colors** | Default: Dark gray (#2A2A2A), Fill: Amber (#E8A838) |
| **6th Bar Color** | Bright amber (#F5A623) with glow (#F5A623, opacity 0.4) |
| **6th Bar Animation** | Subtle pulse (scale 1.0 → 1.05 → 1.0, 1.5s cycle) |
| **Bar Height** | 12px (standard), rounded corners (4px) |
| **Bar Gap** | 4px between bars |
| **Transition** | Smooth fill animation (0.6s ease-in-out) |

---

## The Resonance Signature

### Overview

The Resonance Signature is a **film-level metric** — it describes the nature of a film's impact on audiences. It consists of **three independent metrics**.

### The Three Metrics

| Metric | What It Measures | Type |
| :--- | :--- | :--- |
| **Peak Magnitude** | How high did the most moved viewer go? | Absolute Value |
| **Average Surge Density** | What was the average experience? | Percentage |
| **Surge Spread** | How much do opinions vary? | Label (Polarizing / Distinct / Universal) |

---

### 1. Peak Magnitude

#### Definition
The **maximum Surge score** ever assigned to this film by any user.

```
PEAK MAGNITUDE = MAX(surge_1, surge_2, surge_3, ..., surge_n)
```

#### What It Tells You
- The **ceiling of possibility** for this film.
- How much *someone* was moved by it.

#### Example
| Film | Peak Magnitude | Meaning |
| :--- | :--- | :--- |
| RRR | 8,400 | Someone out there had a life-changing experience |
| OG | 2,100 | The highest anyone went was solid, but not earth-shattering |

#### Why It Matters
It honors your philosophy—*every film has its audience.* Even if most people didn't love it, someone *did*. Peak Magnitude shows you the potential.

---

### 2. Average Surge Density (ASD)

#### Definition
The **average of all normalized Surge percentages** for a film.

```
AVERAGE SURGE DENSITY = AVERAGE(normalized_surge_1, normalized_surge_2, ..., normalized_surge_n)
```

Where:
```
normalized_surge = (Surge / Personal Peak) × 100
```

#### What It Tells You
- The **overall aggregate experience** of the film.
- How much the film moved its audience, on average.
- A single number that represents the collective emotional impact.

#### Example

| User | Surge | Personal Peak | Normalized Surge |
| :--- | :--- | :--- | :--- |
| User A | 4,200 | 3,200 | 131% |
| User B | 1,800 | 2,000 | 90% |
| User C | 2,500 | 4,000 | 62.5% |
| User D | 800 | 1,500 | 53.3% |
| User E | 6,000 | 5,000 | 120% |

```
AVERAGE SURGE DENSITY = (131 + 90 + 62.5 + 53.3 + 120) / 5 = 91.36%
```

**Interpretation:** On average, viewers experienced 91.36% of their personal peak while watching this film.

#### Why It Works Better Than Binary Metrics

| Aspect | Old Binary Approach | Average Surge Density |
| :--- | :--- | :--- |
| **Granularity** | Binary (≥80% or not) | Continuous percentage |
| **Nuance** | Lost | Preserved |
| **Interpretation** | "68% had a deeply positive experience" | "Average viewer experienced 91% of their peak" |
| **Extremes** | Ignored | Included |

---

### 3. Surge Spread (Polarization)

#### Definition
How much opinions vary. Calculated as the **standard deviation of normalized Surge scores**.

```
NORMALIZED SURGE = Surge / User's Peak (as a decimal)

SURGE SPREAD = STDEV(normalized_surge_1, normalized_surge_2, ..., normalized_surge_n)
```

#### Displayed as a Label

| Spread Value | Label | Meaning |
| :--- | :--- | :--- |
| > 0.6 | **Polarizing** | You'll either love it or feel nothing. |
| 0.3 – 0.6 | **Distinct** | Has a clear identity, not for everyone. |
| < 0.3 | **Universal** | Most viewers agree on this one. |

#### What It Tells You
- The **nature** of the film's appeal.
- Whether it's divisive or universally loved.

#### Why It Matters
A polarizing film isn't bad — it's *specific*. It knows who it's for. High spread means the film has a strong identity.

---

### The Full Resonance Signature (Visual)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RESONANCE SIGNATURE — RRR

  PEAK MAGNITUDE        ████████████████████░░  8,400
  AVG SURGE DENSITY     ██████████████░░░░░░░░  91.4%
  SURGE SPREAD          ████████████████████░░  HIGH (Polarizing)

  ──────────────────────────────────────────────────
  On average, viewers experienced 91% of their
  personal peak. Some went much higher, some lower.
  This film consistently moves its audience.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### How the Three Metrics Work Together

| Film Type | Peak Magnitude | Avg Surge Density | Surge Spread | What It Means |
| :--- | :--- | :--- | :--- | :--- |
| **Crowd-Pleaser** | High | High | Low | Almost everyone loves it. Safe bet. |
| **Cult Classic** | Very High | Medium | High | Some people are OBSESSED. Others don't get it. |
| **Niche Masterpiece** | Very High | Low | High | A small group had a life-changing experience. Everyone else was unmoved. |
| **Solid but Unspectacular** | Medium | Medium | Low | Most people liked it. No one loved it. |
| **Polarizing Flop** | Low | Low | High | Some hated it, some tolerated it. No one loved it. |

---

## User Metrics

### Personal Peak

| Element | Value |
| :--- | :--- |
| **Name** | Personal Peak |
| **Definition** | The highest Surge score a user has ever assigned |
| **Starting Value** | 1000 |
| **Update Rule** | Updates when Surge > current peak |

### Ceiling Gap

| Element | Value |
| :--- | :--- |
| **Name** | Ceiling Gap |
| **Definition** | The difference between a user's Surge for a film and their current peak |
| **Formula** | `CEILING GAP = Surge - Personal Peak` |

#### Interpretation

| Ceiling Gap | Meaning |
| :--- | :--- |
| > 0 | Peak Breaker — film exceeded the user's best |
| = 0 | Matched Peak — film was as good as their best |
| < 0 | Below Peak — film didn't top their best |

### Normalized Surge

| Element | Value |
| :--- | :--- |
| **Name** | Normalized Surge |
| **Definition** | Surge expressed as a percentage of the user's peak |
| **Formula** | `NORMALIZED SURGE = (Surge / Personal Peak) × 100` |

#### Display

```
User's Peak: 3200
Surge: 4200

Normalized Surge: 131%  ← Primary display in the UI
```

---

## Data Types & Calculations

### Summary Table

| Data Type | Level | Formula | Display |
| :--- | :--- | :--- | :--- |
| **Surge** | User | User-assigned | Number (0 to ∞) |
| **Personal Peak** | User | MAX(Surges) | Number |
| **Ceiling Gap** | User | Surge - Peak | Number |
| **Normalized Surge** | User | (Surge / Peak) × 100 | Percentage |
| **Peak Magnitude** | Film | MAX(Surges) | Number |
| **Average Surge Density** | Film | AVERAGE(Normalized Surges) | Percentage |
| **Surge Spread** | Film | STDEV(Normalized Surges) | Label |

---

### Database Schema (Conceptual)

```sql
-- Users Table
users:
  - id (UUID)
  - username (String)
  - display_name (String)
  - current_peak (Integer) -- default: 1000
  - spirit (Integer) -- influence score
  - works (Integer) -- number of recommendations
  - created_at (Timestamp)
  - updated_at (Timestamp)

-- Films Table
films:
  - id (UUID)
  - title (String)
  - title_native (String) -- original script title
  - year (Integer)
  - director (String)
  - poster_url (String)
  - genres (String[]) -- array of genre tags
  - created_at (Timestamp)

-- Surge Records Table
surge_records:
  - id (UUID)
  - user_id (UUID) -- references users.id
  - film_id (UUID) -- references films.id
  - surge_score (Integer) -- 0 to ∞
  - previous_peak (Integer) -- user's peak before this film
  - new_peak (Integer) -- user's peak after this film (if broken)
  - normalized_surge (Float) -- (surge_score / previous_peak) × 100
  - is_peak_breaker (Boolean)
  - created_at (Timestamp)

-- Recommendations Table
recommendations:
  - id (UUID)
  - user_id (UUID) -- references users.id
  - film_id (UUID) -- references films.id
  - text (String) -- max 100 words
  - created_at (Timestamp)

-- Experiences Table
experiences:
  - id (UUID)
  - user_id (UUID) -- references users.id
  - film_id (UUID) -- references films.id
  - text (Text) -- unlimited length
  - created_at (Timestamp)

-- Film Aggregates Table (calculated periodically)
film_aggregates:
  - film_id (UUID) -- references films.id
  - peak_magnitude (Integer) -- MAX(surge_score)
  - avg_surge_density (Float) -- AVERAGE(normalized_surge)
  - surge_spread_value (Float) -- STDEV(normalized_surge)
  - surge_spread_label (String) -- Polarizing / Distinct / Universal
  - total_surges (Integer) -- COUNT of surges
  - updated_at (Timestamp)
```

---

## UI Implementation Guidelines

### The Feed (Recommendations)

#### What Users See
1. **Recommendation Text** (hype, 100 words or less)
2. **User Metadata** (name, Spirit, Works)
3. **The Bars** (5-bar display with Surge percentage)
4. **Film Metadata** (title, genre, director, cast)

#### The Bars Display

```
┌─────────────────────────────────────────────────────────┐
│  PRIYA NAIR  @priya_archives                           │
│  842 SPIRIT  ·  7 WORKS                               │
│                                                         │
│  "Naatu Naatu is not just a song—it is a cultural       │
│   declaration..."                                       │
│                                                         │
│  ████████  ████████  ████████  ████████  ████████      │
│   20%       20%       20%       20%       20%          │
│                                                         │
│  131%                                                   │
│  4200 / 3200                                            │
│                                                         │
│  RRR  ·  Epic  ·  Period Drama                         │
│  Dir. S.S. Rajamouli                                    │
└─────────────────────────────────────────────────────────┘
```

### The Film Detail Page

#### Where the Resonance Signature Lives
- **Not in the feed.** The feed is for community hype.
- **On the film's dedicated page.** This is where the deeper data lives.

#### Resonance Signature Display

```
┌─────────────────────────────────────────────────────────┐
│  RESONANCE SIGNATURE                                   │
│                                                         │
│  PEAK MAGNITUDE        ████████████████████░░  8,400   │
│  AVG SURGE DENSITY     ██████████████░░░░░░░░  91.4%   │
│  SURGE SPREAD          ████████████████████░░  HIGH    │
│                                                         │
│  On average, viewers experienced 91% of their           │
│  personal peak. This film consistently moves its        │
│  audience.                                              │
└─────────────────────────────────────────────────────────┘
```

### The FAB (Floating Action Button)

#### States

| State | Visual | Interaction |
| :--- | :--- | :--- |
| **Idle** | Simple circle, subtle amber glow | Visible on all pages |
| **Hover** | Glow intensifies | User hovers over the button |
| **Holding to Score** | Ring fills clockwise, transitions from white to amber | User holds down the button |
| **Peak Break** | Ring shatters — bursts into particles | Surge > Personal Peak |

---

## Glossary

| Term | Definition |
| :--- | :--- |
| **Surge** | A number from 0 to infinity representing how much a film moved a user. |
| **Personal Peak** | The highest Surge score a user has ever assigned. Starts at 1000. |
| **Peak Breaker** | A film that receives a Surge higher than the user's current peak. |
| **Normalized Surge** | The Surge expressed as a percentage of the user's peak: `(Surge / Peak) × 100` |
| **Ceiling Gap** | The difference between a user's Surge and their peak: `Surge - Peak` |
| **Resonance Signature** | A film-level metric consisting of Peak Magnitude, Average Surge Density, and Surge Spread. |
| **Peak Magnitude** | The maximum Surge score ever assigned to a film: `MAX(Surge)` |
| **Average Surge Density (ASD)** | The average of all normalized Surge percentages for a film: `AVERAGE(Normalized Surge)` |
| **Surge Spread** | How much opinions vary, displayed as Polarizing / Distinct / Universal. |
| **Spirit** | A user's influence score (similar to followers, but weighted by Surge). |
| **Works** | The number of recommendations a user has created. |
| **Recommendation** | A short (100 words or less) hype text. |
| **Experience** | An unlimited personal take on a film. |

---

## Version History

| Version | Date | Changes |
| :--- | :--- | :--- |
| 1.0 | July 2026 | Initial documentation |
| 2.0 | July 2026 | Replaced Resonance Density with Average Surge Density; updated all references and examples |
