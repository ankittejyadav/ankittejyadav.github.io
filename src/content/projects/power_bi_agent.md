---
tagline: "An autonomous AI agentic pipeline that translates natural language into optimized DAX queries, orchestrates Power BI REST APIs, and synthesizes enterprise business intelligence."
role: "Principal AI & Data Engineer / Solo Architect"
status: "production-ready"
stack: ""
highlights: ""
description: "A production-grade, highly secure Python agent designed to bridge the gap between natural language and enterprise business intelligence. This system securely authenticates with Azure Active Directory, dynamically inspects Power BI semantic models, generates syntactically correct DAX queries, and executes them with built-in self-healing and validation loops."
pushedAt: "2026-05-26T11:49:47Z"
---

## 🌟 Architectural Vision & System Design

The `power_bi_agent` is designed as a **Modular Agentic Monolith** that decouples the LLM reasoning engine from the execution environment. This separation of concerns ensures that changes to the underlying LLM provider or the Power BI API schemas do not disrupt the core business logic.

```
[ User Query ] ──> [ Agentic Orchestrator (LangGraph) ] ──> [ Semantic Router ]
                                                                   │
                                                                   ▼
[ Power BI API ] <── [ Execution & Validation Engine ] <── [ Schema Cache (Redis) ]
```

### Core Data & System Flow
*   **Ingestion / Input**: Natural language questions enter the system via a structured API gateway. Inputs are validated using strict Pydantic schemas to prevent prompt injection and ensure type safety.
*   **Processing / Logic**: The core engine utilizes a **Reasoning and Acting (ReAct)** loop. When a query is received, the agent:
    1. Retrieves the relevant semantic model schema from the cache.
    2. Prunes the schema to fit within the LLM's optimal context window.
    3. Generates a candidate DAX (Data Analysis Expressions) query.
    4. Runs the query through a local dry-run parser to validate syntax.
*   **Persistence & Caching**: To avoid hitting Power BI REST API rate limits, semantic model metadata (tables, columns, measures, and relationships) is cached in Redis with a configurable Time-To-Live (TTL).

---

## 💻 Tech Stack & Engineering Decisions

Every technology in this stack was selected to balance developer velocity, runtime