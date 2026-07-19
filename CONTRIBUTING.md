# Contributing to Agent.md

Thanks for your interest in contributing to **Agent.md**! 

Agent.md is the open registry for AI engineering presets. Our goal is to collect, curate, and version production-ready standards for models like Claude, DeepSeek, Gemini, and GPT so engineers don't have to rewrite context prompts from scratch.

## How to Contribute

We welcome contributions across several areas:

### 1. Propose a New Preset
Have you engineered a bulletproof system prompt for a specific framework (e.g., Next.js SaaS, Rust Backend, Solidy Smart Contracts) or design style (e.g., Apple-inspired, Linear-inspired)? 
- Open an issue titled `[Preset Proposal] Name of Preset` to discuss it with the maintainers.
- Provide a summary of the preset, the target model, and the problems it solves.

### 2. Improve an Existing Preset
If an existing preset is outputting deprecated code, hallucinating, or ignoring design guidelines:
1. Open an issue describing the flaw and how it can be improved.
2. Fork the repository and locate the preset markdown file.
3. Update the rules, prompt structure, or negative constraints to fix the behavior.
4. Submit a Pull Request with a before/after example of the AI's output using the old vs. new preset.

### 3. Core Platform (Web UI & Backend)
If you want to contribute to the Agent.md web platform itself (the catalog, search functionality, or CLI):
- Check the issue tracker for `good first issue` or `help wanted` tags.
- Open an issue before tackling major architectural changes to ensure alignment with our `ARCHITECTURE.md` and `SPECIFICATION.md`.
- Follow the existing codebase style (Next.js App Router, Tailwind v4, Shadcn/ui).

## General Guidelines

- **Open an issue first:** Before writing significant code or large preset files, please open an issue to discuss your approach.
- **Test your presets:** Do not submit a preset unless you have rigorously tested it with the target model and it produces consistent, production-grade output.
- **Keep it professional:** Presets should use clear, authoritative language aimed at AI models, avoiding fluff.

## License

By contributing, you agree that your contributions are provided under the repository's MIT license terms.
