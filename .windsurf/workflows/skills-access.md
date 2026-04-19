---
description: Access .agent/skills on-demand when user references them
auto_execution_mode: 3
---

# Skills Access Workflow

## When User References a Skill

When user types `@skill-name`, I will:

1. **Check if skill exists:**
   - Look in `c:\Users\admin\Documents\.agent\skills\{skill-name}\`
   - Check for `SKILL.md` file

2. **Load the skill:**
   - Read `SKILL.md` content
   - Parse the instructions and examples
   - Apply the skill's methodology

3. **Execute with skill context:**
   - Follow the skill's specific instructions
   - Use the skill's patterns and best practices
   - Reference skill examples

## How to Use

Simply type `@skill-name` followed by your request:

```
@brainstorming help me design a new feature
@systematic-debugging fix this error
@nextjs-best-practices review my code
```

## Popular Skills Available

| Category | Skills |
|----------|--------|
| **Development** | `@nextjs-best-practices`, `@react-best-practices`, `@typescript-expert` |
| **Testing** | `@test-driven-development`, `@playwright-skill`, `@e2e-testing` |
| **Security** | `@security-audit`, `@ethical-hacking-methodology` |
| **Design** | `@frontend-design`, `@ui-ux-pro-max`, `@tailwind-patterns` |
| **Planning** | `@brainstorming`, `@writing-plans`, `@executing-plans` |
| **Database** | `@postgresql`, `@prisma-expert`, `@neon-postgres` |
| **DevOps** | `@docker-expert`, `@kubernetes-architect`, `@terraform-skill` |

## Example Usage

**User:** `@brainstorming design a student attendance module`

**My Action:**
1. Read `c:\Users\admin\Documents\.agent\skills\brainstorming\SKILL.md`
2. Follow brainstorming methodology
3. Output structured design plan

---

**Available Skills: 1000+ in `c:\Users\admin\Documents\.agent\skills\`**
