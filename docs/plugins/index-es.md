# Guía de plugins

**Español** · [English](index.md)

Documentación oficial para desarrollar plugins en **Lua 5.4** para CurseStone.

| | |
|---|---|
| **Versión de la API** | `1.0.2` |
| **Lenguaje** | Lua 5.4 |
| **Manifiesto** | `plugin.yml` |
| **Servidor** | CurseStone (MCPE 0.15.10 / protocolo 84) |

La guía está dividida en páginas por tema:

```{toctree}
:hidden:
:maxdepth: 1

Primeros pasos <self>
Comandos y permisos <comandos-es>
Eventos <eventos-es>
Tareas programadas <planificador-es>
Datos y configuración <datos-es>
Mundos <mundos-es>
Jugadores <jugadores-es>
Referencia completa de la API <referencia-api-es>
Buenas prácticas y problemas <buenas-practicas-es>
```

## 1. Introducción

El sistema de plugins de CurseStone está diseñado para ser **simple y predecible**:

- **Todo va por nombre de jugador** (string). No hay objetos `Player` en Lua. Si quieres un manejo tipo objeto, `server.getPlayer(nombre)` devuelve un handle ligero que sigue resolviendo al jugador real por nombre en cada llamada.
- **Nada externo que instalar.** El motor Lua 5.4 y los parsers YAML/JSON están compilados dentro del binario del servidor. No necesitas `lua`, `python` ni ninguna otra herramienta en la máquina.
- **Cada plugin está aislado.** Tiene su propio estado Lua y su propia carpeta de datos, y no puede salir de ellos.
- **Un error de plugin nunca tumba el servidor.** Se registra en el log y el servidor sigue funcionando. Un plugin que falla repetidamente o supera los límites de ejecución se desactiva automáticamente.

:::{note}
Todos los mensajes que el servidor escribe en su log (carga de plugins, avisos, duplicados, errores de manifiesto o de API) están en **inglés**.
:::

## 2. Novedades de la API 1.0.2

Si escribiste plugins para `1.0.1`, esto es lo más importante:

- **Mundos**: `server.worlds()`, `server.getWorld()`, `server.loadWorld()`, `server.defaultWorld()` y el handle `world` (leer/escribir bloques, tiempo, spawn, jugadores, descargar). Ver [Mundos](mundos-es.md).
- **Handle de jugador**: `server.getPlayer(nombre)` devuelve un objeto con `p:getName()`, `p:isOnline()` y todas las acciones `player.*` como métodos. Ver [Jugadores](jugadores-es.md).
- **Nuevas funciones de jugador**: `getHealth` / `setHealth`, `kill`, `getPosition`, `getRotation` / `setRotation`, `setMotion`, `teleportWorld`, `getWorld`, `giveItem` (con nombre visible del item), `setNameTag` / `getNameTag`, `setDisplayName` / `getDisplayName`.
- **Muchos más eventos**: `PlayerMove`, `PlayerDeath`, `PlayerRespawn`, `PlayerInteract`, `EntityDamage`, `EntityDamageByEntity`, `PlayerDropItem`, `PlayerItemHeld`, camas, puertas y más. Ver [Eventos](eventos-es.md).
- **Sobrescritura de comandos**: un plugin puede reemplazar temporalmente comandos integrados (`/kick`, ...) y se restauran solos al descargarlo. Ver [Comandos](comandos-es.md).
- **Recursos del plugin**: `plugin.getResource()`, `plugin.saveResource()` y `plugin.listResources()` leen la carpeta `resources/` de tu plugin.
- **Límites de ejecución**: los scripts desbocados se detienen (instrucciones VM y tiempo por llamada) y un plugin con demasiados errores consecutivos se desactiva solo. Ver [Buenas prácticas](buenas-practicas-es.md).
- **Cambio de ubicación de datos**: los datos de plugins ahora viven en `data_pl/` en la **raíz del servidor** (antes `plugins/data_pl/`). El servidor mueve la carpeta vieja automáticamente al primer arranque.

## 3. Tu primer plugin

Crea la carpeta `plugins/HelloWorld/` junto al binario del servidor (al lado de `server.properties`) con estos dos archivos.

**`plugins/HelloWorld/plugin.yml`**

```yaml
api: "1.0.2"
name: HelloWorld
author: TuNombre
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

Reinicia el servidor (o ejecuta `/plugins reload`) y prueba `/hi` en el juego.

:::{tip}
Un plugin de referencia completo y comentado está en [`ExamplePlugin/`](../example-plugin.md).
:::

## 4. Estructura de carpetas

```
<raíz del servidor>/
├── plugins/                <- CÓDIGO de los plugins
│   ├── HelloWorld/
│   │   ├── plugin.yml      <- manifiesto
│   │   ├── resources/      <- recursos opcionales de solo lectura
│   │   └── src/
│   │       ├── main.lua    <- script de entrada
│   │       └── rules.lua   <- archivos auxiliares
│   └── MyPlugin/
│       ├── plugin.yml
│       └── src/
│           └── core/
│               └── Example.lua
└── data_pl/                <- DATOS de los plugins (se crea solo al arrancar)
    ├── HelloWorld/         <- una carpeta por plugin, con el nombre de SU CARPETA
    │   ├── config.yml
    │   ├── counter.json
    │   └── signature.dat
    └── MyPlugin/
