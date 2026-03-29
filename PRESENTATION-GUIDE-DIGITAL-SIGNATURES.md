# Digital Signatures — Complete Presentation Guide

## How to Use This Document

This guide is written so you can **read it out loud** in class. Everything is explained in plain English. The sections marked **"SAY:"** are exactly what you can say to your class. The sections marked **"SHOW:"** tell you what to display or run on screen.

---

## Part 1: What Are Digital Signatures?

### SAY:

"Let me start by explaining what digital signatures are with a simple real-world analogy.

Think about when you sign a cheque or a contract. Your handwritten signature does three things:

1. **It proves who you are** — only you can write your signature
2. **It proves the document hasn't been changed** — if someone erases and rewrites the amount on a cheque, the bank would see the tampering
3. **You can't deny you signed it** — your signature is unique to you

Digital signatures do the exact same thing, but for electronic data — emails, software updates, documents, cryptocurrency transactions.

In cryptography, we call these three properties:

- **Authentication** — proves who sent the message
- **Integrity** — proves the message wasn't altered
- **Non-repudiation** — the sender cannot deny sending it"

---

## Part 2: How Digital Signatures Actually Work (Step by Step)

### SAY:

"Digital signatures use **asymmetric cryptography** — that means two keys:

- A **private key** that only YOU have (like your personal signature)
- A **public key** that EVERYONE can have (like your signature on file at the bank)

Here's the important part — digital signatures are the **reverse** of encryption:

| | Encryption | Digital Signatures |
|---|---|---|
| **Create** | Encrypt with PUBLIC key | Sign with PRIVATE key |
| **Verify** | Decrypt with PRIVATE key | Verify with PUBLIC key |

Now let me walk you through exactly how signing and verifying works."

---

### The Signing Process (What the Sender Does)

### SAY:

"When Alice wants to digitally sign a message, here's what happens step by step:

**Step 1: Start with the original message**

Alice has a message she wants to send, for example:
`'I, Alice, authorize the transfer of $1000 to Bob.'`

**Step 2: Hash the message**

Before signing, we first run the message through a hash function (SHA-256).

Why? Because RSA can only sign small amounts of data. SHA-256 turns ANY size message into a fixed 256-bit fingerprint. So instead of signing the whole message, we sign its fingerprint.

```
Message: 'I, Alice, authorize the transfer of $1000 to Bob.'
         ↓ SHA-256 hash function
Digest:  a1b2c3d4e5f6... (256 bits — always the same size)
```

**Step 3: Encrypt the hash with the PRIVATE key**

Alice takes that hash digest and encrypts it using her **private key**. The result is the **digital signature**.

```
Digest:  a1b2c3d4e5f6...
         ↓ Encrypt with Alice's PRIVATE key
Signature: 7f8e9d0c1b2a... (this IS the digital signature)
```

**Step 4: Send the message + signature**

