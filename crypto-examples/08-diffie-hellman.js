'use strict';

// =============================================================================
// 08 - Diffie-Hellman Key Exchange
// =============================================================================
// The Problem: Alice and Bob want to agree on a shared secret key,
//              but they can only communicate over an INSECURE channel
//              (anyone can eavesdrop).
//
// The Solution: Diffie-Hellman key exchange — lets two parties create a
//               shared secret WITHOUT ever sending the secret itself!
//
// ── The Paint Mixing Analogy ──
//
//   1. Alice and Bob publicly agree on a base color (public parameters p, g)
//   2. Alice picks a secret color, mixes it with the base → sends to Bob
//   3. Bob picks a secret color, mixes it with the base → sends to Alice
//   4. Alice mixes Bob's result with HER secret → gets the SHARED SECRET
//   5. Bob mixes Alice's result with HIS secret → gets the SAME SHARED SECRET
//   6. An eavesdropper sees the mixed colors but can't "unmix" them!
//
// ── The Math ──
//
//   Public: prime p, generator g
//   Alice: secret a, sends A = g^a mod p
//   Bob:   secret b, sends B = g^b mod p
//
//   Alice computes: shared = B^a mod p = (g^b)^a mod p = g^(ab) mod p
//   Bob computes:   shared = A^b mod p = (g^a)^b mod p = g^(ab) mod p
//                   ↑ SAME VALUE! ↑
//
//   Security: Given g^a mod p, finding 'a' is the "Discrete Logarithm Problem"
//             — computationally infeasible for large primes.
//
// Requires: Node.js 16+ (uses built-in 'crypto' module, no install needed)
// =============================================================================

const crypto = require('crypto');

// =============================================================================
// DEMO: Diffie-Hellman Key Exchange Between Alice and Bob
// =============================================================================

console.log('='.repeat(60));
console.log('  Diffie-Hellman Key Exchange Demo');
console.log('='.repeat(60));

// ── Step 1: Alice generates DH parameters and her key pair ──────────────────
console.log('\n[Step 1] Alice generates DH parameters (prime p, generator g)...');
console.log('  (Using 1024-bit prime for faster demo — use 2048+ in production)\n');

// Alice creates the DH instance — this generates a large prime (p) and generator (g)
const alice = crypto.createDiffieHellman(1024);

// Alice generates her key pair (secret 'a' and public A = g^a mod p)
const alicePublicKey = alice.generateKeys();

// Get the public parameters (these are shared openly)
const prime = alice.getPrime();
const generator = alice.getGenerator();

console.log('  Public parameters (sent in the open):');
console.log('    Prime p (hex):     ' + prime.toString('hex').slice(0, 40) + '...');
console.log('    Prime p length:    ' + prime.length * 8 + ' bits');
console.log('    Generator g (hex): ' + generator.toString('hex'));
console.log('\n  Alice\'s keys:');
console.log('    Private key (secret a): [HIDDEN — only Alice knows this]');
console.log('    Public key A = g^a mod p (hex): ' + alicePublicKey.toString('hex').slice(0, 40) + '...');

// ── Step 2: Bob uses Alice's parameters to create his key pair ──────────────
console.log('\n[Step 2] Bob receives the public parameters and generates HIS keys...');

// Bob creates his DH instance using Alice's public parameters
const bob = crypto.createDiffieHellman(prime, generator);

// Bob generates his key pair (secret 'b' and public B = g^b mod p)
const bobPublicKey = bob.generateKeys();

console.log('\n  Bob\'s keys:');
console.log('    Private key (secret b): [HIDDEN — only Bob knows this]');
console.log('    Public key B = g^b mod p (hex): ' + bobPublicKey.toString('hex').slice(0, 40) + '...');

