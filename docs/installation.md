# CurseStone Installation Guide

English | [Español](installation-es.md)

This guide explains how to install, run and update a CurseStone server.

## 1. Requirements

| | |
|---|---|
| Client | Minecraft: Pocket Edition 0.15.x (protocol 84) |
| Platform | Linux x86_64, Android ARM64 (Termux). Other platforms can build from source |
| Network | UDP port `19132` reachable by your players |

You do not need Java, Lua, Python or any interpreter. The Lua engine used by plugins is built into the server.

## 2. Get the server

Pick one option.

### Option A: prebuilt binary

1. Open the releases page: https://github.com/CurseStoneTeam/CurseStone/releases
2. Download the file for your platform. Release files are named:
   - `CurseStone-<version>-linux-x86_64`
   - `CurseStone-<version>-android-arm64`
3. Put it in an empty folder and make it executable:

```bash
mkdir cursestone && cd cursestone
mv ~/Downloads/CurseStone-<version>-linux-x86_64 CurseStone
chmod +x CurseStone
```

Every push also produces binaries as workflow artifacts under the repository's **Actions** tab.

If the binary reports a missing library, install the zlib and LevelDB runtime packages for your system.

### Option B: build from source

Requirements: CMake 3.20 or newer, GCC 12 or newer (or Clang) with C23 and C++20 support, zlib and LevelDB. Lua is bundled.

**Linux (Debian / Ubuntu)**

```bash
sudo apt-get install cmake ninja-build gcc-12 g++-12 zlib1g-dev libleveldb-dev libsnappy-dev
git clone https://github.com/CurseStoneTeam/CurseStone.git
cd CurseStone
cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel
```

The server is `build/CurseStone`. Run it from the `build` folder, or copy the `build/resources` folder next to the binary wherever you move it.

**Android (Termux)**

```bash
pkg update && pkg install -y git cmake ninja clang zlib leveldb
git clone https://github.com/CurseStoneTeam/CurseStone.git
cd CurseStone
cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel
```

**Other platforms**

Cross-compiling for Android with the NDK and the CMake presets are described in `BUILDING.md` in the CurseStone repository. Windows builds from source with CMake (MSVC or MinGW); no prebuilt Windows binary is published.

## 3. First run

From the folder that holds the server:

```bash
./CurseStone
```

There are no setup questions. On the first start the server:

- writes a default `cursestone.yml`,
- creates the world in `worlds/world/`,
- creates `server.log` and a `crashdumps/` folder.

`server.properties` is copied from `resources/server.properties` if that file exists next to the server. If you installed a single binary without the `resources/` folder, create `server.properties` yourself (see the next section) or copy the file from the repository's `resources/` folder.

To run the server with its files in a different folder:

```bash
./CurseStone --data /path/to/server-folder
```

## 4. Folder layout

```
cursestone/
├── CurseStone              the server
├── cursestone.yml          main configuration
├── server.properties       common settings
├── server.log              log file
├── worlds/
│   └── world/              your world
├── plugins/                Lua plugins (one folder per plugin)
│   └── data_pl/            plugin data
└── crashdumps/             crash reports
```

## 5. Configure

Both files are read from the server folder. `server.properties` is checked first when it exists.

Most used `server.properties` settings:

| Key | Default | Description |
|---|---|---|
| `server-port` | `19132` | UDP port |
| `max-players` | `20` | Player limit |
| `view-distance` | `8` | Chunk view distance |
| `gamemode` | `0` | 0 survival, 1 creative, 2 adventure |
| `difficulty` | `1` | 0 peaceful to 3 hard |
| `world-name` | `world` | World folder name inside `worlds/` |
| `world-seed` | empty | World seed |
| `world-format` | `anvil` | `anvil` or `leveldb` |
| `white-list` | `false` | Only allow listed players |

`cursestone.yml` also holds memory limits, the number of async workers and logging options. Restart the server after editing either file.

## 6. Open the port

CurseStone listens on **UDP 19132** by default. Players cannot join until that port is open.

- Linux firewall: `sudo ufw allow 19132/udp`
- VPS or cloud provider: add an inbound UDP rule for the port in the provider's firewall panel.
- Home network: forward UDP 19132 on your router to the machine that runs the server.

If you change `server-port`, open that port instead.

## 7. Connect

In Minecraft: Pocket Edition 0.15.x, go to **Play**, **Edit** an external server or **Add Server**, and enter the server address and port `19132`.

## 8. Run in the background

**tmux** (simple):

```bash
tmux new -s cursestone
./CurseStone
# detach with Ctrl+B then D, reattach with: tmux attach -t cursestone
```

**systemd** (starts on boot), `/etc/systemd/system/cursestone.service`:

```ini
[Unit]
Description=CurseStone server
After=network.target

[Service]
WorkingDirectory=/home/mc/cursestone
ExecStart=/home/mc/cursestone/CurseStone
Restart=on-failure
User=mc

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now cursestone
```

The first run writes its configuration without asking anything, so it also works when no terminal is attached.

## 9. Stop and back up

Type `/stop` in the server console to save and shut down cleanly.

To back up, stop the server (or run `/save`) and copy the `worlds/` folder together with `cursestone.yml` and `server.properties`.

## 10. Install plugins

Copy the plugin folder into `plugins/` next to the server and run `/plugins reload` in the console, or restart the server. See the [plugin guide](plugins.md).

## 11. Update

1. Stop the server with `/stop`.
2. Back up your server folder.
3. Replace the `CurseStone` binary with the new one. Keep `worlds/`, your config files and `plugins/`.
4. Read the changelog of the new version for breaking changes before you start it. Version 1.0.1, for example, renamed the `level-*` config keys to `world-*`.
5. Start the server again.

## 12. Troubleshooting

| Problem | What to check |
|---|---|
| Players cannot connect | The port is open for **UDP**, not only TCP, in the OS firewall and the provider panel. The client is version 0.15.x. |
| Stuck on "Sincronizando paquetes" | Check the UDP port and any tunnel or container networking in front of the server. |
| `Permission denied` when starting | Run `chmod +x CurseStone`. |
| Missing library error | Install the zlib and LevelDB runtime packages. |
| Settings are ignored | You edited a file in another folder. Check you are in the server folder, or pass `--data`. |
| The server crashed | Look in `crashdumps/` and `server.log`, and attach them when you report the bug. |
