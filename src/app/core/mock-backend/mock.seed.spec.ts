import { createSeedDb, SEED_PASSWORDS } from './mock.seed';

describe('createSeedDb', () => {
  it('seeds deterministic counts', () => {
    const db = createSeedDb();
    expect(db.users.length).toBe(5);
    expect(db.projects.length).toBe(4);
    expect(db.labels.length).toBe(6);
    expect(db.issues.length).toBe(32);
    expect(db.comments.length).toBe(18);
    expect(db.notifications.length).toBe(12);
    expect(db.issueSeqByProject['prj_if']).toBe(14);
  });

  it('does not put passwords on the db object', () => {
    const db = createSeedDb();
    expect('passwords' in db).toBe(false);
    expect(SEED_PASSWORDS['usr_ada']).toBe('password');
  });
});