Alice sends two things to Bob:
1. The original message (in plain text — it's NOT encrypted)
2. The digital signature

Important: the message itself is NOT secret! Digital signatures are about **proving who sent it**, not hiding the content."

---

### The Verification Process (What the Receiver Does)

### SAY:

"When Bob receives Alice's message and signature, here's how he verifies it:

**Step 1: Hash the received message**

Bob takes the message he received and hashes it himself with SHA-256, producing his own digest.

```
Received message: 'I, Alice, authorize the transfer of $1000 to Bob.'
                  ↓ SHA-256
Bob's digest:     a1b2c3d4e5f6...
```

**Step 2: Decrypt the signature with Alice's PUBLIC key**

Bob takes the signature and decrypts it using Alice's **public key**. This gives him the original digest that Alice created.

```
Signature:        7f8e9d0c1b2a...
                  ↓ Decrypt with Alice's PUBLIC key
Original digest:  a1b2c3d4e5f6...
```

**Step 3: Compare the two digests**

If Bob's digest matches the decrypted original digest → the signature is **VALID**.

```
Bob's digest:     a1b2c3d4e5f6...
Original digest:  a1b2c3d4e5f6...
                  ↑ MATCH! ✓ Signature is valid!
```

If they don't match, either:
- The message was **tampered with** (someone changed it)
- The signature was **not created by Alice** (wrong private key)"

---

### The Full Flow Diagram

### SAY:

"Here's the complete picture:

```
ALICE (Sender)                           BOB (Receiver)
─────────────                           ──────────────
1. Write message                        4. Receive message + signature
2. Hash message → digest               5. Hash received message → digest
3. Encrypt digest with                  6. Decrypt signature with
   PRIVATE key → signature                Alice's PUBLIC key → original digest
                                        7. Compare digests
        ─── Send message + signature ───→
                                           Match? → VALID ✓
                                           No match? → INVALID ✗
```"

---

## Part 3: The Mathematics Behind Digital Signatures

### SAY:

"Digital signatures use RSA mathematics. Let me walk you through the math using small numbers so you can follow along.

### Key Generation (the setup)

First, we need to generate the key pair:

**Step 1:** Choose two prime numbers
```
p = 61,  q = 53
```

**Step 2:** Multiply them to get n (the modulus)
```
n = 61 × 53 = 3233
```

**Step 3:** Compute Euler's totient — this counts how many numbers less than n are coprime with n
```
φ(n) = (p − 1) × (q − 1)
     = 60 × 52
     = 3120
```

**Step 4:** Choose the public exponent e (must be coprime with φ(n))
```
e = 17
Verify: gcd(17, 3120) = 1 ✓
```

**Step 5:** Find the private exponent d (the modular inverse of e)
```
d × e ≡ 1 (mod φ(n))
d × 17 ≡ 1 (mod 3120)
d = 2753

Verify: 17 × 2753 = 46,801
        46,801 mod 3120 = 1 ✓
```

**The keys:**
```
Public key:  (e = 17,   n = 3233)  ← everyone gets this
Private key: (d = 2753, n = 3233)  ← only Alice has this
```

---

### Signing with Math

Now let's sign a message. We'll use M = 65 (the number 65, which is ASCII for the letter 'A'):

**Step 1:** Hash the message to get a digest. For simplicity, let's say our digest value is H = 65

**Step 2:** Sign by raising H to the power of d (private exponent), mod n:

```
Signature = H^d mod n
          = 65^2753 mod 3233
          = 2790
```

So the signature is the number **2790**.

### Verifying with Math

Bob receives the message and signature (2790). He has Alice's public key (e=17, n=3233):

**Step 1:** Hash the received message himself → gets H = 65

**Step 2:** Decrypt the signature using the public key:

```
Recovered H = Signature^e mod n
            = 2790^17 mod 3233
            = 65
```

**Step 3:** Compare:
```
Bob's hash:      65
Recovered hash:  65
MATCH ✓ → Signature is valid!
```

### Why This Works (Euler's Theorem)

The reason decryption recovers the original value is Euler's theorem:

```
Since d × e ≡ 1 (mod φ(n)):
    d × e = 1 + k × φ(n)     for some integer k

So: (H^d)^e mod n
  = H^(d×e) mod n
  = H^(1 + k×φ(n)) mod n
  = H × (H^φ(n))^k mod n
  = H × 1^k mod n             ← Euler's theorem: H^φ(n) ≡ 1 (mod n)
  = H ✓
```

In plain English: because of the special mathematical relationship between d and e, raising a number to the power of d and then e (mod n) always gives you back the original number."

---

## Part 4: The Code — Digital Signatures in Node.js

### SAY:

"Now let me show you this working in real code. Our script does four things:
1. Generates an RSA key pair
2. Signs a message with the private key
3. Verifies the signature with the public key
4. Demonstrates what happens when someone tampers with the message

Let me run it and walk you through every line."

### SHOW: Run the script

```bash
node 06-digital-signatures.js
```

---

### Line-by-Line Code Explanation

### SAY (while showing the code):

**Lines 1-27: The header comments**
```javascript
'use strict';
```
"This line tells Node.js to use strict mode, which catches common coding mistakes. It's a best practice."

```javascript
// Digital signatures are the REVERSE of encryption:
//   • Encryption:  encrypt with PUBLIC key,  decrypt with PRIVATE key
//   • Signatures:  sign with PRIVATE key,    verify with PUBLIC key
```
"These comments summarize the key concept — signatures are the opposite direction of encryption."

```javascript
// How it works:
//   1. Hash the message (SHA-256) → digest
//   2. Encrypt the digest with PRIVATE key → signature
//   3. Send message + signature
//   4. Receiver hashes the message → digest
//   5. Decrypt signature with PUBLIC key → original digest
//   6. Compare: if digests match → signature is valid!
```
"This is the complete signing and verification flow, right in the comments for reference."

---

**Line 29: Import the crypto module**
```javascript
const crypto = require('crypto');
```
"This imports Node.js's built-in `crypto` module. It comes with Node.js — no installation needed. This module gives us access to RSA key generation, signing, and verification functions."

---

**Lines 40-44: Generate the RSA key pair**
```javascript
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
```

"Let me break this line down piece by piece:

- `crypto.generateKeyPairSync('rsa', ...)` — this generates a brand new RSA key pair. `Sync` means it runs and finishes before moving on.
- `modulusLength: 2048` — this is the key size in bits. 2048 bits is the industry minimum. Remember our math example used tiny primes (61, 53) giving n=3233, which is only about 12 bits. Real RSA uses primes that are about 300 digits long, giving n that is about 617 digits long. That's 2048 bits.
- `type: 'spki'` and `type: 'pkcs8'` — these are standard key format names. SPKI is for public keys, PKCS8 is for private keys.
- `format: 'pem'` — PEM is a text format that looks like `-----BEGIN PUBLIC KEY-----` followed by Base64 encoded data. It's human-readable.
- The `{ publicKey, privateKey }` on the left is JavaScript destructuring — it pulls both keys out of the returned object."

---

**Lines 51-58: Sign the message**
```javascript
const message = 'I, Alice, authorize the transfer of $1000 to Bob.';

const signature = crypto.sign('sha256', Buffer.from(message), privateKey);
```

"This is where the signing happens. Let me explain each argument:

- `'sha256'` — this tells the function to first hash the message with SHA-256 before signing. Remember, RSA can only sign small data, so we hash first to get a fixed-size digest.
- `Buffer.from(message)` — converts our text string into a Buffer (raw bytes). Cryptographic functions work on bytes, not text.
- `privateKey` — Alice's private key. This is what makes the signature uniquely hers. Nobody else has this key, so nobody else can create this signature.

The function does TWO things internally:
1. Hashes the message with SHA-256 → produces a 256-bit digest
2. Encrypts that digest with Alice's private key → produces the signature

The result `signature` is a Buffer containing 256 bytes (for a 2048-bit RSA key). We display it in hexadecimal format."

---

**Lines 64-66: Verify the signature (authentic message)**
```javascript
const isValid = crypto.verify('sha256', Buffer.from(message), publicKey, signature);
```

"This is the verification step — what Bob does when he receives the message. The arguments:

- `'sha256'` — use the same hash algorithm that was used for signing
- `Buffer.from(message)` — the message Bob received
- `publicKey` — Alice's public key (anyone can have this)
- `signature` — the signature Alice sent alongside the message

Internally, this function:
1. Hashes the received message with SHA-256 → Bob's digest
2. Decrypts the signature with Alice's public key → original digest
3. Compares the two digests
4. Returns `true` if they match, `false` if they don't

The result `isValid` will be `true` — the message is authentic!"

---

**Lines 77-88: Tamper detection demo**
```javascript
const tamperedMessage = 'I, Alice, authorize the transfer of $1000000 to Bob.';

const isTamperedValid = crypto.verify(
  'sha256',
  Buffer.from(tamperedMessage),
  publicKey,
  signature
);
```

"Now we simulate an attacker changing the message. Notice the amount changed from $1000 to $1000000 — three extra zeros.

We try to verify the ORIGINAL signature against the TAMPERED message. What happens?

1. `crypto.verify` hashes the tampered message → gets a completely different digest (remember the avalanche effect from SHA-256 — changing even one character changes ~50% of the hash bits)
2. It decrypts the signature with the public key → gets Alice's original digest
3. It compares them → they DON'T match

Result: `false` — tampering detected! The signature was created for the original message, not the tampered one. Any change, even a single character, makes the signature invalid."

---

**Lines 99-112: Wrong key detection**
```javascript
const { publicKey: fakePublicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const isWrongKeyValid = crypto.verify(
  'sha256',
  Buffer.from(message),
  fakePublicKey,
  signature
);
```

"Here we simulate an impersonator. We generate a completely DIFFERENT key pair — this is someone else's key. Then we try to verify Alice's signature using this impostor's public key.

Result: `false` — the signature doesn't verify. Why? Because Alice signed with HER private key, and only HER matching public key can decrypt it correctly. A different public key will decrypt to garbage, which won't match the message hash.

This proves **authentication** — the signature could only have been created by the holder of Alice's private key."

---

**Lines 122-135: Batch signing demo**
```javascript
const documents = [
  'Contract: Project deadline is March 31, 2026',
  'Invoice #1234: Amount due $500.00',
  'NDA: Confidential information agreement'
];

for (const doc of documents) {
  const sig = crypto.sign('sha256', Buffer.from(doc), privateKey);
  const valid = crypto.verify('sha256', Buffer.from(doc), publicKey, sig);
  console.log('  Document: "' + doc + '"');
  console.log('  Signed & Verified:', valid ? '✓' : '✗');
}
```

"This shows that you can sign multiple different documents with the same key pair. Each document gets its own unique signature (because each document has a different hash), but they're all verified with the same public key.

This is exactly how it works in the real world — a company has one key pair and signs thousands of documents, software updates, or transactions with it."

---

## Part 5: Encryption vs Digital Signatures — Side by Side

### SAY:

"A lot of people confuse encryption with digital signatures. Let me show you the difference clearly.

### Encryption (Keeping Secrets)

The goal is **confidentiality** — hiding the message so only the recipient can read it.

```
Alice wants to send a SECRET message to Bob:

1. Alice encrypts with Bob's PUBLIC key    →  ciphertext (unreadable gibberish)
2. Alice sends the ciphertext to Bob
3. Bob decrypts with his own PRIVATE key   →  original message

Nobody else can read it because nobody else has Bob's private key.
```

**Direction: PUBLIC key encrypts → PRIVATE key decrypts**

### Digital Signatures (Proving Identity)

The goal is **authentication** — proving who sent the message and that it wasn't changed.

```
Alice wants to PROVE she sent a message:

1. Alice signs with her own PRIVATE key    →  signature
2. Alice sends the message + signature to Bob
3. Bob verifies with Alice's PUBLIC key    →  valid or invalid

Anyone can READ the message, but only Alice could have SIGNED it.
```

**Direction: PRIVATE key signs → PUBLIC key verifies**

### Key Difference

| Feature | Encryption | Digital Signature |
|---------|-----------|-------------------|
| Purpose | Hide the message | Prove who sent it |
| Sender uses | Recipient's PUBLIC key | Sender's PRIVATE key |
| Receiver uses | Recipient's PRIVATE key | Sender's PUBLIC key |
| Message visible? | No (encrypted) | Yes (not hidden) |
| Confidentiality | ✓ | ✗ |
| Authentication | ✗ | ✓ |
| Integrity | ✗ (use GCM mode) | ✓ |
| Non-repudiation | ✗ | ✓ |

In practice, you often use BOTH together — encrypt the message for secrecy, AND sign it to prove who sent it."

---

## Part 6: How to Present This in Class

### Suggested Presentation Flow (15-20 minutes)

**Minute 0-3: The Analogy (no code, no math)**
- Start with the handwritten signature analogy
- Explain the three properties: authentication, integrity, non-repudiation
- Ask the class: "How do you know a text message really came from your friend?"

**Minute 3-6: How It Works (the flow diagram)**
- Show the signing process (3 steps)
- Show the verification process (3 steps)
- Draw the full flow diagram on the board or show it on screen
- Emphasize: "The message is NOT encrypted — it's about proving WHO sent it"

**Minute 6-10: The Math (with small numbers)**
- Walk through key generation with p=61, q=53
- Show signing: `65^2753 mod 3233 = 2790`
- Show verifying: `2790^17 mod 3233 = 65`
- Briefly mention Euler's theorem (don't go too deep unless asked)

