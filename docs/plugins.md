# CurseStone Plugin Guide

**English** · [Español](plugins-es.md)

Official documentation for developing **Lua 5.4** plugins for CurseStone.

| | |
|---|---|
| **API version** | `1.0.1` |
| **Language** | Lua 5.4 |
| **Manifest** | `plugin.yml` |
| **Server** | CurseStone (MCPE 0.15.10 / protocol 84) |

## 1. Introduction

The CurseStone plugin system is designed to be **simple and predictable**:

- **Everything goes by player name** (string). There are no `Player` objects in Lua.
- **Nothing external to install.** The Lua 5.4 engine and the YAML/JSON parsers are compiled into the server binary. You do not need `lua`, `python` or any other tool on the machine.
- **Each plugin is isolated.** It has its own Lua state and its own data folder, and cannot escape them.
- **A plugin error never crashes the server.** It is logged and the server keeps running.

:::{note}
Every message the server writes to its log (plugin loading, warnings, duplicates, manifest or API errors) is in **English**.
:::

## 2. Your first plugin

Create the folder `plugins/HelloWorld/` next to the server binary (beside `server.properties`) with these two files.

**`plugins/HelloWorld/plugin.yml`**

```yaml
api: "1.0.1"
name: HelloWorld
author: YourName
version: "1.0"
main: src/main.lua
```

**`plugins/HelloWorld/src/main.lua`**

```lua
local pluginTable = {}

function pluginTable.onEnable()
    log.info("HelloWorld enabled!")

    commands.register("hi", {
        description = "Greets you",
        usage = "/hi",
    }, function(sender, args)
        commands.reply(sender, "§aHello, " .. sender.name .. "!")
    end)

    events.on("PlayerJoin", function(e)
        e.message = "§e" .. e.player .. " joined the server"
    end)
end

function pluginTable.onDisable()
    log.info("HelloWorld disabled")
end

return pluginTable
```

Restart the server (or run `/plugins reload`) and try `/hi` in game.

:::{tip}
The example plugins `hello` and `MyPlugin` ship with the repository and CMake copies them next to the binary automatically. `hello` shows the manifest, YAML/JSON configs, binary data, permissions, tip/popup and events. `MyPlugin` shows the tree layout with `src/core/` and module loading with `import()`.

A complete, commented reference plugin lives in [`ExamplePlugin/`](example-plugin.md).
:::

## 3. Folder structure

```
plugins/
├── hello/                  <- plugin code
│   ├── plugin.yml          <- manifest
│   └── src/
│       ├── main.lua        <- entry script
│       └── rules.lua       <- helper files
├── MyPlugin/
│   ├── plugin.yml
│   └── src/
│       ├── main.lua
│       └── core/
│           ├── Example.lua
│           └── PlayerManager.lua
└── data_pl/                <- plugin DATA (created automatically on startup)
    ├── hello/              <- one folder per plugin, named after ITS FOLDER
    │   ├── config.yml
    │   ├── counter.json
    │   └── signature.dat
    └── MyPlugin/
```

| Folder | Purpose |
|---|---|
| `plugins/<Plugin>/` | Plugin code. Treat it as read-only. |
| `plugins/data_pl/<Plugin>/` | Configs and data. Kept across restarts and reloads. |

The data folder uses the plugin's **folder** name (not the manifest `name`), so it is always unique and safe.

## 4. The `plugin.yml` manifest

Every plugin is loaded from its `plugin.yml`.

```yaml
api: "1.0.1"          # API the plugin was written against
name: Hello           # name (if missing: folder name)
author: CurseStone    # author (optional; shown in /plugins)
version: "1.2"        # version (optional)
main: src/main.lua    # entry (if missing: src/main.lua or main.lua)
```

| Field | Required | Description |
|---|---|---|
| `api` | Recommended | API version the plugin targets. See compatibility below. |
| `name` | No | Display name. Defaults to the folder name. |
| `author` | No | Author. Shown in `/plugins`. |
| `version` | No | Plugin version. Shown in `/plugins`. |
| `main` | No | Entry script path, relative to the plugin folder. |

### API compatibility

The current version is **`1.0.1`**. It is also shown in `/plugins`, in the startup log and in `plugin.api`.

| Situation | Result |
|---|---|
| Different `major` | The plugin is **rejected**. |
| Plugin `minor` **newer** than the server's | The plugin is **rejected**. |
| Same or older `minor`, different `patch` | Loads with a **warning**. |

### Manifest rules

