# AGENTS.md

> Read this file before every task. The global `engineering-standards` skill applies
> to all code. This file provides project-specific context that overrides or extends it.

---

## Project

```
name    : Inventory Management System
stack   : Laravel 10.x + React 18 + Inertia.js
arch    : Modular Layered Architecture (Controller -> Service -> Repository)
db      : MySQL 8.0 + Redis
```

## Active Stack Rules

```
stacks: [laravel, react]
```

## Folder Structure

```
app/
├── Enums/               # Backed Enums (PHP 8.1+)
├── Exceptions/          # Typed AppException hierarchy
├── Http/
│   ├── Controllers/     # Thin controllers (<150 lines, <30 lines/method)
│   ├── Requests/        # Form Requests boundary validation
│   └── Resources/       # Standard ApiResponse envelope
├── Models/              # Eloquent entities & relationships
├── Policies/            # Granular authorization policies
├── Repositories/        # Contracts & Eloquent data access layer
└── Services/            # Pure business logic & workflows
resources/js/
├── components/          # Reusable UI & Radix primitives
├── constants/           # Centralized tokens, strings & routes
├── layouts/             # Authenticated & guest layouts
└── pages/               # Atomic page components
```

## Error Code Registry

| Code               | Status | Meaning                           |
| ------------------ | ------ | --------------------------------- |
| `VALIDATION_ERROR` | 422    | Input validation failed           |
| `UNAUTHENTICATED`  | 401    | Missing or invalid token          |
| `UNAUTHORIZED`     | 403    | Insufficient permissions          |
| `NOT_FOUND`        | 404    | Resource does not exist           |
| `CONFLICT`         | 409    | Duplicate or constraint violation |
| `INTERNAL_ERROR`   | 500    | Unexpected failure                |

## Agent Constraints

Must:
- Propose approach before touching more than one file.
- Add new strings/colors to constants files before referencing them.
- Ask before installing a new dependency.

Must not:
- Create or rename folders without approval.
- Leave any TODO, placeholder, or debug output in final code.
- Write inline color values, string literals, or magic numbers.
- Exceed 150 lines per file or 30 lines per function.
