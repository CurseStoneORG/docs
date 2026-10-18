# Players

**English** · [Español](jugadores-es.md)

Every player API goes **by name** (string). There are no `Player` objects in Lua: each call re-resolves the live player, so a name that matches nobody simply returns `false` or `nil`.

For object-style code, `server.getPlayer(name)` returns a lightweight **player handle** (see the [end of this page](#player-handle-servergetplayer)).

## Messages: chat, tip and popup

```lua
player.message("Steve", "§aHello")             -- private chat message
player.tip("Steve", "§aYou got new clothes")   -- centered floating text
player.popup("Steve", "§bPlugin HUD")          -- text above the hotbar
server.broadcast("§eMessage for everyone")     -- to everyone
```

`player.message`, `player.tip` and `player.popup` return `true` if the player exists and `false` otherwise.

- The **tip** is a floating notice.
- The **popup** appears above the hotbar, useful for a HUD.
- Both disappear on their own after a few seconds. To make them "last", resend them with `scheduler.every` (see [Scheduled tasks](scheduler.md)).

## Health, life and death

```lua
local hp = player.getHealth("Steve")    -- current health (0 if offline)
player.setHealth("Steve", 10)           -- half hearts (values are clamped)
player.kill("Steve")                    -- full death pipeline
```

| Function | Description |
|---|---|
| `player.getHealth(name)` | Current health as a number (`0` when the player is not online). |
| `player.setHealth(name, hp)` | Sets health, clamped to `[0, max]`. The hearts bar syncs in the same tick. `setHealth(name, 0)` kills through the **regular damage pipeline** (death screen, drops, `PlayerDeathEvent`) exactly like `/kill`. On a dead player it is a no-op. |
| `player.kill(name)` | Kills the player through the normal death pipeline: death screen, drops, death event. Returns `false` if the player does not exist or is already dead. |

## Movement, position and camera

```lua
local x, y, z = player.getPosition("Steve")        -- feet position | nil
local yaw, pitch = player.getRotation("Steve")     -- camera angles | nil
player.setRotation("Steve", 90, 20)                -- turns the camera
player.setMotion("Steve", 0, 10, 0)                -- vertical impulse
player.teleport("Steve", 100, 65, -200)            -- same-world teleport
player.teleportWorld("Steve", "nether", 8, 64, 8)  -- cross-world teleport
```

| Function | Description |
|---|---|
| `player.getPosition(name)` | Returns `x, y, z` (feet) or `nil` if the player does not exist. |
| `player.getRotation(name)` | Returns `yaw, pitch` or `nil`. |
| `player.setRotation(name, yaw, pitch)` | Sets the rotation on the server **and re-syncs the client** with a `MovePlayerPacket` reset, so the 0.15 client really turns the view. Returns `false` if the player does not exist. |
| `player.setMotion(name, x, y, z)` | Applies a motion impulse to the player (`SetEntityMotionPacket`). Great for knockbacks, launch pads and cannons. Returns `false` if the player does not exist. |
| `player.teleport(name, x, y, z)` | Teleports within the player's world. Returns `false` if the player does not exist. |
| `player.teleportWorld(name, world, x, y, z)` | Teleports to another **world by name** (e.g. `"world"` or `"nether"`). Returns `false` if the player or the world does not exist. |

## Items

```lua
player.giveItem("Steve", 278)                          -- 1x diamond pickaxe
player.giveItem("Steve", 272, 1, 0, "§bStoneslayer")   -- custom visible name
```

| Function | Description |
|---|---|
| `player.giveItem(name, id, count, meta, customName)` | Adds an item stack to the player's inventory. `count` defaults to `1`, `meta` to `0`. `customName` is optional and is the **visible** item name the client renders (anvil-style); it supports `§` color codes. Returns `true` if the stack fit, `false` otherwise (player missing, invalid id, full inventory). |

## NameTag and display name (ranks)

```lua
player.setNameTag("Steve", "§4[Admin]§r Steve")
local tag = player.getNameTag("Steve")          -- nil if the player is offline
player.setDisplayName("Steve", "§6SteveTheBrave")
local dn = player.getDisplayName("Steve")
```

| Function | Description |
|---|---|
| `player.setNameTag(name, tag)` | Sets the name **above the head** and in the server tab list. Accepts `§` codes — this is the rank-prefix surface. Re-broadcasts the player list to everyone. |
| `player.getNameTag(name)` | Current nametag, or `nil` if the player does not exist. |
| `player.setDisplayName(name, dn)` | Name shown **only in chat**. |
| `player.getDisplayName(name)` | Current display name, or `nil` if the player does not exist. |

:::{tip}
`setNameTag` changes what everyone sees above the head and in the tab list; `setDisplayName` only changes the chat name. Combine both for ranks: a colored nametag plus a chat display name.
:::

## Permissions and OP

```lua
local op = player.isOp("Steve")                       -- true/false
player.setPermission("Steve", "myperm.vip", true)     -- grant a node (in memory)
player.setPermission("Steve", "myperm.vip", false)    -- deny it
local ok = player.hasPermission("Steve", "myperm.vip")
```

| Function | Description |
|---|---|
| `player.isOp(name)` | `true` if the player is op (`false` if not online). |
| `player.setPermission(name, node, v)` | Grants or denies a custom permission node **in memory**. Returns `false` if the player is not online. |
| `player.hasPermission(name, node)` | Does the player have that node? (`false` if not online.) |

:::{warning}
Custom permissions live **in memory**: they are lost when the server restarts or the player leaves. To persist them, save them with `data.saveYml` (see [Data and configuration](data.md)) and grant them again in the `PlayerJoin` event.
:::

## World access

```lua
local w = player.getWorld("Steve")   -- world handle | nil
if w then
    log.info("Steve is in " .. w:name())
end
```

`player.getWorld(name)` returns the [world handle](worlds.md) the player is standing in, or `nil`. Use `player.teleportWorld` to move a player between worlds.

## Kick

```lua
player.kick("Steve")                        -- default reason: "Expulsado"
player.kick("Steve", "§cYou have been banned!")
```

`player.kick(name, reason)` kicks the player and returns `false` if the player does not exist. The default reason is `"Expulsado"`.

## Player handle (`server.getPlayer`)

```lua
local p = server.getPlayer("Steve")   -- handle | nil if not online
if p then
    print(p)                          -- "player(Steve)"
    log.info(p:getName() .. " has " .. p:getHealth() .. " HP")
    p:message("§aHi!")
    p:teleport(0, 64, 0)
    p:giveItem(272, 1, 0, "§bStoneslayer")
    p:kill()
end
```

- Returns `nil` when no online player matches (same case-insensitive lookup as the name-based API).
- The handle only carries the **name**: every method re-resolves the live player, so a handle stays valid until the player leaves; afterwards the methods return `nil`/`false` instead of erroring.
- `p:getName()` returns the name, `p:isOnline()` returns `true`/`false`.
- **Every `player.*` function of this page is available as a method**, with the name argument removed: `p:message(msg)`, `p:tip(msg)`, `p:popup(msg)`, `p:kick(reason)`, `p:teleport(x, y, z)`, `p:teleportWorld(world, x, y, z)`, `p:getWorld()`, `p:isOp()`, `p:getHealth()`, `p:setHealth(hp)`, `p:setPermission(node, v)`, `p:hasPermission(node)`, `p:giveItem(id, count, meta, customName)`, `p:setNameTag(tag)`, `p:getNameTag()`, `p:setDisplayName(dn)`, `p:getDisplayName()`, `p:getPosition()`, `p:getRotation()`, `p:setRotation(yaw, pitch)`, `p:setMotion(x, y, z)`, `p:kill()`.

:::{note}
The server never stores C++ pointers inside the handle, so a stale handle can never crash the server. Prefer handles for readable code and the plain name-based functions when you only have a name string (e.g. inside events).
:::
