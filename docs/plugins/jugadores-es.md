# Jugadores

**Español** · [English](players.md)

Toda la API de jugadores va **por nombre** (string). No hay objetos `Player` en Lua: cada llamada vuelve a resolver al jugador real, así que un nombre que no coincide con nadie simplemente devuelve `false` o `nil`.

Para un estilo orientado a objetos, `server.getPlayer(nombre)` devuelve un **handle de jugador** ligero (ver al [final de esta página](#handle-de-jugador-servergetplayer)).

## Mensajes: chat, tip y popup

```lua
player.message("Steve", "§aHello")             -- mensaje privado de chat
player.tip("Steve", "§aYou got new clothes")   -- texto flotante centrado
player.popup("Steve", "§bPlugin HUD")          -- texto sobre la hotbar
server.broadcast("§eMessage for everyone")     -- para todos
```

`player.message`, `player.tip` y `player.popup` devuelven `true` si el jugador existe y `false` si no.

- El **tip** es un aviso flotante.
- El **popup** aparece sobre la hotbar, útil para un HUD.
- Ambos desaparecen solos a los pocos segundos. Para que "duren", reenvíalos con `scheduler.every` (ver [Tareas programadas](planificador-es.md)).

## Vida y muerte

```lua
local hp = player.getHealth("Steve")    -- vida actual (0 si está offline)
player.setHealth("Steve", 10)           -- medios corazones (valores acotados)
player.kill("Steve")                    -- pipeline completo de muerte
```

| Función | Descripción |
|---|---|
| `player.getHealth(name)` | Vida actual como número (`0` si el jugador no está conectado). |
| `player.setHealth(name, hp)` | Fija la vida, acotada a `[0, max]`. La barra de corazones se sincroniza en el mismo tick. `setHealth(name, 0)` mata por el **pipeline normal de daño** (pantalla de muerte, drops, `PlayerDeathEvent`) igual que `/kill`. Sobre un jugador muerto no hace nada. |
| `player.kill(name)` | Mata al jugador por el pipeline normal: pantalla de muerte, drops, evento de muerte. Devuelve `false` si no existe o ya está muerto. |

## Movimiento, posición y cámara

```lua
local x, y, z = player.getPosition("Steve")        -- posición de los pies | nil
local yaw, pitch = player.getRotation("Steve")     -- ángulos de cámara | nil
player.setRotation("Steve", 90, 20)                -- gira la cámara
player.setMotion("Steve", 0, 10, 0)                -- impulso vertical
player.teleport("Steve", 100, 65, -200)            -- teletransporte en su mundo
player.teleportWorld("Steve", "nether", 8, 64, 8)  -- teletransporte a otro mundo
```

| Función | Descripción |
|---|---|
| `player.getPosition(name)` | Devuelve `x, y, z` (pies) o `nil` si no existe. |
| `player.getRotation(name)` | Devuelve `yaw, pitch` o `nil`. |
| `player.setRotation(name, yaw, pitch)` | Fija la rotación en el servidor **y re-sincroniza al cliente** con un `MovePlayerPacket` de reset, así el cliente 0.15 realmente gira la vista. Devuelve `false` si no existe. |
| `player.setMotion(name, x, y, z)` | Aplica un impulso de movimiento al jugador (`SetEntityMotionPacket`). Ideal para empujones, lanzadores y cañones. Devuelve `false` si no existe. |
| `player.teleport(name, x, y, z)` | Teletransporta dentro del mundo del jugador. Devuelve `false` si no existe. |
| `player.teleportWorld(name, world, x, y, z)` | Teletransporta a otro **mundo por nombre** (p. ej. `"world"` o `"nether"`). Devuelve `false` si el jugador o el mundo no existen. |

## Items

```lua
player.giveItem("Steve", 278)                          -- 1x pico de diamante
player.giveItem("Steve", 272, 1, 0, "§bStoneslayer")   -- nombre visible custom
```

| Función | Descripción |
|---|---|
| `player.giveItem(name, id, count, meta, customName)` | Añade un stack al inventario. `count` por defecto `1`, `meta` por defecto `0`. `customName` es opcional y es el nombre **visible** del item que renderiza el cliente (estilo yunque); soporta códigos `§`. Devuelve `true` si el stack cupo, `false` si no (jugador ausente, id inválido, inventario lleno). |

## NameTag y display name (rangos)

```lua
player.setNameTag("Steve", "§4[Admin]§r Steve")
local tag = player.getNameTag("Steve")          -- nil si está offline
player.setDisplayName("Steve", "§6SteveTheBrave")
local dn = player.getDisplayName("Steve")
```

| Función | Descripción |
|---|---|
| `player.setNameTag(name, tag)` | Fija el nombre **sobre la cabeza** y en la pestaña del servidor. Acepta códigos `§` — es la superficie de prefijos de rango. Re-difunde la lista de jugadores a todos. |
| `player.getNameTag(name)` | Nametag actual, o `nil` si el jugador no existe. |
| `player.setDisplayName(name, dn)` | Nombre mostrado **solo en el chat**. |
| `player.getDisplayName(name)` | Display name actual, o `nil` si el jugador no existe. |

:::{tip}
`setNameTag` cambia lo que todos ven sobre la cabeza y en la pestaña; `setDisplayName` solo cambia el nombre en el chat. Combínalos para rangos: nametag de color más display name en el chat.
:::

## Permisos y OP

```lua
local op = player.isOp("Steve")                       -- true/false
player.setPermission("Steve", "myperm.vip", true)     -- conceder nodo (en memoria)
player.setPermission("Steve", "myperm.vip", false)    -- denegarlo
local ok = player.hasPermission("Steve", "myperm.vip")
```

| Función | Descripción |
|---|---|
| `player.isOp(name)` | `true` si el jugador es op (`false` si no está conectado). |
| `player.setPermission(name, node, v)` | Concede o niega un nodo de permiso custom **en memoria**. Devuelve `false` si el jugador no está conectado. |
| `player.hasPermission(name, node)` | ¿Tiene ese nodo? (`false` si no está conectado.) |

:::{warning}
Los permisos custom viven **en memoria**: se pierden al reiniciar el servidor o cuando el jugador se va. Para persistirlos, guárdalos con `data.saveYml` (ver [Datos y configuración](datos-es.md)) y concédelos de nuevo en el evento `PlayerJoin`.
:::

## Acceso al mundo

```lua
local w = player.getWorld("Steve")   -- handle del mundo | nil
if w then
    log.info("Steve is in " .. w:name())
end
```

`player.getWorld(name)` devuelve el [handle del mundo](mundos-es.md) en el que está el jugador, o `nil`. Usa `player.teleportWorld` para mover jugadores entre mundos.

## Kick

```lua
player.kick("Steve")                        -- razón por defecto: "Expulsado"
player.kick("Steve", "§cYou have been banned!")
```

`player.kick(name, reason)` expulsa al jugador y devuelve `false` si no existe. La razón por defecto es `"Expulsado"`.

## Handle de jugador (`server.getPlayer`)

```lua
local p = server.getPlayer("Steve")   -- handle | nil si no está conectado
if p then
    print(p)                          -- "player(Steve)"
    log.info(p:getName() .. " has " .. p:getHealth() .. " HP")
    p:message("§aHi!")
    p:teleport(0, 64, 0)
    p:giveItem(272, 1, 0, "§bStoneslayer")
    p:kill()
end
```

- Devuelve `nil` cuando ningún jugador conectado coincide (misma búsqueda insensible a mayúsculas que la API por nombre).
- El handle solo lleva el **nombre**: cada método vuelve a resolver al jugador real, así que un handle sigue siendo válido hasta que el jugador se va; después los métodos devuelven `nil`/`false` en lugar de fallar.
- `p:getName()` devuelve el nombre y `p:isOnline()` devuelve `true`/`false`.
- **Todas las funciones `player.*` de esta página están disponibles como métodos**, sin el argumento del nombre: `p:message(msg)`, `p:tip(msg)`, `p:popup(msg)`, `p:kick(reason)`, `p:teleport(x, y, z)`, `p:teleportWorld(world, x, y, z)`, `p:getWorld()`, `p:isOp()`, `p:getHealth()`, `p:setHealth(hp)`, `p:setPermission(node, v)`, `p:hasPermission(node)`, `p:giveItem(id, count, meta, customName)`, `p:setNameTag(tag)`, `p:getNameTag()`, `p:setDisplayName(dn)`, `p:getDisplayName()`, `p:getPosition()`, `p:getRotation()`, `p:setRotation(yaw, pitch)`, `p:setMotion(x, y, z)`, `p:kill()`.

:::{note}
El servidor nunca guarda punteros de C++ dentro del handle, así que un handle viejo nunca puede tumbar el servidor. Prefiere los handles para código legible y las funciones por nombre cuando solo tienes el string (p. ej. dentro de eventos).
:::
