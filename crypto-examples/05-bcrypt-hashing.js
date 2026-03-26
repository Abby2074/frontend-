'use strict';

// =============================================================================
// 05 - bcrypt Password Hashing
// =============================================================================
// bcrypt is designed specifically for PASSWORDS. Unlike SHA-256 (which is fast),
// bcrypt is intentionally SLOW — this is a feature, not a bug!
//
// Why not use SHA-256 for passwords?
//   • SHA-256 is too fast: an attacker can try BILLIONS of guesses per second
//   • bcrypt with cost=10: an attacker can only try ~1,000 guesses per second
//
// bcrypt features:
//   1. ADAPTIVE COST — you control how slow it is (cost factor = 2^cost rounds)
//   2. BUILT-IN SALT — random data mixed in, so same password → different hash
//   3. Based on Blowfish cipher — well-studied and trusted
//
// Requires: npm install (bcryptjs package — pure JS, works on any platform)
// =============================================================================

let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (error) {
  console.error('='.repeat(60));
  console.error('  ERROR: bcryptjs is not installed!');
  console.error('  Run this command first: npm install');
  console.error('  (Make sure you\'re in the crypto-examples directory)');
  console.error('='.repeat(60));
  process.exit(1);
}

// =============================================================================
// DEMO 1: Hash and Verify a Password
// =============================================================================

console.log('='.repeat(60));
console.log('  bcrypt Password Hashing Demo');
console.log('='.repeat(60));

const password = 'MySecretPassword123!';
const saltRounds = 10;  // Cost factor: 2^10 = 1,024 iterations

console.log('\n[Demo 1] Hash and Verify a Password:');
console.log('  Password:', password);
console.log('  Salt rounds:', saltRounds, '(2^' + saltRounds + ' = ' + Math.pow(2, saltRounds).toLocaleString() + ' iterations)');

// Generate a hash (salt is automatically created and embedded in the hash)
const hash = bcrypt.hashSync(password, saltRounds);
console.log('\n  Generated hash:', hash);
console.log('  Hash length:', hash.length, 'characters');

// Anatomy of a bcrypt hash:
// $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
// ├──┤├┤├─────────────────────┤├──────────────────────────────────┤
// Alg  Cost  Salt (22 chars)       Hash (31 chars)
console.log('\n  Anatomy of the hash:');
const parts = hash.split('$').filter(Boolean);
console.log('    Algorithm: $' + parts[0] + '$ (bcrypt)');
console.log('    Cost:      $' + parts[1] + '$ (2^' + parts[1] + ' iterations)');
console.log('    Salt+Hash: ' + parts[2]);
console.log('    (First 22 chars = salt, rest = hash)');

// =============================================================================
// DEMO 2: Password Verification
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Password Verification Demo');
console.log('='.repeat(60));

// Correct password
const isMatch = bcrypt.compareSync(password, hash);
console.log('\n  Checking correct password ("' + password + '"):');
console.log('  Match:', isMatch ? 'YES ✓ — Access granted!' : 'NO ✗');

// Wrong password
const isWrong = bcrypt.compareSync('WrongPassword!', hash);
console.log('\n  Checking wrong password ("WrongPassword!"):');
console.log('  Match:', isWrong ? 'YES ✓' : 'NO ✗ — Access denied!');

// =============================================================================
// DEMO 3: Same Password, Different Hashes (thanks to random salt!)
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Salt Demo — Same Password, Different Hashes');
console.log('='.repeat(60));

const hash1 = bcrypt.hashSync('password123', 10);
const hash2 = bcrypt.hashSync('password123', 10);

console.log('\n  Same password hashed twice:');
console.log('  Hash 1:', hash1);
console.log('  Hash 2:', hash2);
console.log('  Are they identical?', hash1 === hash2 ? 'YES' : 'NO ✓ (different salt each time!)');
console.log('\n  But both verify correctly:');
console.log('  Hash 1 verifies:', bcrypt.compareSync('password123', hash1) ? 'YES ✓' : 'NO');
console.log('  Hash 2 verifies:', bcrypt.compareSync('password123', hash2) ? 'YES ✓' : 'NO');

// =============================================================================
// DEMO 4: Adaptive Cost — Higher rounds = slower (more secure)
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Adaptive Cost Factor Demo');
console.log('='.repeat(60));
console.log('\n  Higher cost = slower hashing = harder to brute force');
console.log('  Each +1 DOUBLES the time (exponential growth)\n');

for (const rounds of [8, 10, 12]) {
  const start = Date.now();
  bcrypt.hashSync('testpassword', rounds);
  const elapsed = Date.now() - start;
  const iterations = Math.pow(2, rounds).toLocaleString();
  console.log('  Cost ' + rounds + ' (2^' + rounds + ' = ' + iterations.padStart(6) + ' iterations): ' + elapsed + 'ms');
}

console.log('\n  Recommendation: cost 10-12 for web apps (aim for ~250ms per hash)');
console.log('  Increase over time as hardware gets faster!');

// =============================================================================
// KEY TAKEAWAYS
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Key Takeaways');
console.log('='.repeat(60));
console.log(`
  1. NEVER use SHA-256 or MD5 for passwords — they're too fast!
  2. bcrypt is intentionally SLOW — protects against brute force
  3. ADAPTIVE COST: increase salt rounds as hardware gets faster
  4. BUILT-IN SALT: same password → different hash every time
  5. This prevents rainbow table attacks (pre-computed hash lookups)
  6. bcrypt.compare() is timing-safe — prevents timing attacks
  7. Modern alternatives: Argon2 (memory-hard), scrypt (memory-hard)
`);
