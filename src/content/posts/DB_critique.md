---
title: "Database Design Critique"
date: "2026-05-14"
excerpt: "A critique of database design choices for scalable applications."
tags: ["Database", "Architecture", "Supabase", "SQL"]
---

# Database Critique

Model -ChatGPT Codex 5.5 xHigh
Good-
Separate table for each domain no single giant JSON blob
uuid PK for user owned records with supabse or client generated workflows
Some normalization well done
Using jsonb only where shape is genuinely flexible
tracked created and updated timestamps 

Bad-
Missing relational integrity, all domain tables should have FK for the id columns to avoid orphaned rows
id fields shouldnt be nullable
contranints for date and other columns to avoid impossible data
creds should be isolated, restricted, encrypted and not accessible from querying
auth.users in supabase by default user generated table is duplication