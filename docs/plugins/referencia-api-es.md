# Referencia completa de la API

**Español** · [English](api-reference.md)

Todos los globals disponibles para tu plugin, en una página. Las explicaciones detalladas están en las páginas dedicadas: [Comandos](comandos-es.md), [Eventos](eventos-es.md), [Tareas programadas](planificador-es.md), [Datos](datos-es.md), [Mundos](mundos-es.md), [Jugadores](jugadores-es.md).

## `plugin`: info del propio plugin

| Campo | Descripción |
|---|---|
| `plugin.api` | Versión de la API de plugins del servidor (`"1.0.2"`) |
| `plugin.name` | Nombre del plugin (del manifiesto) |
| `plugin.author` | Autor (del manifiesto) |
| `plugin.version` | Versión (manifiesto o tabla de entrada) |
| `plugin.include(path)` | Carga un archivo Lua del plugin (con caché) |
| `plugin.getResource(name)` | Contenido de `resources/<name>` (binario seguro) o `nil, err` |
| `plugin.saveResource(name, replace)` | Copia `resources/<name>` a la carpeta de datos |
| `plugin.listResources()` | Rutas relativas dentro de `resources/` (recursivo) |
| `import(module)` | Función **global**: carga un módulo (busca en `src/`, extensión opcional, puntos o barras, misma caché) |

## `log`

| Función | Descripción |
|---|---|
| `log.info(msg)` | Escribe en el log con el prefijo `[NombrePlugin]` |
| `log.warn(msg)` | Igual, como aviso |
| `log.error(msg)` | Igual, como error |

## `server`

| Función | Descripción |
|---|---|
| `server.broadcast(msg)` | Mensaje para todos |
| `server.players()` | Lista de nombres de jugadores conectados |
| `server.getPlayer(name)` | Handle de jugador o `nil` si no está conectado (ver [Jugadores](jugadores-es.md#handle-de-jugador-servergetplayer)) |
| `server.worlds()` | Lista de nombres de mundos cargados |
| `server.getWorld(name)` | Handle de mundo o `nil` |
| `server.loadWorld(name, gen)` | Carga/crea un mundo (`"normal"`, `"flat"`, `"Nether"`, `"void"`) |
| `server.defaultWorld()` | Handle del mundo por defecto |

## `player`

| Función | Descripción |
|---|---|
| `player.message(name, msg)` | Mensaje a un jugador (`false` si no existe) |
| `player.tip(name, msg)` | Tip flotante (`false` si no existe) |
| `player.popup(name, msg)` | Popup sobre la hotbar (`false` si no existe) |
| `player.kick(name, reason)` | Expulsa (razón por defecto: `"Expulsado"`) |
| `player.teleport(name, x, y, z)` | Teletransporta dentro de su mundo |
| `player.teleportWorld(name, world, x, y, z)` | Teletransporta a otro mundo por nombre |
| `player.getWorld(name)` | Handle del mundo en el que está (`nil` si no existe) |
| `player.getHealth(name)` | Vida actual (número) |
| `player.setHealth(name, hp)` | Fija la vida; `0` mata por el pipeline normal |
| `player.kill(name)` | Mata por el pipeline normal de muerte |
| `player.getPosition(name)` | `x, y, z` (pies) o `nil` |
| `player.getRotation(name)` | `yaw, pitch` o `nil` |
| `player.setRotation(name, yaw, pitch)` | Gira la cámara (re-sincroniza el cliente) |
| `player.setMotion(name, x, y, z)` | Impulso de movimiento |
| `player.giveItem(name, id, count, meta, customName)` | Añade un stack (nombre visible custom opcional) |
| `player.setNameTag(name, tag)` | Nametag sobre la cabeza + pestaña (códigos `§`) |
| `player.getNameTag(name)` | Nametag actual (`nil` si no existe) |
| `player.setDisplayName(name, dn)` | Nombre solo para el chat |
| `player.getDisplayName(name)` | Display name actual (`nil` si no existe) |
| `player.isOp(name)` | `true` si el jugador es op |
| `player.setPermission(name, node, v)` | Concede o niega un nodo (en memoria) |
| `player.hasPermission(name, node)` | ¿Tiene ese nodo? |

## `commands`

| Función | Descripción |
|---|---|
| `commands.register(name, opts, fn)` | Registra un comando. `opts`: `description`, `usage`, `permission`, `override` (ver [Comandos](comandos-es.md#sobrescribir-comandos-integrados-nuevo-en-102)) |
| `commands.reply(sender, msg)` | Responde a quien ejecutó el comando |

## `events`

| Función | Descripción |
|---|---|
| `events.on(name, fn)` | Escucha un evento (ver [Eventos](eventos-es.md) para la lista completa) |
| `events.CAUSE.<NOMBRE>` | Constantes numéricas de causa de daño (`FALL`, `LAVA`, `ENTITY_ATTACK`, ...) |

## `scheduler`

| Función | Descripción |
|---|---|
| `scheduler.later(ticks, fn)` | Una vez; devuelve un id |
| `scheduler.every(ticks, fn)` | Repetitiva; devuelve un id |
| `scheduler.cancel(id)` | Cancela una tarea |

## `data`

| Función | Descripción |
|---|---|
| `data.folder` | Ruta de tu carpeta de datos |
| `data.read / write / exists / delete / list` | Archivos crudos |
| `data.loadYml / saveYml` | YAML |
| `data.loadJson / saveJson` | JSON |

## Handles

| Handle | Origen | Métodos |
|---|---|---|
| `handle de jugador` | `server.getPlayer(name)`; `tostring` → `player(name)` | `p:getName()`, `p:isOnline()` + toda acción `player.*` sin el argumento del nombre |
| `handle de mundo` | `server.getWorld(name)`, `server.loadWorld()`, `server.defaultWorld()`, `player.getWorld(name)`; `tostring` → `world(name)` | `w:name()`, `w:seed()`, `w:dimension()`, `w:getTime()`, `w:setTime(t)`, `w:getBlock(x,y,z)`, `w:setBlock(x,y,z,id,data)`, `w:getSpawn()`, `w:getPlayers()`, `w:unload()` |

Ambos handles solo guardan un **nombre** y re-resuelven el objeto real en cada llamada; cuando el jugador se va o el mundo se descarga, los métodos devuelven `nil`/`false` en lugar de fallar.
