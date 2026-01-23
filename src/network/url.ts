// this is our virtual file system for file:// URLs
const VIRTUAL_FILE_SYSTEM: Record<string, string> = {
  // when you input url = "file://
  "hello.html":
    "<html><body><h1>Hello from Local File!</h1><p>This is a virtual file.</p></body></html>",
  "test.txt": "Just some plain text content.",
};

export class URL {
  scheme: string;
  host!: string;
  port!: number;
  path!: string;

  constructor(url: string) {
    // 1. Parse Scheme (http vs file)
    const [scheme, rest] = url.split("://");
    this.scheme = scheme;

    if (this.scheme === "http") {
      // 2. Parse Host and Path
      const firstSlash = rest.indexOf("/");
      if (firstSlash === -1) {
        this.host = rest;
        this.path = "/";
      } else {
        this.host = rest.substring(0, firstSlash);
        this.path = rest.substring(firstSlash);
      }

      // 3. Parse Port (if there is :8080)
      if (this.host.includes(":")) {
        const [host, port] = this.host.split(":");
        this.host = host;
        this.port = parseInt(port, 10);
      } else {
        this.port = 80;
      }
    } else if (this.scheme === "file") {
      // file:// followed directly by the path
      this.host = "";
      this.port = 0;
      this.path = rest; // here rest is the filename, e.g., "hello.html"
    }
  }

  // Simulate Python's socket.request or file.read
  // src/network/url.ts
  async request(): Promise<string> {
    if (this.scheme === "file") {
      // ... (previous virtual file system logic) ...
      return VIRTUAL_FILE_SYSTEM[this.path] || "File not found";
    }

    if (this.scheme === "http" || this.scheme === "https") {
      // 【Key Difference】
      // We do not create a TCP Socket, but call the browser's Fetch API
      // It's like your engine outsources the "network department" to Chrome
      try {
        // 1. Send request
        // Use Proxy Server to bypass CORS
        const targetUrl = `http://${this.host}:${this.port}${this.path}`;
        const response = await fetch(
          `http://localhost:3000/proxy?url=${encodeURIComponent(targetUrl)}`,
        );

        // 2. Simulate "read body" from the book
        // The book spends a lot of time discussing transfer-encoding: chunked and gzip
        // fetch has already handled these for you, so you get the decompressed string directly
        const text = await response.text();

        // 【Advanced Learning Point】
        // Although we didn't write the Socket ourselves, you can print out the Response Headers to take a look
        // This is very important for frontend debugging
        console.log("--- Response Headers ---");
        response.headers.forEach((value, key) => {
          console.log(`${key}: ${value}`);
        });
        console.log("------------------------");

        return text;
      } catch (e) {
        console.error(e);
        return `Error: Could not fetch URL. (CORS limitation?)`;
      }
    }

    return "Unknown Scheme";
  }
}
