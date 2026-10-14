-- Events module: join, quit, chat filter and block protection.
-- Módulo Events: entrada, salida, filtro de chat y protección de bloques.

local Stats = import("core.Stats")

local Events = {}

-- Replace {player} in a template. A function replacement avoids problems
-- with special characters in player names.
-- Reemplaza {player} en una plantilla. Usar función evita problemas con
-- caracteres especiales en el nombre.
local function fill(template, name)
    return (string.gsub(template, "{player}", function() return name end))
end

function Events.register(cfg)
    -- Set of protected block ids for O(1) lookup.
    -- Conjunto de ids protegidos para búsqueda rápida.
    local protected = {}
    for _, id in ipairs(cfg.protected_blocks) do
        protected[id] = true
    end

    events.on("PlayerJoin", function(e)
        Stats.recordJoin(e.player)
        e.message = fill(cfg.join_message, e.player)
        player.tip(e.player, fill(cfg.welcome_tip, e.player))
    end)

    events.on("PlayerQuit", function(e)
        e.message = fill(cfg.quit_message, e.player)
        Stats.save()
    end)

    -- Cancelling PlayerChat stops the message from being broadcast.
    -- Cancelar PlayerChat evita que el mensaje se difunda.
    events.on("PlayerChat", function(e)
        local lower = string.lower(e.message)
        for _, word in ipairs(cfg.blocked_words) do
            if string.find(lower, string.lower(word), 1, true) then
                e.cancel()
                player.message(e.player, "§cPlease keep the chat friendly!")
                return
            end
        end
    end)

    -- Only ops can break protected blocks.
    -- Solo los ops pueden romper bloques protegidos.
    events.on("BlockBreak", function(e)
        if protected[e.block_id] and not player.isOp(e.player) then
            e.cancel()
            player.popup(e.player, "§cThis block is protected")
        end
    end)
end

return Events
