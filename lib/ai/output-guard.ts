const unsafe =
  /\b(?:turn off the breaker and|remove the cover|open the panel|use a voltage tester|replace the outlet yourself|same[ -]day|today|dispatched|code compliant|up to code)\b|\$\s*\d/i;
const licenseNumber = /\blicen[cs]e\s*(?:number|no\.?|#|:)\s*(?:is\s*)?([a-z0-9][a-z0-9-]*)/gi;

export function guardAssistantText(text: string, approvedLicenses: string[]): string {
  const unknownLicense = [...text.matchAll(licenseNumber)].some(
    (match) => !approvedLicenses.some((number) => number.toLowerCase() === match[1].toLowerCase()),
  );
  if (unsafe.test(text) || unknownLicense)
    return "Please call the office or request an estimate for reliable assistance. Do not attempt electrical repairs yourself.";
  return text;
}
