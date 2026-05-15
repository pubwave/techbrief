import { getArticleSourceBody } from "./body.js";
import type { FeedArticle } from "./types.js";

const SHA256_INITIAL_STATE = [
  0x6a09e667,
  0xbb67ae85,
  0x3c6ef372,
  0xa54ff53a,
  0x510e527f,
  0x9b05688c,
  0x1f83d9ab,
  0x5be0cd19
] as const;

const SHA256_ROUND_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
] as const;

export function buildArticleContentHash(article: FeedArticle): string {
  return createTextHash(getArticleSourceBody(article) ?? "");
}

export function buildArticleBodyFingerprint(article: FeedArticle): string | null {
  const body = getArticleSourceBody(article);
  if (!body) {
    return null;
  }

  return createTextHash(body);
}

function createTextHash(value: string): string {
  return createSha256Hex(value);
}

function createSha256Hex(value: string): string {
  const words = createPaddedWords(new TextEncoder().encode(value));
  const state = Uint32Array.from(SHA256_INITIAL_STATE);
  const schedule = new Uint32Array(64);

  for (let offset = 0; offset < words.length; offset += 16) {
    for (let index = 0; index < 16; index += 1) {
      schedule[index] = words[offset + index] ?? 0;
    }

    for (let index = 16; index < 64; index += 1) {
      schedule[index] = add32(
        smallSigma1(schedule[index - 2] ?? 0),
        schedule[index - 7] ?? 0,
        smallSigma0(schedule[index - 15] ?? 0),
        schedule[index - 16] ?? 0
      );
    }

    let a = state[0] ?? 0;
    let b = state[1] ?? 0;
    let c = state[2] ?? 0;
    let d = state[3] ?? 0;
    let e = state[4] ?? 0;
    let f = state[5] ?? 0;
    let g = state[6] ?? 0;
    let h = state[7] ?? 0;

    for (let index = 0; index < 64; index += 1) {
      const temp1 = add32(
        h,
        bigSigma1(e),
        choose(e, f, g),
        SHA256_ROUND_CONSTANTS[index] ?? 0,
        schedule[index] ?? 0
      );
      const temp2 = add32(bigSigma0(a), majority(a, b, c));

      h = g;
      g = f;
      f = e;
      e = add32(d, temp1);
      d = c;
      c = b;
      b = a;
      a = add32(temp1, temp2);
    }

    state[0] = add32(state[0] ?? 0, a);
    state[1] = add32(state[1] ?? 0, b);
    state[2] = add32(state[2] ?? 0, c);
    state[3] = add32(state[3] ?? 0, d);
    state[4] = add32(state[4] ?? 0, e);
    state[5] = add32(state[5] ?? 0, f);
    state[6] = add32(state[6] ?? 0, g);
    state[7] = add32(state[7] ?? 0, h);
  }

  return Array.from(state, (word) => word.toString(16).padStart(8, "0")).join("");
}

function createPaddedWords(bytes: Uint8Array): Uint32Array {
  const totalByteLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(totalByteLength);
  const bitLength = BigInt(bytes.length) * 8n;

  padded.set(bytes);
  padded[bytes.length] = 0x80;

  for (let index = 0; index < 8; index += 1) {
    padded[totalByteLength - 1 - index] = Number((bitLength >> BigInt(index * 8)) & 0xffn);
  }

  const words = new Uint32Array(totalByteLength / 4);
  for (let index = 0; index < padded.length; index += 1) {
    const wordIndex = index >> 2;
    words[wordIndex] = (words[wordIndex] ?? 0) | ((padded[index] ?? 0) << (24 - (index % 4) * 8));
  }

  return words;
}

function add32(...values: number[]): number {
  let result = 0;
  for (const value of values) {
    result = (result + value) >>> 0;
  }

  return result;
}

function rotateRight(value: number, bits: number): number {
  return (value >>> bits) | (value << (32 - bits));
}

function choose(x: number, y: number, z: number): number {
  return (x & y) ^ (~x & z);
}

function majority(x: number, y: number, z: number): number {
  return (x & y) ^ (x & z) ^ (y & z);
}

function bigSigma0(value: number): number {
  return rotateRight(value, 2) ^ rotateRight(value, 13) ^ rotateRight(value, 22);
}

function bigSigma1(value: number): number {
  return rotateRight(value, 6) ^ rotateRight(value, 11) ^ rotateRight(value, 25);
}

function smallSigma0(value: number): number {
  return rotateRight(value, 7) ^ rotateRight(value, 18) ^ (value >>> 3);
}

function smallSigma1(value: number): number {
  return rotateRight(value, 17) ^ rotateRight(value, 19) ^ (value >>> 10);
}
