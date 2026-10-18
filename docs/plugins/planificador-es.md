# Tareas programadas

**Español** · [English](scheduler.md)

El planificador corre funciones **en el hilo principal**, a N ticks de ahora o periódicamente. **20 ticks = 1 segundo.**

```lua
local id = scheduler.later(100, function()      -- una vez, tras 5 s
    server.broadcast("§e5 seconds have passed")
end)

local task = scheduler.every(1200, function()   -- cada 60 s
    server.broadcast("§bRead the rules with /rules")
end)

scheduler.cancel(task)                          -- cancelar por id
```

| Función | Descripción |
|---|---|
| `scheduler.later(ticks, fn)` | Corre `fn` una vez, dentro de `ticks`. Devuelve un id. |
| `scheduler.every(ticks, fn)` | Corre `fn` cada `ticks`. Devuelve un id. |
| `scheduler.cancel(id)` | Cancela una tarea por id. |

Reglas:

- `ticks` debe ser un entero (usa `math.floor` en valores calculados); cualquier valor menor que `1` se trata como `1`.
- Las tareas se cancelan **automáticamente** cuando el plugin se desactiva o recarga.
- Los handlers cuentan contra los [límites de ejecución](buenas-practicas-es.md#límites-de-ejecución) del plugin: una tarea que lance 10 errores consecutivos desactiva todo el plugin.

## Patrones

Cuenta atrás, con limpieza final:

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

HUD persistente con una tarea repetida:

```lua
local hud = scheduler.every(10, function()          -- cada 0.5 s
    for _, name in ipairs(server.players()) do
        local hp = player.getHealth(name)
        player.popup(name, "§cHP: " .. hp)
    end
end)
-- scheduler.cancel(hud) cuando ya no lo necesites
```

:::{tip}
Mantén las tareas repetidas ligeras: corren en el hilo principal junto con el tick del servidor. Si necesitas trabajo pesado, repártelo con cadenas de `scheduler.later` en lugar de un gran bucle.
:::
