# Contributing

Thanks for looking. This is a small project, so the process is short.

## Before you open a pull request

```bash
npm run validate
```

That runs lint, type-check, the content audit and a production build. All four have to pass.

## What is likely to be merged

- Bug fixes, with a note on how to reproduce the bug.
- Accessibility and SEO corrections, with the specific rule or checker output that flagged it.
- Parser support for a block type that markdown already has a natural syntax for.
- Documentation that corrects something wrong, rather than restating something already covered.

## What is unlikely to be merged

- A dependency added to do something the standard library or twenty lines can already do.
- A second way to configure something that `lib/site.ts` or `lib/features.ts` already covers.
- A CMS integration. The premise of this project is that the repository is the CMS; a fork is the right place for a different premise.
- Formatting-only changes across files you are not otherwise touching.

## Conventions

Commit subjects use conventional-commit prefixes (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`). Write the body as plain bullets explaining why, not what — the diff already says what.

Match the surrounding code. Comments explain the reason a thing is done, not the mechanics of doing it; if a comment restates the line below it, delete one of them.

New content must pass `npm run audit:content`. New components go under `components/blog/` if the public site renders them and `components/blog-ui/` if they are primitives.

## Reporting a security issue

Open a private security advisory on the repository rather than a public issue.
