# SDLC Orchestrator

This file controls the whole pipeline. Read it at the start of every session and whenever you are unsure what to do next.
Agent files in `agents/` only describe **who you are and what you do** in a phase. **This file decides when each one runs.**

---

## 1. Folder layout

```
SDLC/
├── CLAUDE.md                     ← points here
├── README.md                     ← this file (orchestrator)
├── agents/
│   ├── research-and-requirements.md
│   ├── developer.md
│   └── tester.md
├── projects/
│   └── <project-name>/           ← one folder per project
│       ├── input/                ← the user's original requirement file(s), copied as-is
│       ├── raw-requirement.md    ← extracted from input/ in Phase 0 (uses _template format)
│       ├── status.md             ← pipeline state (created in Phase 0)
│       ├── projectdesc.md        ← output of Research (source of truth for all agents)
│       ├── dev-plan.md           ← Developer's task table
│       ├── test-cases.md         ← Tester's test case table
│       ├── reports/              ← created in Phase 0
│       │   └── test-report-round-<N>.md
│       ├── test-scripts/         ← Tester's own helper scripts (never shipped)
│       └── code/                 ← created in Phase 0; working source code (may hold several components)
└── output/
    └── <project-name>/           ← final approved project (only after Gate 4)
```

`<project-name>` is lowercase-with-hyphens, e.g. `expense-tracker`.

### Works for any kind of project
The pipeline is the same for every project type. Only **how the project is accessed, tested and shown** changes:

| Project type | Access point | How it is tested / showcased |
|---|---|---|
| Web app / website | Local URL (e.g. `http://localhost:5173`) | In the browser pane |
| Backend / REST or GraphQL API | Local base URL (e.g. `http://localhost:8000`) | HTTP requests (curl / scripts), checking status codes and responses |
| CLI tool / script | Run command (e.g. `python main.py --help`) | Running commands in the terminal and checking output, exit codes and files |
| Library / package | Import path + test command | Small test scripts or a test framework calling the public API |
| Multi-part system (e.g. frontend + backend + worker/scheduler + bot) | One access point **per component** | Each component with its own method above, plus end-to-end flows across them |
| Desktop / game / bot / data or ML pipeline / other | Whatever command or URL starts it | The closest of the methods above, decided in `projectdesc.md` |

Everywhere this file and the agent files say **Access point**, read it as "the URL or run command for this project (or for each component)".
Sections or test categories that do not apply to a project (e.g. UI design for a CLI, owner actions for a project with no external services) are marked **N/A** and skipped. They are never forced.

---

## 2. How a run starts

The user starts a run with **"start SDLC for <project name>"** and provides the requirement in any form:
- a file attached in chat or a path on their PC (PDF, Word, Markdown, text, image or anything readable)
- or text pasted directly in the message

The user does no setup. You create every folder and file yourself.

- If a `projects/<project-name>/status.md` already exists → **resume** (see §5).
- Otherwise → begin at **Phase 0**.

Turn the name into lowercase-with-hyphens (e.g. "Expense Tracker" → `expense-tracker`).
If the user gives no project name, take one from the requirement and mention it. If they give a name but no requirement, ask for the requirement.
If they say "resume" or "continue" with no name, list the folders in `projects/` (except `_template`) and ask which one.

`projects/_template/raw-requirement.md` is the format reference for Phase 0. It is never run or changed.

---

## 3. Phases

Each phase names the agent file to act as. **Read that agent file before starting the phase**, act only in that role, and update `status.md` when the phase ends.
**Owner actions (§7) and paid / real-world actions (§8) can come up in any phase.** Follow those sections whenever they do.

### Phase 0 — Setup
1. Create `projects/<project-name>/` with empty `input/`, `code/`, `reports/` and `test-scripts/` folders.
2. Save the user's requirement into `input/`: copy the file they gave, or save pasted text as `input/requirement.txt`.
3. Read the requirement fully (use the PDF / Word skills for those formats) and write `raw-requirement.md` in the format of `projects/_template/raw-requirement.md`:
   - Keep everything the user wrote. Do not drop or reinterpret requirements.
   - Write "Not specified" for anything missing (e.g. tech stack). Phase 1 will fill these with sensible defaults, marked "(chosen)".
   - If the requirement is already a **detailed spec / PRD**, keep its section numbers in your notes so later phases can point back to them. `input/` stays the authority for exact details (configs, prompts, field names, payload shapes).
