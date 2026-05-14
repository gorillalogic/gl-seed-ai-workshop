---
name: sprint
description: Run a sprint by invoking each phase's agent in order, recording progress to .phase, and applying stop_gate governance.
argument-hint: '<sprint-number>'
---

# Sprint Orchestrator

Runs sprint `${input:1}` by invoking each configured phase's agent in ascending phase-number order (1 → 2 → 3 → …). Progress is recorded in `docs/sprints/sprint-${input:1}/.phase` so the sprint can resume mid-flight and recognize when it's done.

## Phase configuration

    phases:
      1: { agent: po,         stop_gate: on_anomaly }
      2: { agent: architect,  stop_gate: on_anomaly }
      3: { agent: developer,  stop_gate: on_anomaly }
      4: { agent: tech-lead,  stop_gate: on_anomaly }


## Stop gates

- `always` — pause after the phase. Output `Phase N (<agent>) complete. Continue?` and wait for the user to say `continue`.
- `on_anomaly` — auto-continue if the phase finished cleanly (no errors, nothing appended to `questions.md`). Pause otherwise.
- `never` — auto-continue silently.

## Resume + completion

`.phase` records the last completed phase as a one-line breadcrumb:

    phase=<N> <ISO 8601 timestamp of when phase N finished>

Use it to decide where to start:

- **No `.phase` yet:** start at phase 1.
- **`.phase` below the highest configured phase:** resume from the next phase.
- **`.phase` already at the highest configured phase:** the sprint is done — output `✓ Sprint ${input:1} complete.` and stop. **Do not read any agent files.**

## Per phase

For each phase `<N>` to run (per the `phases:` config above):

1. Invoke phase `<N>`'s agent as a subagent. Pass sprint number `${input:1}`. Wait for completion.
2. Write `phase=<N> <ISO timestamp>` to `.phase`.
3. Output `✓ Phase <N> (<agent>) complete.`
4. Apply the configured `stop_gate`.

When every configured phase has run: output `✓ Sprint ${input:1} complete.`
