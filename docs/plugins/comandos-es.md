# Comandos y permisos

**Español** · [English](commands.md)

## Registrar un comando

```lua
commands.register("hello", {
    description = "Greets you",        -- opcional (se ve en /help)
    usage       = "/hello",            -- opcional
    permission  = "default",           -- opcional: "default" | "op" | nodo custom
}, function(sender, args)
    commands.reply(sender, "Hello " .. sender.name)
end)
```

- Devuelve `true` si se registró y `false` si el nombre ya estaba tomado. Un nombre de comando solo puede pertenecer a un plugin.
- `sender` es una tabla simple: `{ name = "Steve", isConsole = false, isOp = true }`.
- `args` es una lista de strings **sin** el nombre del comando: `{"a", "b"}`.
- Responde siempre con `commands.reply(sender, msg)`: funciona para jugadores y consola (las respuestas de consola van al log).
- El nombre del comando se pasa a minúsculas al registrarlo.
- Tu función corre en el **siguiente tick** en el hilo principal. `sender` es una **copia** tomada cuando se escribió el comando; para la consola, `sender.name` es `"CONSOLE"` y `sender.isConsole` es `true`.

## Sobrescribir comandos integrados (nuevo en 1.0.2)

Con `override = true` tu comando **reemplaza uno existente** (por ejemplo el `/kick` del núcleo):

```lua
commands.register("kick", {
    description = "Kick with a goodbye message",
    usage       = "/kick <player> [reason]",
    permission  = "op",
    override    = true,                -- toma el /kick integrado
}, function(sender, args)
    if not args[1] then
        return commands.reply(sender, "Usage: /kick <player> [reason]")
    end
    player.kick(args[1], args[2] or "Goodbye!")
    commands.reply(sender, "§aKicked " .. args[1])
end)
```

Cómo funciona:

- El comando original se **desactiva al instante** y tu función corre en su lugar, mientras tu plugin esté habilitado.
- Cuando tu plugin se descarga o se ejecuta `/plugins reload`, el **comando original se restaura automáticamente** — nada que limpiar.
- Sin `override`, registrar un nombre ya tomado simplemente devuelve `false`.

## Permisos

El campo `permission` define para quién es el comando:

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
    permission = "myperm.vip",
}, fn)
```

| Valor de `permission` | Quién puede usarlo |
|---|---|
| `"default"`, `"all"`, `"public"`, `"everyone"`, `"todos"` o sin campo | Todos |
| `"op"`, `"admin"` | Ops y consola (y quien tenga el nodo `cursestone.command.<name>`) |
| Cualquier otro string | Ops y jugadores con ese nodo concedido |

El chequeo corre **antes** de ejecutar el comando: un jugador sin permiso nunca llega a tu función Lua.

## Conceder y revocar permisos

```lua
player.setPermission("Steve", "myperm.vip", true)   -- conceder
player.setPermission("Steve", "myperm.vip", false)  -- denegar
player.hasPermission("Steve", "myperm.vip")         -- consultar
```

:::{warning}
Los permisos custom viven **en memoria**: se pierden al reiniciar el servidor o cuando el jugador se va. Para persistirlos, guárdalos con `data.saveYml` (ver [Datos y configuración](datos-es.md)) y concédelos de nuevo en el evento `PlayerJoin`.
:::

## `/help` dinámico

`/help` (y `/?`) se construye desde el registro real de comandos. Los comandos de tus plugins **aparecen solos**, ordenados alfabéticamente junto a los del servidor y paginados (`/help`, `/help 2`, ...). Cada jugador solo ve los comandos que **puede usar**: los comandos solo-op se ocultan a los jugadores normales.
