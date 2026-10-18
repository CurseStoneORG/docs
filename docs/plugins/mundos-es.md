# Mundos

**Español** · [English](worlds.md)

Nuevo en la API **1.0.2**: CurseStone soporta múltiples mundos con tick independiente, carga y descarga, y la API Lua puede gestionar todo esto.

Los mundos se manejan con **handles de mundo** ligeros: igual que el handle de jugador, el handle solo lleva el *nombre* del mundo y cada método vuelve a resolver el mundo real. Si el mundo se descarga, los métodos devuelven `nil`/`false` en vez de fallar. `tostring(handle)` se lee como `world(name)`.

## Encontrar y cargar mundos

```lua
local names = server.worlds()            -- {"world", "nether", ...}
local w = server.getWorld("world")       -- handle | nil si no está cargado
local spawn = server.defaultWorld()      -- handle del mundo de spawn

-- Carga (o crea) un mundo. Generador: "normal" | "flat" | "Nether" | "void"
local skyblock = server.loadWorld("skyblock", "flat")
local nether   = server.loadWorld("nether", "Nether")
```

| Función | Descripción |
|---|---|
| `server.worlds()` | Lista con los nombres de los mundos cargados. |
| `server.getWorld(name)` | Handle del mundo, o `nil` si no está cargado. |
| `server.loadWorld(name, gen)` | Carga el mundo (creándolo si hace falta) y devuelve su handle. `gen` es opcional y por defecto `"normal"`; valores válidos: `"normal"`, `"flat"`, `"Nether"`, `"void"`. |
| `server.defaultWorld()` | Handle del mundo por defecto (spawn). |

## Métodos del handle de mundo

```lua
local w = server.getWorld("world")
if w then
    log.info(w:name() .. " seed=" .. w:seed() .. " dim=" .. w:dimension())

    w:setTime(0)                    -- amanecer
    local t = w:getTime()           -- 0..24000

    local id = w:getBlock(0, 64, 0) -- id del bloque (0 si el chunk no está cargado)
    w:setBlock(0, 64, 0, 41, 0)     -- coloca un bloque de oro (id, data)

    local sx, sy, sz = w:getSpawn()
    for _, name in ipairs(w:getPlayers()) do
        player.message(name, "§7Welcome to " .. w:name())
    end
end
```

| Método | Descripción |
|---|---|
| `w:name()` | Nombre del mundo. |
| `w:seed()` | Semilla del mundo. |
| `w:dimension()` | `0` = Overworld, `1` = Nether. |
| `w:getTime()` | Hora del mundo, `0..24000`. |
| `w:setTime(t)` | Fija la hora del mundo. |
| `w:getBlock(x, y, z)` | Id del bloque en esa posición; `0` si el chunk no está cargado o `y` fuera de rango. |
| `w:setBlock(x, y, z, id, data)` | Escribe un bloque (`data` opcional, por defecto `0`). Devuelve `true`/`false`. Rangos válidos: `y` `0..255`, `id` `0..255`, `data` `0..15`. |
| `w:getSpawn()` | Coordenadas del spawn `x, y, z`. |
| `w:getPlayers()` | Nombres de los jugadores dentro del mundo. |
| `w:unload()` | Descarga el mundo. Devuelve `false` si es el mundo por defecto o la descarga se cancela. |

:::{note}
`w:setBlock` **fuerza la carga/generación del chunk** destino antes de escribir, así el cambio nunca se pierde silenciosamente en terreno sin generar.
:::

## Ejemplo: hub del Nether

```lua
-- Teletransporta a todos los jugadores del spawn al hub del Nether
local nether = server.loadWorld("nether", "Nether")
for _, name in ipairs(server.players()) do
    player.teleportWorld(name, "nether", 8, 64, 8)
    player.message(name, "§5Welcome to the Nether hub!")
end
```

El movimiento entre mundos, el enlace de portales y la hora por mundo los maneja el servidor; la API Lua simplemente lo dirige. Ver [Jugadores](jugadores-es.md#movimiento-posición-y-cámara) para `player.teleportWorld` y [Eventos](eventos-es.md) para reaccionar a movimientos entre mundos.
