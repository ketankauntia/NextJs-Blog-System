---
title: "Why Your Database Index Is Not Being Used"
description: "A working guide to the reasons Postgres ignores an index you were sure it would use, and how to read the plan instead of guessing at it."
category: Engineering
tags: [databases, postgres, performance, sql]
publishedAt: "2026-08-18T09:00:00+05:30"
updatedAt: "2026-08-24T11:20:00+05:30"
author: ketan
featured: true
cornerstone: true
coverTone: primary
keyphrase: database index not used
tldr: "Postgres skips an index when it estimates that reading the table directly will cost less, when the query shape does not match the index's leading columns, or when a function or type cast on the indexed column makes the index inapplicable. Read EXPLAIN ANALYZE and compare estimated rows against actual rows before changing anything."
keyTakeaways:
  - "An unused index is usually a correct decision made on bad statistics, not a planner bug."
  - "A composite index is only usable from its leading column onward, so column order decides which queries it serves."
  - "Wrapping an indexed column in a function or an implicit cast disables the index unless a matching expression index exists."
  - "A large row estimate makes a sequential scan cheaper than random index lookups; on small tables that is often the right call."
  - "Compare the estimated and actual row counts in EXPLAIN ANALYZE first, because everything else follows from that gap."
faqs:
  - q: "How do I confirm an index is actually unused?"
    a: "Query pg_stat_user_indexes for idx_scan. An index with zero scans since the last statistics reset has never been chosen. Reset the counters with pg_stat_reset() and check again after a representative traffic window, not after a single test query."
  - q: "Does adding more indexes make reads faster?"
    a: "Only for the queries they match. Each index adds write cost on every insert, update and delete, and enlarges the set of plans the planner must consider. Indexes that duplicate another index's leading columns usually cost more than they return."
  - q: "Why does the index work in production but not on my laptop?"
    a: "Two reasons dominate: table size and statistics freshness. On a table of a few hundred rows a sequential scan genuinely is faster, so the planner is right to skip the index. Run ANALYZE and test against a realistically sized dataset."
  - q: "Should I use index hints to force the choice?"
    a: "Postgres deliberately has no hint syntax. Setting enable_seqscan to off is a diagnostic tool, not a fix: if disabling sequential scans makes the query fast, you have learned that the cost model is wrong, and the repair is better statistics or a better index."
---

You add the index. You rerun the query. Nothing changes. The plan still says `Seq Scan`, and the natural conclusion is that the planner has made a mistake.

It almost never has. The planner is a cost model, and a cost model that refuses an index is telling you something specific about your data. This is a guide to reading what it is telling you.

:::callout Read the plan first
Every fix below depends on knowing which of the four causes you have. Running `EXPLAIN (ANALYZE, BUFFERS)` answers that in one command. Guessing does not.
:::

## The four reasons an index goes unused

There are more than four, but these cover the overwhelming majority of real cases.

| Cause | Signal in the plan | Typical fix |
|---|---|---|
| Row estimate too high | `rows=` far above actual | `ANALYZE`, raise the statistics target |
| Wrong leading column | The index never appears | Reorder the composite index |
| Function or cast on the column | `Filter:` shows a function call | Expression index, or fix the type |
| Table too small | Total cost under a few hundred | Nothing, the planner is right |

The rest of this article works through each one.

## Cause 1: the row estimate is wrong

Postgres decides between a sequential scan and an index scan by estimating how many rows the query will return. Index scans read the index, then jump to the heap for each match. Those jumps are random reads. Past roughly five to ten percent of the table, reading everything in order wins.

So when the estimate is badly too high, the planner correctly chooses a sequential scan for a query that actually returns four rows.

:::stat 5-10% | The selectivity range where an index scan usually stops paying off

Compare the two numbers in the plan output:

```text
Seq Scan on orders  (cost=0.00..18334.00 rows=98214 width=64)
                    (actual time=0.021..142.883 rows=37 loops=1)
```

An estimate of 98,214 against an actual of 37 is the whole story. The planner did not have the information it needed.

