# How the radar values a protocol

The board answers one question: among protocols big enough to matter and with no token yet, which is
worth putting money into first, and how much is that position plausibly worth?

Every number on the board is computed from the snapshot alone. No protocol name is special-cased, no
list is hardcoded, and no figure is typed in by hand. If a protocol appears twice in two runs of the
pipeline, it gets the same value both times.

This file explains the four multipliers, shows the arithmetic on the row that leads the board, and
names what the model deliberately does not do. The code that implements it sits in `lib/score.ts`; the
board carries the same four multipliers per row so a reader can recheck any line without trusting this
document.

## The four questions

A person about to lock capital in a protocol asks four things, and each one gets its own multiplier.

1. How big is it? A larger protocol is harder to manipulate and easier to exit, so TVL is the base.
2. Is money arriving or leaving? Seven-day change is the closest thing the snapshot has to a trend.
3. Has it been around long enough to be past a test of patience? Age with no token is a proxy for how
   long the team has been able to launch and has not.
4. How many chains does one position reach? Breadth does not make a protocol worth more, but it spreads
   the risk of one chain's outage or one bridge's failure.

The product of the four is the implied value. It is an estimate of the position a launch could support,
not a price forecast, and the board says so on its face.

## The formula

    base       = tvl_usd x base_multiple
    growthPct  = clamp(change_7d, growth_floor, growth_cap)
    growthMult = 1 + (growthPct / 100) x growth_weight
    maturity   = maturity_floor
               + min(age_days, maturity_days) / maturity_days x maturity_range
    breadth    = 1 + min(max(chains - 1, 0), breadth_cap) x breadth_weight
    implied    = max(1, round(base x growthMult x maturity x breadth))

An unknown seven-day change counts as flat. An unknown age counts as `unknown_age_days`, which is a
deliberately cautious default: a protocol whose listing date the snapshot omits must not outrank one
that has demonstrably run for two years.

## The constants

| name             | value | why that value                                                        |
| ---------------- | ----- | --------------------------------------------------------------------- |
| base_multiple    | 0.25  | a quarter of TVL is the position a launch of this size tends to carry |
| growth_weight    | 0.5   | a 10% week moves the value 5%, so a single week cannot dominate        |
| growth_floor     | -60   | below -60% the week is a collapse, not a signal, and the floor caps it |
| growth_cap       | 120   | above +120% the week is noise or a one-off inflow, and the cap holds it |
| maturity_floor   | 0.6   | a brand-new protocol keeps 60% of its base, never zero               |
| maturity_range   | 0.4   | the remaining 40% accrues over `maturity_days`                        |
| maturity_days    | 1095  | three years is long enough that "about to launch" stops being an excuse |
| unknown_age_days | 365   | one cautious year when the snapshot carries no listing date           |
| breadth_weight   | 0.02  | each extra chain adds 2%, small enough to break ties, not to decide   |
| breadth_cap      | 5     | past five chains the position cannot practically spread wider         |

These live in `MODEL` and nowhere else. The page and the board both read the constants the pipeline
wrote into `board.json`, so a change to one constant reaches every number at the next run.

## Worked example: the row that leads the board

Steakhouse Financial holds $2.75B of TVL, changed -2.19% over seven days, has run 1.5 years with no
token, and runs on 11 chains. Its drawer shows the four multipliers:

    base       = 2.75e9 x 0.25                       = 687.5M
    growthMult = 1 + (-2.19 / 100) x 0.5             = 0.989
    maturity   = 0.6 + (547 / 1095) x 0.4            = 0.7984
    breadth    = 1 + min(10, 5) x 0.02               = 1.1

The drawer shows each multiplier rounded to four decimals for reading. The pipeline multiplies the
unrounded values and rounds once at the end, which is why the product of the printed multipliers can
differ from the printed value in the fourth significant figure. The printed value, $598.0M, is the
round of the unrounded product, and `board.json` carries that same integer.

The same arithmetic, applied to a protocol with half the TVL and flat growth, lands near half the value.
That is the property worth checking: the ordering follows the inputs, and no row is nudged by hand.

## What the board leaves out, and why

The snapshot carries three kinds of protocol that must not share a ranking with the rest.

- Protocols whose token already trades. Their market cap is a fact, not a model, so ranking them
  beside a pre-token estimate would compare two different things. They appear in the Live token view
  with their market cap, and the board counts them as set aside.
- Exchanges. A centralised exchange's TVL measures custody, not a launchable position, and its size
  would swamp every row below it.
- Versioned pools. A name that ends in a release marker, such as `V3` or `2.0`, is a pool of another
  protocol rather than a protocol of its own. Counting it would double-count the parent's liquidity.

Pre-token means the snapshot records no market cap, no CoinGecko id and no symbol. That is a stricter
test than "no market cap", because a protocol can have a ticker before it has a listing.

## How the farm plan is derived

Each row's plan is built from its own figures, so two rows never share a plan unless they share inputs.

- Capital: the suggestion scales with TVL, because a $150 ticket into a $2.75B protocol and a $150
  ticket into a $60M one are different risks, and the smaller one deserves a smaller first test.
- Hold: the suggestion scales with age, because a protocol that has run three years can be held longer
  than one listed last month.
- Exit: the trigger is the row's own TVL and growth. A protocol holding $2.75B is told to withdraw if
  it falls below 70% of that figure, or if growth stays under -10% for two weeks. The number is
  computed from the same snapshot fields as the value, so a reader can see where it came from.
- Breadth: a multi-chain protocol is told to spread the position over two chains at most, because the
  short-term reward for spreading further is small and the bridge risk is not.

Every step carries a cost and a time estimate. A step without both is not a plan, it is advice.

## What the page shows and what the data holds

The page has one source of truth: `data.js`, written by the same run that writes `board.json`. The page
does not recompute the model. It sorts, filters and displays the rows it was given, which is why a
screenshot and `board.json` can never disagree about a value, a rank or a farm step.

The reader can sort by rank, name, TVL, seven-day change, age or implied value, filter by category or
token status, search by name, category or chain, and open any row for its four multipliers and its
five farm steps. A filter that leaves nothing offers a way back rather than an empty screen.

## How to check this yourself

    node main.ts --input <kit>/input/snapshot.json --output out
    node lib/verify.ts out/board.json <kit>/input/snapshot.json

The first line writes the board, the data file, the dashboard copy, the dossier and the screenshots. The
second line re-reads the written board and asserts the invariants this document claims: 200 rows,
the whole watchlist present, a rank for every row, the live tokens set aside rather than ranked, and a
farm plan on every row. It prints one line and exits non-zero if any invariant fails.

## Known limits

- Seven-day change is a weak trend signal. A protocol can be flat for a month and still be worth more.
- Age with no token is evidence of patience, not of intent. Some teams simply do not want a token.
- Breadth rewards chains that each carry liquidity, not chains where the protocol merely deployed.
- The value is a position estimate. It says nothing about whether the launch will succeed.
- A protocol the snapshot lists without a listing date gets the cautious default, which can
  understate a project that has in fact run for years.

Each of these is a reason to read the board as a first pass, not as a verdict, and each is a candidate
for the next version of the model.

## Change log

- radar-1 scored TVL, seven-day growth and age.
- radar-2 adds breadth, because two protocols with the same figures but eleven chains and one chain are
  not the same position, and the ranking had no way to say so.
