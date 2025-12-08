# Password Blur Plugin

A simple and elegant Blinko plugin that blurs sensitive passwords in your notes using CSS blur effect.

## Features

- **Easy Format**: Use `[[password]]` syntax to automatically blur text
- **Hover to Reveal**: Hover over blurred text to see the actual password
- **One-Click Copy**: Click on the blurred text to copy to clipboard
- **CSS Blur**: Uses native CSS blur filter for smooth performance
- **Dark/Light Theme**: Automatically adapts to your system theme
- **Bilingual**: Supports English and Chinese

## Installation

1. Clone this repository
2. Run `bun install`
3. Run `bun run release:publish` to build the plugin
4. Upload the generated plugin to your Blinko instance

## Usage

### Basic Usage

1. Open a note in Blinko
2. Type your password or sensitive text
3. Wrap it with double brackets: `[[myPassword123]]`
4. The text will automatically be blurred

### Interactions

- **Hover**: Move your mouse over the blurred text to reveal it
- **Click**: Click on the text to copy it to clipboard
- **Edit**: Press backspace to remove the blur and edit the text normally

## Example

```
My login credentials:
Username: john_doe
Password: [[secretPassword123]]
API Key: [[sk-1234567890abcdef]]
```

When rendered, the passwords will appear blurred and can be revealed on hover.

## How It Works

The plugin scans your note content for the `[[...]]` pattern and automatically:
1. Wraps the text in a span element
2. Applies CSS blur filter (4px)
3. Removes blur on hover
4. Enables copy-to-clipboard on click

## Performance

- Debounced processing (300ms) to avoid lag
- Tracks processed nodes to prevent re-processing
- Minimal CSS overhead
- No external dependencies