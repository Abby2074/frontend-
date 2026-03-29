'use strict';

// =============================================================================
// 07 - HMAC (Hash-Based Message Authentication Code)
// =============================================================================
// HMAC combines a hash function (like SHA-256) with a SECRET KEY to create
// a "message authentication code" — a tag that proves:
//   1. The message wasn't tampered with (INTEGRITY)
//   2. The message came from someone with the secret key (AUTHENTICATION)
//
// Formula:
//   HMAC(K, m) = H( (K' ⊕ opad) || H( (K' ⊕ ipad) || m ) )
//
// In plain English:
//   1. Take the secret key and mix it with an inner padding (ipad)
//   2. Hash that together with the message
//   3. Take the secret key and mix it with an outer padding (opad)
//   4. Hash that together with the result from step 2
//
// HMAC vs Digital Signatures:
//   • HMAC = symmetric (shared secret key) — both sides can create & verify
//   • Signatures = asymmetric (key pair) — only private key can sign
//   • HMAC is much FASTER than digital signatures
//   • HMAC does NOT provide non-repudiation (both parties know the key)
//
// Real-world uses: API authentication, JWT tokens, webhook verification,
//   message integrity in protocols like TLS
//
// Requires: Node.js 16+ (uses built-in 'crypto' module, no install needed)
// =============================================================================

const crypto = require('crypto');

// ── Helper: Create HMAC-SHA256 ──────────────────────────────────────────────
function createHmac(message, key) {
  return crypto.createHmac('sha256', key).update(message).digest('hex');
}

// =============================================================================
// DEMO 1: Basic HMAC Creation
// =============================================================================

console.log('='.repeat(60));
console.log('  HMAC-SHA256 Demo');
console.log('='.repeat(60));

const secretKey = 'my-super-secret-key-2024';
const message = 'Transfer $500 to account #12345';

const hmac = createHmac(message, secretKey);

console.log('\n[Demo 1] Create an HMAC:');
console.log('  Message: "' + message + '"');
console.log('  Key:     "' + secretKey + '"');
console.log('  HMAC:    ' + hmac);
console.log('  Length:  ' + hmac.length + ' hex chars = ' + (hmac.length * 4) + ' bits');

// =============================================================================
// DEMO 2: Verification — Same key + same message = same HMAC
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  HMAC Verification Demo');
console.log('='.repeat(60));

// The receiver computes their own HMAC and compares
const receiverHmac = createHmac(message, secretKey);

console.log('\n  Sender\'s HMAC:   ' + hmac);
console.log('  Receiver\'s HMAC: ' + receiverHmac);

// IMPORTANT: Use timing-safe comparison to prevent timing attacks!
// A timing attack measures how long the comparison takes to figure out
// which bytes match. timingSafeEqual always takes the same time.
const hmacBuf1 = Buffer.from(hmac, 'hex');
const hmacBuf2 = Buffer.from(receiverHmac, 'hex');
const isValid = crypto.timingSafeEqual(hmacBuf1, hmacBuf2);

console.log('  Match (timing-safe):', isValid ? 'YES ✓ — Message is authentic!' : 'NO ✗');

// =============================================================================
// DEMO 3: Tamper Detection — Changed message → different HMAC
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Tamper Detection Demo');
console.log('='.repeat(60));

const tamperedMessage = 'Transfer $5000000 to account #12345';  // Changed amount!
const tamperedHmac = createHmac(tamperedMessage, secretKey);

console.log('\n  Original message: "' + message + '"');
console.log('  Original HMAC:    ' + hmac);
console.log('\n  Tampered message: "' + tamperedMessage + '"');
console.log('  Tampered HMAC:    ' + tamperedHmac);
console.log('\n  HMACs match?', hmac === tamperedHmac ? 'YES' : 'NO ✗ — Tampering detected!');

// =============================================================================
// DEMO 4: Different Keys → Different HMACs (even for same message)
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Different Keys Demo');
console.log('='.repeat(60));

const key1 = 'alice-secret-key';
const key2 = 'bob-secret-key';
const key3 = 'eve-secret-key';

const sameMessage = 'Hello, World!';

console.log('\n  Same message: "' + sameMessage + '"');
console.log('  Different keys produce different HMACs:\n');
console.log('  Key: "alice-secret-key" → HMAC: ' + createHmac(sameMessage, key1));
console.log('  Key: "bob-secret-key"   → HMAC: ' + createHmac(sameMessage, key2));
console.log('  Key: "eve-secret-key"   → HMAC: ' + createHmac(sameMessage, key3));
console.log('\n  Without the key, an attacker cannot forge a valid HMAC!');

// =============================================================================
// DEMO 5: Practical Example — API Webhook Verification
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Practical Example: Webhook Verification');
console.log('='.repeat(60));

// Simulating how services like GitHub, Stripe, etc. verify webhooks
const webhookSecret = 'whsec_abc123xyz789';
const webhookPayload = JSON.stringify({
  event: 'payment.completed',
  amount: 99.99,
  customer: 'cust_12345'
});

// The service sends: payload + HMAC signature in a header
const webhookSignature = createHmac(webhookPayload, webhookSecret);

console.log('\n  Webhook payload:', webhookPayload);
console.log('  Webhook secret:  ' + webhookSecret);
console.log('  Signature header: sha256=' + webhookSignature);

// Your server receives the webhook and verifies it
const computedSig = createHmac(webhookPayload, webhookSecret);
const sigBuf1 = Buffer.from(webhookSignature, 'hex');
const sigBuf2 = Buffer.from(computedSig, 'hex');
const webhookValid = crypto.timingSafeEqual(sigBuf1, sigBuf2);

console.log('\n  Your server computes: sha256=' + computedSig);
console.log('  Webhook authentic?', webhookValid ? 'YES ✓' : 'NO ✗');

// =============================================================================
// KEY TAKEAWAYS
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('  Key Takeaways');
console.log('='.repeat(60));
console.log(`
  1. HMAC = Hash + Secret Key → Message Authentication Code
  2. Provides INTEGRITY (detects tampering) and AUTHENTICATION (proves sender)
  3. Does NOT provide non-repudiation (both parties know the shared key)
  4. ALWAYS use timing-safe comparison (crypto.timingSafeEqual) to prevent
     timing attacks when verifying HMACs
  5. HMAC is much faster than digital signatures (symmetric vs asymmetric)
  6. Real-world uses: API auth, JWT tokens, webhook verification, TLS
`);
