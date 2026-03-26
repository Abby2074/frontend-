'use strict';

// =============================================================================
// 01 - AES-256-GCM Encryption & Decryption
// =============================================================================
// AES (Advanced Encryption Standard) is the most widely used symmetric
// encryption algorithm. "Symmetric" means the SAME key encrypts AND decrypts.
//
// We use AES-256-GCM because:
//   - 256-bit key = extremely strong (2^256 possible keys)
//   - GCM mode = provides BOTH encryption AND integrity checking (auth tag)
//
// Requires: Node.js 16+ (uses built-in 'crypto' module, no install needed)
// =============================================================================

const crypto = require('crypto');

// ── Helper: Encrypt a message with AES-256-GCM ─────────────────────────────
function encrypt(plaintext, key) {
  // GCM requires a 12-byte (96-bit) initialization vector (IV)
  // The IV must be UNIQUE for every encryption with the same key
  // Think of it like a "nonce" — number used once
  const iv = crypto.randomBytes(12);

  // Create the cipher using AES-256-GCM algorithm
  // Parameters: algorithm, key (32 bytes = 256 bits), IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  // Encrypt the plaintext
  // update() processes the data, final() finishes the encryption
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get the authentication tag — this is what makes GCM special!
  // The auth tag lets us verify the ciphertext hasn't been tampered with
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),           // We need to store the IV for decryption
    encrypted: encrypted,              // The actual encrypted data
    authTag: authTag.toString('hex')   // The integrity verification tag
  };
}

// ── Helper: Decrypt a message with AES-256-GCM ─────────────────────────────
function decrypt(encryptedData, key) {
  // Create the decipher with the same algorithm, key, and original IV
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );

  // Set the auth tag BEFORE decrypting — this verifies integrity
  // If someone tampered with the ciphertext, this will cause decryption to fail
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

  // Decrypt the data
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// =============================================================================
// DEMO: Encrypt and Decrypt a Message
// =============================================================================

console.log('='.repeat(60));
console.log('  AES-256-GCM Encryption & Decryption Demo');
console.log('='.repeat(60));

// Step 1: Generate a random 256-bit (32-byte) key
// In real applications, this key would be stored securely (e.g., key vault)
const key = crypto.randomBytes(32);
console.log('\n[Step 1] Generated a random 256-bit key');
console.log('  Key (hex):', key.toString('hex'));
console.log('  Key length:', key.length, 'bytes =', key.length * 8, 'bits');

// Step 2: Define our secret message
const message = 'Hello, this is a secret message that only the key holder can read!';
console.log('\n[Step 2] Original message:', message);

// Step 3: Encrypt the message
const encryptedData = encrypt(message, key);
console.log('\n[Step 3] Encrypted data:');
console.log('  IV (hex):       ', encryptedData.iv);
console.log('  Ciphertext (hex):', encryptedData.encrypted);
console.log('  Auth Tag (hex):  ', encryptedData.authTag);

// Step 4: Decrypt the message
const decryptedMessage = decrypt(encryptedData, key);
console.log('\n[Step 4] Decrypted message:', decryptedMessage);

// Step 5: Verify the round-trip worked
console.log('\n[Step 5] Verification:');
console.log('  Original === Decrypted?', message === decryptedMessage ? 'YES ✓' : 'NO ✗');

// =============================================================================
// DEMO: Tamper Detection (GCM's integrity guarantee)
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Tamper Detection Demo');
console.log('='.repeat(60));

// Let's modify one character of the ciphertext to simulate tampering
const tamperedData = { ...encryptedData };
// Flip the first hex character of the ciphertext
const firstChar = tamperedData.encrypted[0];
tamperedData.encrypted = (firstChar === '0' ? '1' : '0') + tamperedData.encrypted.slice(1);

console.log('\n  Original ciphertext: ', encryptedData.encrypted.slice(0, 20) + '...');
console.log('  Tampered ciphertext: ', tamperedData.encrypted.slice(0, 20) + '...');

try {
  decrypt(tamperedData, key);
  console.log('  Result: Decryption succeeded (unexpected!)');
} catch (error) {
  console.log('  Result: Decryption FAILED ✓ — tampering detected!');
  console.log('  Error:', error.message);
}

// =============================================================================
// KEY TAKEAWAYS
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Key Takeaways');
console.log('='.repeat(60));
console.log(`
  1. AES is a SYMMETRIC algorithm — same key encrypts and decrypts
  2. AES-256 uses a 256-bit key (32 bytes) — virtually unbreakable
  3. GCM mode provides encryption + integrity in one operation
  4. The IV (nonce) must be UNIQUE for every encryption — never reuse!
  5. The auth tag detects any tampering with the ciphertext
  6. In production: never hardcode keys, use a key management service
`);
