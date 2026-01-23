export class HTMLParser {
  static parse(body: string): string {
    let inTag = false;
    let textContent = "";

    for (let i = 0; i < body.length; i++) {
      const char = body[i];
      if (char === "<") {
        const nextChar = body[i + 1];
        if (/(\s, [0-9])/.exec(nextChar)) {
          // skip malformed tags like <  or <
          textContent += char;
          continue;
        }
        inTag = true;
      } else if (char === ">") {
        inTag = false;
      } else if (!inTag) {
        textContent += char;
      }
    }
    return this.decodeHTMLEntities(textContent);
  }

  static decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
    };
    return text.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
      return entities[match] || match;
    });
  }
}
