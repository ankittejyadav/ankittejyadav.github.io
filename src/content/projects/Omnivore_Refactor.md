---
tagline: "An autonomous, fault-tolerant data synchronization engine bridging Home Performance Contractor (HPC) datasets with Salesforce CRM."
role: "Principal Software Architect / Lead Engineer"
status: "production"
stack: ""
highlights: ""
description: "A highly optimized, autonomous synchronization engine engineered to reconcile heterogeneous Home Performance Contractor (HPC) energy data with Salesforce. This refactored system replaces fragile legacy scripts with a robust, test-driven, and fault-tolerant pipeline designed for high data integrity and strict API governance."
pushedAt: "2026-05-26T11:49:07Z"
---

## 🌟 Architectural Vision & System Design

The `Omnivore_Refactor` system is designed as a highly reliable, decoupled ETL (Extract, Transform, Load) pipeline. The primary architectural goal was to transition a legacy, fragile synchronization script into an enterprise-grade, autonomous integration service. The system operates on a modular pipeline architecture, separating data extraction from business logic and CRM mutation boundaries.

```
[ HPC Data Sources ] ──> [ Ingestion & Extraction ]
                                 │
                                 ▼
                         [ Pydantic Validation ] ──(Schema Drift Alert)──> [ Dead-Letter Queue ]
                                 │
                                 ▼
                         [ Transformation Layer ]
                                 │
                                 ▼
                         [ Batching & Upsert Engine ] ──> [ Salesforce API ]
```

### Core Data & System Flow
*   **Ingestion / Input**: The system ingests heterogeneous energy efficiency and audit datasets from various Home Performance Contractors (HPCs). Data sources are abstracted behind a unified ingestion interface, allowing the system to process flat files, API payloads, or database exports seamlessly.
*   **Processing / Logic**: Once ingested, raw payloads are passed through a strict validation pipeline. Business logic maps contractor-specific terminologies and metrics to standardized internal data models. The system