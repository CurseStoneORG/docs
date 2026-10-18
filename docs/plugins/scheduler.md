# Scheduled tasks

**English** · [Español](planificador-es.md)

The scheduler runs functions **on the main thread**, N ticks from now or periodically. **20 ticks = 1 second.**

```lua
local id = scheduler.later(100, function()      -- once, after 5 s
    server.broadcast("§e5 seconds have passed")
end)

local task = scheduler.every(1200, function()   -- every 60 s
    server.broadcast("§bRead the rules with /rules")
end)

scheduler.cancel(task)                          -- cancel by id
```

| Function | Description |
|---|---|
| `scheduler.later(ticks, fn)` | Runs `fn` once, `ticks` from now. Returns an id. |
| `scheduler.every(ticks, fn)` | Runs `fn` every `ticks`. Returns an id. |
| `scheduler.cancel(id)` | Cancels a task by id. |

Rules:

- `ticks` must be an integer (use `math.floor` on computed values); anything below `1` is treated as `1`.
- Tasks are cancelled **automatically** when the plugin is disabled or reloaded.
- Handlers count against the plugin's [execution limits](best-practices.md#execution-limits): a task that throws 10 consecutive errors gets the whole plugin disabled.

## Patterns

Countdown, then cleanup:

```lua
local function countdown(seconds)
    for i = seconds, 1, -1 do
        scheduler.later((seconds - i) * 20, function()
            server.broadcast("§eRestart in " .. i .. "s")
        end)
    end
    scheduler.later(seconds * 20, function()
        server.broadcast("§cRestarting NOW")
    end)
end
```

Persistent HUD with a repeating task:

```lua
local hud = scheduler.every(10, function()          -- every 0.5 s
    for _, name in ipairs(server.players()) do
        local hp = player.getHealth(name)
        player.popup(name, "§cHP: " .. hp)
    end
end)
-- scheduler.cancel(hud) when you no longer need it
```

:::{tip}
Keep repeating tasks light: they run on the main thread together with the server tick. If you need heavy work, spread it out with `scheduler.later` chains instead of one big loop.
:::
