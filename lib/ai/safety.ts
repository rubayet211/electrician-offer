const hazardPatterns = [
  /\b(?:fire|flames?|arcing|sparks?|sparking|shocked|electrocut(?:ed|ion))\b/i,
  /\b(?:burning|burnt)\s+(?:smell|odor|odour)\b|\b(?:smell|smells|smelling)\s+(?:of\s+)?burn(?:ing|t)\b/i,
  /\bsmoke\b(?!\s+detectors?\b)/i,
  /\b(?:power\s+lines?|electrical\s+lines?)\b.{0,30}\b(?:down|fallen|hanging)\b|\b(?:downed|fallen)\s+(?:power|electrical)\s+lines?\b/i,
  /\b(?:exposed|live|hanging|dangling)\s+wires?\b|\bwires?\b.{0,20}\b(?:hanging|dangling|exposed)\b/i,
  /\bwater\b.{0,30}\bpanel\b|\bpanel\b.{0,30}\bwater\b/i,
  /\b(?:breaker|panel)\b.{0,25}\b(?:hot|melt(?:ing|ed)?)\b|\b(?:hot|melt(?:ing|ed)?)\b.{0,25}\b(?:breaker|panel)\b/i,
];

export function isElectricalHazard(text: string): boolean {
  return hazardPatterns.some((pattern) => pattern.test(text));
}

export function safetyReply(phone: string): string {
  return `Leave the area if unsafe and stay away from electrical equipment and wires. Call 911 for fire or injury. For downed power lines, stay away and call your utility. From a safe place, you can also call ${phone}.`;
}
