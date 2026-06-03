import { normalizeWhitespace, splitSentences, tokenize } from "./text.js";

export interface ExtractSummaryOptions {
  /** Number of sentences to keep. Defaults to 3. */
  sentences?: number;
}

const DAMPING = 0.85;
const MAX_ITERATIONS = 60;
const CONVERGENCE = 1e-5;

/**
 * Extractive summary via TextRank: score sentences by how strongly they are
 * referenced by other sentences (PageRank over a sentence-similarity graph),
 * then return the top sentences in their original order. No model, no network.
 */
export function extractSummary(text: string, options: ExtractSummaryOptions = {}): string {
  const targetSentences = Math.max(1, Math.floor(options.sentences ?? 3));
  const cleaned = normalizeWhitespace(text);
  if (!cleaned) {
    return "";
  }

  const sentences = splitSentences(cleaned);
  if (sentences.length <= targetSentences) {
    return sentences.join(" ");
  }

  const tokenized = sentences.map(tokenize);
  const scores = rankSentences(tokenized);

  const selected = scores
    .map((score, index) => ({ index, score }))
    .sort((left, right) => right.score - left.score)
    .slice(0, targetSentences)
    .map((entry) => entry.index)
    .sort((left, right) => left - right);

  return selected
    .map((index) => sentences[index] ?? "")
    .filter(Boolean)
    .join(" ");
}

function rankSentences(tokenized: string[][]): number[] {
  const count = tokenized.length;
  const tokenSets = tokenized.map((tokens) => new Set(tokens));
  const weights: number[][] = Array.from({ length: count }, () => new Array<number>(count).fill(0));
  const outWeight = new Array<number>(count).fill(0);

  for (let i = 0; i < count; i += 1) {
    for (let j = i + 1; j < count; j += 1) {
      const sim = similarity(
        tokenSets[i]!,
        tokenSets[j]!,
        tokenized[i]!.length,
        tokenized[j]!.length
      );
      if (sim > 0) {
        weights[i]![j] = sim;
        weights[j]![i] = sim;
        outWeight[i]! += sim;
        outWeight[j]! += sim;
      }
    }
  }

  let scores = new Array<number>(count).fill(1 / count);
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
    const next = new Array<number>(count).fill((1 - DAMPING) / count);
    for (let i = 0; i < count; i += 1) {
      for (let j = 0; j < count; j += 1) {
        const weight = weights[j]![i]!;
        const total = outWeight[j]!;
        if (weight > 0 && total > 0) {
          next[i]! += DAMPING * (weight / total) * scores[j]!;
        }
      }
    }

    let delta = 0;
    for (let i = 0; i < count; i += 1) {
      delta += Math.abs(next[i]! - scores[i]!);
    }
    scores = next;
    if (delta < CONVERGENCE) {
      break;
    }
  }

  return scores;
}

/** Classic TextRank similarity: shared tokens normalized by sentence lengths. */
function similarity(a: Set<string>, b: Set<string>, lengthA: number, lengthB: number): number {
  if (lengthA === 0 || lengthB === 0) {
    return 0;
  }

  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let common = 0;
  for (const token of small) {
    if (large.has(token)) {
      common += 1;
    }
  }
  if (common === 0) {
    return 0;
  }

  const norm = Math.log(lengthA + 1) + Math.log(lengthB + 1);
  return norm === 0 ? common : common / norm;
}
