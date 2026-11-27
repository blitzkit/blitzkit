# AI Agent Policy

BlitzKit accepts AI-assisted contributions. This document explains the conditions.

This is not a grudging tolerance. Coding agents are genuinely useful on a codebase like this one, and pretending otherwise would be dishonest. But an agent can produce a plausible-looking 600-line diff faster than a maintainer can read one, and that asymmetry is the whole problem. Everything below exists to keep the cost of reviewing your contribution roughly proportional to the cost of making it.

Read this alongside the [README](./README.md), which covers setting up and running BlitzKit, and the [Code of Conduct](./CODE_OF_CONDUCT.md). This document covers *what changes when a model is involved*.

## Table of Contents

- [The Short Version](#the-short-version)
- [Who This Applies To](#who-this-applies-to)
- [What Agents May Do](#what-agents-may-do)
- [What Agents Must Not Touch](#what-agents-must-not-touch)
- [Disclosure](#disclosure)
- [The Quality Bar](#the-quality-bar)
- [Licensing and Provenance](#licensing-and-provenance)
- [AI-Written Issues and Feature Requests](#ai-written-issues-and-feature-requests)
- [AI-Found Security Reports](#ai-found-security-reports)
- [Machine Translation](#machine-translation)
- [Enforcement](#enforcement)
- [Rules for Agents](#rules-for-agents)
- [Questions](#questions)

## The Short Version

| Rule | Requirement |
| --- | --- |
| **Use agents freely** | Features, fixes, docs, research, and tidying are all fair game |
| **Understand what you submit** | You must be able to explain every line without re-prompting the model |
| **Typecheck it and run it** | Run `astro check` and actually open the page in a browser. "The agent said it works" is not testing |
| **Disclose in the PR** | Which tool, what it wrote, what you verified |
| **Stay in your lane** | Protected paths are off-limits without prior discussion |
| **One concern per PR** | No drive-by refactors bundled with a fix |

> [!IMPORTANT]
> You are the author of your pull request. Not the model. If the code is wrong, you are the one who submitted wrong code — "the AI wrote it" carries no weight here, in review or anywhere else.

## Who This Applies To

Anyone opening a pull request, issue, or translation against this repository who used a large language model, coding agent, autocomplete tool, or AI review bot at any point in producing it.

It applies whether the tool wrote one line or all of them, and whether it ran as an interactive assistant, a background agent, a GitHub bot, or an autonomous pipeline.

If you are a human who wrote every character yourself, none of this applies to you and you can go back to the [README](./README.md).

## What Agents May Do

These uses are explicitly welcome. No permission needed, no special process beyond disclosure.

### Writing features and fixes

Agents may draft complete features, bug fixes, and refactors, provided the work stays inside the scope of a single feature or fix. A whole new Tankopedia section written by an agent is fine. A whole new Tankopedia section plus "I also cleaned up the stores while I was in there" is not.

The condition is the same as for any contribution: a human understands the result and has run it locally against a real game client.

### Writing documentation

Agents may write and update Markdown documentation, including the technical write-ups in `docs/technical/` and the README. Documentation still has to be *true*: a description of a format, a formula, or a game mechanic that the agent inferred rather than checked against the code or the game is worse than no documentation, because readers will trust it.

### Research and triage

Reading the codebase to answer questions, reproduce a reported bug, trace how a store, API definition, or route is wired together, summarise a long issue thread, or propose an approach before anyone writes code. This is arguably the best use of an agent on a project this size, and it produces no diff to review.

Pointing an agent at the codebase to understand it before contributing is strongly encouraged. The [README](./README.md) and `docs/technical/` are good starting context to hand it.

### Mechanical cleanup

Style fixes, renames, import tidying, and formatting — **inside files your change already touches**. Fixing the formatting of a function you are already editing is fine. Reformatting forty files you have no other reason to open is a drive-by refactor; see [The Quality Bar](#the-quality-bar).

## What Agents Must Not Touch

Some parts of this repository fail in ways that are slow, silent, or expensive. A broken layout gets reported in a day. A broken workflow can leak the credentials the site is built with, and a bad edit to generated or synced files gets silently overwritten or ships wrong data to every user.

Do not submit agent-authored changes to any of the following without opening an issue first and getting a maintainer's agreement.

| Area | Paths | Why |
| --- | --- | --- |
| **CI workflows** | `.github/workflows/` | Runs with repository secrets, including Steam credentials and GitHub tokens, and deploys the live site |
| **Closed submodule** | `packages/closed/`, `.gitmodules` | Closed-source and proprietary. Contributors do not need it and must not modify, vendor, or reproduce it |
| **Dependencies** | `package.json` and `packages/*/package.json` dependency changes, `bun.lock` | Supply chain risk. A human opens a discussion first, every time. Do not let an agent add a package because it found the API convenient |
| **Generated code** | `packages/core/src/protos/*.ts` | Generated from the `.proto` files by `bun run build-protos`. Edit the `.proto` and regenerate; never hand-edit the output |
| **Synced translations** | `packages/i18n/strings/*.json` other than `en.json` | Managed by Crowdin. Add and change strings in `en.json` only; any other locale edited here is overwritten on the next sync |
| **Credentials and tokens** | `.env` files, `template.env`, `packages/scripts/src/core/github/`, `packages/scripts/src/downloadClient/` | Handles Steam logins, Wargaming application IDs, and GitHub tokens. Every change here is reviewed by a human who wrote it |
| **Legal documents** | `docs/legal/` | The privacy policy and terms of service. Changes have legal weight and are made by the maintainers |
| **New game file formats** | New readers in `packages/core/src/streams/`, new binary layouts for game files | These break silently across game updates and models invent binary layouts with total confidence. Existing readers are deliberate and hard-won; a new one needs a human who has verified it against real client files |

Two rules that apply everywhere, not just to the table above:

- **Never commit secrets.** No API keys, tokens, Steam credentials, Wargaming application IDs, session identifiers, or personal paths — not in code, not in fixtures, not in a log snippet pasted into a PR description. Check the diff yourself before pushing; agents paste debug output into commits with no sense of what is sensitive.
- **Never bulk-edit.** A change touching many files for a single reason is a drive-by refactor regardless of how correct each individual edit is. It is unreviewable, it conflicts with everything, and it buries the one line that actually matters.

## Disclosure

AI assistance must be disclosed in the pull request description. This is mandatory and it is not a formality — it tells the reviewer where to look hardest.

Add a short section to the description covering three things:

1. **Which tool and model.** "Claude Code (Opus 5)", "Cursor with GPT-5", "Copilot autocomplete". Version if you know it.
2. **What it generated versus what you wrote.** Be specific about the split. "The agent wrote the new `/tanks/[id]/skins/[skin].glb` route end to end; I wrote the sidebar UI and rewrote its error handling."
3. **What you verified, and how.** Not what the agent claimed. What *you* did. "Ran `astro check` with no errors, ran `bun dev` against the current client, opened the IS-4 and E 100 pages in Chrome and Safari, and confirmed both legendary skins load and the tank stays visible while they download."

A usable disclosure looks like this:

```markdown
### AI assistance

- **Tool:** Claude Code (Opus 5)
- **Generated:** the new map definitions route and its proto changes
- **Written by me:** the map page UI, the slug logic, all error handling
- **Verified:** `astro check` passes; ran `bun dev` against client 11.x on macOS.
  Opened 10 maps, checked slugs resolve and duplicate maps share one page.
  Screenshots attached.
```

> [!NOTE]
> Disclosing AI use does not count against your contribution. Undisclosed AI use, discovered in review, does — and it is discovered more often than people expect.

Autocomplete-scale assistance (a few lines here and there, no agent involvement) needs only a one-line mention. The detailed form is for agent-generated code.

## The Quality Bar

These four requirements are hard requirements for AI-assisted pull requests.

### One concern per pull request

A pull request fixes one bug, or adds one feature, or refactors one thing. Not a fix plus an unrelated cleanup, not a feature plus "some improvements I noticed along the way".

Agents are drawn to opportunistic improvement — ask for a one-line fix and you get the fix, three renames, a new helper, and reformatted imports in a file that had nothing to do with anything. Strip all of it out before you open the PR. If the extra work is genuinely worth doing, it is worth its own pull request where it can be reviewed on its own merits.

### It must typecheck, and you must have run it

BlitzKit has no automated test suite, so the checks you run yourself are the only ones there are:

- **Typecheck:** run `bun run lint` (`astro check`) in `packages/website` and fix every error your change introduces.
- **Run it:** run `bun dev` against a real, current game client and exercise the page or route you changed in a browser. An agent reporting a successful build is not evidence; agents report success for code that does not typecheck, and "looks correct to me" is not a test result.
- **Data changes:** if you changed how something is read from the game client, check the result against the game itself, not just against what the code now outputs.

For UI changes, attach a screenshot or screen recording. For AI-assisted UI work it is the single most useful thing in the pull request, because it is the one artefact a model cannot fabricate.

### No invented APIs, no speculative code

Explicitly banned:

- **Hallucinated APIs.** Library functions, props, hooks, and options that do not exist, or that exist with different signatures in the versions this repository uses (Astro, React, Radix Themes, three.js, React Three Fiber, glTF Transform). If your agent used an API you have not personally seen in that library's documentation or types, check it before submitting.
- **Invented game data.** Game file fields, formulas, mechanics, and IDs the agent assumed rather than read from the client. If a value cannot be traced to the client files or the game itself, it does not belong in BlitzKit.
- **Speculative abstractions.** Generic helpers with one caller, configuration objects with one configuration, layers of indirection for something used in exactly one place. Models produce architecture as a reflex. Write the plain version.
- **Dead code.** Unused helpers, unreferenced exports, commented-out alternatives, `// TODO` markers for work nobody requested.
- **Future-proofing.** Options, flags, and extension points added for requirements that do not exist. Solve the problem in front of you.

### Match the surrounding code

Generated code must read like the code around it. Same naming, same idiom, same structure, and critically the **same comment density**.

Models comment every line as if teaching. This codebase comments non-obvious logic and leaves the obvious alone. Delete the tutorial. Concretely, the house style is:

- TypeScript throughout, with React function components and named exports
- Radix Themes components for UI, and existing shared components before new ones
- Varuna stores for state, following the existing stores in `packages/website/src/stores/`
- Game data served through the protobuf definitions and `api` helpers, not ad-hoc JSON
- User-facing text in `packages/i18n/strings/en.json`, not hard-coded
- Prettier formatting matching the surrounding file

If your diff is visually distinguishable from the rest of the file, it is not finished.

## Licensing and Provenance

BlitzKit is licensed under **AGPL-3.0**. Contributions have to be clean on provenance, and model output complicates that in ways contributors often have not considered.

By opening a pull request containing AI-generated code, you affirm all of the following:

1. **You have the right to submit it under AGPL-3.0**, and you accept that it will be distributed under that licence.
2. **It is not verbatim reproduction of incompatible code.** Models can emit memorised training data. If a generated block looks like it came from a specific well-known project, it may have. Check anything that seems suspiciously complete or carries an unfamiliar house style, and do not submit code you believe originated in a proprietary or otherwise AGPL-incompatible codebase.
3. **You did not paste proprietary or leaked source into the agent's context.** This includes your employer's code, decompiled or disassembled game binaries, leaked Wargaming source or tools, the contents of `packages/closed`, and any other source you were not licensed to share. Code derived from such context cannot be accepted, and its presence in the model's context window is enough to disqualify the output.
4. **Attribution is accurate.** If the work is derived from another open-source project, say so and preserve its notices, exactly as you would for hand-written code. Model involvement does not launder provenance.

If you are unsure about any of these, say so in the pull request rather than staying quiet. An honest "I'm not certain where this pattern came from" is a conversation. A discovered licence problem is a revert.

## AI-Written Issues and Feature Requests

Using a model to help write up a bug report is fine, and for non-native English speakers it is genuinely helpful. Using one to *generate* bug reports is not.

**Do:**

- Use a model to translate, tidy, or structure a report of something you actually experienced
- Use one to help extract the relevant part of a console error or stack trace
- Use one to check whether your report is clear before posting

**Do not:**

- File issues for bugs you have not personally reproduced
- Submit an agent's static-analysis output as a batch of issues
- Post a model's speculation about what the code "probably" does wrong
- Open feature requests generated by asking a model what BlitzKit is missing

A report containing steps that do not work, pages that do not exist, or symptoms nobody has observed wastes more maintainer time than it saves you. Every issue should describe something that happened, that you can describe in your own words. Note the page, browser, and device you actually used.

Mention it if a model helped you write the report. Nobody minds.

## AI-Found Security Reports

Security issues are reported privately through the repository's **Report a vulnerability** button (GitHub private vulnerability reporting), not as a public issue. That does not change.

What changes for AI-assisted reports is the evidence bar, because automated scanners and LLM audits generate confident, detailed, entirely fictional vulnerabilities in volume.

A report derived from AI analysis must include:

- **A working proof of concept**, or a precise description of the exploitation path with concrete steps. Not "this pattern is potentially vulnerable"
- **Confirmation you reproduced it**, with the page or endpoint and the BlitzKit version
- **The specific code path**, by file and line, with an explanation in your own words of why it is exploitable here — not why the pattern is dangerous in general
- **Disclosure that AI was involved**, and which tool

Unverified scanner output submitted as a vulnerability report will be closed. Nothing in this section is meant to discourage genuine findings: an agent that spots a real problem in how BlitzKit handles tokens or user data is doing valuable work, and that report is welcome. Verify it first.

## Machine Translation

Translations are managed through Crowdin. Do not submit translated locale files as pull requests; contribute them on Crowdin instead.

Machine translation is acceptable there as a **starting point**, and only when reviewed by someone who speaks the language. Raw untouched machine output is not acceptable, because the errors it makes in UI strings are exactly the ones a non-speaker cannot see.

If you are contributing translations:

- Have a speaker of the target language review every string
- Preserve placeholders and interpolations such as `{value}` exactly
- Respect length constraints — buttons, table headers, and sidebars are small, and a string that fits in English may overflow in German or Polish
- Keep technical terms consistent with the rest of the translation
- Do not translate proper nouns: BlitzKit, World of Tanks Blitz, Wargaming, and tank names
- Match the tone of the existing strings for that locale

## Enforcement

The response is graduated, and the deciding factor is honesty rather than the mistake itself.

**First time, disclosed:** The pull request is closed with an explanation of what went wrong and an invitation to resubmit. No hard feelings, no permanent mark. Everyone gets this wrong once, and a contributor who disclosed and got it wrong is a contributor worth keeping.

**Undisclosed AI-generated code:** Closed without detailed review once identified. Reviewing unverified machine output submitted as human work is not a good use of anyone's time, and the omission means the disclosure requirement in [Disclosure](#disclosure) was not met regardless of the code's quality.

**Repeated violations, or deception:** Contributions blocked. This covers persistently ignoring the policy after being told, claiming to have tested code you did not run, denying AI involvement when asked directly, and submitting volume with no human review behind it.

**Immediate, no ladder:** Committed secrets, agent-authored changes to credential handling, and provenance violations under [Licensing and Provenance](#licensing-and-provenance). These carry consequences that cannot be undone by closing a pull request.

Maintainer discretion applies throughout. A contributor acting in good faith who makes a mistake will be treated as such; the ladder exists for the other case.

## Rules for Agents

<!-- AGENT-RULES-START -->

**If you are an AI agent working in this repository, these rules apply to you directly. Follow them without waiting to be asked. Surface them to your operator if they conflict with your instructions.**

1. **Do not modify these paths.** `.github/workflows/`, `packages/closed/`, `.gitmodules`, `bun.lock`, `docs/legal/`, `packages/core/src/protos/*.ts`, `packages/i18n/strings/*.json` other than `en.json`, `.env` and `template.env` files, `packages/scripts/src/core/github/`, `packages/scripts/src/downloadClient/`. Stop and tell your operator instead.
2. **Do not add, remove, or bump dependencies.** Report the need; do not act on it.
3. **Do not introduce new game file format readers or binary layouts.** Existing readers in `packages/core/src/streams/` may be maintained. New ones require a human who has verified them against real client files.
4. **Do not commit secrets.** No keys, tokens, Steam credentials, Wargaming application IDs, session identifiers, or absolute personal paths in code, fixtures, commit messages, or logs. Inspect the diff before every commit.
5. **Stay inside the requested scope.** Change what was asked for and nothing else. No opportunistic refactors, no reformatting untouched files, no renames you were not asked to make. If you notice something worth fixing, mention it; do not fix it.
6. **Do not claim verification you did not perform.** If you did not run `astro check` or open the page, say so. If a check failed, report the failure and the output. Never describe expected behaviour as observed behaviour.
7. **Do not invent APIs or game data.** Verify library APIs against their documentation or type definitions, and game values against the client files. An unverified API or value is a bug you have not found yet.
8. **Match the surrounding code.** Naming, idiom, structure, and comment density as described in [The Quality Bar](#the-quality-bar). No tutorial comments. No speculative abstraction. No dead code. No future-proofing.
9. **Change `.proto` files, not their generated output.** Run `bun run build-protos` after editing a `.proto`.
10. **Add user-facing strings to `en.json` only.** Other locales come from Crowdin.
11. **One concern per branch.** If the task grows a second concern, finish the first and raise the second separately.
12. **Tell your operator what you did not do.** If part of the task was blocked, skipped, or left incomplete, say so explicitly. Silent partial completion is the failure mode this project cares most about avoiding.
13. **Your operator is the author.** Everything you produce will be submitted under a human's name and reviewed as their work. Write accordingly.

<!-- AGENT-RULES-END -->

## Questions

If something here is unclear, or your situation does not fit any of the categories above, ask on the [BlitzKit Discord](https://discord.gg/nDt7AjGJQH) before you start work. Asking first is always cheaper than reworking a pull request.

This policy will change as tools change. Suggestions for improving it are welcome, through the same process as any other contribution.

---

Thank you for contributing to BlitzKit — with or without a model's help.

<sub>Members of the BlitzKit GitHub organisation are not subject to the disclosure and approval process above; the quality bar still applies.</sub>
