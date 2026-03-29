# Cryptographic Algorithms — Class Presentation Guide

A beginner-friendly walkthrough of cryptographic algorithms with runnable Node.js examples. This README is structured as a **step-by-step presentation guide** — each section is one "slide" you can walk through in class.

---

## Table of Contents

1. [How to Get These Files on Your Mac](#1-how-to-get-these-files-on-your-mac)
2. [Project Overview — What's in This Repo](#2-project-overview--whats-in-this-repo)
3. [Question 1 — How Do Digital Signatures Work?](#3-question-1--how-do-digital-signatures-work)
4. [Question 2 — The Math Behind Digital Signatures](#4-question-2--the-math-behind-digital-signatures)
5. [Question 3 — Code Example of Digital Signatures](#5-question-3--code-example-of-digital-signatures)
6. [Question 4 — Encryption and Decryption Example](#6-question-4--encryption-and-decryption-example)
7. [Quick Reference — All 8 Examples](#7-quick-reference--all-8-examples)
8. [Further Reading](#8-further-reading)

---

## 1. How to Get These Files on Your Mac

### What You Need First

You need **Node.js** installed on your Mac. This is the program that runs JavaScript code outside of a web browser.

**Check if you already have it:** Open your Terminal app (search "Terminal" in Spotlight) and type:

```bash
node -v
```

If you see a version number like `v18.17.0` or higher, you're good. If not, download Node.js from [https://nodejs.org](https://nodejs.org) — pick the "LTS" version (the big green button).

### Download the Project

Open Terminal and run these commands one at a time:

```bash
# Step 1: Download (clone) the project from GitHub
git clone https://github.com/Abby2074/frontend-.git

# Step 2: Go into the project folder
cd frontend-

# Step 3: Go into the examples folder
cd crypto-examples

# Step 4: Install the one dependency (bcryptjs for password hashing)
npm install
```

That's it! Now you can run any example:

```bash
# Run a specific example
node 06-digital-signatures.js

# Run ALL examples at once
npm run all
```

> **Note:** 7 out of 8 examples use only built-in Node.js modules — no internet or extra downloads needed. Only `05-bcrypt-hashing.js` needs the `npm install` step.

---

## 2. Project Overview — What's in This Repo

### Why Cryptography Matters

Cryptography is what keeps your data safe every single day. Every time you:
- Visit a website with the lock icon (HTTPS)
- Send a WhatsApp message
- Log into your bank account
- Use Apple Pay

...cryptography is working behind the scenes. It's built on three pillars called the **CIA Triad**:

| Pillar | What It Means | Real-Life Analogy |
|--------|--------------|-------------------|
| **Confidentiality** | Only the right people can read the data | A locked box — only the key holder can open it |
| **Integrity** | The data hasn't been changed or tampered with | A tamper-evident seal on a medicine bottle |
| **Authentication** | You can prove who sent the data | A handwritten signature on a check |

### What's in Each File

| File | What It Does |
|------|-------------|
| `crypto-algorithms-guide.md` | The full written theory guide (covers everything in detail) |
| `01-aes-encryption.js` | AES-256-GCM — the gold standard for encrypting data (symmetric) |
| `02-des-encryption.js` | 3DES — an old, deprecated encryption method (educational only) |
| `03-rsa-encryption.js` | RSA — encryption with public/private keys + step-by-step math |
| `04-sha256-hashing.js` | SHA-256 — one-way hashing with avalanche effect demo |
| `05-bcrypt-hashing.js` | bcrypt — intentionally slow hashing for passwords |
| `06-digital-signatures.js` | Digital Signatures — sign with private key, verify with public key |
| `07-hmac.js` | HMAC — message authentication using a shared secret key |
| `08-diffie-hellman.js` | Diffie-Hellman — two strangers create a shared secret over an insecure channel |

---

## 3. Question 1 — How Do Digital Signatures Work?

### The Simple Analogy

Think of a digital signature like **signing a check at a bank**:

- **Only YOU** can write your signature (you use your **private key** to sign)
- **ANYONE** can look at your signature and verify it's really yours (they use your **public key** to verify)
- If someone **changes the amount** on the check after you signed it, the bank will know it was tampered with (the signature won't match anymore)

### How Is This Different from Encryption?

This is a really important distinction. Digital signatures are the **OPPOSITE** of encryption:

| | Encryption | Digital Signatures |
|---|-----------|-------------------|
| **Who creates it?** | Encrypt with the **PUBLIC** key | Sign with the **PRIVATE** key |
| **Who reads/checks it?** | Decrypt with the **PRIVATE** key | Verify with the **PUBLIC** key |
| **Purpose** | Keep a message **secret** | Prove a message is **authentic** |

With encryption, you're hiding the message. With digital signatures, the message is NOT hidden — anyone can read it. The signature just proves **who sent it** and that **nobody changed it**.

### The 6-Step Process (How It Actually Works)

Imagine Alice wants to send a signed message to Bob. Here's exactly what happens:

**Alice's side (the sender):**

```
Step 1: Alice writes her message
        "I authorize the transfer of $1000 to Bob"

Step 2: Alice runs the message through a hash function (SHA-256)
        This creates a short "fingerprint" of the message called a DIGEST
        "I authorize..." → 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069

Step 3: Alice encrypts this digest with her PRIVATE key
        This encrypted digest IS the digital signature
        digest + private key → signature (a long string of numbers)

Step 4: Alice sends BOTH the original message AND the signature to Bob
        Bob receives: message + signature
```

**Bob's side (the receiver):**

```
Step 5: Bob does TWO things:
        a) He hashes the message himself → gets a digest
        b) He decrypts the signature using Alice's PUBLIC key → gets Alice's original digest

Step 6: Bob compares the two digests:
        - If they MATCH → The signature is VALID!
          (The message really came from Alice and wasn't changed)
        - If they DON'T match → SOMETHING IS WRONG!
          (Either someone tampered with the message, or it wasn't Alice)
```

### What Does a Valid Signature Prove? (Three Guarantees)

| Guarantee | What It Means | Why It Works |
|-----------|--------------|--------------|
| **Authentication** | The message really came from Alice | Only Alice has her private key, so only she could have created the signature |
| **Integrity** | The message wasn't changed after signing | If even ONE character changes, the hash changes completely, so the digests won't match |
| **Non-repudiation** | Alice can't deny she sent it | Only her private key could have created a signature that her public key can verify. She can't say "that wasn't me" |

> **Non-repudiation** is the big difference between digital signatures and HMAC (another way to verify messages). With HMAC, both sides share the same key, so either side could have created the message. With digital signatures, ONLY the private key holder could have signed it.

### Where Are Digital Signatures Used in Real Life?

- **SSL/TLS Certificates** — When you visit a website with HTTPS, the website's certificate is digitally signed. Your browser verifies this signature to make sure you're really talking to the right website and not an impersonator.
- **Software Updates** — When your Mac downloads a software update, it checks the digital signature to make sure Apple actually made the update and nobody tampered with it.
- **Code Signing** — App developers sign their apps so your phone/computer knows the app is legitimate.
- **Cryptocurrency** — Every Bitcoin transaction is digitally signed by the sender's private key.
- **Legal Documents** — DocuSign and similar services use digital signatures for legally binding e-signatures.

---

## 4. Question 2 — The Math Behind Digital Signatures

Digital signatures use **RSA** — the same math as RSA encryption, just used in reverse. Let's walk through it with small numbers so you can follow every calculation by hand.

### Step-by-Step Key Generation

**Step 1: Pick two prime numbers**

```
p = 61
q = 53
```

A prime number is a number that can only be divided by 1 and itself (like 2, 3, 5, 7, 11...). In real RSA, these primes are ~300 digits long. We use small ones here so you can do the math on a calculator.

**Step 2: Multiply them together to get `n`**

```
n = p x q = 61 x 53 = 3233
```

This number `n` is called the **modulus**. It's part of both your public and private keys.

**Step 3: Calculate Euler's totient `phi(n)`**

```
phi(n) = (p - 1) x (q - 1)
       = 60 x 52
       = 3120
```

Don't worry too much about *why* this formula works — just know that Euler's totient counts how many numbers from 1 to `n` don't share any factors with `n`. It's the "secret ingredient" that makes the math work.

**Step 4: Pick a public exponent `e`**

```
e = 17
```

The rule is: `e` must be between 1 and `phi(n)`, and it must share no common factors with `phi(n)` (mathematically: `gcd(e, phi(n)) = 1`). Common choices are 3, 17, or 65537. We pick 17.

**Step 5: Calculate the private exponent `d`**

```
d = 2753
```

`d` is the "modular inverse" of `e`. In plain English: find a number `d` where `(e x d) mod phi(n) = 1`.

```
Verify: 17 x 2753 = 46,801
        46,801 mod 3120 = 46,801 - (15 x 3120) = 46,801 - 46,800 = 1  ✓
```

**Step 6: Your keys are ready!**

```
Public Key:  (e=17,   n=3233)  ← You share this with everyone
Private Key: (d=2753, n=3233)  ← You keep this SECRET
```

### The Signing and Verification Formulas

Now here's where digital signatures use this math:

**To SIGN a message:**

```
signature = hash(message)^d mod n
```

In plain English: take the hash of your message, raise it to the power of your **private** exponent `d`, then take the remainder when divided by `n`.

**To VERIFY a signature:**

```
recovered_hash = signature^e mod n
```

In plain English: take the signature, raise it to the power of the **public** exponent `e`, then take the remainder when divided by `n`. This gives you back the original hash. Compare it to the hash of the received message — if they match, the signature is valid.

### A Worked Example

Let's say the hash of our message is the number `65`:

```
SIGNING (with private key d=2753):
    signature = 65^2753 mod 3233 = 2790

VERIFYING (with public key e=17):
    recovered_hash = 2790^17 mod 3233 = 65  ✓ (matches the original hash!)
```

### Why Does the Math Actually Work?

This is the beautiful part. It works because of **Euler's Theorem**:

```
Since e x d = 1 + k x phi(n)    (for some integer k)

Then:  M^(e x d) mod n
     = M^(1 + k x phi(n)) mod n
     = M x (M^phi(n))^k mod n
     = M x 1^k mod n             ← Euler's theorem says M^phi(n) mod n = 1
     = M  ✓
```

So when you sign with `d` and then verify with `e`, you always get back the original value. The math guarantees it.

### Why Is It Secure?

The security of RSA relies on one simple fact: **factoring large numbers is extremely hard**.

- With small numbers: you can easily see that `3233 = 61 x 53`
- With real RSA (2048-bit keys): `n` is a number with **617 digits**. No computer on Earth can factor a number that large in any reasonable amount of time.

If an attacker can't factor `n`, they can't figure out `p` and `q`, which means they can't compute `phi(n)`, which means they can't compute the private key `d`. Your signature is safe.

---

## 5. Question 3 — Code Example of Digital Signatures

Here's the actual code from `06-digital-signatures.js` with detailed explanations of every line.

### Part A: Generate the Key Pair

```javascript
const crypto = require('crypto');

// Generate a 2048-bit RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
```

**What's happening here:**
- `crypto` is Node.js's built-in cryptography library — no install needed
- `generateKeyPairSync('rsa', ...)` creates a brand new RSA key pair
- `modulusLength: 2048` means the key is 2048 bits long (industry standard minimum)
- `publicKey` is what you share with everyone
- `privateKey` is what you keep secret
- `pem` format means the keys are stored as human-readable text strings

### Part B: Sign a Message

```javascript
const message = 'I, Alice, authorize the transfer of $1000 to Bob.';

// Sign: hash the message with SHA-256, then encrypt the hash with private key
const signature = crypto.sign('sha256', Buffer.from(message), privateKey);
```

**What's happening here:**
- We have a message that Alice wants to sign
- `crypto.sign('sha256', ...)` does two things in one call:
  1. It hashes the message using SHA-256 (creates a fingerprint)
  2. It encrypts that hash with Alice's **private key**
- The result is the `signature` — a long string of bytes that proves Alice signed this exact message
- `Buffer.from(message)` converts the text string into raw bytes (which is what the crypto functions need)

### Part C: Verify the Signature

```javascript
// Verify: hash the message, decrypt the signature with public key, compare
const isValid = crypto.verify('sha256', Buffer.from(message), publicKey, signature);
console.log('Valid signature?', isValid);  // true
```

**What's happening here:**
- `crypto.verify('sha256', ...)` does the reverse:
  1. It hashes the received message using SHA-256
  2. It decrypts the signature using Alice's **public key**
  3. It compares the two — if they match, returns `true`
- If `isValid` is `true`, we know:
  - The message really came from Alice (only she has the private key)
  - The message wasn't changed (the hash would be different)

### Part D: Tamper Detection Demo

What happens if someone changes the message after Alice signed it?

```javascript
// An attacker changes "$1000" to "$1000000"
const tamperedMessage = 'I, Alice, authorize the transfer of $1000000 to Bob.';

const isTamperedValid = crypto.verify(
  'sha256',
  Buffer.from(tamperedMessage),  // Using the TAMPERED message
  publicKey,
  signature                      // But the ORIGINAL signature
);
console.log('Valid?', isTamperedValid);  // false — Tampering detected!
```

**What's happening here:**
- The attacker changed "$1000" to "$1000000" — a sneaky modification
- When we verify, the hash of the tampered message is **completely different** from the hash Alice originally signed
- The signature check **fails** — we caught the tamperer!
- Even changing a single character (like adding one extra "0") would cause the verification to fail

### Part E: Wrong Key Demo

What if someone tries to verify with a DIFFERENT person's public key?

```javascript
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
console.log('Valid?', isWrongKeyValid);  // false — Not signed by this key!
```

**What's happening here:**
- We created a completely different key pair (imagine this belongs to an impersonator named "Eve")
- We try to verify Alice's signature using Eve's public key
- It **fails** because Alice's signature was created with Alice's private key — it can only be verified with Alice's matching public key
- This proves **authentication** — you can confirm exactly who signed the message

### Run It Yourself

```bash
cd crypto-examples
node 06-digital-signatures.js
```

You'll see all of the above demos run with real output in your terminal.

---

## 6. Question 4 — Encryption and Decryption Example

This uses `03-rsa-encryption.js`, which has two parts: a manual "textbook" example with small numbers (so you can see the math), and a real-world example using proper RSA-OAEP.

### Part A: Manual RSA with Small Numbers (See the Math!)

```javascript
// Step 1: Choose two prime numbers
const p = 61n;   // The "n" suffix means BigInt (handles large numbers exactly)
const q = 53n;

// Step 2: Compute the modulus
const n = p * q;  // n = 3233

// Step 3: Compute Euler's totient
const phi = (p - 1n) * (q - 1n);  // phi = 3120

// Step 4: Choose public exponent
const e = 17n;

// Step 5: Compute private exponent (modular inverse of e)
const d = 2753n;  // (17 * 2753) mod 3120 = 1
```

**What's happening here:**
- We manually pick two small prime numbers and compute all the RSA key components by hand
- The `n` suffix on numbers means "BigInt" — JavaScript's way of handling very large numbers without rounding errors
- After these steps: **Public key = (17, 3233)** and **Private key = (2753, 3233)**

#### Encryption (Scrambling the Message)

```javascript
const message = 65n;  // The number 65 (ASCII code for the letter 'A')

// Encryption formula: ciphertext = message^e mod n
const ciphertext = modPow(message, e, n);
// 65^17 mod 3233 = 2790
```

**What's happening here:**
- We want to encrypt the number 65 (which represents the letter 'A')
- The encryption formula is: `C = M^e mod n`
- In plain English: take 65, raise it to the power of 17, divide by 3233, and keep only the remainder
- Result: **65 becomes 2790** — the message is now scrambled!
- `modPow` is a helper function that does this calculation efficiently (raising to large powers directly would create impossibly huge numbers)

#### Decryption (Unscrambling the Message)

```javascript
// Decryption formula: message = ciphertext^d mod n
const decrypted = modPow(ciphertext, d, n);
// 2790^2753 mod 3233 = 65  ← Original message recovered!
```

**What's happening here:**
- We take the scrambled number 2790
- The decryption formula is: `M = C^d mod n`
- In plain English: take 2790, raise it to the power of 2753, divide by 3233, and keep only the remainder
- Result: **2790 becomes 65 again** — we got our original message back!
- This works because of Euler's theorem (the math guarantees that encrypting then decrypting always returns the original)

### Part B: Real RSA-OAEP Encryption (How It's Done in Practice)

In real life, you don't do the math by hand. You use the `crypto` library with proper padding (OAEP) for security.

#### Encryption with Public Key

```javascript
const crypto = require('crypto');

// Generate a real 2048-bit RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// The message we want to encrypt
const realMessage = 'RSA encrypts this secret message!';

// Encrypt with the public key
const encryptedBuffer = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,  // OAEP padding (secure)
    oaepHash: 'sha256'
  },
  Buffer.from(realMessage)
);
console.log('Encrypted:', encryptedBuffer.toString('hex'));
// Output: a long string of random-looking hex characters
```

**What's happening here:**
- `crypto.publicEncrypt()` encrypts the message using the **public key**
- Anyone who has the public key can encrypt a message — but only the private key holder can decrypt it
- `RSA_PKCS1_OAEP_PADDING` adds random padding before encrypting. This is critical because:
  - Without padding, the same message always produces the same ciphertext (an attacker could notice patterns)
  - With OAEP, the same message produces **different** ciphertext every time (the randomness makes it unpredictable)

#### Decryption with Private Key

```javascript
// Decrypt with the private key
const decryptedBuffer = crypto.privateDecrypt(
  {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  encryptedBuffer
);
console.log('Decrypted:', decryptedBuffer.toString('utf8'));
// Output: "RSA encrypts this secret message!"
```

**What's happening here:**
- `crypto.privateDecrypt()` decrypts the message using the **private key**
- Only the person with the private key can do this — that's the whole point of asymmetric encryption
- The decrypted message matches the original exactly: `"RSA encrypts this secret message!"`

### Summary: Encryption vs Decryption

```
ENCRYPTION (hiding the message):
    Original Message  →  [Public Key + OAEP Padding]  →  Scrambled Ciphertext
    "Hello"           →  encrypt                       →  "8f3a2b..."

DECRYPTION (revealing the message):
    Scrambled Ciphertext  →  [Private Key + OAEP Padding]  →  Original Message
    "8f3a2b..."           →  decrypt                        →  "Hello"
```

### Run It Yourself

```bash
cd crypto-examples
node 03-rsa-encryption.js
```

You'll see both the manual math demo AND the real RSA-OAEP encryption/decryption in action.

---

## 7. Quick Reference — All 8 Examples

Here's how to run every example in the project:

```bash
cd crypto-examples
npm install   # Only needed once (installs bcryptjs)
```

| # | Command | What It Demonstrates |
|---|---------|---------------------|
| 1 | `node 01-aes-encryption.js` | AES-256-GCM symmetric encryption + tamper detection |
| 2 | `node 02-des-encryption.js` | 3DES encryption (deprecated — for education only) |
| 3 | `node 03-rsa-encryption.js` | RSA encryption/decryption with math + real OAEP |
| 4 | `node 04-sha256-hashing.js` | SHA-256 hashing with avalanche effect visualization |
| 5 | `node 05-bcrypt-hashing.js` | bcrypt password hashing with adaptive cost demo |
| 6 | `node 06-digital-signatures.js` | RSA digital signatures — sign, verify, tamper/wrong-key detection |
| 7 | `node 07-hmac.js` | HMAC-SHA256 message authentication + webhook example |
| 8 | `node 08-diffie-hellman.js` | Diffie-Hellman key exchange — Alice & Bob shared secret |

Or run all at once: `npm run all`

---

## 8. Further Reading

- **Full Theory Guide:** See [`crypto-algorithms-guide.md`](crypto-algorithms-guide.md) for in-depth explanations of every algorithm, including math, diagrams, and a comparison table of all 8 algorithms.

- **Algorithm Comparison Table:** Section 7 of the guide has a quick-reference table comparing key sizes, speed, use cases, and security status of every algorithm.

- **Golden Rule:** Never implement your own cryptography in production. Always use proven, well-tested libraries like Node.js's built-in `crypto` module.
