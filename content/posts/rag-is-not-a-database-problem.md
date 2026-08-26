---
title: "RAG Is Not a Database Problem"
description: "Teams reach for a vector database on day one and spend the next month discovering that retrieval quality was never about the store they picked."
category: Artificial Intelligence
tags: [rag, retrieval, llm, search, evaluation]
publishedAt: "2026-08-05T09:15:00+05:30"
updatedAt: "2026-08-22T14:40:00+05:30"
author: ketan
cornerstone: true
coverTone: primary
keyphrase: rag retrieval quality
tldr: "Most retrieval-augmented generation systems fail at chunking, query formulation and ranking, not at vector storage. The database is the most interchangeable component in the stack, which is why swapping it rarely fixes anything. Build an evaluation set first, then fix retrieval in the order that the failures actually occur."
keyTakeaways:
  - "Without a labelled evaluation set you cannot tell whether a change improved retrieval or merely changed it."
  - "Chunk boundaries decide what can be retrieved at all; no ranking model recovers a fact that was split across two chunks."
  - "The user's question and the answering passage rarely share vocabulary, which is why hybrid retrieval beats pure vector search on real corpora."
  - "Reranking a shortlist is usually the highest return per unit of work in the whole pipeline."
  - "Every retrieved chunk that is not relevant costs both money and accuracy; more context is not free."
faqs:
  - q: "Which vector database should I use?"
    a: "For most applications, whichever one your team already operates. Postgres with pgvector is sufficient well past the scale teams assume it is not. Choose a dedicated store when you have measured a specific limit you are hitting, not in anticipation of one."
  - q: "What chunk size works best?"
    a: "There is no universal answer, because the right unit is semantic rather than numeric. Split on document structure first, on headings and sections, then cap the resulting pieces by token count. A structural split at 800 tokens beats a fixed 512-token window in nearly every corpus."
  - q: "Do I still need keyword search if I have embeddings?"
    a: "Usually yes. Embeddings handle paraphrase and conceptual similarity; keyword search handles exact identifiers, error codes, product names and rare terms that embeddings blur. Fusing both is consistently stronger than either alone."
  - q: "How many chunks should I put in the prompt?"
    a: "Fewer than instinct suggests. Retrieve broadly, rerank hard, and pass three to five high-precision chunks. Long contexts degrade attention to the middle of the input and increase the chance the model grounds its answer in something irrelevant."
---

The first architecture diagram is always the same. Documents on the left, an arrow labelled "embed", a vector database in the middle, an arrow to an LLM on the right. The database gets a logo and a name. Everything else is an arrow.

Then retrieval quality is poor, and the team evaluates a different vector database.

## Start with the thing nobody wants to build

Before touching retrieval, build the evaluation set. Fifty to two hundred real questions, each paired with the passages that genuinely answer it.

This is tedious, requires domain knowledge, and produces no demo. It is also the only thing that makes every subsequent decision measurable rather than aesthetic.

:::callout The test for whether you need this
If you cannot answer "did that change help?" with a number, you are tuning by vibe. Every RAG system that stalls for a month is stalled here.
:::

Track two things at minimum:

- **Recall@k** — of the passages that should have been found, how many appeared in the top k?
- **Precision@k** — of the k passages retrieved, how many were actually relevant?

Recall is the ceiling. If the right passage is not in the retrieved set, no amount of prompting produces a correct grounded answer. Fix recall before anything downstream.

## Failure 1: chunking destroys the answer before retrieval starts

Fixed-size chunking is the default because it is easy, and it is the most damaging default in the pipeline.

Split a document every 512 tokens and you will, reliably, cut a table from its header, separate a definition from the term it defines, and place a procedure's step 4 in a different chunk from steps 1 to 3. The information still exists in your corpus. It is no longer retrievable as an answer.

Split on structure instead:

```python
# Structure first, size second.
sections = split_on_headings(document)      # h1/h2/h3 boundaries

chunks = []
for section in sections:
    if token_count(section) <= MAX_TOKENS:
        chunks.append(section)
    else:
        # Only now fall back to size, and split on paragraphs, never mid-sentence.
        chunks.extend(split_paragraphs(section, MAX_TOKENS, overlap=OVERLAP))
```

Two additions repay themselves immediately. Prepend the document title and heading path to each chunk, so an orphaned section still carries its context. And keep tables intact even when they exceed the cap, because a truncated table is worse than a long one.

## Failure 2: the question does not look like the answer

A user asks "why is my deploy stuck?". The document that answers it says "pipeline jobs remain in a pending state when no runner matches the job's tag set."

No shared vocabulary. Embeddings help here — this is exactly what they are for — but they also blur precisely the tokens that matter most in technical corpora: version numbers, error codes, product names, flags.

| Query type | Vector search | Keyword search |
|---|---|---|
| Paraphrased concept | Strong | Weak |
| Exact error code | Weak | Strong |
| Rare product name | Weak | Strong |
| Long natural question | Strong | Moderate |
| Two-word lookup | Moderate | Strong |

Neither column wins. Run both and fuse the rankings — reciprocal rank fusion is about fifteen lines of code and needs no tuning:

```python
def rrf(rankings, k=60):
    scores = {}
    for ranking in rankings:              # one list per retriever
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)
```

Query rewriting is the other half of this failure. Expanding a terse query into two or three explicit reformulations before retrieval costs one small model call and consistently lifts recall on conversational inputs.

## Failure 3: no reranking

Embedding search is fast and approximate. It compares two vectors computed independently, which means it never actually looks at the query and the document together.

A cross-encoder does. It is far too slow to run across a corpus and entirely practical across fifty candidates.

:::stat 50 → 5 | Retrieve broadly, rerank hard, and pass only what survives

The pattern is: retrieve 50 by hybrid search, rerank all 50 with a cross-encoder, pass the top 5. In most systems this is the single highest-value change available, and it is roughly an afternoon of work.

## Failure 4: stuffing the context window

Long context windows made it tempting to skip precision entirely. Pass twenty chunks, let the model sort it out.

It does not sort it out. Retrieval quality degrades measurably when relevant content sits in the middle of a long input, and every irrelevant chunk is another opportunity to ground an answer in the wrong place. It is also directly billed.

> Context is not free storage. It is the model's working attention, and it is finite in a way the token limit does not describe.

---

## The order to fix things in

- [x] Build an evaluation set of real questions with labelled answer passages
- [x] Fix chunking so complete answers survive as retrievable units
- [x] Add keyword retrieval alongside vector retrieval and fuse the results
- [ ] Add a cross-encoder reranker over the shortlist
- [ ] Add query rewriting for conversational inputs
- [ ] Tune how many chunks reach the prompt, downward
- [ ] Only now, consider whether the store itself is a constraint

That last line is where most teams start. By the time you honestly reach it, you will have a benchmark that tells you whether the answer is yes, and in most systems it will not be.
