'use strict';

// =============================================================================
// 03 - RSA Encryption & Decryption
// =============================================================================
// RSA is an ASYMMETRIC encryption algorithm — it uses TWO different keys:
//   • Public key  — anyone can have it, used to ENCRYPT
//   • Private key — kept secret, used to DECRYPT
//
// Analogy: A mailbox — anyone can drop mail in (public key encrypts),
//          but only the owner has the key to open it (private key decrypts).
//
// This file includes:
//   Part 1: Manual RSA with small primes (p=61, q=53) — see the math!
//   Part 2: Real RSA-OAEP using Node.js crypto module
//
// Requires: Node.js 16+ (uses built-in 'crypto' module, no install needed)
// =============================================================================

const crypto = require('crypto');

// =============================================================================
// PART 1: Manual RSA with Small Numbers (Educational)
// =============================================================================
// This shows RSA step-by-step with tiny primes so you can follow the math.
// In real RSA, the primes are ~300 digits long!
// =============================================================================

console.log('='.repeat(60));
console.log('  Part 1: RSA Step-by-Step with Small Primes');
console.log('='.repeat(60));

// ── Step 1: Choose two prime numbers ────────────────────────────────────────
const p = 61n;  // "n" suffix means BigInt (for exact large-number arithmetic)
const q = 53n;
console.log('\n[Step 1] Choose two prime numbers:');
console.log('  p =', p.toString());
console.log('  q =', q.toString());

// ── Step 2: Compute n = p × q ───────────────────────────────────────────────
// n is the "modulus" — it's part of both public AND private keys
const n = p * q;
console.log('\n[Step 2] Compute n = p × q:');
console.log('  n = ' + p + ' × ' + q + ' = ' + n);

// ── Step 3: Compute Euler's totient φ(n) = (p-1)(q-1) ──────────────────────
// φ(n) tells us how many numbers from 1 to n are coprime with n
// This is the "secret ingredient" that makes RSA work
const phi = (p - 1n) * (q - 1n);
console.log('\n[Step 3] Compute Euler\'s totient φ(n) = (p-1)(q-1):');
console.log('  φ(n) = (' + p + '-1) × (' + q + '-1) = 60 × 52 = ' + phi);

// ── Step 4: Choose public exponent e ────────────────────────────────────────
// e must satisfy: 1 < e < φ(n) AND gcd(e, φ(n)) = 1 (coprime)
// Common choices: 3, 17, 65537. We use 17 for this demo.
const e = 17n;

// Verify gcd(e, φ(n)) = 1 using Euclidean algorithm
function gcd(a, b) {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}
console.log('\n[Step 4] Choose public exponent e = ' + e);
console.log('  Verify: gcd(' + e + ', ' + phi + ') = ' + gcd(e, phi) + ' ✓ (must be 1)');

// ── Step 5: Compute private exponent d ──────────────────────────────────────
// d is the modular inverse of e mod φ(n)
// Meaning: (e × d) mod φ(n) = 1
// We find d using the Extended Euclidean Algorithm
function modInverse(e, phi) {
  let [old_r, r] = [e, phi];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const quotient = old_r / r;
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }
  // Make sure result is positive
  return ((old_s % phi) + phi) % phi;
}

const d = modInverse(e, phi);
console.log('\n[Step 5] Compute private exponent d (modular inverse of e):');
console.log('  d = ' + d);
console.log('  Verify: (e × d) mod φ(n) = (' + e + ' × ' + d + ') mod ' + phi);
console.log('        = ' + (e * d) + ' mod ' + phi + ' = ' + ((e * d) % phi) + ' ✓ (must be 1)');

// ── Step 6: Our keys are ready! ─────────────────────────────────────────────
console.log('\n[Step 6] Keys generated:');
console.log('  PUBLIC KEY  (e, n) = (' + e + ', ' + n + ')  ← share with everyone');
console.log('  PRIVATE KEY (d, n) = (' + d + ', ' + n + ')  ← keep secret!');

// ── Step 7: Encrypt a message ───────────────────────────────────────────────
// RSA encrypts a NUMBER, not text. The number must be < n
// Encryption formula: ciphertext = message^e mod n
const message = 65n;  // Let's encrypt the number 65 (ASCII for 'A')