- **Only `plugin.yml` is accepted.** A bare `main.lua` without a manifest is not loaded: the folder is ignored with a log warning.
- `main` is **relative** to the plugin folder. Absolute paths and `..` are not allowed.
- Strings containing spaces, `:` or `#` need quotes (`message: "hi: world"`). Numbers and booleans go unquoted (`interval: 1200`, `enabled: true`).
- If several folders share a name, only the one with a `plugin.yml` is considered.

:::{tip}
**Upgrading from an older version?** Move the fields from your old `main.lua` into a `plugin.yml` (same YAML syntax).
:::

## 5. Lifecycle

The entry script must **return a table**:

```lua
local pluginTable = {}

function pluginTable.onEnable() end     -- optional: runs on enable
function pluginTable.onDisable() end    -- optional: runs on disable

return pluginTable
```

- Plugins load in **alphabetical order** at startup.
- A plugin with a syntax error is discarded with a log message; the server still starts.
- Register commands, events and tasks inside `onEnable`.

## 6. Modules with `import()`

A plugin can have any number of Lua files in subfolders. Each module is a file that **returns a table** and is loaded with the global function `import`.

```lua
local Example       = import("core.Example")        -- require style, with dots
local PlayerManager = import("core/PlayerManager")  -- with slashes: same thing
```

### How paths are resolved

`import(path)` looks **inside `src/` first** and does not require an extension. All of these load the same file:

```lua
import("core.Example")
import("core/Example")
import("core/Example.lua")
import("src/core/Example")
```

- **Dots = folders.** In a module name with no slashes or extension, each `.` is a folder level: `import("helper.sub")` loads `src/helper/sub.lua`. If a file were literally named `core.example.lua`, the slash/folder form wins; for the literal dotted file use the full path: `import("core.example.lua")`.
- **`require`-style cache.** A module runs **only once**; every later call, from any file in the plugin, returns **the same table**. Ideal for stateful modules such as a `PlayerManager`.
- **Outside `src/`.** Works if the folder exists: `import("lib/extra.lua")` loads `<plugin>/lib/extra.lua`.
- **Explicit variant.** `plugin.include("src/rules.lua")` requires the exact path (with extension) relative to the plugin folder and shares the same cache.
- **No escaping.** `..` and absolute paths raise a Lua error.

### Restricted environment

