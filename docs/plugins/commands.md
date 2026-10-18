# Commands and permissions

**English** · [Español](comandos-es.md)

## Registering a command

```lua
commands.register("hello", {
    description = "Greets you",        -- optional (shown in /help)
    usage       = "/hello",            -- optional
    permission  = "default",           -- optional: "default" | "op" | custom node
}, function(sender, args)
    commands.reply(sender, "Hello " .. sender.name)
end)
```

- Returns `true` if registered and `false` if the name was already taken. A command name can belong to only one plugin.
- `sender` is a simple table: `{ name = "Steve", isConsole = false, isOp = true }`.
- `args` is a list of strings **without** the command name: `{"a", "b"}`.
- Always answer with `commands.reply(sender, msg)`: it works for both players and the console (console replies go to the log).
- The command name is lowercased on registration.
- Your function runs on the **next tick** on the main thread. `sender` is a **copy** taken when the command was typed; for the console, `sender.name` is `"CONSOLE"` and `sender.isConsole` is `true`.

## Overriding built-in commands (new in 1.0.2)

With `override = true` your command **replaces an existing one** (for example the core `/kick`):

```lua
commands.register("kick", {
    description = "Kick with a goodbye message",
    usage       = "/kick <player> [reason]",
    permission  = "op",
    override    = true,                -- take over the built-in /kick
}, function(sender, args)
    if not args[1] then
        return commands.reply(sender, "Usage: /kick <player> [reason]")
    end
    player.kick(args[1], args[2] or "Goodbye!")
    commands.reply(sender, "§aKicked " .. args[1])
end)
```

How it works:

- The original command is **disabled immediately** and your function runs instead, for as long as your plugin is enabled.
- When your plugin is disabled or `/plugins reload` runs, the **original command is restored automatically** — nothing to clean up.
- Without `override`, registering an already-taken name simply returns `false`.

## Permissions

The `permission` field defines who the command is for:

```lua
-- 1) PUBLIC (default)
commands.register("hello", { description = "Greets you" }, fn)

-- 2) OP ONLY
commands.register("announce", {
    description = "Broadcast a message (op)",
    usage = "/announce <text>",
    permission = "op",
}, fn)

-- 3) CUSTOM PERMISSION
commands.register("vip", {
    description = "VIP zone",
    permission = "myperm.vip",
}, fn)
```

| `permission` value | Who can use it |
|---|---|
| `"default"`, `"all"`, `"public"`, `"everyone"`, `"todos"` or no field | Everyone |
| `"op"`, `"admin"` | Ops and console (and anyone with the node `cursestone.command.<name>`) |
| Any other string | Ops and players granted that node |

The check runs **before** the command executes: a player without permission never reaches your Lua function.

## Granting and revoking permissions

```lua
player.setPermission("Steve", "myperm.vip", true)   -- grant
player.setPermission("Steve", "myperm.vip", false)  -- deny
player.hasPermission("Steve", "myperm.vip")         -- query
```

:::{warning}
Custom permissions live **in memory**: they are lost when the server restarts or the player leaves. To persist them, save them with `data.saveYml` (see [Data and configuration](data.md)) and grant them again in the `PlayerJoin` event.
:::

## Dynamic `/help`

`/help` (and `/?`) is built from the real command registry. Your plugins' commands **show up on their own**, sorted alphabetically with the server's and paginated (`/help`, `/help 2`, ...). Each player only sees the commands they **can use**: op-only commands are hidden from regular players.
