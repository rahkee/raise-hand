# Raise Hand

A VS Code extension for Cursor that provides visual notifications when AI finishes generating code.

## Features

- Monitors text insertions in the active editor
- Detects when AI likely finished generating code using heuristics
- Shows a notification with a "Go to it" button
- Clicking the button jumps to the inserted code location

## Installation

1. Install Node.js and npm if you haven't already
2. Clone this repository
3. Run `npm install` to install dependencies
4. Run `npm run compile` to build the extension
5. Press F5 in VS Code to start debugging

## Development

```bash
# Install dependencies
npm install

# Compile the extension
npm run compile

# Watch for changes during development
npm run watch
```

## Building VSIX Package

To create a VSIX package for installation:

1. Install vsce: `npm install -g @vscode/vsce`
2. Run: `vsce package`
3. Install the generated .vsix file in Cursor

## License

MIT