The Lua environment has **no** `io`, `os`, `package`, `debug`, `load`, `loadfile` or `dofile`. The only way to load code is `import` / `plugin.include`, and the only way to touch files is the [`data.*`](#10-data-and-configuration) API.

## 7. Commands and permissions

### Registering a command

```lua
commands.register("hello", {
    description = "Greets you",        -- optional (shown in /help)
    usage       = "/hello",            -- optional
    permission  = "default",           -- optional: "default" | "op" | custom node
}, function(sender, args)
    commands.reply(sender, "Hello " .. sender.name)
end)
```

- Returns `true` if registered and `false` if the name was already taken. A command name can belong to only one plugin.
- `sender` is a simple table: `{ name = "Steve", isConsole = false, isOp = true }`.
- `args` is a list of strings **without** the command name: `{"a", "b"}`.
- Always answer with `commands.reply(sender, msg)`: it works for both players and the console.
- The command name is lowercased on registration.
- Your function runs on the **next tick** on the main thread. `sender` is a **copy** taken when the command was typed; for the console, `sender.name` is `"CONSOLE"` and `sender.isConsole` is `true`.

### Permissions

The `permission` field defines who the command is for:

```lua
-- 1) PUBLIC (default)
commands.register("hello", { description = "Greets you" }, fn)

-- 2) OP ONLY
commands.register("announce", {
    description = "Broadcast a message (op)",
    usage = "/announce <text>",
    permission = "op",
}, fn)

-- 3) CUSTOM PERMISSION
commands.register("vip", {
    description = "VIP zone",
    permission = "myperm.vip",
}, fn)
```

| `permission` value | Who can use it |
|---|---|
| `"default"`, `"all"`, `"public"`, `"everyone"`, `"todos"` or no field | Everyone |
| `"op"`, `"admin"` | Ops and console (and anyone with the node `cursestone.command.<name>`) |
| Any other string | Ops and players granted that node |

The check runs **before** the command executes: a player without permission never reaches your Lua function.

### Granting and revoking permissions

```lua
player.setPermission("Steve", "myperm.vip", true)   -- grant
player.setPermission("Steve", "myperm.vip", false)  -- deny
player.hasPermission("Steve", "myperm.vip")         -- query
```

:::{warning}
Custom permissions live **in memory**: they are lost when the server restarts or the player leaves. To persist them, save them with `data.saveYml` and grant them again in the `PlayerJoin` event.
:::

### Dynamic `/help`

`/help` (and `/?`) is built from the real command registry. Your plugins' commands **show up on their own**, sorted alphabetically with the server's and paginated (`/help`, `/help 2`, ...). Each player only sees the commands they **can use**: op-only commands are hidden from regular players.

## 8. Events

Listen with `events.on(name, fn)`.

| Event | Fields of `e` | Writable | Cancellable |
|---|---|---|---|
| `PlayerJoin` | `player`, `message` | `message` | Yes (only suppresses the message) |
| `PlayerQuit` | `player`, `message` | `message` | Yes (only suppresses the message) |
| `PlayerChat` | `player`, `message` | `message` | Yes (chat is not broadcast) |
| `BlockBreak` | `player`, `x`, `y`, `z`, `block_id` | no | Yes |
| `BlockPlace` | `player`, `x`, `y`, `z`, `block_id` | no | Yes |

- `e.player` is the player's **name** (string), never an object.
- `e.cancel()` cancels the event.
- `e.message` can be rewritten: whatever is left in the table when the handler returns is what gets broadcast. Set `""` to silence it.

```lua
events.on("PlayerChat", function(e)
    if string.find(string.lower(e.message), "noob") then
        e.cancel()
        player.message(e.player, "§cBe nice in chat!")
    end
end)
```

## 9. Scheduled tasks

**20 ticks = 1 second.**

```lua
local id = scheduler.later(100, function()      -- once, after 5 s
    server.broadcast("§e5 seconds have passed")
end)

local task = scheduler.every(1200, function()   -- every 60 s
    server.broadcast("§bRead the rules with /rules")
end)

scheduler.cancel(task)                          -- cancel by id
```

| Function | Description |
|---|---|
| `scheduler.later(ticks, fn)` | Runs `fn` once. Returns an id. |
| `scheduler.every(ticks, fn)` | Runs `fn` every `ticks`. Returns an id. |
| `scheduler.cancel(id)` | Cancels a task. |

`ticks` must be an integer (use `math.floor` on computed values) and anything below `1` is treated as `1`. Tasks are cancelled automatically when the plugin is disabled.

## 10. Data and configuration

On startup `plugins/data_pl/` is created and, for each loaded plugin, its folder `plugins/data_pl/<pluginFolder>/`. The `data.*` API can **only** read and write inside it.

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

### Recommended pattern: config with defaults

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

### Format support

**YAML** supports: nested maps by indentation, lists (`- item`, including lists of maps), quoted and unquoted strings, integers, floats, `true`/`false`, `null`/`~` (the key is omitted in Lua), `#` comments and empty `{}` / `[]`.
It does **not** support: anchors, multi-line text (`|` / `>`) or tab indentation (clear error).

**JSON** is the full standard, including `\uXXXX` escapes and surrogate pairs. A `null` inside an object omits the key in the Lua table.

## 11. Messages: chat, tip and popup

```lua
player.message("Steve", "§aHello")             -- private chat message
player.tip("Steve", "§aYou got new clothes")   -- centered floating text
player.popup("Steve", "§bPlugin HUD")          -- text above the hotbar
server.broadcast("§eMessage for everyone")     -- to everyone
```

`player.message`, `player.tip` and `player.popup` return `true` if the player exists and `false` otherwise.

- The **tip** is a floating notice.
- The **popup** appears above the hotbar, useful for a HUD.
- Both disappear on their own after a few seconds. To make them "last", resend them with `scheduler.every`.

## 12. Managing plugins on the server

### `/plugins`

Public command. Lists loaded plugins with version and author:

```
Plugins (API 1.0.1) (2): MyPlugin v1.1 by CurseStone, Hello v1.3 by CurseStone
```

### `/plugins reload`

Ops and console only. Hot-reloads **all** plugins:

1. Calls each plugin's `onDisable`.
2. Removes their commands from the registry.
3. Closes their `lua_State`s.
4. Rescans `plugins/` and loads everything from scratch.

This is the typical dev workflow: edit your `.lua` files, run `/plugins reload` and test without restarting. `data_pl/` is **not** touched. If a plugin fails on reload it is discarded with a log message and the rest keep working. From the console the reload runs on the main thread, so it is safe.

Any other argument (`/plugins foo`) replies `Usage: /plugins [reload]`.

### Duplicate plugins

If two or more folders contain the same plugin, the server **picks none**: it disables every copy and logs a warning:

```
[Plugins] WARNING: there are 2 duplicate plugins named 'Hello'
(Hello, hello-copy). All of them are disabled: keep only one copy.
```

Two plugins count as the same if their `name` matches, or if their folders have the same name (both case-insensitive, since they would clash in `data_pl/`). Keep a single copy and restart or use `/plugins reload`.

## 13. Full API reference

### `plugin`: info about the plugin itself

| Field | Description |
|---|---|
| `plugin.api` | Server plugin API version (`"1.0.1"`) |
| `plugin.name` | Plugin name (from the manifest) |
| `plugin.author` | Author (from the manifest) |
| `plugin.version` | Version (manifest or entry table) |
| `plugin.include(path)` | Loads a Lua file from the plugin (cached) |
| `import(module)` | **Global** function: loads a module (searches `src/`, extension optional, dots or slashes, same cache) |

### `log`

| Function | Description |
|---|---|
| `log.info(msg)` | Writes to the log with the `[PluginName]` prefix |
| `log.warn(msg)` | Same, as a warning |
| `log.error(msg)` | Same, as an error |

### `server`

| Function | Description |
|---|---|
| `server.broadcast(msg)` | Message to everyone |
| `server.players()` | List of player names |

### `player`

| Function | Description |
|---|---|
| `player.message(name, msg)` | Message to a player (`false` if not found) |
| `player.tip(name, msg)` | Floating tip (`false` if not found) |
| `player.popup(name, msg)` | Popup above the hotbar (`false` if not found) |
| `player.kick(name, reason)` | Kicks the player (default reason: `"Expulsado"`) |
| `player.teleport(name, x, y, z)` | Teleports |
| `player.isOp(name)` | `true` if the player is op |
| `player.setPermission(name, node, v)` | Grants or denies a node (in memory) |
| `player.hasPermission(name, node)` | Does the player have that node? |

### `commands`

| Function | Description |
|---|---|
| `commands.register(name, opts, fn)` | Registers a command. `opts`: `description`, `usage`, `permission` |
| `commands.reply(sender, msg)` | Replies to whoever ran the command |

### `events`

| Function | Description |
|---|---|
| `events.on(name, fn)` | Listens to an event |

### `scheduler`

| Function | Description |
|---|---|
| `scheduler.later(ticks, fn)` | Once; returns an id |
| `scheduler.every(ticks, fn)` | Repeating; returns an id |
| `scheduler.cancel(id)` | Cancels a task |

### `data`

| Function | Description |
|---|---|
| `data.folder` | Path of your data folder |
| `data.read / write / exists / delete / list` | Raw files |
| `data.loadYml / saveYml` | YAML |
| `data.loadJson / saveJson` | JSON |

## 14. Best practices

- **Register everything in `onEnable`** (commands, events, tasks) and clean up what you need in `onDisable`.
- **Always create a default config** if `loadYml` / `loadJson` return `nil`.
- **Validate command arguments** before using them: `args` is just a list of strings.
- **Use modules** (`import`) to split logic; a module with shared state, such as a `PlayerManager`, works well thanks to the cache.
- **One command name per plugin.** Check the return value of `commands.register`.
- **Avoid infinite loops.** There is no instruction limit yet.
- **Use `/plugins reload`** while developing instead of restarting the server.
- **Do not keep important data only in memory** (permissions, counters): persist it in `data_pl`.

## 15. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Plugin missing from `/plugins` | No `plugin.yml` | Create the manifest; a bare `main.lua` is ignored |
| Plugin rejected for API | Different `major` or `minor` newer than the server | Adjust the `api` field |
| Two copies disabled | Duplicate plugins | Keep a single folder |
| `register` returns `false` | Another plugin already uses that command | Rename it |
| Lua error using `data.*` or `import` | Path with `..`, absolute, or with a backslash | Use relative paths with `/` |
| `loadYml` returns `nil, err` | Malformed YAML (for example tabs) | Fix the indentation or use JSON |
| Server freezes | Infinite loop (`while true do end`) | Review your logic; there is no instruction limit |
| Permission disappears | Permissions are in memory | Grant it again in `PlayerJoin` |

## 16. Limitations and roadmap

### Limitations (v1)

- No `/plugins enable|disable <name>` (reload does exist).
- No persistent permissions on disk.
- No `PlayerMove` event (it would fire on every movement tick).
- Commands from a plugin discarded due to an error are not registered; after `/plugins reload` everything is registered again from scratch.
- No command aliases.
- `plugin.include`, `import` and `data.*` do not allow absolute paths or `..` (on purpose).
- The YAML parser does not support anchors or multi-line text (use JSON for complex structures).
- No per-plugin instruction limit.

### Ideas for v2

- `/plugins enable|disable <name>`.
- More events: `PlayerDeath`, `PlayerMove` with throttling, inventory.
- Per-plugin instruction limit with `lua_sethook` (anti `while true`).
- Command aliases.
- Native persistent permissions, loaded from `data_pl`.
