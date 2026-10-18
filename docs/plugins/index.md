# Plugin guide

**English** · [Español](index-es.md)

Official guide for developing **Lua 5.4** plugins for CurseStone.

| | |
|---|---|
| **API version** | `1.0.2` |
| **Language** | Lua 5.4 |
| **Manifest** | `plugin.yml` |
| **Server** | CurseStone (MCPE 0.15.10 / protocol 84) |

The guide is split into focused pages:

```{toctree}
:hidden:
:maxdepth: 1

Getting started <self>
Commands and permissions <commands>
Events <events>
Scheduled tasks <scheduler>
Data and configuration <data>
Worlds <worlds>
Players <players>
Full API reference <api-reference>
Best practices and troubleshooting <best-practices>
```

## 1. Introduction

The CurseStone plugin system is designed to be **simple and predictable**:

- **Everything goes by player name** (string). There are no `Player` objects in Lua. If you want an object-style handle, `server.getPlayer(name)` returns a lightweight one that still resolves the live player by name on every call.
- **Nothing external to install.** The Lua 5.4 engine and the YAML/JSON parsers are compiled into the server binary. You do not need `lua`, `python` or any other tool on the machine.
- **Each plugin is isolated.** It has its own Lua state and its own data folder, and cannot escape them.
- **A plugin error never crashes the server.** It is logged and the server keeps running. A plugin that fails repeatedly or exceeds the execution limits is disabled automatically.

:::{note}
Every message the server writes to its log (plugin loading, warnings, duplicates, manifest or API errors) is in **English**.
:::

## 2. What is new in API 1.0.2

If you wrote plugins for `1.0.1`, these are the highlights:

- **Worlds**: `server.worlds()`, `server.getWorld()`, `server.loadWorld()`, `server.defaultWorld()` and the `world` handle (read/write blocks, time, spawn, players, unload). See [Worlds](worlds.md).
- **Player handle**: `server.getPlayer(name)` returns an object with `p:getName()`, `p:isOnline()` and every `player.*` action as a method. See [Players](players.md).
- **New player functions**: `getHealth` / `setHealth`, `kill`, `getPosition`, `getRotation` / `setRotation`, `setMotion`, `teleportWorld`, `getWorld`, `giveItem` (with custom item names), `setNameTag` / `getNameTag`, `setDisplayName` / `getDisplayName`.
- **Many more events**: `PlayerMove`, `PlayerDeath`, `PlayerRespawn`, `PlayerInteract`, `EntityDamage`, `EntityDamageByEntity`, `PlayerDropItem`, `PlayerItemHeld`, bed, door and more. See [Events](events.md).
- **Command overrides**: a plugin can temporarily replace built-in commands (`/kick`, ...) and they are restored automatically on unload. See [Commands](commands.md).
- **Plugin resources**: `plugin.getResource()`, `plugin.saveResource()` and `plugin.listResources()` read the `resources/` folder of your plugin.
- **Execution limits**: runaway scripts are stopped (VM instructions and wall-clock time per call) and a plugin with too many consecutive errors is disabled automatically. See [Best practices](best-practices.md).
- **Data location change**: plugin data now lives in `data_pl/` at the **server root** (it used to be `plugins/data_pl/`). The server moves the old folder automatically on the first start.

## 3. Your first plugin

Create the folder `plugins/HelloWorld/` next to the server binary (beside `server.properties`) with these two files.

**`plugins/HelloWorld/plugin.yml`**

```yaml
api: "1.0.2"
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
A complete, commented reference plugin lives in [`ExamplePlugin/`](../example-plugin.md).
:::

## 4. Folder structure

```
<server root>/
├── plugins/                <- plugin CODE
│   ├── HelloWorld/
│   │   ├── plugin.yml      <- manifest
│   │   ├── resources/      <- optional read-only resources (configs, texts)
│   │   └── src/
│   │       ├── main.lua    <- entry script
│   │       └── rules.lua   <- helper files
│   └── MyPlugin/
│       ├── plugin.yml
│       └── src/
│           └── core/
│               └── Example.lua
└── data_pl/                <- plugin DATA (created automatically on startup)
    ├── HelloWorld/         <- one folder per plugin, named after ITS FOLDER
    │   ├── config.yml
    │   ├── counter.json
    │   └── signature.dat
    └── MyPlugin/
```

| Folder | Purpose |
|---|---|
| `plugins/<Plugin>/` | Plugin code. Treat it as read-only at runtime. |
| `plugins/<Plugin>/resources/` | Optional read-only files shipped with the plugin, read with `plugin.getResource()` and installed with `plugin.saveResource()`. |
| `data_pl/<Plugin>/` | Configs and data. Kept across restarts and reloads. |

The data folder uses the plugin's **folder** name (not the manifest `name`), so it is always unique and safe.

:::{note}
**Upgrading from 1.0.1?** The data root used to be `plugins/data_pl/`. CurseStone detects it and moves it to `<server root>/data_pl/` automatically on the first start — you do not need to do anything.
:::

## 5. The `plugin.yml` manifest

Every plugin is loaded from its `plugin.yml`.

```yaml
api: "1.0.2"          # API the plugin was written against
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

The current version is **`1.0.2`**. It is also shown in `/plugins`, in the startup log and in `plugin.api`.

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

## 6. Lifecycle

The entry script must **return a table**:

```lua
local pluginTable = {}

function pluginTable.onEnable() end     -- optional: runs on enable
function pluginTable.onDisable() end    -- optional: runs on disable

return pluginTable
```

- Plugins load in **alphabetical order** at startup.
- A plugin with a syntax error is discarded with a log message; the server still starts.
- Register commands, events and tasks inside `onEnable`, and undo what you can in `onDisable` (the server removes your listeners, tasks and commands automatically anyway).

## 7. Modules with `import()`

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

The Lua environment has **no** `io`, `os`, `package`, `debug`, `load`, `loadfile` or `dofile`. The only way to load code is `import` / `plugin.include`, and the only ways to touch files are the [data API](data.md) and the [resources API](data.md#plugin-resources).
