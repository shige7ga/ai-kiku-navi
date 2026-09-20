export async function copyPrompt(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}
