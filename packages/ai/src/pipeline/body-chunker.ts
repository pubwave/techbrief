export function splitIntoChunks(input: string, chunkSize: number): string[] {
  const paragraphs = input
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) {
    return splitPlainText(input, chunkSize);
  }

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length <= chunkSize || !current) {
      current = next;
      continue;
    }

    chunks.push(current);
    current = paragraph;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.flatMap((chunk) => splitPlainText(chunk, chunkSize));
}

function splitPlainText(input: string, chunkSize: number): string[] {
  if (input.length <= chunkSize) {
    return [input.trim()];
  }

  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < input.length) {
    const nextCursor = Math.min(input.length, cursor + chunkSize);
    const hardSlice = input.slice(cursor, nextCursor);
    const softBreak = Math.max(
      hardSlice.lastIndexOf("\n\n"),
      hardSlice.lastIndexOf(". "),
      hardSlice.lastIndexOf("! "),
      hardSlice.lastIndexOf("? "),
      hardSlice.lastIndexOf("。"),
      hardSlice.lastIndexOf("！"),
      hardSlice.lastIndexOf("？")
    );
    const end = softBreak > Math.floor(chunkSize * 0.6)
      ? cursor + softBreak + 1
      : nextCursor;
    chunks.push(input.slice(cursor, end).trim());
    cursor = end;
  }

  return chunks.filter(Boolean);
}
