'use strict';

// =============================================================================
// 06 - Digital Signatures (RSA Sign & Verify)
// =============================================================================
// Digital signatures are the REVERSE of encryption:
//   • Encryption:  encrypt with PUBLIC key,  decrypt with PRIVATE key
//   • Signatures:  sign with PRIVATE key,    verify with PUBLIC key
//
// What a digital signature proves:
//   1. AUTHENTICATION — the message came from the claimed sender
//   2. INTEGRITY — the message wasn't altered in transit
//   3. NON-REPUDIATION — the sender can't deny sending it
//
// Analogy: Like a handwritten signature on a notarized document —
//   only YOU can sign it, but ANYONE can verify it's your signature.
//
// How it works:
//   1. Hash the message (SHA-256) → digest
//   2. Encrypt the digest with PRIVATE key → signature
//   3. Send message + signature
//   4. Receiver hashes the message → digest
//   5. Decrypt signature with PUBLIC key → original digest
//   6. Compare: if digests match → signature is valid!
//
// Requires: Node.js 16+ (uses built-in 'crypto' module, no install needed)
// =============================================================================

const crypto = require('crypto');

// =============================================================================
// Step 1: Generate RSA Key Pair
// =============================================================================

console.log('='.repeat(60));
console.log('  Digital Signatures (RSA) Demo');
console.log('='.repeat(60));

console.log('\n[Step 1] Generating 2048-bit RSA key pair...');
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
console.log('  Key pair generated! ✓');

// =============================================================================
// Step 2: Sign a Message
// =============================================================================

const message = 'I, Alice, authorize the transfer of $1000 to Bob.';
console.log('\n[Step 2] Signing the message:');
console.log('  Message: "' + message + '"');

// Sign: hash the message with SHA-256, then encrypt the hash with private key
const signature = crypto.sign('sha256', Buffer.from(message), privateKey);
console.log('  Signature (hex): ' + signature.toString('hex').slice(0, 60) + '...');
console.log('  Signature size: ' + signature.length + ' bytes');

// =============================================================================
// Step 3: Verify the Signature (Authentic Message)
// =============================================================================

console.log('\n[Step 3] Verifying with the ORIGINAL message:');
const isValid = crypto.verify('sha256', Buffer.from(message), publicKey, signature);
console.log('  Valid signature?', isValid ? 'YES ✓ — Message is authentic!' : 'NO ✗');

// =============================================================================
// Step 4: Tamper Detection — Modified Message
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Tamper Detection Demo');
console.log('='.repeat(60));

// An attacker changes "$1000" to "$1000000"
const tamperedMessage = 'I, Alice, authorize the transfer of $1000000 to Bob.';
console.log('\n  Original message:  "' + message + '"');
console.log('  Tampered message:  "' + tamperedMessage + '"');

const isTamperedValid = crypto.verify(
  'sha256',
  Buffer.from(tamperedMessage),
  publicKey,
  signature
);
console.log('\n  Signature valid for tampered message?',
  isTamperedValid ? 'YES (unexpected!)' : 'NO ✗ — Tampering detected!');

// =============================================================================
// Step 5: Wrong Key Detection
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Wrong Key Demo');
console.log('='.repeat(60));

// Generate a DIFFERENT key pair (simulating an impersonator)
const { publicKey: fakePublicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const isWrongKeyValid = crypto.verify(
  'sha256',
  Buffer.from(message),
  fakePublicKey,  // Using someone ELSE's public key
  signature
);
console.log('\n  Verifying Alice\'s signature with a DIFFERENT public key:');
console.log('  Valid?', isWrongKeyValid ? 'YES (unexpected!)' : 'NO ✗ — Not signed by this key!');

// =============================================================================
// DEMO: Sign and Verify Multiple Messages
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Batch Signing Demo');
console.log('='.repeat(60));

const documents = [
  'Contract: Project deadline is March 31, 2026',
  'Invoice #1234: Amount due $500.00',
  'NDA: Confidential information agreement'
];

console.log();
for (const doc of documents) {
  const sig = crypto.sign('sha256', Buffer.from(doc), privateKey);
  const valid = crypto.verify('sha256', Buffer.from(doc), publicKey, sig);
  console.log('  Document: "' + doc + '"');
  console.log('  Signed & Verified:', valid ? '✓' : '✗');
  console.log();
}

// =============================================================================
// KEY TAKEAWAYS
// =============================================================================

console.log('='.repeat(60));
console.log('  Key Takeaways');
console.log('='.repeat(60));
console.log(`
  1. Sign with PRIVATE key, verify with PUBLIC key (opposite of encryption!)
  2. Digital signatures provide: authentication, integrity, non-repudiation
  3. The signature is over the HASH of the message, not the message itself
  4. Any change to the message invalidates the signature
  5. Only the private key holder can create valid signatures
  6. Real-world uses: software updates, SSL/TLS certificates, code signing,
     legal documents, cryptocurrency transactions
`);
