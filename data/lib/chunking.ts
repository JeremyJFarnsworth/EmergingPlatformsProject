export function chunkText(
  text: string,
  maxLength = 500
) {

   const paragraphs = text.split(/\n\s*\n/); // split by paragraphs
  const chunks: string[] = [];

  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += "\n\n" + para;
    }
  }
if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
}