4. Create `status.md` from the template in §6, with `Phase: 1 - Research`, `Round: 0`.
5. Tell the user in one or two lines what you understood (project type, a few key features, any external services or paid usage spotted). There is no gate here; Gate 1 covers it. Go straight to Phase 1.

### Phase 1 — Research → 🔒 Gate 1
- **Act as:** `agents/research-and-requirements.md`
- **Input:** `raw-requirement.md`, `input/`
- **Output:** `projectdesc.md`
- **Gate 1:** Show the user a summary of `projectdesc.md`: key features, what makes it different, tech stack, and, if any, the external services, owner actions and paid usage it needs. Ask for approval.
  - Approved → go to Phase 2.
  - Changes requested → update `projectdesc.md`, show it again. Repeat until approved.

### Phase 2 — Development plan → 🔒 Gate 2
- **Act as:** `agents/developer.md` (planning part)
- **Input:** `projectdesc.md`
- **Output:** `dev-plan.md` — a table with **every** feature and technical task, however small, including the project's own automated tests, owner actions and non-code deliverables. Large plans are grouped into **milestones**.
- **Gate 2:** Display the full table to the user and ask for approval.
  - Approved → go to Phase 3.
  - Changes requested → revise the table, show it again.

### Phase 3 — Build
- **Act as:** `agents/developer.md` (build part)
- **Input:** `projectdesc.md`, approved `dev-plan.md`
- **Output:** working code in `code/` with a working **Access point** for every component (see §1).
- Build **milestone by milestone** (or in plan order if there are no milestones). After each milestone, update `dev-plan.md` and `status.md`, and tell the user in one line what's done.
- When a task needs something only the user can give or do, run an **owner action** (§7). Never spend money or credits without asking (§8).
- Write the **Project type** and each component's **Access point** and **run command** into `status.md`.
- No gate here → go straight to Phase 4.

### Phase 4 — Test plan → 🔒 Gate 3
- **Act as:** `agents/tester.md` (planning part)
- **Input:** `projectdesc.md`, Access point(s)
- **Output:** `test-cases.md` with two parts:
  - **Automated test cases** (`TC-xx`): run with free / mock / local services only. These decide the pass rate.
  - **Owner-assisted / live test cases** (`L-xx`), only if the project needs them: tests that need a real person, a real device, a real external service or paid usage. Write "N/A" if there are none.
- **Gate 3:** Display the full table to the user and ask for approval.
  - Approved → go to Phase 5.
  - Changes requested → revise, show again.
- This phase runs **once per project**. Later rounds reuse the same approved test cases.

### Phase 5 — Test run
- **Act as:** `agents/tester.md` (execution part)
- **Input:** approved `test-cases.md`, Access point(s)
- Increase `Round` in `status.md` by 1.
- Run every **automated** test case (`TC-xx`), including the project's own test suites, and record Pass/Fail.
- **Pass rate = passed ÷ total automated cases × 100**, recorded in `status.md`.
- Always write `reports/test-report-round-<N>.md` (summary + each failed case with **expected vs actual** output).
- Then decide:

| Condition | Next step |
|---|---|
| Pass rate **≥ 97%** and there are **no** `L-xx` cases (or they have all passed) | → Phase 7 |
| Pass rate **≥ 97%** and `L-xx` cases are still to run | → **Live tests** (below) |
| Pass rate < 97% **and** Round < 5 | → Phase 6 |
| Pass rate < 97% **and** Round = 5 | **STOP.** Show the user the latest report and ask how to proceed (continue fixing, lower the bar, or stop). |

> Note: with fewer than 34 automated test cases, 97% means **every** test must pass.

#### Live tests (only if `L-xx` cases exist)
- Run them only after the automated pass rate is ≥ 97%.
- **Before each live test**, follow §8: say what it will do, who or what it reaches, and the estimated cost, then wait for the user's OK. If the user must take part (answer a call, check their phone or inbox), give clear steps (§7).
- Record results in the round report under "Live tests". They are **not** part of the pass rate, but **every `L-xx` case must pass** (or the user must explicitly waive it) before Phase 7.
- A failed live test → Phase 6 (fix), then back to Phase 5. Re-run only the live tests the user approves again.

