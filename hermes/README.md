# Hermes Agent Templates

This directory contains [Hermes Agent](https://hermes-agent.nousresearch.com/docs) compatible versions of the Pinata/OpenClaw agent templates.

## What are Hermes Skills?

Hermes skills are reusable procedural memory files (markdown with YAML frontmatter) that tell the Hermes Agent how to perform a specific workflow or adopt a specific persona. They live in `~/.hermes/skills/` or can be loaded from a repository path.

## Layout

Each agent template has its own folder under `hermes/<category>/<template-name>/`:

- `SKILL.md` — Hermes procedural skill (persona, workflows, pitfalls)
- `manifest.json` — Pinata marketplace metadata with `"platform": "hermes"` and `authorUrl` pointing at this Hermes path
- `references/` — optional API/contract detail docs

Templates:

- `creative-ai-digital-twin/` — full-featured Creative AI digital twin for Creative TV / Livepeer ecosystems, plus Creative Pixels MCP video create/edit/render when connected.
- `creative-ai-digital-twin-lite/` — lighter digital twin focused on YouTube/Twitch creators, plus the same Creative Pixels MCP video workflows.

## Loading a skill in Hermes

From a Hermes session, copy or symlink the skill directory into `~/.hermes/skills/<category>/`, then reference it by name in prompts or `metadata.hermes.related_skills`.

Example:

```bash
mkdir -p ~/.hermes/skills/interaction-and-interfaces
cp -r hermes/interaction-and-interfaces/creative-ai-digital-twin ~/.hermes/skills/interaction-and-interfaces/
```

Then in Hermes:

> "Load the creative-ai-digital-twin skill and run an alignment round."

## Relationship to OpenClaw templates

The `openclaw/` tree contains the original containerized agent templates with runnable skill scripts. The `hermes/` tree contains the same conceptual agent as Hermes skills — procedural instructions for a Hermes Agent runtime rather than isolated container code. Where a workflow requires external APIs or on-chain transactions, the Hermes skill references the same environment variables, endpoints, and contract addresses as the OpenClaw template.

## Converting more templates

To port another OpenClaw template:

1. Read its `workspace/SOUL.md`, `workspace/AGENTS.md`, `workspace/BOOTSTRAP.md`, and `workspace/TOOLS.md`.
2. Extract the persona, operational modes, and workflow triggers.
3. Write a Hermes `SKILL.md` with `Overview`, `When to Use`, ordered workflow steps, and `Common Pitfalls`.
4. Add a `manifest.json` with `"platform": "hermes"`, secrets from the skill's Required Environment, and `authorUrl` pointing at the Hermes template path (not OpenClaw).
5. Move bulky API details into `references/*.md` and link them from the main skill.
6. Validate frontmatter and commit.
