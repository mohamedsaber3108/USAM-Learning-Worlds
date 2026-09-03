import * as bcrypt from 'bcryptjs';

/**
 * Regression test for the bcrypt -> bcryptjs swap.
 *
 * bcryptjs is a pure-JS, MIT-licensed drop-in replacement for the native
 * `bcrypt` module. It produces standard $2a$/$2b$ modular crypt format
 * hashes, so existing password hashes already stored in the database
 * (created with native bcrypt) remain valid and verifiable with bcryptjs.
 * No data migration is required.
 */
describe('bcryptjs password hashing (bcrypt swap)', () => {
  const password = 'password123';

  it('hashes and verifies a password round-trip', async () => {
    const hash = await bcrypt.hash(password, 10);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await bcrypt.hash(password, 10);
    expect(await bcrypt.compare('wrong-password', hash)).toBe(false);
  });

  it('produces standard bcrypt modular crypt format hashes ($2a$/$2b$, cost 10)', async () => {
    const hash = await bcrypt.hash(password, 10);
    expect(hash).toMatch(/^\$2[aby]\$10\$/);
  });

  it('verifies a pre-existing hash produced by the native bcrypt module', async () => {
    // Generated with `bcrypt` (native) v5.1.1: bcrypt.hashSync('password123', 10)
    // Included verbatim to prove bcryptjs can verify hashes created before
    // the swap, so no user passwords need to be reset/migrated.
    const nativeBcryptHash =
      '$2b$10$Y40AUxxGMawzdqqwdz9taee5IJCnXI5F.BcacbqT.IbF4cCRtrYDW';
    expect(await bcrypt.compare(password, nativeBcryptHash)).toBe(true);
    expect(await bcrypt.compare('wrong-password', nativeBcryptHash)).toBe(false);
  });
});
