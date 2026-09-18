import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  const pipe = new TimeAgoPipe();
  const iso = '2026-09-17T12:00:00.000Z';
  const t = Date.parse(iso);

  it('stays just now until a minute passes', () => {
    expect(pipe.transform(iso, t + 10_000)).toBe('just now');
  });

  it('changes bucket when now moves', () => {
    expect(pipe.transform(iso, t + 5 * 60_000)).toBe('5m ago');
  });
});
