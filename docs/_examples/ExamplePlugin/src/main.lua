-- ExamplePlugin: showcase of the CurseStone Lua plugin API (1.0.1)
-- ExamplePlugin: demostración de la API de plugins Lua de CurseStone (1.0.1)
--
-- Features / Funciones:
--   * plugin.yml manifest                  (manifiesto)
--   * modules with import()                (módulos con import)
--   * YAML config + JSON data              (config YAML + datos JSON)
--   * public / op / custom-permission cmds (comandos con permisos)
--   * events: join, quit, chat, break      (eventos)
--   * scheduler: repeating announcement    (tarea repetida)
--   * tip and popup messages               (mensajes tip y popup)

local Config   = import("core.Config")
local Stats    = import("core.Stats")
local Commands = import("core.Commands")
local Events   = import("core.Events")

local pluginTable = {}
local announceTask = nil

function pluginTable.onEnable()
    local cfg = Config.load()
    Stats.load()

    Commands.register(cfg)
    Events.register(cfg)

    -- Repeating broadcast (20 ticks = 1 second). interval <= 0 disables it.
    -- Anuncio repetido (20 ticks = 1 segundo). interval <= 0 lo desactiva.
    if cfg.announce_interval > 0 then
        announceTask = scheduler.every(cfg.announce_interval, function()
            server.broadcast(cfg.announce_message)
        end)
    end

    log.info("ExamplePlugin v" .. plugin.version .. " enabled (API " .. plugin.api .. ")")
end

function pluginTable.onDisable()
    if announceTask then
        scheduler.cancel(announceTask)
        announceTask = nil
    end
    Stats.save()
    log.info("ExamplePlugin disabled")
end

return pluginTable
