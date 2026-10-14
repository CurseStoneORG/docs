-- Config module: loads data_pl/ExamplePlugin/config.yml, creating it with defaults.
-- Módulo Config: carga config.yml y lo crea con valores por defecto si falta.
-- Thanks to the import() cache, every file gets the SAME table.
-- Gracias a la caché de import(), todos los archivos reciben LA MISMA tabla.

local Config = {}

local DEFAULTS = {
    join_message      = "§e{player} joined the game",
    quit_message      = "§e{player} left the game",
    welcome_tip       = "§aWelcome, {player}!",
    announce_interval = 2400,   -- ticks (2400 = 2 minutes)
    announce_message  = "§bTip: type §f/example §bto see what this plugin does",
    blocked_words     = { "noob", "idiot" },
    protected_blocks  = { 7 },  -- block ids only ops can break (7 = bedrock)
}

local current = nil

local function copy(value)
    if type(value) ~= "table" then return value end
    local out = {}
    for k, v in pairs(value) do out[k] = copy(v) end
    return out
end

function Config.load()
    local cfg, created = nil, false

    if data.exists("config.yml") then
        local loaded, err = data.loadYml("config.yml")
        if loaded then
            cfg = loaded
        else
            -- Malformed file: keep it on disk so the admin can fix it by hand.
            -- Archivo mal formado: se deja en disco para que el admin lo arregle.
            log.warn("config.yml is malformed, using defaults: " .. tostring(err))
        end
    else
        created = true
    end

    cfg = cfg or {}

    -- Fill in missing keys without touching what the admin already set.
    -- Rellena claves faltantes sin tocar lo que el admin ya configuró.
    for key, default in pairs(DEFAULTS) do
        if cfg[key] == nil then cfg[key] = copy(default) end
    end

    -- Validate types: a hand-edited config must never break the plugin.
    -- Valida tipos: un config editado a mano nunca debe romper el plugin.
    cfg.announce_interval = math.floor(tonumber(cfg.announce_interval) or DEFAULTS.announce_interval)
    for _, key in ipairs({ "join_message", "quit_message", "welcome_tip", "announce_message" }) do
        cfg[key] = tostring(cfg[key])
    end
    for _, key in ipairs({ "blocked_words", "protected_blocks" }) do
        if type(cfg[key]) ~= "table" then
            log.warn(key .. " must be a list, using defaults")
            cfg[key] = copy(DEFAULTS[key])
        end
    end

    if created then
        data.saveYml("config.yml", cfg)
        log.info("Created default config.yml")
    end

    current = cfg
    return cfg
end

function Config.get()
    return current or Config.load()
end

return Config
