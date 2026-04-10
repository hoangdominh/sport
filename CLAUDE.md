# Sport Tracker — CLAUDE.md

## Project Overview

A web app for a friend group to:
1. **Track daily expenses** — add/remove spending records per person per session
2. **View expense summary** — total spent per person, total players, average cost per person
3. **Vote on schedule** — vote on upcoming play dates and sports/activities

**Deploy target**: Netlify (static frontend only)
**Data storage**: Google Sheets via SheetDB.io REST API
**Auto-reset logic**: Frontend filters records to only show entries from the last 7 days (no hard delete needed)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| UI Components | shadcn/ui (Radix primitives) |
| Icons | Lucide React |
| HTTP client | Axios |
| Date handling | date-fns |
| Routing | React Router v6 |
| State | React useState / useContext |
| Backend | SheetDB.io (Google Sheets → REST API) |
| Deploy | Netlify (drag & drop or GitHub CI) |

---

## Design System

### Inspiration
Dark theme inspired by **Resend.com**: clean, modern, developer-grade aesthetic adapted for a sports/social context.

### Color Palette
```
Background:   #0a0a0a  (near-black)
Surface:      #111111  (cards, panels)
Border:       #1f1f1f  (subtle dividers)
Text primary: #ffffff
Text muted:   #71717a  (zinc-500)
Accent 1:     #f97316  (orange-500) — energy, sport
Accent 2:     #22c55e  (green-500)  — confirm, positive
Accent 3:     #6366f1  (indigo-500) — vote, schedule
Danger:       #ef4444  (red-500)
Gradient:     linear-gradient(135deg, #f97316 0%, #6366f1 100%)
```

### Typography
```
Font family:  Inter (Google Fonts)
Heading XL:   48px / 700 / tracking-tight
Heading L:    32px / 700
Heading M:    20px / 600
Body:         14px / 400
Caption:      12px / 400 / text-muted
```

### Component Style Rules
- Cards: `bg-[#111] border border-[#1f1f1f] rounded-2xl p-6`
- Buttons primary: `bg-white text-black hover:bg-zinc-200 rounded-xl px-4 py-2 font-semibold`
- Buttons accent: `bg-orange-500 hover:bg-orange-400 text-white rounded-xl px-4 py-2`
- Inputs: `bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-white placeholder:text-zinc-600`
- Badges: `rounded-full px-3 py-0.5 text-xs font-medium`
- Grid: Responsive 1 col mobile → 2 col tablet → 3 col desktop

---

## App Structure

```
sport/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/
│   │   └── sheetdb.js          # All SheetDB API calls
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── PageWrapper.jsx
│   │   ├── expense/
│   │   │   ├── AddExpenseForm.jsx
│   │   │   ├── ExpenseTable.jsx
│   │   │   ├── SummaryCards.jsx
│   │   │   └── DeleteButton.jsx
│   │   └── vote/
│   │       ├── VoteCard.jsx
│   │       ├── AddVoteOption.jsx
│   │       └── VoteResults.jsx
│   ├── pages/
│   │   ├── ExpensePage.jsx     # Route: /
│   │   └── VotePage.jsx        # Route: /vote
│   ├── hooks/
│   │   ├── useExpenses.js
│   │   └── useVotes.js
│   └── lib/
│       └── utils.js            # date filter, number format
├── .env.example
├── index.html
├── vite.config.js
├── tailwind.config.js
└── netlify.toml
```

---

## Google Sheets Structure

### Sheet 1: `expenses`
| Column | Key | Description |
|---|---|---|
| A | id | UUID (generated frontend) |
| B | name | Player name |
| C | amount | Amount in VND (number) |
| D | note | Optional note |
| E | date | ISO date string (YYYY-MM-DD) |
| F | created_at | Full ISO timestamp |

### Sheet 2: `votes`
| Column | Key | Description |
|---|---|---|
| A | id | UUID |
| B | type | `date` or `activity` |
| C | option | e.g. "Thứ 7 - 12/4" or "Cầu lông" |
| D | voter | Voter name |
| E | created_at | ISO timestamp |

---

## SheetDB API Usage

```js
// src/api/sheetdb.js
const BASE_URL = import.meta.env.VITE_SHEETDB_URL; // e.g. https://sheetdb.io/api/v1/XXXXXXX

// GET all expenses
export const getExpenses = () => axios.get(`${BASE_URL}?sheet=expenses`);

// POST new expense
export const addExpense = (data) => axios.post(`${BASE_URL}?sheet=expenses`, { data });

// DELETE by id
export const deleteExpense = (id) =>
  axios.delete(`${BASE_URL}/id/${id}?sheet=expenses`);

// GET votes
export const getVotes = () => axios.get(`${BASE_URL}?sheet=votes`);

// POST vote
export const addVote = (data) => axios.post(`${BASE_URL}?sheet=votes`, { data });
```

