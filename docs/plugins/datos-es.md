# Datos y configuración

**Español** · [English](data.md)

Al arrancar el servidor crea `data_pl/` en la **raíz del servidor** y, para cada plugin cargado, su carpeta `data_pl/<carpetaDelPlugin>/`. La API `data.*` solo puede leer y escribir dentro de ella.

```lua
data.folder                      -- ruta de TU carpeta de datos (string)
data.read(archivo)               -- contenido crudo | nil, err
data.write(archivo, contenido)   -- escritura cruda (binario seguro) | true | nil, err
data.exists(archivo)             -- ¿existe?
data.delete(archivo)             -- borra (false si no existía)
data.list()                      -- nombres de las entradas de la carpeta
data.loadYml(archivo)            -- YAML -> tabla | nil, err
data.saveYml(archivo, tabla)     -- tabla -> YAML | true | nil, err
data.loadJson(archivo)           -- JSON -> tabla | nil, err
data.saveJson(archivo, tabla)    -- tabla -> JSON | true | nil, err
```

- `archivo` siempre es **relativo a tu carpeta de datos**. Las subcarpetas funcionan: `data.write("stats/2026.json", ...)` crea la ruta.
- `..`, rutas absolutas y backslashes lanzan un **error de Lua**: ningún plugin puede salir de su carpeta.
- Los strings de Lua 5.4 son binario-seguros, así que `data.read` / `data.write` funcionan con **cualquier formato** (`.dat`, `.bin`, imágenes), `\0` incluido.
- Una config malformada **no rompe nada**: `loadYml` / `loadJson` devuelven `nil, err` y tu plugin decide qué hacer.

:::{note}
**Se movió en 1.0.2.** La raíz de datos era `plugins/data_pl/`; ahora es `data_pl/` junto al binario del servidor. CurseStone mueve la carpeta vieja automáticamente en el primer arranque.
:::

## Patrón recomendado: config con valores por defecto

```lua
local config = data.loadYml("config.yml")
if not config then
    config = {
        message  = "§bRemember to read the rules (/rules)",
        interval = 1200,               -- ticks (1200 = 60 s)
        rules    = { "Respect", "No grief" },
    }
    data.saveYml("config.yml", config)
end
```

Esto produce el siguiente `config.yml`:

```yaml
message: "§bRemember to read the rules (/rules)"
interval: 1200
rules:
  - Respect
  - No grief
```

## Recursos del plugin

Envía archivos de solo lectura dentro de tu plugin, bajo `plugins/<Plugin>/resources/`, y gestiónalos con:

```lua
local text = plugin.getResource("motd.txt")          -- contenido | nil, err
local ok, err = plugin.saveResource("config.yml", false)  -- instalar en data_pl
for _, path in ipairs(plugin.listResources()) do     -- listado recursivo
    log.info("shipped: " .. path)
end
```

| Función | Descripción |
|---|---|
| `plugin.getResource(name)` | Devuelve el contenido de `resources/<name>` (binario seguro), o `nil, err` si no existe. |
| `plugin.saveResource(name, replace)` | Copia `resources/<name>` a tu carpeta de datos — la forma estándar de instalar una config por defecto. Con `replace = false` se conserva un archivo existente. Devuelve `true` o `false, motivo`. |
| `plugin.listResources()` | Rutas relativas de todo lo que hay dentro de `resources/` (recursivo). |

Un arranque típico:

```lua
if not data.exists("config.yml") then
    plugin.saveResource("config.yml", false)   -- instala el default incluido
end
local config = data.loadYml("config.yml")
```

## Soporte de formatos

**YAML** soporta: mapas anidados por indentación, listas (`- item`, incluidas listas de mapas), strings con y sin comillas, enteros, floats, `true`/`false`, `null`/`~` (la clave se omite en Lua), comentarios `#` y `{}` / `[]` vacíos.
**No** soporta: anclas, texto multilínea (`|` / `>`) ni indentación con tabs (error claro).

**JSON** es el estándar completo, incluidos escapes `\uXXXX` y surrogate pairs. Un `null` dentro de un objeto omite la clave en la tabla Lua.
