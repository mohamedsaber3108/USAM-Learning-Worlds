# 29 — PROJECT SYSTEM

> Projects turn learning into created evidence (06 R8). Backend: `Project`,
> `ProjectMilestone`, `Rubric`, `RubricCriterion`, `ProjectCollaborator`, cross-
> domain project engine (`20260909_add_cross_domain_project_engine_v1.sql`).

Date: 2026-09-30

---

## 1. What a project is

A learner builds a real artifact (code app, story, AI creation, business pitch),
guided by milestones + a rubric, producing a portfolio artifact + `Evidence`
(type CREATION) that feeds mastery. Projects can be single-domain or cross-domain.

## 2. Lifecycle

`Brief → Workspace (milestones) → Create → Self-assess (rubric) → Mentor review
(Socratic, e.g. project-reviewer role) → Submit → Reflect → Portfolio artifact +
Evidence`. Milestones (`ProjectMilestone`) structure the work; rubrics
(`Rubric`/`RubricCriterion`) make quality explicit and self-assessable.

## 3. Per-domain projects

- English: a written/spoken piece, a story, a presentation.
- Coding: a working program/game (Pyodide/Sandpack).
- AI: an AI artifact (classifier demo, prompt-crafted creation) with reflection on
  limits/bias.
- Entrepreneurship: a product idea + prototype + pitch (the domain's heart, 28).

## 4. Evidence + mastery link

Project completion writes `Evidence` (CREATION/APPLICATION/TRANSFER) → updates
`MasteryRecord` for the targeted competencies → contributes to stage completion
(09 §3 requires ≥1 portfolio artifact). Rubric score = quality signal.

## 5. Collaboration (bounded)

`ProjectCollaborator` supports safe collaboration; subject to safety/moderation
(35) and age limits. Not multiplayer-realtime (out of scope first cut).

## 6. Status

Models + cross-domain engine EXIST + `seed-projects-rubrics.ts`. Frontend
projects/portfolio pages exist but MOCK-backed. Rebuild = wire real project
workspace + milestones + rubric + submit + reflection to the backend.
