# Talaria Docs Data Files

Data files that drive generated content.

## `mcp-tools.json`

**Status:** Awaiting export from platform  
**Source:** `new_talaria_server/tool/gen_mcp_tools_doc.dart`  
**Count:** 44 tools (platform main a22afa2f)

This file should be generated from the MCP server tool registry and committed here. The marketing site will import it from this location.

### Expected structure

```json
{
  "source": "https://github.com/newtalaria/server",
  "generatedAt": "2026-10-29T06:00:00Z",
  "protocolVersions": ["2025-11-25", "2025-06-18", "2025-03-26"],
  "count": 44,
  "tools": [
    {
      "name": "get_doc",
      "title": "Get documentation page",
      "description": "Fetch a docs page by id, path, or alias",
      "toolset": "docs",
      "scope": "read:docs",
      "readOnlyHint": true,
      "destructiveHint": false,
      "params": [
        { "name": "idOrPath", "type": "string", "required": true, "description": "Page id, path, or alias" }
      ]
    }
  ]
}
```

### Toolsets (from spec)

| Toolset | Count |
|---------|-------|
| issues | 10 |
| projects | 6 |
| events | 6 |
| performance | 4 |
| flags | 4 |
| docs | 3 |
| ops | 3 |
| connection | 2 |
| releases | 2 |
| analytics | 2 |
| keys | 1 |
| ai | 1 |

### Phase 3 requirement

The generated MCP tools reference page (`reference/mcp-tools.md`) will render from this file. Until then, the file can remain a stub or be generated but not rendered.

### Validation

`_tools/validate.ts` will (in phase 3):
- Check that `count` matches `tools.length`
- Verify any tool name mentioned in page content exists in this file
- Ensure all tools referenced in `features.yaml` `mcpTools` are present

## Future data files

- **`sdk-versions.json`** - Current versions per platform (if versioning is needed)
- **`release-notes.json`** - For changelog generation
