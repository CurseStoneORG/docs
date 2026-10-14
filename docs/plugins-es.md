# Guía de plugins de CurseStone

🌐 [English](plugins.md) · **Español**

Documentación oficial para desarrollar plugins en **Lua 5.4** para CurseStone.

| | |
|---|---|
| **Versión de la API** | `1.0.1` |
| **Lenguaje** | Lua 5.4 |
| **Manifiesto** | `plugin.yml` |
| **Servidor** | CurseStone (MCPE 0.15.10 / protocolo 84) |

---

## Índice

1. [Introducción](#1-introducción)
2. [Tu primer plugin](#2-tu-primer-plugin)
3. [Estructura de carpetas](#3-estructura-de-carpetas)
4. [El manifiesto `plugin.yml`](#4-el-manifiesto-pluginyml)
5. [Ciclo de vida](#5-ciclo-de-vida)
6. [Módulos con `import()`](#6-módulos-con-import)
7. [Comandos y permisos](#7-comandos-y-permisos)
8. [Eventos](#8-eventos)
9. [Tareas programadas (scheduler)](#9-tareas-programadas-scheduler)
10. [Datos y configuración](#10-datos-y-configuración)
11. [Mensajes: chat, tip y popup](#11-mensajes-chat-tip-y-popup)
12. [Gestión de plugins en el servidor](#12-gestión-de-plugins-en-el-servidor)
13. [Referencia completa de la API](#13-referencia-completa-de-la-api)
14. [Buenas prácticas](#14-buenas-prácticas)
15. [Solución de problemas](#15-solución-de-problemas)
16. [Limitaciones y hoja de ruta](#16-limitaciones-y-hoja-de-ruta)

---

## 1. Introducción

El sistema de plugins de CurseStone está pensado para ser **simple y predecible**:

- **Todo viaja por nombre de jugador** (string). No existen objetos `Player` en Lua.
- **Nada externo que instalar.** El motor Lua 5.4 y los parsers YAML/JSON están compilados dentro del binario del servidor. No necesitas `lua`, `python` ni ninguna otra herramienta en la máquina.
- **Cada plugin está aislado.** Tiene su propio estado Lua, su propia carpeta de datos y no puede salirse de ellas.
- **Un error en un plugin no tumba el servidor.** Se registra en el log y el servidor continúa.

> **Nota:** todos los mensajes que el servidor escribe en su log (carga de plugins, avisos, duplicados, errores de manifiesto o API) están en **inglés**.

---

## 2. Tu primer plugin

Crea la carpeta `plugins/HolaMundo/` junto al binario del servidor (al lado de `server.properties`) con estos dos archivos.

**`plugins/HolaMundo/plugin.yml`**

```yaml
api: "1.0.1"
name: HolaMundo
author: TuNombre
version: "1.0"
main: src/main.lua
```

**`plugins/HolaMundo/src/main.lua`**

```lua
local pluginTable = {}

function pluginTable.onEnable()
    log.info("HolaMundo enabled!")

    commands.register("hola", {
        description = "Te saluda",
        usage = "/hola",
    }, function(sender, args)
        commands.reply(sender, "§aHola, " .. sender.name .. "!")
    end)

    events.on("PlayerJoin", function(e)
        e.message = "§e" .. e.player .. " entró al servidor"
    end)
end

function pluginTable.onDisable()
    log.info("HolaMundo disabled")
end

return pluginTable
```

Reinicia el servidor (o ejecuta `/plugins reload`) y prueba `/hola` en el juego.

> Los plugins de ejemplo `hello` y `MyPlugin` vienen en el repositorio y CMake los copia automáticamente junto al binario. `hello` muestra manifiesto, configs YAML/JSON, datos binarios, permisos, tip/popup y eventos. `MyPlugin` muestra la estructura en árbol con `src/core/` y la carga de módulos con `import()`.
>
> Un plugin de referencia completo y comentado está en [`ExamplePlugin/`](example-plugin.md).

---

## 3. Estructura de carpetas

```
plugins/
├── hello/                  <- código del plugin
│   ├── plugin.yml          <- manifiesto
│   └── src/
│       ├── main.lua        <- script de entrada
│       └── reglas.lua      <- archivos auxiliares
├── MyPlugin/
│   ├── plugin.yml
│   └── src/
│       ├── main.lua
│       └── core/
│           ├── Example.lua
│           └── PlayerManager.lua
└── data_pl/                <- DATOS de los plugins (se crea sola al arrancar)
    ├── hello/              <- una carpeta por plugin, con el NOMBRE DE SU CARPETA
    │   ├── config.yml
    │   ├── contador.json
    │   └── firma.dat
    └── MyPlugin/
```

| Carpeta | Para qué sirve |
|---|---|
| `plugins/<Plugin>/` | Código del plugin. Tratarla como solo lectura. |
| `plugins/data_pl/<Plugin>/` | Configs y datos. Se conserva entre reinicios y recargas. |

La carpeta de datos usa el nombre de la **carpeta** del plugin (no el `name` del manifiesto), así siempre es única y segura.

---

## 4. El manifiesto `plugin.yml`

Todo plugin se carga a partir de su `plugin.yml`.

```yaml
api: "1.0.1"          # API con la que se escribió el plugin
name: Hello           # nombre (si falta: nombre de la carpeta)
author: CurseStone    # autor (opcional; sale en /plugins)
version: "1.2"        # versión (opcional)
main: src/main.lua    # entrada (si falta: src/main.lua o main.lua)
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `api` | Recomendado | Versión de la API que usa el plugin. Ver compatibilidad abajo. |
| `name` | No | Nombre visible. Por defecto, el de la carpeta. |
| `author` | No | Autor. Aparece en `/plugins`. |
| `version` | No | Versión del plugin. Aparece en `/plugins`. |
| `main` | No | Ruta del script de entrada, relativa a la carpeta del plugin. |

### Compatibilidad de la API

La versión actual es **`1.0.1`**. También se ve en `/plugins`, en el log de arranque y en `plugin.api`.

| Situación | Resultado |
|---|---|
| Distinto `major` | El plugin se **descarta**. |
| `minor` del plugin **mayor** que la del servidor | El plugin se **descarta**. |
| `minor` igual o menor, `patch` distinto | Carga con un **aviso**. |

### Reglas del manifiesto

- **Solo se acepta `plugin.yml`.** Un `main.lua` suelto sin manifiesto no se carga: la carpeta se ignora con un aviso en el log.
- `main` es **relativa** a la carpeta del plugin. No se permiten rutas absolutas ni `..`.
- Los strings con espacios, `:` o `#` van entre comillas (`mensaje: "hola: mundo"`). Números y booleanos van sin comillas (`intervalo: 1200`, `activado: true`).
- Si varias carpetas comparten nombre, solo se considera la que tiene `plugin.yml`.

> **Actualizas desde una versión anterior?** Mueve los campos de tu antiguo `main.lua` a un `plugin.yml` (misma sintaxis YAML).

---

## 5. Ciclo de vida

El script de entrada debe **devolver una tabla**:

```lua
local pluginTable = {}

function pluginTable.onEnable() end     -- opcional: al habilitar
function pluginTable.onDisable() end    -- opcional: al deshabilitar

return pluginTable
```

- Los plugins se cargan en **orden alfabético** al arrancar.
- Un plugin con error de sintaxis se descarta con un mensaje en el log; el servidor arranca igual.
- Registra comandos, eventos y tareas dentro de `onEnable`.

---

## 6. Módulos con `import()`

Un plugin puede tener cualquier cantidad de archivos Lua en subcarpetas. Cada módulo es un archivo que **devuelve una tabla** y se carga con la función global `import`.

```lua
local Example       = import("core.Example")        -- estilo require, con puntos
local PlayerManager = import("core/PlayerManager")  -- con barras: es lo mismo
```

### Cómo se resuelve la ruta

`import(ruta)` busca **primero dentro de `src/`** y no exige extensión. Todas estas llamadas cargan el mismo archivo:

```lua
import("core.Example")
import("core/Example")
import("core/Example.lua")
import("src/core/Example")
```

- **Puntos = carpetas.** En un módulo sin barras ni extensión, cada `.` es un nivel: `import("helper.sub")` carga `src/helper/sub.lua`. Si existiera un archivo literal `core.example.lua`, gana el nombre con barras; para el archivo con puntos usa la ruta completa: `import("core.example.lua")`.
- **Caché tipo `require`.** El módulo se ejecuta **una sola vez** y todas las llamadas siguientes, desde cualquier archivo del plugin, devuelven **la misma tabla**. Ideal para módulos con estado, como un `PlayerManager`.
- **Fuera de `src/`.** Funciona si la carpeta existe: `import("lib/extra.lua")` carga `<plugin>/lib/extra.lua`.
- **Variante explícita.** `plugin.include("src/reglas.lua")` exige la ruta exacta (con extensión) relativa a la carpeta del plugin y comparte la misma caché.
- **Sin escapes.** `..` y rutas absolutas producen un error de Lua.

### Entorno restringido

El entorno Lua **no tiene** `io`, `os`, `package`, `debug`, `load`, `loadfile` ni `dofile`. La única forma de cargar código es `import` / `plugin.include`, y la única forma de tocar archivos es la API [`data.*`](#10-datos-y-configuración).

---

## 7. Comandos y permisos

### Registrar un comando

```lua
commands.register("hello", {
    description = "Greets you",        -- opcional (aparece en /help)
    usage       = "/hello",            -- opcional
    permission  = "default",           -- opcional: "default" | "op" | nodo custom
}, function(sender, args)
    commands.reply(sender, "Hello " .. sender.name)
end)
```

- Devuelve `true` si se registró y `false` si el nombre ya estaba tomado. Un nombre de comando solo puede tenerlo un plugin.
- `sender` es una tabla simple: `{ name = "Steve", isConsole = false, isOp = true }`.
- `args` es una lista de strings **sin** el nombre del comando: `{"a", "b"}`.
- Responde siempre con `commands.reply(sender, msg)`: funciona tanto para jugadores como para la consola.
- El nombre del comando se pasa a minúsculas al registrarlo.
- Tu función corre en el **siguiente tick** en el hilo principal. `sender` es una **copia** tomada al escribir el comando; para la consola, `sender.name` es `"CONSOLE"` y `sender.isConsole` es `true`.

### Permisos

El campo `permission` define a quién va dirigido el comando:

```lua
-- 1) PÚBLICO (por defecto)
commands.register("hello", { description = "Greets you" }, fn)

-- 2) SOLO OP
commands.register("announce", {
    description = "Broadcast a message (op)",
    usage = "/announce <text>",
    permission = "op",
}, fn)

-- 3) PERMISO CUSTOM
commands.register("vip", {
    description = "VIP zone",
    permission = "mipermiso.vip",
}, fn)
```

| Valor de `permission` | Quién puede usarlo |
|---|---|
| `"default"`, `"all"`, `"public"`, `"everyone"`, `"todos"` o sin campo | Todos |
| `"op"`, `"admin"` | Ops y consola (y quien tenga el nodo `cursestone.command.<nombre>`) |
| Cualquier otro string | Ops y jugadores con ese nodo concedido |

El chequeo se hace **antes** de ejecutar el comando: un jugador sin permiso ni siquiera llega a la función Lua.

### Conceder y quitar permisos

```lua
player.setPermission("Steve", "mipermiso.vip", true)   -- conceder
player.setPermission("Steve", "mipermiso.vip", false)  -- denegar
player.hasPermission("Steve", "mipermiso.vip")         -- consultar
```

> Los permisos custom viven **en memoria**: se pierden al reiniciar el servidor o al salir el jugador. Si necesitas persistirlos, guárdalos con `data.saveYml` y vuelve a concederlos en el evento `PlayerJoin`.

### `/help` dinámico

`/help` (y `/?`) se construye desde el registro real de comandos. Los comandos de tus plugins **aparecen solos**, mezclados alfabéticamente con los del servidor y paginados (`/help`, `/help 2`, ...). Cada jugador solo ve los comandos que **puede usar**: los de solo op no salen para un jugador normal.

---

## 8. Eventos

Se escuchan con `events.on(nombre, fn)`.

| Evento | Campos de `e` | Escribibles | Cancelable |
|---|---|---|---|
| `PlayerJoin` | `player`, `message` | `message` | Sí (solo suprime el mensaje) |
| `PlayerQuit` | `player`, `message` | `message` | Sí (solo suprime el mensaje) |
| `PlayerChat` | `player`, `message` | `message` | Sí (no se difunde el chat) |
| `BlockBreak` | `player`, `x`, `y`, `z`, `block_id` | no | Sí |
| `BlockPlace` | `player`, `x`, `y`, `z`, `block_id` | no | Sí |

- `e.player` es el **nombre** del jugador (string), nunca un objeto.
- `e.cancel()` cancela el evento.
- `e.message` se puede reescribir: lo que quede en la tabla al salir del handler es lo que se difunde. Pon `""` para silenciarlo.

```lua
events.on("PlayerChat", function(e)
    if string.find(string.lower(e.message), "noob") then
        e.cancel()
        player.message(e.player, "§cBe nice in chat!")
    end
end)
```

---

## 9. Tareas programadas (scheduler)

**20 ticks = 1 segundo.**

```lua
local id = scheduler.later(100, function()      -- una vez, a los 5 s
    server.broadcast("§eHan pasado 5 segundos")
end)

local tarea = scheduler.every(1200, function()  -- cada 60 s
    server.broadcast("§bLee las reglas con /rules")
end)

scheduler.cancel(tarea)                         -- cancelar por id
```

| Función | Descripción |
|---|---|
| `scheduler.later(ticks, fn)` | Ejecuta `fn` una vez. Devuelve un id. |
| `scheduler.every(ticks, fn)` | Ejecuta `fn` cada `ticks`. Devuelve un id. |
| `scheduler.cancel(id)` | Cancela una tarea. |

`ticks` debe ser un entero (usa `math.floor` en valores calculados) y todo lo menor a `1` se trata como `1`. Las tareas se cancelan solas cuando el plugin se deshabilita.

---

## 10. Datos y configuración

Al arrancar se crea `plugins/data_pl/` y, por cada plugin cargado, su carpeta `plugins/data_pl/<carpetaDelPlugin>/`. La API `data.*` **solo** puede leer y escribir dentro de ella.

```lua
data.folder                      -- ruta de TU carpeta de datos (string)
data.read(archivo)               -- contenido crudo | nil, err
data.write(archivo, contenido)   -- escribe crudo (binario seguro) | true | nil, err
data.exists(archivo)             -- ¿existe?
data.delete(archivo)             -- borra (false si no existía)
data.list()                      -- lista de nombres en tu carpeta
data.loadYml(archivo)            -- YAML -> tabla | nil, err
data.saveYml(archivo, tabla)     -- tabla -> YAML | true | nil, err
data.loadJson(archivo)           -- JSON -> tabla | nil, err
data.saveJson(archivo, tabla)    -- tabla -> JSON | true | nil, err
```

- `archivo` siempre es **relativo a tu carpeta de datos**. Las subcarpetas funcionan: `data.write("stats/2026.json", ...)` crea la ruta.
- `..`, rutas absolutas y backslashes producen un **error de Lua**: ningún plugin puede salirse de su carpeta.
- Los strings de Lua 5.4 son binario-seguros, así que `data.read` / `data.write` sirven para **cualquier formato** (`.dat`, `.bin`, imágenes), incluido `\0`.
- Un config mal formado **no tumba nada**: `loadYml` / `loadJson` devuelven `nil, err` y tu plugin decide qué hacer.

### Patrón recomendado: config con valores por defecto

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

Genera este `config.yml`:

```yaml
message: "§bRemember to read the rules (/rules)"
interval: 1200
rules:
  - Respect
  - No grief
```

### Soporte de formatos

**YAML** soporta: mapas anidados por indentación, listas (`- item`, incluso de mapas), strings con o sin comillas, enteros, flotantes, `true`/`false`, `null`/`~` (la clave se omite en Lua), comentarios con `#` y `{}` / `[]` vacíos.
**No** soporta: anchors, textos multilínea (`|` / `>`) ni tabs de indentación (da un error claro).

**JSON** es el estándar completo, con escapes `\uXXXX` y surrogate pairs. Un `null` dentro de un objeto omite la clave en la tabla Lua.

---

## 11. Mensajes: chat, tip y popup

```lua
player.message("Steve", "§aHola")              -- chat privado
player.tip("Steve", "§aTienes nueva ropa")     -- texto flotante centrado
player.popup("Steve", "§bHUD del plugin")      -- texto sobre la hotbar
server.broadcast("§eMensaje para todos")       -- a todos
```

`player.message`, `player.tip` y `player.popup` devuelven `true` si el jugador existe y `false` si no.

- El **tip** es un aviso flotante.
- El **popup** aparece sobre la hotbar, útil para HUD.
- Ambos se borran solos tras unos segundos. Para que "duren", reenvíalos con `scheduler.every`.

---

## 12. Gestión de plugins en el servidor

### `/plugins`

Comando público. Lista los plugins cargados con su versión y autor:

```
Plugins (API 1.0.1) (2): MyPlugin v1.1 by CurseStone, Hello v1.3 by CurseStone
```

### `/plugins reload`

Solo para ops y consola. Recarga **todos** los plugins en caliente:

1. Llama a `onDisable` de cada plugin.
2. Quita sus comandos del registro.
3. Cierra sus `lua_State`.
4. Vuelve a escanear `plugins/` y carga todo desde cero.

Es el flujo de desarrollo típico: editas tus `.lua`, ejecutas `/plugins reload` y pruebas sin reiniciar. Los datos de `data_pl/` **no se tocan**. Si un plugin falla al recargarse, se descarta con un log y el resto sigue funcionando. Desde la consola el reload corre en el hilo principal, así que es seguro.

Cualquier otro argumento (`/plugins foo`) responde `Usage: /plugins [reload]`.

### Plugins duplicados

Si hay dos o más carpetas con el mismo plugin, el servidor **no elige ninguna**: apaga todas las copias y emite un aviso:

```
[Plugins] WARNING: there are 2 duplicate plugins named 'Hello'
(Hello, hello-copy). All of them are disabled: keep only one copy.
```

Dos plugins cuentan como el mismo si su `name` coincide, o si sus carpetas tienen el mismo nombre (ambos sin distinguir mayúsculas, porque chocarían sus carpetas en `data_pl/`). Deja una sola copia y rearranca o usa `/plugins reload`.

---

## 13. Referencia completa de la API

### `plugin`: información del propio plugin

| Campo | Descripción |
|---|---|
| `plugin.api` | Versión de la API del servidor (`"1.0.1"`) |
| `plugin.name` | Nombre del plugin (del manifiesto) |
| `plugin.author` | Autor (del manifiesto) |
| `plugin.version` | Versión (manifiesto o tabla de entrada) |
| `plugin.include(ruta)` | Carga un archivo Lua del plugin (con caché) |
| `import(módulo)` | Función **global**: carga un módulo (busca en `src/`, extensión opcional, puntos o barras, misma caché) |

### `log`

| Función | Descripción |
|---|---|
| `log.info(msg)` | Escribe en el log con el prefijo `[NombrePlugin]` |
| `log.warn(msg)` | Igual, como aviso |
| `log.error(msg)` | Igual, como error |

### `server`

| Función | Descripción |
|---|---|
| `server.broadcast(msg)` | Mensaje a todos |
| `server.players()` | Lista de nombres de jugadores |

### `player`

| Función | Descripción |
|---|---|
| `player.message(name, msg)` | Mensaje a un jugador (`false` si no existe) |
| `player.tip(name, msg)` | Tip flotante (`false` si no existe) |
| `player.popup(name, msg)` | Popup sobre la hotbar (`false` si no existe) |
| `player.kick(name, reason)` | Expulsa al jugador (razón por defecto: `"Expulsado"`) |
| `player.teleport(name, x, y, z)` | Teletransporta |
| `player.isOp(name)` | `true` si es op |
| `player.setPermission(name, nodo, v)` | Concede o deniega un nodo (en memoria) |
| `player.hasPermission(name, nodo)` | ¿Tiene ese nodo? |

### `commands`

| Función | Descripción |
|---|---|
| `commands.register(name, opts, fn)` | Registra un comando. `opts`: `description`, `usage`, `permission` |
| `commands.reply(sender, msg)` | Responde a quien ejecutó el comando |

### `events`

| Función | Descripción |
|---|---|
| `events.on(nombre, fn)` | Escucha un evento |

### `scheduler`

| Función | Descripción |
|---|---|
| `scheduler.later(ticks, fn)` | Una vez; devuelve id |
| `scheduler.every(ticks, fn)` | Repetida; devuelve id |
| `scheduler.cancel(id)` | Cancela una tarea |

### `data`

| Función | Descripción |
|---|---|
| `data.folder` | Ruta de tu carpeta de datos |
| `data.read / write / exists / delete / list` | Archivos crudos |
| `data.loadYml / saveYml` | YAML |
| `data.loadJson / saveJson` | JSON |

---

## 14. Buenas prácticas

- **Registra todo en `onEnable`** (comandos, eventos, tareas) y limpia lo que necesites en `onDisable`.
- **Crea siempre un config por defecto** si `loadYml` / `loadJson` devuelven `nil`.
- **Valida los argumentos** de tus comandos antes de usarlos: `args` es solo una lista de strings.
- **Usa módulos** (`import`) para separar la lógica; un módulo con estado compartido, como un `PlayerManager`, funciona bien gracias a la caché.
- **Un solo nombre de comando por plugin.** Revisa el retorno de `commands.register`.
- **Evita bucles infinitos.** No hay límite de instrucciones todavía.
- **Usa `/plugins reload`** mientras desarrollas en vez de reiniciar el servidor.
- **No guardes datos importantes solo en memoria** (permisos, contadores): persístelos en `data_pl`.

---

## 15. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| El plugin no aparece en `/plugins` | Falta `plugin.yml` | Crea el manifiesto; un `main.lua` suelto se ignora |
| Plugin descartado por la API | `major` distinto o `minor` más nuevo que el servidor | Ajusta el campo `api` |
| Dos copias desactivadas | Plugins duplicados | Deja una sola carpeta |
| `register` devuelve `false` | Otro plugin ya usa ese comando | Cambia el nombre |
| Error de Lua al usar `data.*` o `import` | Ruta con `..`, absoluta o con backslash | Usa rutas relativas con `/` |
| `loadYml` devuelve `nil, err` | YAML mal formado (por ejemplo, tabs) | Corrige la indentación o usa JSON |
| El servidor se congela | Bucle infinito (`while true do end`) | Revisa tu lógica; no hay límite de instrucciones |
| El permiso desaparece | Los permisos son en memoria | Reconcédelo en `PlayerJoin` |

---

## 16. Limitaciones y hoja de ruta

### Limitaciones (v1)

- Sin `/plugins enable|disable <nombre>` (el reload sí existe).
- Sin permisos persistentes en disco.
- Sin evento `PlayerMove` (se dispararía en cada tick de movimiento).
- Los comandos de un plugin descartado por error no quedan registrados; tras `/plugins reload` todo se re-registra desde cero.
- Sin alias de comandos.
- `plugin.include`, `import` y `data.*` no admiten rutas absolutas ni `..` (a propósito).
- El parser YAML no soporta anchors ni multilínea (usa JSON para estructuras complejas).
- Sin límite de instrucciones por plugin.

### Ideas para v2

- `/plugins enable|disable <nombre>`.
- Más eventos: `PlayerDeath`, `PlayerMove` con throttle, inventario.
- Límite de instrucciones por plugin con `lua_sethook` (anti `while true`).
- Alias de comandos.
- Permisos persistentes nativos, cargados desde `data_pl`.
