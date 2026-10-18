# Data and configuration

**English** · [Español](datos-es.md)

On startup the server creates `data_pl/` at the **server root** and, for each loaded plugin, its folder `data_pl/<pluginFolder>/`. The `data.*` API can **only** read and write inside it.

```lua
data.folder                      -- path of YOUR data folder (string)
data.read(file)                  -- raw contents | nil, err
data.write(file, contents)       -- raw write (binary safe) | true | nil, err
data.exists(file)                -- does it exist?
data.delete(file)                -- delete (false if it did not exist)
data.list()                      -- list of names in your folder
data.loadYml(file)               -- YAML -> table | nil, err
data.saveYml(file, table)        -- table -> YAML | true | nil, err
data.loadJson(file)              -- JSON -> table | nil, err
data.saveJson(file, table)       -- table -> JSON | true | nil, err
```

- `file` is always **relative to your data folder**. Subfolders work: `data.write("stats/2026.json", ...)` creates the path.
- `..`, absolute paths and backslashes raise a **Lua error**: no plugin can leave its folder.
- Lua 5.4 strings are binary safe, so `data.read` / `data.write` work with **any format** (`.dat`, `.bin`, images), `\0` included.
- A malformed config **does not break anything**: `loadYml` / `loadJson` return `nil, err` and your plugin decides what to do.

:::{note}
**Moved in 1.0.2.** The data root used to be `plugins/data_pl/`; it is now `data_pl/` next to the server binary. CurseStone moves the old folder automatically on the first start.
:::

## Recommended pattern: config with defaults

```lua
local config = data.loadYml("config.yml")
if not config then
    config = {
        message  = "§bRemember to read the rules (/rules)",
        interval = 1200,               -- ticks (1200 = 60 s)
        rules    = { "Respect", "No grief" },
    }
    data.saveYml("config.yml", config)
end
```

This produces the following `config.yml`:

```yaml
message: "§bRemember to read the rules (/rules)"
interval: 1200
rules:
  - Respect
  - No grief
```

## Plugin resources

Ship read-only files inside your plugin under `plugins/<Plugin>/resources/` and manage them with:

```lua
local text = plugin.getResource("motd.txt")          -- contents | nil, err
local ok, err = plugin.saveResource("config.yml", false)  -- install to data_pl
for _, path in ipairs(plugin.listResources()) do     -- recursive listing
    log.info("shipped: " .. path)
end
```

| Function | Description |
|---|---|
| `plugin.getResource(name)` | Returns the contents of `resources/<name>` (binary safe), or `nil, err` if it does not exist. |
| `plugin.saveResource(name, replace)` | Copies `resources/<name>` into your data folder — the standard way to install a default config. With `replace = false` an existing file is kept. Returns `true` or `false, reason`. |
| `plugin.listResources()` | Relative paths of everything inside `resources/` (recursive). |

A typical startup:

```lua
if not data.exists("config.yml") then
    plugin.saveResource("config.yml", false)   -- install shipped default
end
local config = data.loadYml("config.yml")
```

## Format support

**YAML** supports: nested maps by indentation, lists (`- item`, including lists of maps), quoted and unquoted strings, integers, floats, `true`/`false`, `null`/`~` (the key is omitted in Lua), `#` comments and empty `{}` / `[]`.
It does **not** support: anchors, multi-line text (`|` / `>`) or tab indentation (clear error).

**JSON** is the full standard, including `\uXXXX` escapes and surrogate pairs. A `null` inside an object omits the key in the Lua table.