The usual causes are stale statistics after a bulk load, or a column whose distribution is more skewed than the default sample can capture.

```sql
ANALYZE orders;

-- For a skewed column, sample it harder.
ALTER TABLE orders ALTER COLUMN status SET STATISTICS 1000;
ANALYZE orders;
```

Correlated columns are the harder version of this. Postgres assumes independence, so a filter on `city = 'Pune' AND state = 'Maharashtra'` has its selectivity multiplied out to something implausibly small. Extended statistics fix that:

```sql
CREATE STATISTICS orders_city_state (dependencies)
  ON city, state FROM orders;
ANALYZE orders;
```

## Cause 2: the leading column does not match

A composite index on `(tenant_id, created_at, status)` is a sorted structure. It can serve a query filtering on `tenant_id`, or on `tenant_id` and `created_at`, or on all three. It cannot efficiently serve a query filtering only on `status`, for the same reason a phone book sorted by surname cannot help you find everyone named Priya.

This is the rule worth memorising: **an index is usable from its leading column onward, without gaps.**

Which makes index column order a design decision rather than an implementation detail. The ordering that works:

1. Columns used with equality predicates, most selective first.
2. Columns used with range predicates such as greater-than, less-than or `BETWEEN`.
3. Columns used only for `ORDER BY`.
4. Columns that are merely selected, if you want an index-only scan.

Range predicates go after equality predicates because a range stops the index from narrowing further. Everything to its right is scanned rather than sought.

## Cause 3: a function or a cast hides the column

An index stores the values of an expression. `CREATE INDEX ON users (email)` stores emails. It knows nothing about `lower(email)`, so this query cannot use it:

```sql
SELECT * FROM users WHERE lower(email) = 'ketan@example.com';
```

Either index the expression you actually query:

```sql
CREATE INDEX users_email_lower_idx ON users (lower(email));
```

Or, better, fix the underlying type so the function is unnecessary. A `citext` column, or a normalising constraint applied on write, removes the problem instead of indexing around it.

Implicit casts are the version of this that is easy to miss, because nothing in the query text looks like a function call. Comparing a `timestamptz` column to a `date`, or a `bigint` column against a value the driver sent as text, both introduce a cast the index cannot see through. The plan gives it away in the `Filter:` line.

> The query you wrote and the query the planner sees are not always the same query. The plan is the only account of the difference that can be trusted.

## Cause 4: the table is small

On a table of eight hundred rows, the entire heap is a handful of pages, all of them already in the buffer cache. A sequential scan reads them in order and finishes. An index scan reads the index pages first, then jumps back to the heap. It is more work.

The planner is right, and the correct response is to leave it alone. This is also why an index that goes unused on a development laptop works perfectly in production: the two tables are not the same size, and the right plan genuinely differs.

To prove that is what is happening, disable sequential scans for one session and compare:

```sql
SET enable_seqscan = off;
EXPLAIN ANALYZE SELECT ...;
RESET enable_seqscan;
```

If the forced index plan reports a higher cost and a slower actual time, there is nothing to fix.

---

## A checklist before you add another index

Adding an index is the most common response to a slow query and one of the least often justified. Work down this list first.

- [x] Run `EXPLAIN (ANALYZE, BUFFERS)` and compare estimated rows to actual rows
- [x] Run `ANALYZE` on the table and re-check
- [ ] Confirm the query's filter matches the index's leading columns
- [ ] Check the `Filter:` line for a function call or a cast you did not write
- [ ] Check `pg_stat_user_indexes` for an index that already covers this query
- [ ] Confirm the table is large enough for an index scan to pay off
- [ ] Only then design the index, and decide its column order deliberately

Most slow queries that arrive at my desk are fixed by the second line. The rest are almost always the third.

## What to measure afterwards

An index that helps one query and slows every write to the table is not obviously a win. After adding one, watch three numbers: the `idx_scan` count for the new index, the write latency on the table, and total index size against table size. If `idx_scan` stays at zero after a full traffic cycle, the index was never the answer, and dropping it is not a retreat.
