# Buenas prácticas y problemas

**Español** · [English](best-practices.md)

## Buenas prácticas

- **Registra todo en `onEnable`** (comandos, eventos, tareas) y limpia lo que necesites en `onDisable`.
- **Crea siempre una config por defecto** si `loadYml` / `loadJson` devuelven `nil` — o incluye una con `plugin.saveResource`.
- **Valida los argumentos de los comandos** antes de usarlos: `args` es solo una lista de strings.
- **Usa módulos** (`import`) para separar la lógica; un módulo con estado compartido, como un `PlayerManager`, funciona muy bien gracias a la caché.
- **Un nombre de comando por plugin.** Comprueba el valor de retorno de `commands.register`.
- **Mantén los handlers de eventos ligeros.** `PlayerMove` se dispara en cada paquete de movimiento aceptado — haz ahí los chequeos de región, no bucles pesados.
- **No guardes datos importantes solo en memoria** (permisos, contadores): persiste en `data_pl`.
- **Usa `/plugins reload`** mientras desarrollas en lugar de reiniciar el servidor.

## Límites de ejecución

Nuevo en **1.0.2**: un plugin ya no puede congelar el servidor por accidente. Hay límites globales que aplican a cada llamada a tu código Lua (handlers de eventos, comandos, tareas programadas):

| Límite | Valor por defecto | Efecto al superarse |
|---|---|---|
| Instrucciones VM por llamada más externa | `1,000,000` | La llamada se detiene con un error de Lua |
| Tiempo de reloj por llamada más externa | `100 ms` | La llamada se detiene con un error de Lua |
| Errores consecutivos | `10` | El plugin se **desactiva automáticamente** |

Notas:

- "Llamada más externa" significa una entrada del servidor a tu plugin: un handler de evento completo, un comando o un tick del planificador. Una llamada puede contener muchas iteraciones de bucle — un millón de instrucciones es mucho, pero no es licencia para `while true do end`.
- El contador de errores es **consecutivo**: una llamada exitosa lo reinicia. Un plugin que escupe errores seguidos se desactiva y lo deja registrado en el log.
- Un plugin desactivado deja de recibir eventos, tareas y comandos; vuelve tras `/plugins reload` o un reinicio.

```lua
-- Mal: bucle sin límite dentro de un handler -> alcanza el límite de instrucciones
events.on("PlayerChat", function(e)
    local n = 0
    while true do n = n + 1 end
end)

-- Bien: reparte el trabajo entre ticks
events.on("PlayerChat", function(e)
    scheduler.later(1, function() heavyWork(e.player) end)
end)
```

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| El plugin no aparece en `/plugins` | Falta `plugin.yml` | Crea el manifiesto; un `main.lua` suelto se ignora |
| Plugin rechazado por la API | `major` distinto o `minor` más nuevo que el servidor | Ajusta el campo `api` (`"1.0.2"`) |
| Dos copias desactivadas | Plugins duplicados | Deja una sola carpeta |
| `register` devuelve `false` | Otro plugin ya usa ese comando | Renómbralo, o usa `override = true` para reemplazar el integrado |
| Error de Lua usando `data.*`, `plugin.getResource` o `import` | Ruta con `..`, absoluta o con backslash | Usa rutas relativas con `/` |
| `loadYml` devuelve `nil, err` | YAML malformado (por ejemplo tabs) | Corrige la indentación o usa JSON |
| `attempt to call a nil value` en una función nueva | El plugin apunta a una API vieja | Pon `api: "1.0.2"` en `plugin.yml` |
| El plugin se desactivó de repente | 10 errores consecutivos de Lua (o límite superado) | Revisa el log; corrige el error; `/plugins reload` |
| El handler se cortó a mitad | Límite de instrucciones o de tiempo superado | Reparte el trabajo entre ticks con `scheduler.later` |
| El permiso desaparece | Los permisos viven en memoria | Concédelo de nuevo en `PlayerJoin` |
| Datos "perdidos" tras actualizar | La raíz de datos se movió a `<servidor>/data_pl` | Se migró automáticamente; revisa el log de arranque |

## Limitaciones y hoja de ruta

### Limitaciones (v1)

- No hay `/plugins enable|disable <name>` (el reload sí existe).
- No hay permisos persistentes en disco.
- Los comandos de un plugin descartado por un error no se registran; tras `/plugins reload` todo se registra de nuevo desde cero.
- No hay alias de comandos.
- `plugin.include`, `import` y `data.*` no permiten rutas absolutas ni `..` (a propósito).
- El parser YAML no soporta anclas ni texto multilínea (usa JSON para estructuras complejas).

### Ideas para v2

- `/plugins enable|disable <name>`.
- Más eventos (inventario, clima, spawn de entidades...).
- Alias de comandos.
- Permisos persistentes nativos, cargados desde `data_pl`.
