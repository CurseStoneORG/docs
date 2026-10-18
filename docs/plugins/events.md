# Events

**English** · [Español](eventos-es.md)

Events let your plugin react to what happens on the server. Listen with `events.on(name, fn)`; the handler receives an event table `e`.

```lua
events.on("PlayerChat", function(e)
    if string.find(string.lower(e.message), "noob") then
        e.cancel()
        player.message(e.player, "§cBe nice in chat!")
    end
end)
```

- `e.player` is the player's **name** (string), never an object.
- `e.cancel()` cancels a cancellable event. Calling it on a non-cancellable event does nothing harmful.
- Writable fields (marked below) can be rewritten: whatever is left in the table when the handler returns is what the server uses.
- Listeners run at **normal priority** and are removed automatically when the plugin is disabled.

## Player events

| Event | Fields of `e` | Writable | Cancellable |
|---|---|---|---|
| `PlayerJoin` | `player`, `message` | `message` | Yes (only suppresses the message) |
| `PlayerQuit` | `player`, `message` | `message` | Yes (only suppresses the message) |
| `PlayerChat` | `player`, `message` | `message` | Yes (chat is not broadcast) |
| `PlayerDeath` | `player`, `message` | `message` | Yes (only suppresses the broadcast message) |
| `PlayerRespawn` | `player`, `x`, `y`, `z` (respawn point) | no | No (intentionally not cancellable) |
| `PlayerMove` | `player`, `fromX`, `fromY`, `fromZ`, `toX`, `toY`, `toZ` | no | Yes (movement is reverted) |
| `PlayerInteract` | `player`, `x`, `y`, `z`, `face`, `action`, `item` | no | Yes (interaction is not processed) |
| `PlayerBedEnter` | `player`, `x`, `y`, `z` (bed position) | no | Yes (player does not sleep) |
| `PlayerBedLeave` | `player`, `x`, `y`, `z` | no | No |
| `PlayerDropItem` | `player`, `item` | no | Yes (item stays in the inventory) |
| `PlayerItemHeld` | `player`, `item`, `slot` | no | Yes (selection is reverted) |

Notes:

- `PlayerSleepInBed` is accepted as an **alias** of `PlayerBedEnter`.
- `PlayerMove` fires for **every accepted movement packet**; keep the handler light. Cancelling reverts the player to the previous position (the server sends a correction packet) — the same pattern the anti-cheat uses.
- `PlayerInteract.action` is one of `"left_click_block"`, `"right_click_block"`, `"right_click_air"`, `"left_click_air"`, `"physical"`. `item` is an item table (see below).

## Block events

| Event | Fields of `e` | Writable | Cancellable |
|---|---|---|---|
| `BlockBreak` | `player`, `x`, `y`, `z`, `block_id` | no | Yes (block is not broken) |
| `BlockPlace` | `player`, `x`, `y`, `z`, `block_id` | no | Yes (block is not placed) |
| `DoorToggle` | `player`, `x`, `y`, `z` | no | Yes (door does not toggle) |

## Damage events

| Event | Fields of `e` | Writable | Cancellable |
|---|---|---|---|
| `EntityDamage` | `entity`, `amount`, `cause` | `amount` | Yes (no damage) |
| `EntityDamageByEntity` | `entity`, `amount`, `cause`, `damager` | `amount` | Yes (no damage) |

- `e.entity` / `e.damager` are readable identifiers: the player's **name**, or `eid:<id>` for other entities, or `"unknown"`.
- `e.amount` is writable: whatever number is left in the table is applied, clamped to `0` or more. This is how you build damage multipliers, shields or armor bonuses.
- `e.cause` is a string: `"entity_attack"`, `"contact"`, `"fall"`, `"lava"`, `"fire"`, `"fire_tick"`, `"drowning"`, `"cactus"`, `"starvation"`, `"void"`, `"projectile"`, `"magic"` or `"custom"`.

```lua
-- x2 damage for players holding a netherite sword (id 744 in 0.15 data)
events.on("EntityDamageByEntity", function(e)
    if e.cause == "entity_attack" and e.damager and player.isOp(e.damager) then
        e.amount = e.amount * 2
    end
end)
```

The numeric constants of these causes are also exported as `events.CAUSE.*` (`events.CAUSE.FALL`, `events.CAUSE.LAVA`, ...); `e.cause` itself is the string above.

## Item tables

Events that carry an item (`PlayerInteract`, `PlayerDropItem`, `PlayerItemHeld`) provide three fields:

| Field | Description |
|---|---|
| `e.item_id` | Numeric item id. |
| `e.item_meta` | Item metadata / damage value. |
| `e.item_count` | Stack size. |

## Examples

Announce deaths with style and keep a kill counter:

```lua
events.on("PlayerDeath", function(e)
    e.message = "§4" .. e.player .. " has fallen"
end)
```

Simple spawn protection with `EntityDamage`:

```lua
local SPAWN = { x = 0, z = 0, r = 20 }
events.on("EntityDamage", function(e)
    local ex, ey, ez = player.getPosition(e.entity)
    if ex and math.abs(ex - SPAWN.x) < SPAWN.r and math.abs(ez - SPAWN.z) < SPAWN.r then
        e.cancel()
    end
end)
```

:::{tip}
Combine `PlayerMove` cancellation with region checks to build fenced areas, and `EntityDamage` to make them safe — a classic mini-game kit with a few lines of Lua. See [Best practices](best-practices.md) for keeping handlers fast.
:::