---

## Core Logic

### 7-Day Filter (Auto-reset)
```js
// src/lib/utils.js
import { subDays, isAfter, parseISO } from 'date-fns';

export const filterRecent = (records, days = 7) => {
  const cutoff = subDays(new Date(), days);
  return records.filter(r => isAfter(parseISO(r.created_at), cutoff));
};
```

### Expense Summary Calculation
```js
export const calcSummary = (expenses) => {
  const recent = filterRecent(expenses);
  
  // Total per person
  const perPerson = recent.reduce((acc, e) => {
    acc[e.name] = (acc[e.name] || 0) + Number(e.amount);
    return acc;
  }, {});

  const players = Object.keys(perPerson);
  const totalAmount = Object.values(perPerson).reduce((a, b) => a + b, 0);
  const average = players.length > 0 ? totalAmount / players.length : 0;

  return { perPerson, players, totalAmount, average };
};
```

### Vote Tallying
```js
export const tallyVotes = (votes, type) => {
  const filtered = votes.filter(v => v.type === type);
  return filtered.reduce((acc, v) => {
    acc[v.option] = (acc[v.option] || 0) + 1;
    return acc;
  }, {});
};
```

---

## Pages

### Page 1: Expense Tracker (`/`)

**Layout top → bottom:**
1. **Hero section** — Gradient headline: "Hôm nay chúng mày xài bao nhiêu?" + subtext showing current session date range
2. **Summary cards row** (3 cards):
   - Total players (with avatar stack)
   - Total amount spent (orange accent)
   - Average per person (green accent)
3. **Add expense form** — Name input + Amount input + Note (optional) + Submit button
4. **Expense table/list** — Each row: avatar icon, name, amount (formatted VND), date, delete button
5. **Per-person breakdown** — Card grid, one card per person showing their total

### Page 2: Vote (`/vote`)

**Layout:**
1. **Header** — "Lịch sắp tới — Vote đi nào"
2. **Two columns**:
   - Left: **Vote ngày chơi** — list of date options with vote count bar, add new date option, cast vote
   - Right: **Vote bộ môn** — list of activity options (Cầu lông, Pickleball, Bóng đá...) with vote count, add new activity, cast vote
3. **Voter name input** — persistent at top (stored in localStorage)
4. **Results visualization** — horizontal progress bars styled with gradient fill

---

## Navbar

```
[🏸 SportTracker]          [Chi Tiêu /] [Vote /vote]
```
- Dark background, sticky top
- Active route highlighted with orange underline
- Mobile: hamburger menu

---

## Environment Variables

```env
# .env.example
VITE_SHEETDB_URL=https://sheetdb.io/api/v1/YOUR_API_ID
```

```env
# Netlify → Site settings → Environment variables
VITE_SHEETDB_URL=https://sheetdb.io/api/v1/YOUR_API_ID
```

---

## Netlify Deploy Config

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Key UX Decisions

| Decision | Rationale |
|---|---|
| No login/auth | Small friend group, trust-based |
| Voter name in localStorage | Convenience, no account needed |
| 7-day rolling window | Auto-cleanup without complex backend logic |
| VND number format | `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` |
| No hard delete confirmation | Single click delete is fine at this scale — row is just marked/removed |
| SheetDB free tier | 500 req/month is sufficient for personal use (~20 ops/session) |

---

## Coding Standards

- **No TypeScript** — keep it simple, plain JSX
- **No Redux** — useContext + useState is enough
- **Tailwind only** — no custom CSS files
- **shadcn/ui** for form elements, dialogs, and toasts
- **Component files**: PascalCase, one component per file
- **API calls**: always wrapped in try/catch, show toast on error
- **Loading states**: show skeleton cards while fetching
- **Mobile first**: design for 375px, scale up

---

## Constraints & Limits

- SheetDB free: **500 requests/month** — avoid polling, fetch on mount + on user action only
- No server-side logic — all computation on frontend
- No image uploads
- Keep bundle small — lazy load Vote page

---

## Frontend Design Skills

Use the following skills when building UI components:

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/pbakaus/impeccable --skill frontend-design
```

Apply **impeccable** principles:
- Every pixel intentional
- Spacing scale: 4px base unit (Tailwind default)
- No orphan text, no crowded elements
- Consistent hover/focus states on all interactive elements
- Smooth transitions: `transition-all duration-150 ease-out`