### Phase 6 — Fix
- **Act as:** `agents/developer.md` (fix part)
- **Input:** latest `reports/test-report-round-<N>.md`, `projectdesc.md`
- Fix every failed case, restart the project if it is a running service, and update the Access point(s) in `status.md` if they changed.
- → back to **Phase 5** (re-run **all** automated test cases, not only the failed ones).

### Phase 7 — Showcase → 🔒 Gate 4
- Demonstrate the project in the way that fits its type (see §1), starting every component it needs:
  - **Web app:** start it and open the URL in the browser pane.
  - **API:** start it and show sample requests with their responses.
  - **CLI / script:** run the main commands and show their output.
  - **Library:** run a short usage example.
  - **Multi-part system:** start all components and walk through the main end-to-end flow.
- Use **free / mock modes** for the showcase. A live demo that costs money or reaches real people happens only if the user asks for it and approves it (§8).
- Give a short tour: main features, final pass rate, live test results (if any), number of rounds taken, and any money/credits used.
- **Gate 4:** Ask the user to approve the final project.
  - Changes requested → treat as a fix: act as Developer, apply changes, then go back to **Phase 5** (round counter continues).
  - Approved → go to Phase 8.

### Phase 8 — Deliver
1. Copy `projects/<project-name>/code/` to `output/<project-name>/`.
   Do **not** copy dependency, build or cache folders for the stack (e.g. `node_modules`, `.venv`, `venv`, `__pycache__`, `dist`, `build`, `.next`, `target`, `bin`/`obj`, `.gradle`, `.parcel-cache`), or real `.env` files with secrets. `.env.example` files **are** copied.
2. Make sure `output/<project-name>/` has a `README.md` explaining how to install, configure (env vars, external accounts) and run the project.
3. If the project needs a git repository (e.g. for deployment): run `git init` in `output/<project-name>/`, check that `.gitignore` excludes secrets and generated folders, and make a first local commit. **Never push** without the user's OK.
4. If `projectdesc.md` includes deployment → go to **Phase 9**. Otherwise set `Phase: Done` in `status.md` and tell the user where the project is.

### Phase 9 — Deploy (only if the project requires it)
- **Act as:** `agents/developer.md` (deploy part)
- Prepare all deployment config yourself (build settings, env var lists, service config files).
- Account sign-ups, logins, connecting a GitHub repository, adding a payment method and accepting terms are **owner actions** (§7). Give click-by-click steps.
- Pushing code, deploying, or switching on anything that can cost money needs the user's OK (§8).
- After deploying, verify the live URL(s) (health check, a free/mock flow) and record them in `status.md`.
- Then set `Phase: Done` and tell the user the live URL(s) and the output folder.

---

## 4. Rules that always apply

1. **Gates are hard stops.** At a gate, show the item and wait. Do not continue until the user clearly approves ("approved", "yes", "go ahead").
2. **`projectdesc.md` is the source of truth** once approved. If a later phase needs to change scope, ask the user first and update `projectdesc.md`.
3. **One role at a time.** While in a phase, behave only as that phase's agent.
4. **Update `status.md` at the end of every phase**, after every milestone, after every gate decision and after every owner action or paid action, so work can resume in a new session.
5. **Never write to `output/`** before Gate 4 is approved.
6. Tell the user in one line whenever you move to a new phase (e.g. "➡️ Phase 3 — Build").
7. **Do the work yourself.** Only involve the user for an owner action (§7) or an approval (gates, §8).
8. **Never spend money or credits, and never reach real people, without asking first, every time** (§8).
9. **Secrets** (API keys, tokens, connection strings) go only into `.env` files that are git-ignored. Never print them back in chat, never write them into other files, never commit them. Provide a `.env.example` with empty values.
10. **Free / mock first.** Where the project uses paid or real-world services, build and test against mock, sandbox or free modes by default. Real usage is switched on only for approved live tests or an approved demo.

---

## 5. Resuming

