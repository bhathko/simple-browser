# Simple Browser Engine

A toy browser engine implementation in TypeScript, designed to demonstrate the core concepts of how a browser works: networking, parsing, layout, and rendering.

## File Structure

```
src/
├── main.ts              # Entry point. Bootstraps the Browser instance.
├── browser.ts           # Main controller. Orchestrates fetching, parsing, layout, and rendering.
├── config.ts            # Configuration for styling, layout, and theme.
├── dom/
│   └── nodes.ts         # DOM Node definitions (LayoutNode).
├── layout/
│   └── layout.ts        # Layout Engine. Converts DOM tree into a visual Display List.
├── network/
│   └── url.ts           # Network layer. Handles URL parsing and HTTP requests (via proxy).
├── parser/
│   ├── html.ts          # HTML Parser. Discovers content, handles <style>/<script>, and builds DOM.
│   ├── css.ts           # CSS Parser. Parses styles into rules.
│   └── js.ts            # JS Parser (Placeholder).
└── platform/
    └── graphics.ts      # Graphics abstraction layer (Canvas API wrapper).
```

## Architecture

The engine follows a standard browser pipeline:

1.  **User Interface**: The `Browser` class manages the window state, scroll position, and user input (scrolling, navigation).
2.  **Networking**: The `URL` class fetches raw content from a URL.
    *   *Note*: Uses a local proxy server to bypass CORS limitations in the development environment.
3.  **Parsing**:
    *   `HTMLParser`: The main entry point for document parsing.
    *   It separates concerns by extracting `<style>` and `<script>` blocks *before* building the DOM.
    *   `CSSParser`: Parses extracted CSS into `StyleRule` objects.
    *   The result is a `ParsedDocument` containing the `root` (DOM tree) and `styles`.
4.  **Layout**:
    *   The `Layout` engine takes the DOM tree and calculates positions for each element.
    *   It currently implements a simple "flow layout" with word wrapping and baseline alignment for mixed font sizes.
    *   Generates a `DisplayItem` list.
5.  **Rendering**:
    *   The `Graphics` module reads the display list and draws to the HTML5 Canvas.

## Execution Flow

1.  **Bootstrap**: `src/main.ts` creates a `new Browser()` instance.
2.  **Load**: `browser.load(url)` is called.
3.  **Fetch**: `URL.request()` fetches the HTML string.
4.  **Parse**:
    *   `HTMLParser.parse(html)` is invoked.
    *   `<style>` tags are extracted and parsed by `CSSParser`.
    *   `<script>` tags are extracted and passed to `JSParser`.
    *   The remaining HTML is parsed into a tree of `LayoutNode`s.
5.  **Layout**: `new Layout(root, graphics).layout()` traverses the DOM tree and computes `x, y` coordinates for text.
6.  **Paint**: `browser.render()` clears the canvas and draws the computed display list using `graphics.createText()`.

## Key Concepts Implemented

*   **Recursive Descent Parsing**: Used for HTML structure.
*   **Stack-based State Machine**: Handles nested HTML tags.
*   **Two-Phase Layout**: 
    1.  Collection: Flattens the DOM into a stream of styled words.
    2.  Line Breaking: Groups words into lines, calculating width and baseline alignment.
*   **Coordinate System**: All layout is calculated relative to the document top; the renderer applies a viewport transform (`scrollY`).
