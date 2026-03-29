'use strict';

// =============================================================================
// 02 - Triple DES (3DES) Encryption & Decryption
// =============================================================================
//
// ⚠️  WARNING: 3DES IS DEPRECATED — DO NOT USE IN NEW PROJECTS! ⚠️
// NIST officially disallowed 3DES after 2023. Use AES instead.
// This example is for EDUCATIONAL PURPOSES ONLY.
//
// 3DES applies the original DES algorithm THREE times with the
// Encrypt-Decrypt-Encrypt (EDE) pattern:
//
//   Ciphertext = E_K3( D_K2( E_K1( Plaintext ) ) )
//
// This is called a "Feistel network" structure:
//   ┌──────────┐     ┌──────────┐     ┌──────────┐
//   │ Encrypt  │ ──> │ Decrypt  │ ──> │ Encrypt  │ ──> Ciphertext
//   │ with K1  │     │ with K2  │     │ with K3  │
//   └──────────┘     └──────────┘     └──────────┘
//
// Why three times? Original DES only had a 56-bit key (too weak).
// 3DES effectively gives us 168 bits (3 × 56), but real security
// is only ~112 bits due to meet-in-the-middle attacks.
//
// Requires: Node.js 16+ (uses built-in 'crypto' module, no install needed)
// =============================================================================

const crypto = require('crypto');

// ── Helper: Encrypt with 3DES-EDE3-CBC ──────────────────────────────────────
function encrypt(plaintext, key) {
  // 3DES uses an 8-byte (64-bit) IV for CBC mode
  // CBC = Cipher Block Chaining — each block depends on the previous one
  const iv = crypto.randomBytes(8);

  // 'des-ede3-cbc' = Triple DES in EDE mode with CBC chaining
  // Key must be exactly 24 bytes (3 × 8-byte DES keys)
  const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);

  // Encrypt — PKCS7 padding is applied automatically
  // (padding fills the last block to reach the 8-byte block size)
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    iv: iv.toString('hex'),
    encrypted: encrypted
  };
}

// ── Helper: Decrypt with 3DES-EDE3-CBC ──────────────────────────────────────
function decrypt(encryptedData, key) {
  const decipher = crypto.createDecipheriv(
    'des-ede3-cbc',
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// =============================================================================
// DEMO: 3DES Encrypt and Decrypt
// =============================================================================

console.log('='.repeat(60));
console.log('  Triple DES (3DES) Encryption & Decryption Demo');
console.log('  ⚠️  DEPRECATED — For educational purposes only!');
console.log('='.repeat(60));

// Step 1: Generate a 24-byte (192-bit) key — three 8-byte DES keys combined
// K1 = bytes 0-7, K2 = bytes 8-15, K3 = bytes 16-23
const key = crypto.randomBytes(24);
console.log('\n[Step 1] Generated a 192-bit key (3 × 64-bit DES keys)');
console.log('  Full key (hex):', key.toString('hex'));
console.log('  K1 (hex):', key.subarray(0, 8).toString('hex'));
console.log('  K2 (hex):', key.subarray(8, 16).toString('hex'));
console.log('  K3 (hex):', key.subarray(16, 24).toString('hex'));

// Step 2: Define our message
const message = 'Triple DES encrypts this message three times!';
console.log('\n[Step 2] Original message:', message);

// Step 3: Encrypt
const encryptedData = encrypt(message, key);
console.log('\n[Step 3] Encrypted data:');
console.log('  IV (hex):        ', encryptedData.iv);
console.log('  Ciphertext (hex):', encryptedData.encrypted);

// Step 4: Decrypt
const decryptedMessage = decrypt(encryptedData, key);
console.log('\n[Step 4] Decrypted message:', decryptedMessage);

// Step 5: Verify
console.log('\n[Step 5] Verification:');
console.log('  Original === Decrypted?', message === decryptedMessage ? 'YES ✓' : 'NO ✗');

// =============================================================================
// COMPARISON: Why AES replaced DES/3DES
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  DES vs 3DES vs AES Comparison');
console.log('='.repeat(60));
console.log(`
  ┌─────────────┬──────────┬────────────┬──────────┬───────────┐
  │ Algorithm   │ Key Size │ Block Size │ Rounds   │ Status    │
  ├─────────────┼──────────┼────────────┼──────────┼───────────┤
  │ DES         │ 56 bits  │ 64 bits    │ 16       │ BROKEN    │
  │ 3DES (EDE)  │ 168 bits │ 64 bits    │ 48 (3×16)│ DEPRECATED│
  │ AES-128     │ 128 bits │ 128 bits   │ 10       │ SECURE    │
  │ AES-256     │ 256 bits │ 128 bits   │ 14       │ SECURE    │
  └─────────────┴──────────┴────────────┴──────────┴───────────┘

  Why 3DES lost to AES:
  • 3DES is ~3x SLOWER than AES (applies DES three times)
  • 64-bit block size is vulnerable to birthday attacks on large data
  • AES was designed from scratch for modern hardware
  • AES supports 128-bit blocks (more secure for large data)
`);

// =============================================================================
// KEY TAKEAWAYS
// =============================================================================

console.log('='.repeat(60));
console.log('  Key Takeaways');
console.log('='.repeat(60));
console.log(`
  1. 3DES applies DES three times: Encrypt → Decrypt → Encrypt (EDE)
  2. Uses a Feistel network structure (same as original DES)
  3. 24-byte key = three 8-byte DES sub-keys
  4. DEPRECATED by NIST — do NOT use for new projects
  5. AES is faster, more secure, and the modern standard
  6. 3DES still exists in legacy banking and payment systems
`);