```

| Carpeta | Propósito |
|---|---|
| `plugins/<Plugin>/` | Código del plugin. Trátalo como solo lectura en ejecución. |
| `plugins/<Plugin>/resources/` | Archivos opcionales de solo lectura que viajan con el plugin; se leen con `plugin.getResource()` y se instalan con `plugin.saveResource()`. |
| `data_pl/<Plugin>/` | Configs y datos. Se conservan entre reinicios y recargas. |

La carpeta de datos usa el nombre de la **carpeta** del plugin (no el `name` del manifiesto), así siempre es única y segura.

:::{note}
**¿Vienes de la 1.0.1?** La raíz de datos era `plugins/data_pl/`. CurseStone la detecta y la mueve a `<raíz>/data_pl/` automáticamente en el primer arranque — no tienes que hacer nada.
:::

## 5. El manifiesto `plugin.yml`

Todo plugin se carga desde su `plugin.yml`.

```yaml
api: "1.0.2"          # API con la que se escribió el plugin
name: Hello           # nombre (si falta: nombre de la carpeta)
author: CurseStone    # autor (opcional; se ve en /plugins)
version: "1.2"        # versión (opcional)
main: src/main.lua    # entrada (si falta: src/main.lua o main.lua)
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `api` | Recomendado | Versión de la API objetivo. Ver compatibilidad abajo. |
| `name` | No | Nombre visible. Por defecto, el de la carpeta. |
| `author` | No | Autor. Se muestra en `/plugins`. |
| `version` | No | Versión del plugin. Se muestra en `/plugins`. |
| `main` | No | Ruta del script de entrada, relativa a la carpeta del plugin. |

### Compatibilidad de la API

La versión actual es **`1.0.2`**. También se ve en `/plugins`, en el log de arranque y en `plugin.api`.

| Situación | Resultado |
|---|---|
| `major` distinto | El plugin se **rechaza**. |
| `minor` del plugin **más nuevo** que el del servidor | El plugin se **rechaza**. |
| `minor` igual o más viejo, `patch` distinto | Carga con un **aviso**. |

### Reglas del manifiesto

- **Solo se acepta `plugin.yml`.** Un `main.lua` suelto sin manifiesto no se carga: la carpeta se ignora con un aviso en el log.
- `main` es **relativo** a la carpeta del plugin. No se permiten rutas absolutas ni `..`.
- Los strings con espacios, `:` o `#` necesitan comillas (`message: "hi: world"`). Números y booleanos van sin comillas (`interval: 1200`, `enabled: true`).
- Si varias carpetas comparten nombre, solo cuenta la que tiene `plugin.yml`.

:::{tip}
**¿Actualizas desde una versión vieja?** Pasa los campos de tu viejo `main.lua` a un `plugin.yml` (misma sintaxis YAML).
:::

## 6. Ciclo de vida

El script de entrada debe **devolver una tabla**:

```lua
local pluginTable = {}

function pluginTable.onEnable() end     -- opcional: corre al activar
function pluginTable.onDisable() end    -- opcional: corre al desactivar

return pluginTable
```

- Los plugins cargan en **orden alfabético** al arrancar.
- Un plugin con error de sintaxis se descarta con un mensaje en el log; el servidor arranca igual.
- Registra comandos, eventos y tareas dentro de `onEnable`, y deshaz lo que puedas en `onDisable` (el servidor elimina solo tus listeners, tareas y comandos de todas formas).

## 7. Módulos con `import()`

Un plugin puede tener cualquier cantidad de archivos Lua en subcarpetas. Cada módulo es un archivo que **devuelve una tabla** y se carga con la función global `import`.

```lua
local Example       = import("core.Example")        -- estilo require, con puntos
local PlayerManager = import("core/PlayerManager")  -- con barras: lo mismo
```

### Cómo se resuelven las rutas

`import(ruta)` busca **dentro de `src/` primero** y no exige extensión. Todas estas cargan el mismo archivo:

```lua
import("core.Example")
import("core/Example")
import("core/Example.lua")
import("src/core/Example")
```

- **Puntos = carpetas.** En un nombre de módulo sin barras ni extensión, cada `.` es un nivel de carpeta: `import("helper.sub")` carga `src/helper/sub.lua`. Si existiera un archivo llamado literalmente `core.example.lua`, gana la forma con barra; para el archivo con punto literal usa la ruta completa: `import("core.example.lua")`.
- **Caché estilo `require`.** Un módulo corre **una sola vez**; cada llamada posterior, desde cualquier archivo del plugin, devuelve **la misma tabla**. Ideal para módulos con estado, como un `PlayerManager`.
- **Fuera de `src/`.** Funciona si la carpeta existe: `import("lib/extra.lua")` carga `<plugin>/lib/extra.lua`.
- **Variante explícita.** `plugin.include("src/rules.lua")` exige la ruta exacta (con extensión) relativa a la carpeta del plugin y comparte la misma caché.
- **No se escapa.** `..` y rutas absolutas lanzan un error de Lua.

### Entorno restringido

El entorno Lua **no tiene** `io`, `os`, `package`, `debug`, `load`, `loadfile` ni `dofile`. La única forma de cargar código es `import` / `plugin.include`, y las únicas formas de tocar archivos son la [API de datos](datos-es.md) y la [API de recursos](datos-es.md#recursos-del-plugin).