// ── Step 3: Exchange public keys (over insecure channel) ────────────────────
console.log('\n[Step 3] Alice and Bob exchange PUBLIC keys (eavesdropper can see these):');
console.log('    Alice sends to Bob: A = ' + alicePublicKey.toString('hex').slice(0, 30) + '...');
console.log('    Bob sends to Alice: B = ' + bobPublicKey.toString('hex').slice(0, 30) + '...');

// ── Step 4: Both compute the SAME shared secret ─────────────────────────────
console.log('\n[Step 4] Both sides compute the shared secret:');

// Alice computes: shared = B^a mod p
const aliceSharedSecret = alice.computeSecret(bobPublicKey);
console.log('    Alice computes B^a mod p: ' + aliceSharedSecret.toString('hex').slice(0, 40) + '...');

// Bob computes: shared = A^b mod p
const bobSharedSecret = bob.computeSecret(alicePublicKey);
console.log('    Bob computes   A^b mod p: ' + bobSharedSecret.toString('hex').slice(0, 40) + '...');

// ── Step 5: Verify they got the same secret! ────────────────────────────────
const secretsMatch = aliceSharedSecret.toString('hex') === bobSharedSecret.toString('hex');

console.log('\n[Step 5] Do the shared secrets match?');
console.log('    ' + (secretsMatch ? 'YES ✓ — Alice and Bob now share a secret key!' : 'NO ✗ — Something went wrong!'));

// ── Step 6: Use the shared secret as an encryption key ──────────────────────
console.log('\n[Step 6] Using the shared secret for AES encryption:');

// Derive a 256-bit AES key from the shared secret using SHA-256
const aesKey = crypto.createHash('sha256').update(aliceSharedSecret).digest();

// Now Alice and Bob can communicate securely using AES!
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
let encrypted = cipher.update('Secret message from Alice to Bob!', 'utf8', 'hex');
encrypted += cipher.final('hex');
const authTag = cipher.getAuthTag();

console.log('    Alice encrypts with shared key: ' + encrypted.slice(0, 40) + '...');

// Bob decrypts
const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
decipher.setAuthTag(authTag);
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');

console.log('    Bob decrypts with shared key:   "' + decrypted + '"');

// =============================================================================
// What the Eavesdropper Sees
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  What the Eavesdropper (Eve) Sees');
console.log('='.repeat(60));
console.log(`
  Eve can see:
    • Prime p and generator g (public)
    • Alice's public key A = g^a mod p
    • Bob's public key B = g^b mod p
    • The encrypted messages

  Eve CANNOT figure out:
    • Alice's secret 'a' (would need to solve: a = log_g(A) mod p)
    • Bob's secret 'b'   (would need to solve: b = log_g(B) mod p)
    • The shared secret g^(ab) mod p

  This is the "Discrete Logarithm Problem" — computationally
  infeasible for large primes (1024+ bits).
`);

// =============================================================================
// Security Warning
// =============================================================================

console.log('='.repeat(60));
console.log('  Security Notes');
console.log('='.repeat(60));
console.log(`
  ⚠️  Basic DH is vulnerable to Man-in-the-Middle (MITM) attacks!
  An attacker could intercept and replace public keys.

  Solutions:
    • Authenticate public keys using digital signatures (see example 06)
    • Use certificates (like in TLS/HTTPS)
    • Use Elliptic Curve Diffie-Hellman (ECDH) — same concept,
      smaller keys, faster, and more secure
`);

// =============================================================================
// KEY TAKEAWAYS
// =============================================================================

console.log('='.repeat(60));
console.log('  Key Takeaways');
console.log('='.repeat(60));
console.log(`
  1. DH lets two parties create a SHARED SECRET over an insecure channel
  2. Neither party ever sends the secret — they each compute it independently
  3. Math: both sides compute g^(ab) mod p, but from different directions
  4. Security relies on the Discrete Logarithm Problem
  5. Vulnerable to MITM attacks — must authenticate public keys!
  6. Modern alternative: ECDH (Elliptic Curve DH) — same concept, better security
  7. Used in: TLS/HTTPS, SSH, VPNs, Signal protocol
`);
