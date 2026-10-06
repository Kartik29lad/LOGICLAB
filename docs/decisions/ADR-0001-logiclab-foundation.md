# ADR-0001 — LogicLab Foundation

- **Status:** Accepted
- **Phase:** 0 — Project Governance and Master Setup

## Decision

LogicLab is the project identity and **Explore. Visualize. Understand.** is the project tagline. MD-01 through MD-13 are treated as the approved specification baseline for implementation.

## Stack

Next.js, React, TypeScript, Next.js server/API layer, Microsoft SQL Server, repository-based static educational content, SVG/DOM-first visualization, automated testing, Git/GitHub, and optional Docker.

## Architecture Rules

- Core algorithm logic remains independent from UI.
- Educational content remains separate from UI and executable logic.
- Database access remains behind server-side abstractions.
- API routes remain thin composition layers.
- Source files have a maximum of 400 physical lines.
- Responsibilities must remain atomic and explicit.
