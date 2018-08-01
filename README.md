![](https://badgen.net/badge/CodeX%20Editor/v2.0/blue)

# InlineCode Tool

Inline Tool for marking code-fragments for the [CodeX Editor](https://ifmo.su/editor).

![](assets/example.gif)

## Installation

### Install via NPM

Get the package

```shell
npm i --save-dev codex.editor.inline-code
```

Include module at your application

```javascript
const InlineCode = require('codex.editor.inline-code');
```

### Download to your project's source dir

1. Upload folder `dist` from repository
2. Add `dist/bundle.js` file to your page.

### Load from CDN

Get newest bundle path from [RawGit](https://rawgit.com) — open site and paste link to JS bundle in repository.

`https://github.com/codex-editor/inline-code/blob/master/dist/bundle.js`

> Note: use `production` link with commit hash to avoid issues with caching.

Then require this script on page with CodeX Editor.

```html
<script src="..."></script>
```

## Usage

Add a new Tool to the `tools` property of the CodeX Editor initial config.

```javascript
var editor = CodexEditor({
  ...
  
  tools: {
    ...
    inlineCode: {
      class: InlineCode,
      shortcut: 'CMD+SHIFT+M',
    },
  },
  
  ...
});
```

## Config Params

This Tool has no config params

## Output data

Marked text will be wrapped with a `span` tag with an `inline-code` class.

```json
{
    "type" : "text",
    "data" : {
        "text" : "Create a directory for your module, enter it and run <span class=\"inline-code\">npm init</span> command."
    }
}
```

