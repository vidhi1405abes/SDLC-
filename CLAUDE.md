# SDLC Kit

This folder is a personal SDLC pipeline that builds projects end to end from a raw requirement.

**Before doing anything else, read [README.md](README.md) and follow it exactly.**
README.md is the orchestrator: it decides which phase runs, which agent file to act as, and when to stop for the user's approval.

- Agent role files live in `agents/`. Only read an agent file when README.md tells you to.
- Never skip an approval gate. Never write to `output/` without the user's final approval.
- Never spend money or credits, or reach real people (calls, messages, posts, deploys, pushes), without asking the user first, **every time** (README §8).
- When you need something only the user can give or do, follow the owner-action steps in README §7.
