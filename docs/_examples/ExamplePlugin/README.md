# ExamplePlugin

🌐 **English** · [Español](#español)

Reference plugin for the CurseStone Lua plugin API **1.0.1**. Copy this folder to your server's `plugins/` directory and run `/plugins reload`.

## What it demonstrates

| Feature | Where |
|---|---|
| `plugin.yml` manifest | `plugin.yml` |
| Lifecycle (`onEnable` / `onDisable`) | `src/main.lua` |
| Modules with `import()` (shared, cached) | `src/core/*.lua` |
| YAML config with defaults | `src/core/Config.lua` |
| JSON persistence | `src/core/Stats.lua` |
| Public, op-only and custom-permission commands | `src/core/Commands.lua` |
| Events: join, quit, chat, block break | `src/core/Events.lua` |
| Scheduler (repeating announcement) | `src/main.lua` |
| Tip and popup messages | `Commands.lua`, `Events.lua` |

## Layout

```
ExamplePlugin/
├── plugin.yml
└── src/
    ├── main.lua
    └── core/
        ├── Config.lua
        ├── Stats.lua
        ├── Commands.lua
        └── Events.lua
```

On first run it creates `plugins/data_pl/ExamplePlugin/config.yml` and, later, `stats.json`.

## Commands

| Command | Permission | Description |
|---|---|---|
| `/example [info\|stats\|tip\|popup]` | everyone | Demo menu |
| `/exannounce <text>` | op | Broadcasts a message |
| `/vipzone` | `example.vip` (or op) | Custom-permission demo |
| `/exvip <player> <on\|off>` | op | Grants/revokes `example.vip` (in memory only) |

## Configuration (`config.yml`)

| Key | Default | Meaning |
|---|---|---|
| `join_message` / `quit_message` | see file | `{player}` is replaced by the name |
| `welcome_tip` | see file | Tip shown to the player on join |
| `announce_interval` | `2400` | Ticks between announcements (`0` disables) |
| `announce_message` | see file | Repeating broadcast text |
| `blocked_words` | `noob`, `idiot` | Chat messages containing them are cancelled |
| `protected_blocks` | `[7]` | Block ids only ops can break |

---

## Español

Plugin de referencia para la API de plugins Lua de CurseStone **1.0.1**. Copia esta carpeta al directorio `plugins/` de tu servidor y ejecuta `/plugins reload`.

### Qué demuestra

| Función | Dónde |
|---|---|
| Manifiesto `plugin.yml` | `plugin.yml` |
| Ciclo de vida (`onEnable` / `onDisable`) | `src/main.lua` |
| Módulos con `import()` (compartidos, con caché) | `src/core/*.lua` |
| Config YAML con valores por defecto | `src/core/Config.lua` |
| Persistencia JSON | `src/core/Stats.lua` |
| Comandos públicos, solo-op y con permiso custom | `src/core/Commands.lua` |
| Eventos: entrada, salida, chat, romper bloque | `src/core/Events.lua` |
| Scheduler (anuncio repetido) | `src/main.lua` |
| Mensajes tip y popup | `Commands.lua`, `Events.lua` |

### Comandos

| Comando | Permiso | Descripción |
|---|---|---|
| `/example [info\|stats\|tip\|popup]` | todos | Menú de demostración |
| `/exannounce <texto>` | op | Difunde un mensaje |
| `/vipzone` | `example.vip` (u op) | Demo de permiso custom |
| `/exvip <jugador> <on\|off>` | op | Da/quita `example.vip` (solo en memoria) |

### Configuración (`config.yml`)

Se crea sola en `plugins/data_pl/ExamplePlugin/config.yml` la primera vez. `{player}` se reemplaza por el nombre del jugador, `announce_interval` está en ticks (20 = 1 s, `0` lo desactiva), `blocked_words` cancela los mensajes de chat que las contengan y `protected_blocks` son los ids de bloque que solo pueden romper los ops.
