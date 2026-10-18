# Eventos

**Español** · [English](events.md)

Los eventos permiten a tu plugin reaccionar a lo que pasa en el servidor. Escucha con `events.on(nombre, fn)`; el handler recibe una tabla de evento `e`.

```lua
events.on("PlayerChat", function(e)
    if string.find(string.lower(e.message), "noob") then
        e.cancel()
        player.message(e.player, "§cBe nice in chat!")
    end
end)
```

- `e.player` es el **nombre** del jugador (string), nunca un objeto.
- `e.cancel()` cancela un evento cancelable. Llamarlo en un evento no cancelable no hace nada malo.
- Los campos escribibles (marcados abajo) se pueden reescribir: lo que quede en la tabla cuando el handler retorna es lo que usa el servidor.
- Los listeners corren con prioridad **normal** y se eliminan automáticamente al desactivar el plugin.

## Eventos de jugador

| Evento | Campos de `e` | Escribible | Cancelable |
|---|---|---|---|
| `PlayerJoin` | `player`, `message` | `message` | Sí (solo suprime el mensaje) |
| `PlayerQuit` | `player`, `message` | `message` | Sí (solo suprime el mensaje) |
| `PlayerChat` | `player`, `message` | `message` | Sí (el chat no se difunde) |
| `PlayerDeath` | `player`, `message` | `message` | Sí (solo suprime el mensaje global) |
| `PlayerRespawn` | `player`, `x`, `y`, `z` (punto de respawn) | no | No (intencionalmente no cancelable) |
| `PlayerMove` | `player`, `fromX`, `fromY`, `fromZ`, `toX`, `toY`, `toZ` | no | Sí (el movimiento se revierte) |
| `PlayerInteract` | `player`, `x`, `y`, `z`, `face`, `action`, `item` | no | Sí (la interacción no se procesa) |
| `PlayerBedEnter` | `player`, `x`, `y`, `z` (posición de la cama) | no | Sí (el jugador no duerme) |
| `PlayerBedLeave` | `player`, `x`, `y`, `z` | no | No |
| `PlayerDropItem` | `player`, `item` | no | Sí (el item se queda en el inventario) |
| `PlayerItemHeld` | `player`, `item`, `slot` | no | Sí (la selección se revierte) |

Notas:

- `PlayerSleepInBed` se acepta como **alias** de `PlayerBedEnter`.
- `PlayerMove` se dispara en **cada paquete de movimiento aceptado**; mantén el handler ligero. Cancelarlo revierte al jugador a la posición anterior (el servidor manda un paquete de corrección) — el mismo patrón que usa el anti-cheat.
- `PlayerInteract.action` es uno de `"left_click_block"`, `"right_click_block"`, `"right_click_air"`, `"left_click_air"`, `"physical"`. `item` es una tabla de item (ver abajo).

## Eventos de bloques

| Evento | Campos de `e` | Escribible | Cancelable |
|---|---|---|---|
| `BlockBreak` | `player`, `x`, `y`, `z`, `block_id` | no | Sí (el bloque no se rompe) |
| `BlockPlace` | `player`, `x`, `y`, `z`, `block_id` | no | Sí (el bloque no se coloca) |
| `DoorToggle` | `player`, `x`, `y`, `z` | no | Sí (la puerta no cambia) |

## Eventos de daño

| Evento | Campos de `e` | Escribible | Cancelable |
|---|---|---|---|
| `EntityDamage` | `entity`, `amount`, `cause` | `amount` | Sí (no hay daño) |
| `EntityDamageByEntity` | `entity`, `amount`, `cause`, `damager` | `amount` | Sí (no hay daño) |

- `e.entity` / `e.damager` son identificadores legibles: el **nombre** del jugador, o `eid:<id>` para otras entidades, o `"unknown"`.
- `e.amount` es escribible: el número que quede en la tabla es el que se aplica, acotado a `0` o más. Así construyes multiplicadores de daño, escudos o bonos de armadura.
- `e.cause` es un string: `"entity_attack"`, `"contact"`, `"fall"`, `"lava"`, `"fire"`, `"fire_tick"`, `"drowning"`, `"cactus"`, `"starvation"`, `"void"`, `"projectile"`, `"magic"` o `"custom"`.

```lua
-- Daño x2 para jugadores con espada de netherite (id 744 en los datos 0.15)
events.on("EntityDamageByEntity", function(e)
    if e.cause == "entity_attack" and e.damager and player.isOp(e.damager) then
        e.amount = e.amount * 2
    end
end)
```

Las constantes numéricas de estas causas también se exportan como `events.CAUSE.*` (`events.CAUSE.FALL`, `events.CAUSE.LAVA`, ...); `e.cause` en sí es el string de arriba.

## Tablas de item

Los eventos que llevan un item (`PlayerInteract`, `PlayerDropItem`, `PlayerItemHeld`) aportan tres campos:

| Campo | Descripción |
|---|---|
| `e.item_id` | Id numérico del item. |
| `e.item_meta` | Metadata / valor de daño del item. |
| `e.item_count` | Tamaño del stack. |

## Ejemplos

Anuncia las muertes con estilo:

```lua
events.on("PlayerDeath", function(e)
    e.message = "§4" .. e.player .. " has fallen"
end)
```

Protección de spawn simple con `EntityDamage`:

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
Combina la cancelación de `PlayerMove` con chequeos de región para construir zonas cercadas, y `EntityDamage` para hacerlas seguras — un kit clásico de minijuego con pocas líneas de Lua. Ver [Buenas prácticas](buenas-practicas-es.md) para mantener los handlers rápidos.
:::
