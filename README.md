# Wes on Ops

> Frameworks and working tools for building modern support organizations.

Opinionated, AI-first, and built from the field. Authored by a 
Director of Support who got tired of rebuilding the same models and 
decks at every company.

---

## Tools

### 🔍 SLA RCA Auditor
**An agentic workflow that translates raw tickets into audit-ready 
RCA documents.** Enforces data integrity and SOC2 compliance via a 
gatekeeping architecture.

Built for support orgs operating under SOC2 CC7 controls where every 
SLA breach triggers the same painful loop: pull ticket data, 
reconstruct timeline, draft RCA in audit-acceptable format, route 
for review. The Auditor automates the first three steps and routes 
a defensible draft to a human gate.

**Key design choice:** agentic, not single-shot LLM. RCAs need 
evidence chains. A gatekeeping architecture leaves an audit trail — 
which is the whole point in a SOC2 context.

![SLA RCA Auditor](./docs/rca-auditor.png)

➡️ [Tool details & architecture](./tools/sla-rca-auditor)

---

### 🧮 LLM ROI Modeler
**A CFO-grade strategy model for AI agent budgets.** Calculates 
support-op token economics, engine latency matrices, and escape 
hand-off taxes to build defensible deflection investment cases.

Vendor pitches give you deflection rate. Finance asks for cost per 
deflected ticket. Engineering asks which model. This modeler 
unifies all three views into a single decision artifact.

**What it models:**
- Token economics across GPT-4o, Claude Sonnet, Llama 3, and 
  self-hosted options
- Latency-vs-cost tradeoff matrices
- **Escape hand-off tax** — the hidden cost of failed deflections 
  that escalate angrier than they started
- Break-even deflection rate vs. fully-loaded agent cost
- Sensitivity analysis on volume and deflection-rate shifts

![LLM ROI Modeler](./docs/roi-modeler.png)

➡️ [Tool details & methodology](./tools/llm-roi-modeler)

---

## Frameworks

- **Tiered Support Models** — when Tier 1–3 works, when it doesn't
- **AI-First Support Workflows** — practical patterns for deflection, 
  summarization, and agent assist
- **Metrics That Matter** — moving past CSAT-only thinking

---

## Related Work

- **[cxdebt.com](https://cxdebt.com)** — flagship calculator for 
  quantifying CX debt. ([repo](https://github.com/wesleyshiCX/cxdebt))

---

## Status

Active. Tools are v0.1 — usable, opinionated, and improving.

## Author

Built by **[Wes Shi](https://github.com/wesleyshiCX)** — support 
leadership, AI-first ops. Currently exploring Director / Head of 
Support roles in SaaS, AI, and developer tooling.
