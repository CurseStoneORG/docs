# Full API reference

**English** · [Español](referencia-api-es.md)

Every global available to your plugin, in one page. Detailed explanations live in the dedicated pages: [Commands](commands.md), [Events](events.md), [Scheduled tasks](scheduler.md), [Data](data.md), [Worlds](worlds.md), [Players](players.md).

## `plugin`: info about the plugin itself

| Field | Description |
|---|---|
| `plugin.api` | Server plugin API version (`"1.0.2"`) |
| `plugin.name` | Plugin name (from the manifest) |
| `plugin.author` | Author (from the manifest) |
| `plugin.version` | Version (manifest or entry table) |
| `plugin.include(path)` | Loads a Lua file from the plugin (cached) |
| `plugin.getResource(name)` | Contents of `resources/<name>` (binary safe) or `nil, err` |
| `plugin.saveResource(name, replace)` | Copies `resources/<name>` into the data folder |
| `plugin.listResources()` | Relative paths inside `resources/` (recursive) |
| `import(module)` | **Global** function: loads a module (searches `src/`, extension optional, dots or slashes, same cache) |

## `log`

| Function | Description |
|---|---|
| `log.info(msg)` | Writes to the log with the `[PluginName]` prefix |
| `log.warn(msg)` | Same, as a warning |
| `log.error(msg)` | Same, as an error |

## `server`

| Function | Description |
|---|---|
| `server.broadcast(msg)` | Message to everyone |
| `server.players()` | List of online player names |
| `server.getPlayer(name)` | Player handle or `nil` if not online (see [Players](players.md#player-handle-servergetplayer)) |
| `server.worlds()` | List of loaded world names |
| `server.getWorld(name)` | World handle or `nil` |
| `server.loadWorld(name, gen)` | Loads/creates a world (`"normal"`, `"flat"`, `"Nether"`, `"void"`) |
| `server.defaultWorld()` | World handle of the default world |

## `player`

| Function | Description |
|---|---|
| `player.message(name, msg)` | Message to a player (`false` if not found) |
| `player.tip(name, msg)` | Floating tip (`false` if not found) |
| `player.popup(name, msg)` | Popup above the hotbar (`false` if not found) |
| `player.kick(name, reason)` | Kicks the player (default reason: `"Expulsado"`) |
| `player.teleport(name, x, y, z)` | Teleports within the world |
| `player.teleportWorld(name, world, x, y, z)` | Teleports to another world by name |
| `player.getWorld(name)` | World handle the player is in (`nil` if not found) |
| `player.getHealth(name)` | Current health (number) |
| `player.setHealth(name, hp)` | Sets health; `0` kills through the normal pipeline |
| `player.kill(name)` | Kills through the normal death pipeline |
| `player.getPosition(name)` | `x, y, z` (feet) or `nil` |
| `player.getRotation(name)` | `yaw, pitch` or `nil` |
| `player.setRotation(name, yaw, pitch)` | Turns the camera (re-syncs the client) |
| `player.setMotion(name, x, y, z)` | Motion impulse |
| `player.giveItem(name, id, count, meta, customName)` | Adds an item stack (optional visible custom name) |
| `player.setNameTag(name, tag)` | Nametag above head + tab list (`§` codes allowed) |
| `player.getNameTag(name)` | Current nametag (`nil` if not found) |
| `player.setDisplayName(name, dn)` | Chat-only name |
| `player.getDisplayName(name)` | Current display name (`nil` if not found) |
| `player.isOp(name)` | `true` if the player is op |
| `player.setPermission(name, node, v)` | Grants or denies a node (in memory) |
| `player.hasPermission(name, node)` | Does the player have that node? |

## `commands`

| Function | Description |
|---|---|
| `commands.register(name, opts, fn)` | Registers a command. `opts`: `description`, `usage`, `permission`, `override` (see [Commands](commands.md#overriding-built-in-commands-new-in-102)) |
| `commands.reply(sender, msg)` | Replies to whoever ran the command |

## `events`

| Function | Description |
|---|---|
| `events.on(name, fn)` | Listens to an event (see [Events](events.md) for the full list) |
| `events.CAUSE.<NAME>` | Numeric damage-cause constants (`FALL`, `LAVA`, `ENTITY_ATTACK`, ...) |

## `scheduler`

| Function | Description |
|---|---|
| `scheduler.later(ticks, fn)` | Once; returns an id |
| `scheduler.every(ticks, fn)` | Repeating; returns an id |
| `scheduler.cancel(id)` | Cancels a task |

## `data`

| Function | Description |
|---|---|
| `data.folder` | Path of your data folder |
| `data.read / write / exists / delete / list` | Raw files |
| `data.loadYml / saveYml` | YAML |
| `data.loadJson / saveJson` | JSON |

## Handles

| Handle | Truth | Methods |
|---|---|---|
| `player handle` | `server.getPlayer(name)`; `tostring` → `player(name)` | `p:getName()`, `p:isOnline()` + every `player.*` action without the name argument |
| `world handle` | `server.getWorld(name)`, `server.loadWorld()`, `server.defaultWorld()`, `player.getWorld(name)`; `tostring` → `world(name)` | `w:name()`, `w:seed()`, `w:dimension()`, `w:getTime()`, `w:setTime(t)`, `w:getBlock(x,y,z)`, `w:setBlock(x,y,z,id,data)`, `w:getSpawn()`, `w:getPlayers()`, `w:unload()` |

Both handles only store a **name** and re-resolve the live object on every call; after the player leaves or the world unloads, methods return `nil`/`false` instead of erroring.
