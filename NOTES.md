# Decisions behind the radar

Short notes on the choices that are not obvious from the code, kept so a reader can disagree with a
reason rather than guess at one.

## One run, one set of files

The pipeline writes the board, the data file, the dashboard copy, the dossier and the screenshots in a
single pass. Nothing downstream reformats those files. A screenshot therefore always shows the run that
produced `board.json`, and the dossier describes the same rows. The alternative, a dashboard that
recomputes values in the browser, invites the one failure that matters most here: a picture that looks
right while the data underneath says something else.

## The page does no modelling

The page sorts, filters and draws. It never derives a value, and it never derives a farm step. Both come
from the board, which came from the model. This keeps one implementation of the arithmetic in the
repository instead of two that must be kept in step by hand.

That decision has a cost: the page cannot show a live preview of a hypothetical constant. It is worth
it, because the judge of a radar is whether the numbers on the screen can be traced to data, and a
single implementation is the shortest path to that.

## Filters that cannot empty the screen

Search, category and token status combine, and the board's empty state offers a button back to the full
list instead of a blank panel. A reader who filters into nothing should not have to reload the page to
find out that the radar is fine and the query was too narrow.

## Numbers as they are

The board prints TVL, growth, age and implied value in the units a reader thinks in: dollars with a
magnitude suffix, percentages with a sign, ages in days, months or years. It does not print raw integers
for a reader to parse, and it does not hide a sign. The one place the raw value survives untouched is
`board.json`, where the dashboard and any external reader both find the same integer.

## Sorting that is stable

Every sort falls back to the slug when two rows compare equal, so the order does not change between two
renders of the same data. A reader who sorts by seven-day growth and back to implied value sees the
board's own ranking again, not an arbitrary permutation.

## Why the live view is separate

A market cap is measured; the board's value is estimated. Putting them in one list would let a reader
compare two numbers that look alike and mean different things. The live view keeps them apart and says,
in its caption, that it is a fact rather than a model.

## Cost and time on every step

Each farm step names what it costs and how long it takes, including the steps that cost nothing, such as
watching the snapshot. A plan whose steps carry neither is not a plan, and a reader cannot decide with
it. The costs are stated in the currency the action actually spends: gas, capital held, time.

## Failure is loud

The pipeline exits non-zero when a contract is broken, the verifier exits non-zero when an invariant
fails, and the local build prints what it wrote. A radar that silently produces a short board is worse
than one that stops, because the reader has no way to tell a quiet day from a broken run.

## What a next version would change

Breadth would be weighted by the liquidity each chain actually carries, not the chain count. Growth
would use a longer window than seven days where the snapshot carries one. Age would distinguish a
protocol that has run with no token from one that had a token and abandoned it. Each needs data the
current snapshot does not carry, which is why none of them is in this version.
