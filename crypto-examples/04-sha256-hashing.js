'use strict';

// =============================================================================
// 04 - SHA-256 Hashing with Avalanche Effect Demo
// =============================================================================
// SHA-256 is a HASHING algorithm — it's a ONE-WAY function:
//   • Input: any data of any size
//   • Output: a fixed 256-bit (32-byte) "digest" or "fingerprint"
//   • You CANNOT reverse it to get the original data back
//
// Think of it like a fingerprint — unique to the person, but you can't
// reconstruct the person from just their fingerprint.
//
// How SHA-256 works (Merkle-Damgard Construction):
//   1. Pad the message to a multiple of 512 bits
//   2. Split into 512-bit blocks
//   3. Process each block through a compression function
//   4. Chain the output of each block into the next
//   5. Final output = 256-bit hash
//
//   Message → [Pad] → [Block 1] → [Block 2] → ... → [Hash]
//                        ↑            ↑
//                    Compression  Compression
//                    Function     Function
//                    (64 rounds)  (64 rounds)
//
// Requires: Node.js 16+ (uses built-in 'crypto' module, no install needed)
// =============================================================================

const crypto = require('crypto');

// ── Helper: Compute SHA-256 hash ────────────────────────────────────────────
function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// =============================================================================
// DEMO 1: Basic Hashing
// =============================================================================

console.log('='.repeat(60));
console.log('  SHA-256 Hashing Demo');
console.log('='.repeat(60));

const message = 'Hello, World!';
const hash = sha256(message);

console.log('\n[Demo 1] Basic Hashing:');
console.log('  Input:  "' + message + '"');
console.log('  SHA-256:', hash);
console.log('  Length:', hash.length, 'hex characters =', hash.length * 4, 'bits');

// =============================================================================
// DEMO 2: Determinism — Same input ALWAYS gives the same hash
// =============================================================================

console.log('\n[Demo 2] Determinism (same input → same hash):');
const hash1 = sha256('Hello, World!');
const hash2 = sha256('Hello, World!');
console.log('  Hash 1:', hash1);
console.log('  Hash 2:', hash2);
console.log('  Identical?', hash1 === hash2 ? 'YES ✓' : 'NO ✗');

// =============================================================================
// DEMO 3: Avalanche Effect — Tiny change → completely different hash
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Avalanche Effect Demo');
console.log('='.repeat(60));

const input1 = 'hello';
const input2 = 'hello!';  // Just one character added!
const hashA = sha256(input1);
const hashB = sha256(input2);

console.log('\n  Input 1: "' + input1 + '"');
console.log('  Hash 1:  ' + hashA);
console.log('\n  Input 2: "' + input2 + '"  (just added "!")');
console.log('  Hash 2:  ' + hashB);

// Count how many bits differ between the two hashes
const bufA = Buffer.from(hashA, 'hex');
const bufB = Buffer.from(hashB, 'hex');
let diffBits = 0;

for (let i = 0; i < bufA.length; i++) {
  // XOR the bytes — each 1-bit in the result means a difference
  let xor = bufA[i] ^ bufB[i];
  // Count the 1-bits (Hamming distance)
  while (xor > 0) {
    diffBits += xor & 1;
    xor >>= 1;
  }
}

const totalBits = 256;
const percentage = ((diffBits / totalBits) * 100).toFixed(1);

console.log('\n  Bits that changed: ' + diffBits + ' out of ' + totalBits + ' (' + percentage + '%)');
console.log('  Expected: ~50% (ideal avalanche effect)');
console.log('  This means changing ONE character flips about HALF the output bits!');

// Visual comparison — mark positions where hex chars differ
let diffMarker = '           ';
for (let i = 0; i < hashA.length; i++) {
  diffMarker += hashA[i] === hashB[i] ? ' ' : '^';
}
console.log('\n  Hash 1: ' + hashA);
console.log('  Hash 2: ' + hashB);
console.log(diffMarker + '  (^ = different)');

// =============================================================================
// DEMO 4: Different Inputs, Different Hashes
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Various Inputs Demo');
console.log('='.repeat(60));

const examples = [
  'The quick brown fox jumps over the lazy dog',
  'The quick brown fox jumps over the lazy dog.',  // Added period
  '',                                                // Empty string
  'a',                                               // Single character
  'a'.repeat(1000),                                  // 1000 characters
];

console.log();
for (const input of examples) {
  const display = input.length > 50 ? input.slice(0, 47) + '...' : input;
  const label = input === '' ? '(empty string)' : '"' + display + '"';
  console.log('  Input: ' + label);
  console.log('  Hash:  ' + sha256(input));
  console.log();
}

console.log('  Notice: ALL hashes are exactly 64 hex characters (256 bits),');
console.log('  regardless of whether the input was 0 or 1000 characters!');

// =============================================================================
// KEY TAKEAWAYS
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Key Takeaways');
console.log('='.repeat(60));
console.log(`
  1. SHA-256 is a ONE-WAY function — you cannot reverse a hash
  2. Output is ALWAYS 256 bits (64 hex chars), regardless of input size
  3. DETERMINISTIC — same input always produces the same hash
  4. AVALANCHE EFFECT — changing 1 bit of input changes ~50% of output bits
  5. COLLISION RESISTANT — practically impossible to find two inputs
     with the same hash (would take ~2^128 attempts)
  6. Common uses: file integrity checks, blockchain, digital signatures,
     password storage (but use bcrypt for passwords — see example 05!)
`);
