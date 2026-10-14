-- Stats module: counts joins per player and persists them to stats.json.
-- Módulo Stats: cuenta entradas por jugador y las guarda en stats.json.

local Stats = {}

local state = { total_joins = 0, players = {} }

function Stats.load()
    if not data.exists("stats.json") then return end

    local loaded, err = data.loadJson("stats.json")
    if not loaded then
        log.warn("stats.json is malformed, starting fresh: " .. tostring(err))
        return
    end

    state.total_joins = loaded.total_joins or 0
    state.players = loaded.players or {}
end

function Stats.save()
    local ok, err = data.saveJson("stats.json", state)
    if not ok then
        log.error("could not save stats.json: " .. tostring(err))
    end
end

function Stats.recordJoin(name)
    state.total_joins = state.total_joins + 1
    state.players[name] = (state.players[name] or 0) + 1
    return state.players[name]
end

function Stats.joinsOf(name)
    return state.players[name] or 0
end

function Stats.total()
    return state.total_joins
end

return Stats
