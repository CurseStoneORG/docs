# Best practices and troubleshooting

**English** · [Español](buenas-practicas-es.md)

## Best practices

- **Register everything in `onEnable`** (commands, events, tasks) and clean up what you need in `onDisable`.
- **Always create a default config** if `loadYml` / `loadJson` return `nil` — or ship one with `plugin.saveResource`.
- **Validate command arguments** before using them: `args` is just a list of strings.
- **Use modules** (`import`) to split logic; a module with shared state, such as a `PlayerManager`, works well thanks to the cache.
- **One command name per plugin.** Check the return value of `commands.register`.
- **Keep event handlers light.** `PlayerMove` fires on every accepted movement packet — do region checks there, not heavy loops.
- **Do not keep important data only in memory** (permissions, counters): persist it in `data_pl`.
- **Use `/plugins reload`** while developing instead of restarting the server.

## Execution limits

New in **1.0.2**: a plugin can no longer freeze the server by accident. Server-wide limits apply to every call into your Lua code (event handlers, commands, scheduled tasks):

| Limit | Default value | Effect when exceeded |
|---|---|---|
| VM instructions per outermost call | `1,000,000` | The call is stopped with a Lua error |
| Wall-clock time per outermost call | `100 ms` | The call is stopped with a Lua error |
| Consecutive errors | `10` | The plugin is **disabled automatically** |

Notes:

- "Outermost call" means one entry from the server into your plugin: a full event handler, a command run or a scheduler tick. One call may contain many loop iterations — a million instructions is a lot, but not a license for `while true do end`.
- The error counter is **consecutive**: one successful call resets it. A plugin that spams errors gets disabled and logs it.
- A disabled plugin stops receiving events, tasks and commands; it comes back after `/plugins reload` or a restart.

```lua
-- Bad: unbounded loop inside one handler -> hits the instruction limit
events.on("PlayerChat", function(e)
    local n = 0
    while true do n = n + 1 end
end)

-- Good: spread work over ticks
events.on("PlayerChat", function(e)
    scheduler.later(1, function() heavyWork(e.player) end)
end)
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Plugin missing from `/plugins` | No `plugin.yml` | Create the manifest; a bare `main.lua` is ignored |
| Plugin rejected for API | Different `major` or `minor` newer than the server | Adjust the `api` field (`"1.0.2"`) |
| Two copies disabled | Duplicate plugins | Keep a single folder |
| `register` returns `false` | Another plugin already uses that command | Rename it, or use `override = true` to replace the built-in |
| Lua error using `data.*`, `plugin.getResource` or `import` | Path with `..`, absolute, or with a backslash | Use relative paths with `/` |
| `loadYml` returns `nil, err` | Malformed YAML (for example tabs) | Fix the indentation or use JSON |
| `attempt to call a nil value` on a new function | Plugin targets an older API | Set `api: "1.0.2"` in `plugin.yml` |
| Plugin suddenly disabled | 10 consecutive Lua errors (or limit exceeded) | Check the log; fix the error; `/plugins reload` |
| Handler stopped mid-way | VM instruction or time limit exceeded | Split the work across ticks with `scheduler.later` |
| Permission disappears | Permissions are in memory | Grant it again in `PlayerJoin` |
| Old data "missing" after upgrade | Data root moved to `<server>/data_pl` | It was migrated automatically; check the startup log |

## Limitations and roadmap

### Limitations (v1)

- No `/plugins enable|disable <name>` (reload does exist).
- No persistent permissions on disk.
- Commands from a plugin discarded due to an error are not registered; after `/plugins reload` everything is registered again from scratch.
- No command aliases.
- `plugin.include`, `import` and `data.*` do not allow absolute paths or `..` (on purpose).
- The YAML parser does not support anchors or multi-line text (use JSON for complex structures).

### Ideas for v2

- `/plugins enable|disable <name>`.
- More events (inventory, weather, entity spawn...).
- Command aliases.
- Native persistent permissions, loaded from `data_pl`.
