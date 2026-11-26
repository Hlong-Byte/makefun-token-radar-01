// A farm plan's steps: the leave trigger, the plan itself, and the one-string form the board carries.
//
// The trigger quotes the row's own TVL and seven-day growth, so a reader has a number to check rather than
// a slogan, and no protocol name is ever special-cased.

import { actionFor, capitalFor, chainOf, holdDaysFor } from './farm.ts';
import type { FarmStep, SnapshotProtocol } from './types.ts';

/** A step as one string: its action, then its cost and time, within the gate's 20..600 characters. */
export function stepText(step: FarmStep): string {
  let s = `${step.text} Cost: ${step.cost}. Time: ${step.time}.`;
  if (s.length > 600) s = `${s.slice(0, 596)}...`;
  if (s.length < 20) s = `${s} Hold the position and check the protocol's own page.`;
  return s;
}

/** A dollar figure short enough for a step: B for billions, M for millions. */
export function shortUsd(usd: number): string {
  return usd >= 1e9 ? `$${(usd / 1e9).toFixed(2)}B` : `$${(usd / 1e6).toFixed(1)}M`;
}

/** The line that says when to leave, from the row's own TVL and seven-day growth. */
export function exitTrigger(p: SnapshotProtocol): string {
  const now = shortUsd(p.tvl_usd);
  const floor = shortUsd(p.tvl_usd * 0.7);
  const growth =
    p.change_7d === null
      ? 'no seven-day change is recorded this snapshot'
      : `its seven-day change is ${p.change_7d.toFixed(2)}%`;
  const chains =
    p.chains.length > 1
      ? ` It runs on ${p.chains.length} chains, so spread the position over two of them at most.`
      : '';
  return `Each week compare the snapshot: this protocol holds ${now} of TVL and ${growth}; if TVL falls below ${floor} or growth stays under -10% for two weeks, withdraw and move the funds to the next row.${chains}`;
}

/** A protocol's farm plan: seven steps, each an action with a cost and a time. */
export function farmSteps(p: SnapshotProtocol, age: number | null): FarmStep[] {
  const chain = chainOf(p);
  const capital = capitalFor(p);
  const hold = holdDaysFor(age);
  const gas = capital >= 150 ? 8 : 4;
  return [
    {
      text: 'Use a fresh wallet that holds only the funds you plan to farm, and keep its seed phrase offline.',
      cost: 'under $3 of gas for the first transaction',
      time: '5 minutes',
    },
    {
      text: actionFor(p, capital, chain),
      cost: `$${capital} of capital and about $${gas} of gas`,
      time: '15 minutes to set up',
    },
    {
      text: exitTrigger(p),
      cost: 'nothing to watch, and $3 to $6 of gas if you exit',
      time: '5 minutes a week',
    },
    {
      text: 'Make one qualifying action each week, such as a deposit, a borrow, a swap or a vote.',
      cost: 'about $2 of gas a week',
      time: '10 minutes a week',
    },
    {
      text: `Hold the position for at least ${hold} days so the activity is counted in more than one snapshot.`,
      cost: `the $${capital} stays in the position`,
      time: `${hold} days`,
    },
    {
      text: "Before you withdraw, open the protocol's own points or rewards page and claim only from the link it publishes.",
      cost: 'no fee to check, and never pay to claim',
      time: '10 minutes',
    },
    {
      text: 'Write the wallet, the dates and every transaction in a farm log so you can repeat the position or unwind it.',
      cost: 'nothing but the log',
      time: '5 minutes',
    },
  ];
}