**Minute 10-15: Live Code Demo**
- Open terminal, run `node 06-digital-signatures.js`
- Walk through the output section by section
- Point out: "Look — the valid message says YES, the tampered message says NO"
- Point out: "Even a different key pair fails — proves authentication"

**Minute 15-18: Encryption vs Signatures Comparison**
- Show the side-by-side comparison table
- Emphasize the reversed direction of keys
- Real-world examples: HTTPS certificates, app store code signing, Bitcoin

**Minute 18-20: Q&A / Summary**
- Recap the three properties
- Mention real-world uses

### Tips for Presenting

1. **Run the demo LIVE** — open your terminal and type `node 06-digital-signatures.js`. Live demos are more impressive than screenshots
2. **Point at the output** as you explain each section
3. **Pause after the tamper detection** — let the class see that changing $1000 to $1000000 breaks the signature
4. **If someone asks "why not just encrypt?"** — explain that encryption hides the message, signatures prove who sent it. You often use both together
5. **If someone asks about the math** — use the small number example (p=61, q=53). Don't try to explain modular exponentiation in detail unless the class is comfortable with it

### Common Questions Your Class Might Ask

**Q: "Can someone copy your digital signature from one document to another?"**
A: No! The signature is tied to the specific message content. If you attach Alice's signature from Document A to Document B, verification will fail because Document B has a different hash.

**Q: "What if someone steals your private key?"**
A: Then they can forge your signature. This is why private key security is critical. In practice, private keys are stored in hardware security modules (HSMs), encrypted key stores, or smart cards.

**Q: "Is this what HTTPS uses?"**
A: Yes! When you visit a website, the server sends its SSL certificate which contains its public key and a digital signature from a Certificate Authority (CA). Your browser verifies the signature to confirm the website is legitimate.

**Q: "Why hash first? Why not just sign the whole message?"**
A: RSA can only process data smaller than the key size (~256 bytes for 2048-bit RSA). A message could be megabytes long. Hashing reduces ANY size message to exactly 256 bits (32 bytes), which RSA can sign.
