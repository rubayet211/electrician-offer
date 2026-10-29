export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (
    /^[=@\t\r]/.test(text) ||
    (/^[+-]/.test(text) && !/^[+-](?:\d+(?:\.\d+)?|(?=(?:\D*\d){7,}\D*$)[\d ()-]+)$/.test(text))
  )
    text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