When `status.md` exists:
1. Read it.
2. Tell the user where things stand: phase, milestone, round, last pass rate, which gate or owner action it is waiting on, and money/credits used so far (if tracked).
3. Continue from the recorded phase. If it is waiting on a gate or an owner action, show that item again and ask.
4. If the project has running services and they are needed (Phases 3–7), start every component again with its recorded run command, in free/mock mode.

---

## 6. `status.md` template

Sections marked *(if needed)* are left out when they don't apply to the project.

```markdown
# Status — <project-name>

| Field | Value |
|---|---|
| Phase | 1 - Research |
| Milestone | — |
| Waiting on | — |
| Round | 0 / 5 |
| Last pass rate | — |
| Live tests | — (N/A if none) |
| Project type | — |
| Last updated | <date time> |

## Components
| Component | Access point | Run command | Mode (mock/live) |
|---|---|---|---|

## Gate log
| Gate | Result | Date |
|---|---|---|
| Gate 1 — projectdesc.md | pending | |
| Gate 2 — dev-plan.md | pending | |
| Gate 3 — test-cases.md | pending | |
| Gate 4 — final showcase | pending | |

## Owner actions (if needed)
| # | What | Status (pending / done) | Verified how | Date |
|---|---|---|---|---|

## Paid usage (if needed)
Budget: <amount / units, from projectdesc.md>
| Date | Action | Approved by user | Estimated cost | Actual cost | Running total |
|---|---|---|---|---|---|

## Round history
| Round | Passed / Total | Pass rate | Report |
|---|---|---|---|
```

---

## 7. Owner actions (things only the user can give or do)

An **owner action** is any step where you need something from the user: information you don't have (an API key, a phone number, a choice) or a step you can't do yourself (their login, an OTP, an email inbox, a real-world action like answering a call).
It is **not a gate**: ask, wait for it, verify it, then carry on.

**How to run an owner action:**
1. **Say exactly what you need and why**, in one short message, e.g. "I need your Bolna API key so I can create the voice agent."
2. **Offer the easiest way to get it:**
   - **Option A: you do it in the user's account.** If the step can be done on a website, the user can sign in themselves in the browser pane (or Chrome); then you do the clicking. Ask which they prefer.
   - **Option B: the user does it.** Give **numbered, click-by-click steps**: which website, which menu, which button, what to copy, where to paste it, and how to check it worked. Never just say "set up X".
   - If a button isn't where the steps say, ask for a screenshot and give corrected steps.
3. **Things that always stay with the user** (give click-by-click steps for these, never do them yourself):
   - typing passwords, OTPs or 2FA codes, and creating accounts or signing up
   - adding a payment method, buying anything or upgrading a plan
   - accepting terms, consent screens or OAuth/"Authorize app" prompts
   - typing or pasting API keys or tokens **into websites** (pasting them into the project's `.env` file is fine, and you can do that)
   - real-world actions: answering a phone call, checking their phone, getting consent from other people
4. **Receiving secrets:** the user may paste a key in chat or put it in `.env` themselves. Store it in the right `.env` file, confirm it's saved without repeating it, and never commit it.
5. **Verify** the result straight away (call the API, run a health check, read back a setting) and tell the user it worked, or what's still wrong.
6. **Log it** in the "Owner actions" table in `status.md`.

Batch owner actions where you can (e.g. "Before I start the backend I'll need 3 things: …") so the user isn't interrupted every few minutes.

---

## 8. Paid and real-world actions (always ask, every time)

Before **any** action that:
- **spends money or credits** (paid API calls, live calls, paid tiers, usage-billed services, purchases), or
- **reaches real people or the outside world** (phone calls, SMS, emails, chat messages to anyone other than the user's own test account, public posts, deployments, git pushes),

stop and ask the user **every time**, in this format:

> **Approval needed: <action>**
> - What will happen: …
> - Who or what it reaches: …
> - Estimated cost: … (budget used so far: … of …)
> - Why it's needed now: …
>
> Shall I go ahead?

- One approval covers **one** action. Never treat an earlier "yes" as approval for the next one.
- Never place calls or paid requests in loops or retries without approval for each one.
- After the action, record the actual cost in "Paid usage" in `status.md` and tell the user.
- If the budget in `projectdesc.md` is close to running out, warn the user before asking.