// Modular exponentiation: compute base^exp mod modulus efficiently
function modPow(base, exp, modulus) {
  let result = 1n;
  base = base % modulus;
  while (exp > 0n) {
    // If exp is odd, multiply result by base
    if (exp % 2n === 1n) {
      result = (result * base) % modulus;
    }
    exp = exp / 2n;
    base = (base * base) % modulus;
  }
  return result;
}

const ciphertext = modPow(message, e, n);
console.log('\n[Step 7] Encrypt message M = ' + message + ' (ASCII for "A"):');
console.log('  C = M^e mod n');
console.log('  C = ' + message + '^' + e + ' mod ' + n);
console.log('  C = ' + ciphertext);

// ── Step 8: Decrypt the ciphertext ──────────────────────────────────────────
// Decryption formula: message = ciphertext^d mod n
const decrypted = modPow(ciphertext, d, n);
console.log('\n[Step 8] Decrypt ciphertext C = ' + ciphertext + ':');
console.log('  M = C^d mod n');
console.log('  M = ' + ciphertext + '^' + d + ' mod ' + n);
console.log('  M = ' + decrypted + '  ← Original message recovered! ✓');

// ── Why does this work? ─────────────────────────────────────────────────────
console.log('\n[Why It Works] Euler\'s Theorem:');
console.log('  Since e×d ≡ 1 (mod φ(n)), we know e×d = 1 + k×φ(n) for some k');
console.log('  So: M^(e×d) mod n = M^(1 + k×φ(n)) mod n');
console.log('     = M × (M^φ(n))^k mod n');
console.log('     = M × 1^k mod n       ← Euler\'s theorem: M^φ(n) ≡ 1 (mod n)');
console.log('     = M  ✓');

// =============================================================================
// PART 2: Real RSA-OAEP with Node.js Crypto
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Part 2: Real RSA-OAEP Encryption (2048-bit)');
console.log('='.repeat(60));

// Generate a 2048-bit RSA key pair
console.log('\n  Generating 2048-bit RSA key pair (this may take a moment)...');
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,               // 2048 bits — industry standard minimum
  publicKeyEncoding: {
    type: 'spki',                     // Standard public key format
    format: 'pem'                     // Human-readable PEM encoding
  },
  privateKeyEncoding: {
    type: 'pkcs8',                    // Standard private key format
    format: 'pem'
  }
});

console.log('  Key pair generated! ✓');
console.log('\n  Public key (first 3 lines):');
publicKey.split('\n').slice(0, 3).forEach(line => console.log('    ' + line));
console.log('    ...');

// Encrypt with the public key using OAEP padding
// OAEP = Optimal Asymmetric Encryption Padding (prevents several attacks)
const realMessage = 'RSA encrypts this secret message!';
console.log('\n  Original message:', realMessage);

const encryptedBuffer = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,  // OAEP is recommended
    oaepHash: 'sha256'                                   // Hash for OAEP padding
  },
  Buffer.from(realMessage)
);
console.log('  Encrypted (hex):', encryptedBuffer.toString('hex').slice(0, 60) + '...');

// Decrypt with the private key
const decryptedBuffer = crypto.privateDecrypt(
  {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  encryptedBuffer
);
console.log('  Decrypted:', decryptedBuffer.toString('utf8'));
console.log('  Match?', realMessage === decryptedBuffer.toString('utf8') ? 'YES ✓' : 'NO ✗');

// =============================================================================
// KEY TAKEAWAYS
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Key Takeaways');
console.log('='.repeat(60));
console.log(`
  1. RSA is ASYMMETRIC — public key encrypts, private key decrypts
  2. Security relies on the difficulty of FACTORING large numbers
  3. Key generation: choose primes → compute n, φ(n) → pick e → find d
  4. Encrypt: C = M^e mod n | Decrypt: M = C^d mod n
  5. Always use OAEP padding — raw "textbook RSA" is insecure
  6. RSA is SLOW — in practice, use it to encrypt a symmetric key (AES),
     then use AES for the actual data (this is called "hybrid encryption")
  7. Minimum key size: 2048 bits (4096 recommended for long-term security)
`);
