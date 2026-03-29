# Cryptographic Algorithms Guide

A beginner-friendly guide to understanding cryptographic algorithms, the math behind them, and how to use them in code. Each section includes plain-English explanations, step-by-step math, and runnable Node.js examples.

---

## Table of Contents

1. [Introduction to Cryptography](#1-introduction-to-cryptography)
2. [Symmetric Encryption](#2-symmetric-encryption-same-key-encrypts-and-decrypts)
3. [Asymmetric Encryption (RSA)](#3-asymmetric-encryption-public-key--private-key)
4. [Hashing Algorithms](#4-hashing-algorithms-one-way-functions)
5. [Digital Signatures & Message Authentication](#5-digital-signatures--message-authentication)
6. [Key Exchange (Diffie-Hellman)](#6-key-exchange-diffie-hellman)
7. [Comparison Table & Summary](#7-comparison-table--summary)

---

## 1. Introduction to Cryptography

**Cryptography** is the science of securing information so that only authorized parties can access it. Every time you visit a website with HTTPS, send a message on WhatsApp, or log into your bank account, cryptography is working behind the scenes.

### The Three Pillars of Security (CIA Triad)

| Pillar | Meaning | Analogy |
|--------|---------|---------|
| **Confidentiality** | Only authorized people can read the data | A locked box — only the key holder can open it |
| **Integrity** | Data hasn't been tampered with | A tamper-evident seal — you can tell if someone opened it |
| **Authentication** | You can verify who sent the data | A handwritten signature — proves who wrote the document |

### Three Types of Cryptographic Algorithms

| Type | How It Works | Key Count | Speed | Example Use |
|------|-------------|-----------|-------|-------------|
| **Symmetric** | Same key encrypts and decrypts | 1 key | Fast | Encrypting files, database encryption |
| **Asymmetric** | Public key encrypts, private key decrypts | 2 keys | Slow | Secure key exchange, digital signatures |
| **Hashing** | One-way function, no key needed | No key | Fast | Password storage, file integrity |

> **Code examples:** All runnable scripts are in the [`crypto-examples/`](crypto-examples/) directory. Run `cd crypto-examples && npm install` first, then `node <filename>` for any script.

---

## 2. Symmetric Encryption (Same Key Encrypts and Decrypts)

Symmetric encryption is like a door lock — the **same key** locks (encrypts) and unlocks (decrypts) it. If you and your friend both have a copy of the key, you can exchange locked boxes securely.

### AES (Advanced Encryption Standard)

AES is the **gold standard** for symmetric encryption. It's used by governments, banks, and virtually every secure application today.

**How AES Works (simplified):**

AES operates on a 4×4 grid of bytes called the **state matrix**. Each round applies four transformations:

1. **SubBytes** — Substitutes each byte using a lookup table (S-box). This adds **confusion** — the relationship between key and ciphertext becomes complex.

2. **ShiftRows** — Shifts each row of the state matrix by a different offset. Row 0 stays, Row 1 shifts left by 1, Row 2 by 2, Row 3 by 3.

3. **MixColumns** — Mixes the bytes within each column using matrix multiplication. This adds **diffusion** — each output byte depends on multiple input bytes.

4. **AddRoundKey** — XORs the state with a portion of the expanded key. This is where the secret key actually gets mixed in.

These four steps repeat for multiple rounds:

| Key Size | Rounds |
|----------|--------|
| AES-128 (128 bits) | 10 rounds |
| AES-192 (192 bits) | 12 rounds |
| AES-256 (256 bits) | 14 rounds |

**GCM Mode (Galois/Counter Mode):**

AES by itself only encrypts one 16-byte block. To encrypt longer messages, we use a **mode of operation**. GCM is the recommended mode because it provides:
- **Encryption** — keeps data secret
- **Authentication** — detects if anyone tampered with the ciphertext (via an "auth tag")

> **Code:** See [`crypto-examples/01-aes-encryption.js`](crypto-examples/01-aes-encryption.js) — encrypts and decrypts with AES-256-GCM, plus a tamper detection demo.

---

### 3DES (Triple DES) — Deprecated

> ⚠️ **WARNING:** 3DES was deprecated by NIST in 2023. Use AES instead. This section is for educational purposes only.

Before AES, there was DES (Data Encryption Standard) with a 56-bit key. When DES became too weak, the quick fix was to **apply DES three times** — hence "Triple DES" or 3DES.

**Feistel Network Structure:**

DES (and by extension 3DES) uses a structure called a **Feistel network**:

```
Plaintext
    ├── Left half (L)    Right half (R)
    │                        │
    │    ┌──────────┐        │
    │    │ Round     │◄───── Key_i
    │    │ Function  │        │
    │    └────┬─────┘        │
    │         │               │
    │    XOR ◄┘               │
    │     │                   │
    └─────┼───────────────────┘
          │         Swap L and R
          ▼
    Next Round...
```

Each round splits the data into left and right halves, applies a function to one half using a sub-key, XORs the result with the other half, then swaps them. DES does this for 16 rounds.

**3DES applies DES three times** in an Encrypt-Decrypt-Encrypt (EDE) pattern:

```
Plaintext → [Encrypt with K1] → [Decrypt with K2] → [Encrypt with K3] → Ciphertext
```

This gives an effective key length of 168 bits (3 × 56), though real security is ~112 bits due to meet-in-the-middle attacks.

**Why 3DES was replaced by AES:**
- 3DES is **~3x slower** (applies DES three times)
- 64-bit block size is vulnerable to **birthday attacks** on large data
- AES has a **128-bit block size** and was designed for modern hardware

> **Code:** See [`crypto-examples/02-des-encryption.js`](crypto-examples/02-des-encryption.js) — encrypts and decrypts with 3DES, includes a comparison table.

---

## 3. Asymmetric Encryption (Public Key + Private Key)

Asymmetric encryption uses **two different keys**: a public key and a private key. Think of it like a **mailbox** — anyone can drop mail in through the slot (public key encrypts), but only the owner has the key to open it (private key decrypts).

### RSA (Rivest-Shamir-Adleman)

RSA is the most well-known asymmetric algorithm. Let's walk through exactly how it works with small numbers.

#### Step-by-Step RSA Key Generation (Worked Example)

We'll use small primes so you can follow every calculation by hand.

**Step 1: Choose two prime numbers**

```
p = 61
q = 53
```

**Step 2: Compute n = p × q**

```
n = 61 × 53 = 3233
```

`n` is the **modulus** — it's part of both the public and private keys.

**Step 3: Compute Euler's totient φ(n) = (p − 1)(q − 1)**

```
φ(n) = (61 − 1) × (53 − 1)
     = 60 × 52
     = 3120
```

Euler's totient tells us how many numbers from 1 to n are **coprime** with n (share no common factors). This is the "secret ingredient" that makes RSA work.

**Step 4: Choose the public exponent e**

`e` must satisfy: `1 < e < φ(n)` and `gcd(e, φ(n)) = 1` (e and φ(n) share no common factors).

```
e = 17

Verify: gcd(17, 3120) = 1 ✓
```

Common choices for e: 3, 17, or 65537.

**Step 5: Compute the private exponent d**

`d` is the **modular inverse** of `e` mod `φ(n)`. In other words, find `d` such that:

```
(e × d) mod φ(n) = 1
(17 × d) mod 3120 = 1
```

Using the Extended Euclidean Algorithm:

```
d = 2753

Verify: 17 × 2753 = 46,801
        46,801 mod 3120 = 46,801 − (15 × 3120) = 46,801 − 46,800 = 1 ✓
```

**Step 6: Our keys are ready!**

```
Public Key:  (e=17,   n=3233)  ← Share with everyone
Private Key: (d=2753, n=3233)  ← Keep secret!
```

#### Encryption and Decryption

**Encrypt** a message `M` (must be a number less than `n`):

```
C = M^e mod n
```

**Decrypt** a ciphertext `C`:

```
M = C^d mod n
```

**Worked example with M = 65 (ASCII for 'A'):**

```
Encrypt:  C = 65^17 mod 3233 = 2790
Decrypt:  M = 2790^2753 mod 3233 = 65 ✓  (original message recovered!)
```

#### Why Does This Work? (Euler's Theorem)

The magic is in Euler's theorem. Since `e × d ≡ 1 (mod φ(n))`, we know:

```
e × d = 1 + k × φ(n)    for some integer k
```

So when we decrypt:

```
C^d mod n = (M^e)^d mod n
          = M^(e×d) mod n
          = M^(1 + k×φ(n)) mod n
          = M × (M^φ(n))^k mod n
          = M × 1^k mod n          ← Euler's theorem: M^φ(n) ≡ 1 (mod n)
          = M ✓
```

#### Why Is RSA Secure?

RSA's security relies on the fact that **factoring large numbers is hard**. Given `n = 3233`, it's easy to find that `3233 = 61 × 53`. But for a 2048-bit `n` (a number with ~617 digits), no known algorithm can factor it in a reasonable time.

#### OAEP Padding

Raw "textbook RSA" (just computing `M^e mod n`) is insecure because:
- It's **deterministic**: same message always produces the same ciphertext
- It's **malleable**: an attacker can manipulate ciphertexts

**OAEP** (Optimal Asymmetric Encryption Padding) adds randomness before encryption, solving both problems. Always use OAEP in practice.

> **Code:** See [`crypto-examples/03-rsa-encryption.js`](crypto-examples/03-rsa-encryption.js) — includes both a manual RSA demo with small primes AND real RSA-OAEP encryption.

---

## 4. Hashing Algorithms (One-Way Functions)

A **hash function** takes any input and produces a fixed-size output (the "digest" or "fingerprint"). It's a **one-way** function — you cannot reverse it to get the original input.

**Key properties of a good hash function:**

| Property | Meaning |
|----------|---------|
| **Deterministic** | Same input always gives the same output |
| **Fast to compute** | Hash any size input quickly |
| **Avalanche effect** | Changing 1 bit of input changes ~50% of output bits |
| **Pre-image resistant** | Given a hash, you can't find the original input |
| **Collision resistant** | Practically impossible to find two inputs with the same hash |

### SHA-256

SHA-256 (Secure Hash Algorithm, 256-bit) is part of the SHA-2 family, designed by the NSA.

**Merkle-Damgard Construction:**

SHA-256 processes data in blocks using a chain structure:

```
Message → [Pad to 512-bit blocks] → [Block 1] → [Block 2] → ... → [256-bit Hash]
                                        ↓            ↓
                                   Compression   Compression
                                   Function      Function
                                   (64 rounds)   (64 rounds)
                                        ↓            ↓
                                   ───────── Chain ─────────
```

Each compression function takes the previous block's output (or an initial value) and the current block, then applies 64 rounds of mixing. The final output is the 256-bit hash.

**The Avalanche Effect:**

```
Input:  "hello"   → 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
Input:  "hello!"  → ce06092fb948d9ffac7d1a376e404b26b7575bcc11ee05a4615fef4fec3a308b
                     ^^^^                                    (completely different!)
```

Changing just one character flips approximately **50% of the output bits**. This makes it impossible to guess the input from the output.

**Common uses:** File integrity checks, blockchain (Bitcoin), digital signature hashing, git commit IDs.

> **Code:** See [`crypto-examples/04-sha256-hashing.js`](crypto-examples/04-sha256-hashing.js) — hashing demo with avalanche effect visualization.

---

### bcrypt (For Password Hashing)

**Why not use SHA-256 for passwords?** Because SHA-256 is too **fast**. An attacker with a modern GPU can try **billions** of SHA-256 hashes per second. When your password is "password123", that takes microseconds to crack.

**bcrypt** solves this by being **intentionally slow**:

| Feature | How It Helps |
|---------|-------------|
| **Adaptive cost factor** | Cost = 2^rounds iterations. Cost 10 = 1,024 iterations. Each +1 **doubles** the time. |
| **Built-in salt** | Random data mixed into each hash. Same password → different hash every time. Prevents rainbow table attacks. |
| **Blowfish-based** | Uses the Blowfish cipher's expensive key setup as the core operation. |

**How bcrypt cost factor scales:**

```
Cost  8:  ~40ms     (2^8  = 256 iterations)
Cost 10:  ~150ms    (2^10 = 1,024 iterations)
Cost 12:  ~600ms    (2^12 = 4,096 iterations)
Cost 14:  ~2,400ms  (2^14 = 16,384 iterations)
```

As hardware gets faster, you simply **increase the cost factor**. This is what "adaptive" means.

**Anatomy of a bcrypt hash:**

```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
├──┤├─┤├─────────────────────┤├──────────────────────────────────┤
Alg Cost  Salt (22 chars)          Hash (31 chars)
```

> **Code:** See [`crypto-examples/05-bcrypt-hashing.js`](crypto-examples/05-bcrypt-hashing.js) — hash/verify passwords, salt demo, adaptive cost timing comparison.

---

## 5. Digital Signatures & Message Authentication

### Digital Signatures (RSA)

Digital signatures are the **reverse** of encryption:

| | Encryption | Signatures |
|---|-----------|------------|
| **Create** | Encrypt with PUBLIC key | Sign with PRIVATE key |
| **Verify** | Decrypt with PRIVATE key | Verify with PUBLIC key |

**How signing works:**

```
1. Hash the message           → digest (SHA-256)
2. Encrypt digest with        → signature
   PRIVATE key
3. Send: message + signature

Receiver:
4. Hash the received message  → digest
5. Decrypt signature with     → original digest
   PUBLIC key
6. Compare digests            → if match, signature is VALID
```

**What a digital signature proves:**
- **Authentication** — the message came from the private key holder
- **Integrity** — the message wasn't altered (hash would change)
- **Non-repudiation** — the sender can't deny sending it (only they have the private key)

> **Code:** See [`crypto-examples/06-digital-signatures.js`](crypto-examples/06-digital-signatures.js) — sign/verify with tamper and wrong-key detection demos.

---

### HMAC (Hash-Based Message Authentication Code)

HMAC is a simpler, faster alternative to digital signatures when both parties share a **secret key**.

**The HMAC Formula:**

```
HMAC(K, m) = H( (K' ⊕ opad) || H( (K' ⊕ ipad) || m ) )
```

In plain English:
1. Mix the key with an inner padding → hash it with the message
2. Mix the key with an outer padding → hash it with the result from step 1

**HMAC vs Digital Signatures:**

| Feature | HMAC | Digital Signature |
|---------|------|-------------------|
| Key type | Shared secret (symmetric) | Key pair (asymmetric) |
| Speed | Fast | Slow |
| Authentication | ✓ | ✓ |
| Integrity | ✓ | ✓ |
| Non-repudiation | ✗ (both parties know the key) | ✓ |
| Common use | API auth, JWTs, webhooks | Code signing, certificates |

> **Code:** See [`crypto-examples/07-hmac.js`](crypto-examples/07-hmac.js) — HMAC creation, verification with timing-safe comparison, webhook example.

---

## 6. Key Exchange (Diffie-Hellman)

**The Problem:** Alice and Bob want to agree on a shared secret key, but they can only communicate over an insecure channel where anyone can eavesdrop.

**The Solution:** Diffie-Hellman key exchange — lets two parties create a shared secret **without ever sending the secret itself**.

### The Paint Mixing Analogy

1. Alice and Bob publicly agree on a **base color** (public parameters)
2. Alice picks a **secret color**, mixes it with the base → sends the mixture to Bob
3. Bob picks a **secret color**, mixes it with the base → sends the mixture to Alice
4. Alice mixes Bob's mixture with **her** secret → gets the **shared color**
5. Bob mixes Alice's mixture with **his** secret → gets the **same shared color**
6. An eavesdropper sees the mixtures but **cannot "unmix" them** to find the secrets!

### The Math

**Public parameters** (known to everyone):
- `p` = a large prime number
- `g` = a generator (primitive root mod p)

**Alice's side:**
- Picks secret `a` (random number)
- Computes `A = g^a mod p` → sends `A` to Bob

**Bob's side:**
- Picks secret `b` (random number)
- Computes `B = g^b mod p` → sends `B` to Alice

**Shared secret computation:**

```
Alice computes:  B^a mod p = (g^b)^a mod p = g^(ab) mod p
Bob computes:    A^b mod p = (g^a)^b mod p = g^(ab) mod p
                 ↑ SAME VALUE! ↑
```

Both arrive at `g^(ab) mod p` without ever sending `a`, `b`, or the shared secret!

### Why Is It Secure? (Discrete Logarithm Problem)

An eavesdropper sees `g`, `p`, `A = g^a mod p`, and `B = g^b mod p`. To find the shared secret, they'd need to figure out `a` from `A = g^a mod p`. This is the **Discrete Logarithm Problem** — computationally infeasible for large primes (2048+ bits).

### Security Warning

Basic Diffie-Hellman is vulnerable to **Man-in-the-Middle (MITM) attacks**. An attacker could intercept Alice and Bob's public keys and replace them with their own. Solutions:
- Authenticate public keys using **digital signatures** (see Section 5)
- Use **certificates** (like in TLS/HTTPS)
- Use **ECDH** (Elliptic Curve Diffie-Hellman) — same concept, stronger security with smaller keys

> **Code:** See [`crypto-examples/08-diffie-hellman.js`](crypto-examples/08-diffie-hellman.js) — full Alice & Bob key exchange simulation with AES encryption using the shared secret.

---

## 7. Comparison Table & Summary

### Algorithm Comparison

| Algorithm | Type | Key Size | Speed | Use Case | Status |
|-----------|------|----------|-------|----------|--------|
| **AES-256-GCM** | Symmetric | 256-bit | Fast | Bulk data encryption | ✅ Recommended |
| **3DES** | Symmetric | 168-bit | Slow | Legacy systems only | ❌ Deprecated |
| **RSA-2048** | Asymmetric | 2048-bit | Slow | Key exchange, signatures | ✅ Recommended (4096 preferred) |
| **SHA-256** | Hash | N/A (256-bit output) | Fast | File integrity, blockchain | ✅ Recommended |
| **bcrypt** | Hash (KDF) | N/A | Intentionally slow | Password storage | ✅ Recommended |
| **HMAC-SHA256** | MAC | Variable | Fast | API auth, message auth | ✅ Recommended |
| **Diffie-Hellman** | Key Exchange | 2048-bit | Moderate | Shared secret derivation | ⚠️ Use ECDH instead |

### When to Use Which Algorithm

```
Need to encrypt data?
  ├── Large data (files, database)  →  AES-256-GCM (symmetric)
  └── Small data + key exchange     →  RSA-OAEP (asymmetric) + AES (hybrid)

Need to store passwords?
  └── Always use bcrypt (or Argon2)  —  NEVER SHA-256 or MD5!

Need to verify data integrity?
  ├── With a shared secret key?  →  HMAC-SHA256
  └── Without any key?           →  SHA-256

Need to prove who sent a message?
  ├── Need non-repudiation?   →  Digital Signatures (RSA/ECDSA)
  └── Shared secret is OK?    →  HMAC

Need to establish a shared secret?
  └── Diffie-Hellman (preferably ECDH) + authenticate with signatures
```

### Key Takeaways

1. **Symmetric encryption** (AES) is fast — use it for bulk data encryption
2. **Asymmetric encryption** (RSA) is slow — use it for key exchange and signatures
3. **Hashing** (SHA-256) is one-way — use it for integrity, NOT for passwords
4. **bcrypt** is intentionally slow — use it for password storage
5. **Digital signatures** provide non-repudiation — the sender can't deny sending
6. **HMAC** is faster than signatures but requires a shared key
7. **Diffie-Hellman** lets strangers create a shared secret over an insecure channel
8. **Never use deprecated algorithms** (DES, 3DES, MD5, SHA-1) in new projects
9. **Always use proven libraries** — never implement your own crypto in production

---

## Running the Examples

```bash
# 1. Navigate to the examples directory
cd crypto-examples

# 2. Install dependencies (only bcryptjs is needed)
npm install

# 3. Run any example
node 01-aes-encryption.js       # AES-256-GCM encrypt/decrypt
node 02-des-encryption.js       # 3DES encrypt/decrypt (educational)
node 03-rsa-encryption.js       # RSA with small primes + real RSA-OAEP
node 04-sha256-hashing.js       # SHA-256 with avalanche effect
node 05-bcrypt-hashing.js       # bcrypt password hashing
node 06-digital-signatures.js   # RSA sign/verify
node 07-hmac.js                 # HMAC-SHA256
node 08-diffie-hellman.js       # Diffie-Hellman key exchange

# Or run all examples at once
npm run all
```

> **Requirements:** Node.js 16 or higher (18+ recommended). All examples except bcrypt use only Node.js built-in modules — no installation needed for those.
