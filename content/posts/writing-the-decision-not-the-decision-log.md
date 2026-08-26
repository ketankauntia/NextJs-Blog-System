---
title: "Write Down the Decision, Not the Meeting"
description: "Most team documentation records what was discussed. The thing that turns out to be valuable a year later is why the alternatives were rejected."
category: Product
tags: [documentation, decision records, teams, writing]
publishedAt: "2026-04-30T09:00:00+05:30"
updatedAt: "2026-07-11T16:20:00+05:30"
author: ketan
coverTone: chart-2
keyphrase: architecture decision records
tldr: "Meeting notes record what was said; decision records capture what was chosen and why the alternatives were not. The second survives contact with the future, because the question people ask a year later is never what was discussed, it is whether the reasoning still holds. A useful record fits on one page and is written before the decision is executed."
keyTakeaways:
  - "The valuable half of a decision record is the alternatives you rejected and the reason each was rejected."
  - "Write the record while the decision is still contested, since once it is implemented the reasoning is quietly rewritten as obvious."
  - "Record the constraints that were true at the time, because those are what expire and trigger a revisit."
  - "Records should be immutable; superseding a decision means writing a new record that links back, not editing the old one."
  - "A record nobody can find is not a record, so store them in the repository next to the code they explain."
faqs:
  - q: "How is this different from meeting notes?"
    a: "Meeting notes are chronological and record what happened. A decision record is structured and records what was concluded and why. The first answers 'what did we talk about', the second answers 'why is the system like this', which is the question that actually gets asked later."
  - q: "How long should a decision record be?"
    a: "One page. If it runs longer, either the decision is really several decisions that should be separated, or the context section has become a design document that belongs elsewhere and can be linked."
  - q: "What if the decision turns out to be wrong?"
    a: "Write a new record that supersedes it and explains what changed. Do not edit or delete the original. The trail of a reversed decision, with its original reasoning intact, is among the most useful things a team can leave behind."
  - q: "Do small teams need this?"
    a: "Small teams need it most, because they have the least redundancy in who remembers things. A two-person team where one person leaves loses half its institutional memory at once."
---

Open the wiki of any team more than two years old and you will find hundreds of pages of meeting notes. Attendees, agenda, discussion, action items. Faithfully recorded and almost never read.

Now try to answer a question that comes up constantly: *why does the payment service talk to the ledger over a queue instead of directly?*

The notes will not tell you. Somewhere in there is a meeting where it was decided, and the notes will say "discussed queue vs. direct integration" and then list an action item. The reasoning is gone.

## What a decision record captures that notes do not

A decision record is not a summary of a conversation. It has a fixed shape, and each part exists because a specific future question needs it.

| Section | The question it answers later |
|---|---|
| Context | What was true at the time? |
| Decision | What did we actually choose? |
| Alternatives | What else did we look at, and why not? |
| Consequences | What did we accept as the cost? |
| Status | Is this still in force? |

The third row carries most of the value and is the one most often left out. A record saying "we chose a queue" tells you nothing you cannot read from the code. A record saying "we chose a queue because direct calls would have coupled deployment schedules across two teams, and we rejected the shared database option because the ledger's compliance requirements would have propagated to the payment service" tells you when it is safe to revisit.

:::callout The test for a good record
Hand it to someone who joined last month and ask them to argue the opposite side. If they cannot, the alternatives section is too thin.
:::

## Write it before you build, not after

There is a strong pull toward writing these afterwards, when the decision is settled and the writing is easy. That is exactly what makes the result worthless.

Once a decision is implemented, it acquires an air of inevitability. The alternatives that were genuinely competitive at the time get remembered as obviously worse. What you write down is not the reasoning, it is a justification, and justification is what makes future readers assume the question was never close.

> Write the record while you can still feel the pull of the option you did not take. That tension is the information.

There is a second benefit, which several teams have described to me independently. Writing the alternatives section honestly, before committing, sometimes changes the decision. It is difficult to write "we rejected X because it felt heavier" and leave it there.

## The template, and it is short

```markdown
# ADR-0014: Queue-based integration between payments and ledger

Status: Accepted
Date: 2026-04-28
Deciders: payments team, platform team

## Context
Payments must record every settled transaction in the ledger. The ledger is
owned by another team, is subject to audit requirements we are not in scope
for, and deploys on its own weekly cadence.

## Decision
Payments publishes settlement events to a durable queue. The ledger consumes
them asynchronously and owns its own retry and reconciliation.

## Alternatives considered
- **Direct synchronous call.** Rejected: couples our availability and deploy
  schedule to a team with a different release cadence.
- **Shared database table.** Rejected: the ledger's audit scope would extend
  to any service writing to its schema.
- **Nightly batch file.** Rejected: settlement visibility of up to 24 hours
  fails the support team's stated requirement of under 5 minutes.

## Consequences
- Settlement is eventually consistent; the UI must show a pending state.
- We own a queue, including its monitoring and dead-letter handling.
- Either team can deploy without coordinating with the other.
```

Numbered sequentially, one file per decision, stored in `docs/decisions/` in the repository the decision affects. Not in a wiki, where it will drift away from the code and out of anyone's search path.

## Which decisions are worth recording

Not all of them. A record for every choice produces a directory nobody reads, which is the same failure as the meeting notes in a different format.

- [x] The decision is expensive or slow to reverse
- [x] A reasonable engineer would have chosen differently
- [x] It constrains work that other people will do
- [ ] Someone will ask "why is it like this" within two years
- [ ] The reasoning depends on constraints that might expire

That last criterion is the most useful and the least obvious. A decision made because of a constraint — a vendor contract, a team boundary, a compliance scope, a deadline — should say so explicitly, because when the constraint lifts, the record becomes a to-do item rather than a historical note.

## Never edit, always supersede

When a decision changes, write a new record. Set the old one's status to `Superseded by ADR-0031` and leave everything else untouched.

The temptation to tidy up is strong and should be resisted. The most instructive document a team can own is a decision that was later reversed, with the original reasoning intact and a second record explaining what changed. That pair teaches something no correctly-decided record can: what the team could not see at the time, and what made it visible later.

---

## What this replaces

Not documentation. Decision records sit alongside your architecture docs and your runbooks; they answer a different question and do not substitute for either.

What they replace is the specific ritual of writing down what was said in a meeting, which consumes real time and produces an artifact whose main function is to prove the meeting happened.
