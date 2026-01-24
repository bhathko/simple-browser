export type StyleRule = {
  selector: string;
  declarations: Record<string, string>;
};

export class CSSParser {
  static parse(source: string): StyleRule[] {
    const rules: StyleRule[] = [];
    let buffer = "";
    let i = 0;

    while (i < source.length) {
      const char = source[i];

      if (char === "{") {
        const selector = buffer.trim();
        buffer = "";
        i++;
        
        // Parse declarations until '}'
        const declarations: Record<string, string> = {};
        let declBuffer = "";
        
        while (i < source.length && source[i] !== "}") {
          if (source[i] === ";") {
            const [key, val] = declBuffer.split(":").map(s => s.trim());
            if (key && val) {
              declarations[key] = val;
            }
            declBuffer = "";
          } else {
            declBuffer += source[i];
          }
          i++;
        }

        // Handle last declaration if missing semicolon
        if (declBuffer.trim()) {
           const [key, val] = declBuffer.split(":").map(s => s.trim());
           if (key && val) {
             declarations[key] = val;
           }
        }

        rules.push({ selector, declarations });
        buffer = "";
      } else {
        buffer += char;
      }
      i++;
    }

    return rules;
  }
}