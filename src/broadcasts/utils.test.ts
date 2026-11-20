import { describe, expect, it } from 'vitest';

import { parseBroadcast, roundQuery } from './utils';

describe('roundQuery', () => {
  it('sends nothing about rounds when none are picked', () => {
    expect(roundQuery({ rounds: [] })).toEqual({});
  });

  it('sends the rounds, their states and who receives it', () => {
    expect(
      roundQuery({
        rounds: [{ uuid: 'r1', name: 'Round 1' }],
        proposal_states: ['draft'],
        reviewers: true,
      }),
    ).toEqual({
      rounds: ['r1'],
      proposal_states: ['draft'],
      proposal_teams: true,
      reviewers: true,
    });
  });
});

describe('parseBroadcast', () => {
  it('reads the rounds back, keeping only real states', () => {
    const form = parseBroadcast({
      subject: 'Reminder',
      body: 'Please submit',
      query: {
        rounds: [{ uuid: 'r1', name: 'Round 1' }],
        proposal_states: ['draft', 'not-a-state'],
        proposal_teams: true,
        reviewers: false,
      },
    } as any);
    expect(form.rounds).toEqual([{ uuid: 'r1', name: 'Round 1' }]);
    expect(form.proposal_states).toEqual(['draft']);
    expect(form.proposal_teams).toBe(true);
  });
});
