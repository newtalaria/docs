---
title: VS Code
description: Add the Talaria MCP server in VS Code or GitHub Copilot.
section: agents
order: 70
---

VS Code and GitHub Copilot read MCP servers from `mcp.json`. The top-level key is `servers`, and each HTTP server needs `"type": "http"`. Workspace file: `.vscode/mcp.json`.

```json
{
  "servers": {
    "Talaria": {
      "type": "http",
      "url": "https://api.newtalaria.com/mcp/YOUR_ORG_ID/YOUR_PROJECT_ID?readonly=true"
    }
  }
}
```

Command Palette › **MCP: Add Server**, or `talaria mcp install`. VS Code tries Streamable HTTP on `POST /mcp`. A personal token goes in `headers.Authorization`. Never use an API key.

See [MCP](/agents/mcp/).
