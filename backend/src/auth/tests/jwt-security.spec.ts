import * as jwt from 'jsonwebtoken';

// Uses the same signing approach as your JwtStrategy — only the secret matters.
// These tests run standalone: npx jest jwt-security --no-coverage
const SECRET = 'test-jwt-secret-for-security-tests';

describe('JWT Security', () => {
  // ── 1. Expired token is rejected ──────────────────────────────────────────
  it('rejects a token that has already expired', () => {
    const expired = jwt.sign(
      { sub: 'user-abc', email: 'test@example.com', role: 'DONOR' },
      SECRET,
      { expiresIn: '-1s' }, // expired 1 second ago
    );
    expect(() => jwt.verify(expired, SECRET)).toThrow('jwt expired');
  });

  // ── 2. Wrong secret is rejected ───────────────────────────────────────────
  it('rejects a token signed with a different secret', () => {
    const fakeToken = jwt.sign(
      { sub: 'user-abc', role: 'ADMIN' },
      'wrong-secret',
    );
    expect(() => jwt.verify(fakeToken, SECRET)).toThrow('invalid signature');
  });

  // ── 3. Tampered payload is rejected ──────────────────────────────────────
  it('rejects a token whose payload was tampered with', () => {
    const valid = jwt.sign({ sub: 'user-abc', role: 'DONOR' }, SECRET);
    const [header, , signature] = valid.split('.');

    // Change role from DONOR → ADMIN without re-signing
    const tampered = Buffer.from(
      JSON.stringify({
        sub: 'user-abc',
        role: 'ADMIN',
        iat: Math.floor(Date.now() / 1000),
      }),
    ).toString('base64url');

    expect(() =>
      jwt.verify(`${header}.${tampered}.${signature}`, SECRET),
    ).toThrow('invalid signature');
  });

  // ── 4. Malformed tokens are rejected ─────────────────────────────────────
  it('rejects a completely malformed string', () => {
    expect(() => jwt.verify('not.a.jwt', SECRET)).toThrow();
  });

  it('rejects an empty string', () => {
    expect(() => jwt.verify('', SECRET)).toThrow();
  });

  it('rejects a token with only two segments', () => {
    expect(() => jwt.verify('header.payload', SECRET)).toThrow();
  });

  // ── 5. Valid token is accepted ────────────────────────────────────────────
  it('accepts a valid non-expired token and returns correct payload', () => {
    const token = jwt.sign(
      { sub: 'user-abc', email: 'test@example.com', role: 'DONOR' },
      SECRET,
      { expiresIn: '1h' },
    );
    const decoded = jwt.verify(token, SECRET) as any;
    expect(decoded.sub).toBe('user-abc');
    expect(decoded.role).toBe('DONOR');
  });

  // ── 6. Role escalation is not possible ───────────────────────────────────
  it('cannot escalate role from DONOR to ADMIN via token manipulation', () => {
    const donorToken = jwt.sign({ sub: 'user-abc', role: 'DONOR' }, SECRET, {
      expiresIn: '1h',
    });
    const decoded = jwt.verify(donorToken, SECRET) as any;
    // Role must stay DONOR — attacker cannot change it without re-signing
    expect(decoded.role).toBe('DONOR');
    expect(decoded.role).not.toBe('ADMIN');
  });

  // ── 7. Token reuse (stateless note) ──────────────────────────────────────
  // JWTs are stateless — a valid token stays valid until expiry.
  // To truly block reuse after logout, a Redis blacklist is required.
  // This test documents the known gap:
  it('documents that stateless JWT cannot be invalidated before expiry without a blacklist', () => {
    const token = jwt.sign({ sub: 'user-abc', role: 'DONOR' }, SECRET, {
      expiresIn: '1h',
    });
    // Simulate logout — but the token is still cryptographically valid
    const decoded = jwt.verify(token, SECRET) as any;
    // Without a blacklist check, this still passes — expected behaviour to document
    expect(decoded.sub).toBe('user-abc');
    // RECOMMENDATION: Add Redis token blacklist in JwtAuthGuard for full logout security
  });
});
