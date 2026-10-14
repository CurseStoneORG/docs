-- Commands module: public, op-only and custom-permission commands.
-- Módulo Commands: comandos públicos, solo-op y con permiso custom.

local Stats = import("core.Stats")

local Commands = {}

local VIP_NODE = "example.vip"

function Commands.register(cfg)
    -- 1) PUBLIC command with a tiny help menu.
    -- 1) Comando PÚBLICO con un mini menú de ayuda.
    commands.register("example", {
        description = "ExamplePlugin demo (info, stats, tip, popup)",
        usage = "/example [info|stats|tip|popup]",
    }, function(sender, args)
        local sub = args[1] and string.lower(args[1]) or "info"

        if sub == "info" then
            commands.reply(sender, "§6ExamplePlugin §fv" .. plugin.version
                .. " by " .. plugin.author .. " (API " .. plugin.api .. ")")
            commands.reply(sender, "§7Try: /example stats | tip | popup, /vipzone, /exannounce")

        elseif sub == "stats" then
            commands.reply(sender, "§aTotal joins: §f" .. Stats.total())
            if not sender.isConsole then
                commands.reply(sender, "§aYour joins: §f" .. Stats.joinsOf(sender.name))
            end

        elseif sub == "tip" or sub == "popup" then
            if sender.isConsole then
                commands.reply(sender, "This subcommand is for players only")
                return
            end
            if sub == "tip" then
                player.tip(sender.name, "§aThis is a tip")
            else
                player.popup(sender.name, "§bThis is a popup")
            end

        else
            commands.reply(sender, "§cUsage: /example [info|stats|tip|popup]")
        end
    end)

    -- 2) OP-ONLY command: broadcasts a message.
    -- 2) Comando SOLO OP: difunde un mensaje.
    commands.register("exannounce", {
        description = "Broadcast a message (op)",
        usage = "/exannounce <text>",
        permission = "op",
    }, function(sender, args)
        if #args == 0 then
            commands.reply(sender, "§cUsage: /exannounce <text>")
            return
        end
        server.broadcast("§d[Announcement] §f" .. table.concat(args, " "))
    end)

    -- 3) CUSTOM permission: only ops or players granted "example.vip".
    -- 3) Permiso CUSTOM: solo ops o jugadores con "example.vip".
    commands.register("vipzone", {
        description = "VIP-only zone (permission: " .. VIP_NODE .. ")",
        permission = VIP_NODE,
    }, function(sender, args)
        commands.reply(sender, "§6Welcome to the VIP zone, " .. sender.name .. "!")
    end)

    -- Op command to grant/revoke the custom node (in memory only).
    -- Comando de op para dar/quitar el nodo custom (solo en memoria).
    commands.register("exvip", {
        description = "Grant or revoke the VIP node (op)",
        usage = "/exvip <player> <on|off>",
        permission = "op",
    }, function(sender, args)
        local target, mode = args[1], args[2] and string.lower(args[2])
        if not target or (mode ~= "on" and mode ~= "off") then
            commands.reply(sender, "§cUsage: /exvip <player> <on|off>")
            return
        end

        local ok = player.setPermission(target, VIP_NODE, mode == "on")
        if ok == false then
            commands.reply(sender, "§cPlayer not found: " .. target)
            return
        end
        commands.reply(sender, "§aVIP " .. mode .. " for " .. target
            .. " §7(lost on restart or when they leave)")
    end)
end

return Commands
