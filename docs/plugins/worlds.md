# Worlds

**English** · [Español](mundos-es.md)

New in API **1.0.2**: CurseStone supports multiple worlds with independent ticking, loading and unloading, and the Lua API can manage all of it.

Worlds are handled through lightweight **world handles**: like the player handle, a handle only carries the world *name*, and every method re-resolves the live world. If the world gets unloaded, the methods return `nil`/`false` instead of erroring. `tostring(handle)` reads `world(name)`.

## Finding and loading worlds

```lua
local names = server.worlds()            -- {"world", "nether", ...}
local w = server.getWorld("world")       -- handle | nil if not loaded
local spawn = server.defaultWorld()      -- handle of the spawn world

-- Load (or create) a world. Generator: "normal" | "flat" | "Nether" | "void"
local skyblock = server.loadWorld("skyblock", "flat")
local nether   = server.loadWorld("nether", "Nether")
```

| Function | Description |
|---|---|
| `server.worlds()` | List with the names of the currently loaded worlds. |
| `server.getWorld(name)` | World handle, or `nil` if that world is not loaded. |
| `server.loadWorld(name, gen)` | Loads the world (creating it if needed) and returns its handle. `gen` is optional and defaults to `"normal"`; valid values: `"normal"`, `"flat"`, `"Nether"`, `"void"`. |
| `server.defaultWorld()` | Handle of the default (spawn) world. |

## World handle methods

```lua
local w = server.getWorld("world")
if w then
    log.info(w:name() .. " seed=" .. w:seed() .. " dim=" .. w:dimension())

    w:setTime(0)                    -- sunrise
    local t = w:getTime()           -- 0..24000

    local id = w:getBlock(0, 64, 0) -- block id (0 if the chunk is not loaded)
    w:setBlock(0, 64, 0, 41, 0)     -- place a gold block (id, data)

    local sx, sy, sz = w:getSpawn()
    for _, name in ipairs(w:getPlayers()) do
        player.message(name, "§7Welcome to " .. w:name())
    end
end
```

| Method | Description |
|---|---|
| `w:name()` | World name. |
| `w:seed()` | World seed. |
| `w:dimension()` | `0` = Overworld, `1` = Nether. |
| `w:getTime()` | World time, `0..24000`. |
| `w:setTime(t)` | Sets the world time. |
| `w:getBlock(x, y, z)` | Block id at the position; `0` if the chunk is not loaded or `y` is out of range. |
| `w:setBlock(x, y, z, id, data)` | Writes a block (`data` optional, default `0`). Returns `true`/`false`. Valid ranges: `y` `0..255`, `id` `0..255`, `data` `0..15`. |
| `w:getSpawn()` | Spawn coordinates `x, y, z`. |
| `w:getPlayers()` | Names of the players currently inside the world. |
| `w:unload()` | Unloads the world. Returns `false` if it is the default world or the unload is cancelled. |

:::{note}
`w:setBlock` **forces the target chunk to load/generate** before writing, so the change is never silently lost on ungenerated terrain.
:::

## Example: Nether hub

```lua
-- Teleport everyone in the Overworld spawn area to the Nether hub
local nether = server.loadWorld("nether", "Nether")
for _, name in ipairs(server.players()) do
    player.teleportWorld(name, "nether", 8, 64, 8)
    player.message(name, "§5Welcome to the Nether hub!")
end
```

Cross-world player movement, portal linking and per-world time are all handled by the server; the Lua API simply drives it. See [Players](players.md#movement-position-and-camera) for `player.teleportWorld` and [Events](events.md) for reacting to movement between worlds.
