# Guía de instalación de CurseStone

[English](installation.md) | Español

Esta guía explica cómo instalar, ejecutar y actualizar un servidor CurseStone.

## 1. Requisitos

| | |
|---|---|
| Cliente | Minecraft: Pocket Edition 0.15.x (protocolo 84) |
| Plataforma | Linux x86_64, Android ARM64 (Termux). Otras plataformas se pueden compilar desde el código |
| Red | Puerto UDP `19132` accesible para tus jugadores |

No necesitas Java, Lua, Python ni ningún intérprete. El motor Lua de los plugins viene integrado en el servidor.

## 2. Obtener el servidor

Elige una opción.

### Opción A: binario ya compilado

1. Abre la página de releases: https://github.com/CurseStoneTeam/CurseStone/releases
2. Descarga el archivo de tu plataforma. Los archivos de un release se llaman:
   - `CurseStone-<versión>-linux-x86_64`
   - `CurseStone-<versión>-android-arm64`
3. Ponlo en una carpeta vacía y hazlo ejecutable:

```bash
mkdir cursestone && cd cursestone
mv ~/Descargas/CurseStone-<versión>-linux-x86_64 CurseStone
chmod +x CurseStone
```

Cada push también genera binarios como artifacts del workflow, en la pestaña **Actions** del repositorio.

Si el binario avisa de una librería que falta, instala los paquetes de zlib y LevelDB de tu sistema.

### Opción B: compilar desde el código

Requisitos: CMake 3.20 o superior, GCC 12 o superior (o Clang) con soporte de C23 y C++20, zlib y LevelDB. Lua viene incluido.

**Linux (Debian / Ubuntu)**

```bash
sudo apt-get install cmake ninja-build gcc-12 g++-12 zlib1g-dev libleveldb-dev libsnappy-dev
git clone https://github.com/CurseStoneTeam/CurseStone.git
cd CurseStone
cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel
```

El servidor queda en `build/CurseStone`. Ejecútalo desde la carpeta `build`, o copia la carpeta `build/resources` junto al binario si lo mueves a otro sitio.

**Android (Termux)**

```bash
pkg update && pkg install -y git cmake ninja clang zlib leveldb
git clone https://github.com/CurseStoneTeam/CurseStone.git
cd CurseStone
cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel
```

**Otras plataformas**

La compilación cruzada para Android con el NDK y los presets de CMake están en `BUILDING.md`, en el repositorio de CurseStone. En Windows se compila desde el código con CMake (MSVC o MinGW); no se publica un binario de Windows.

## 3. Primer arranque

Desde la carpeta del servidor:

```bash
./CurseStone
```

No hace preguntas de configuración. En el primer arranque el servidor:

- escribe un `cursestone.yml` por defecto,
- crea el mundo en `worlds/world/`,
- crea `server.log` y la carpeta `crashdumps/`.

`server.properties` se copia desde `resources/server.properties` si ese archivo existe junto al servidor. Si instalaste solo el binario, sin la carpeta `resources/`, crea `server.properties` a mano (mira la siguiente sección) o copia el archivo de la carpeta `resources/` del repositorio.

Para ejecutar el servidor con sus archivos en otra carpeta:

```bash
./CurseStone --data /ruta/a/la-carpeta-del-servidor
```

## 4. Estructura de carpetas

```
cursestone/
├── CurseStone              el servidor
├── cursestone.yml          configuración principal
├── server.properties       ajustes comunes
├── server.log              archivo de log
├── worlds/
│   └── world/              tu mundo
├── plugins/                plugins Lua (una carpeta por plugin)
│   └── data_pl/            datos de los plugins
└── crashdumps/             reportes de crash
```

## 5. Configurar

Los dos archivos se leen desde la carpeta del servidor. `server.properties` se revisa primero si existe.

Ajustes más usados de `server.properties`:

| Clave | Por defecto | Descripción |
|---|---|---|
| `server-port` | `19132` | Puerto UDP |
| `max-players` | `20` | Límite de jugadores |
| `view-distance` | `8` | Distancia de visión en chunks |
| `gamemode` | `0` | 0 supervivencia, 1 creativo, 2 aventura |
| `difficulty` | `1` | 0 pacífico a 3 difícil |
| `world-name` | `world` | Nombre de la carpeta del mundo dentro de `worlds/` |
| `world-seed` | vacío | Semilla del mundo |
| `world-format` | `anvil` | `anvil` o `leveldb` |
| `white-list` | `false` | Solo permite jugadores de la lista |

`cursestone.yml` también tiene los límites de memoria, el número de workers asíncronos y las opciones de logs. Reinicia el servidor después de editar cualquiera de los dos.

## 6. Abrir el puerto

CurseStone escucha por defecto en el **puerto UDP 19132**. Nadie podrá entrar hasta que ese puerto esté abierto.

- Firewall de Linux: `sudo ufw allow 19132/udp`
- VPS o proveedor cloud: agrega una regla de entrada UDP para el puerto en el panel de firewall del proveedor.
- Red doméstica: redirige el puerto UDP 19132 de tu router hacia la máquina que ejecuta el servidor.

Si cambias `server-port`, abre ese puerto.

## 7. Conectarse

En Minecraft: Pocket Edition 0.15.x, entra en **Jugar**, edita un servidor externo o usa **Añadir servidor**, y escribe la dirección del servidor y el puerto `19132`.

## 8. Ejecutar en segundo plano

**tmux** (lo más simple):

```bash
tmux new -s cursestone
./CurseStone
# desconecta con Ctrl+B y luego D, vuelve con: tmux attach -t cursestone
```

**systemd** (arranca con el sistema), `/etc/systemd/system/cursestone.service`:

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

El primer arranque escribe su configuración sin preguntar nada, así que también funciona sin una terminal conectada.

## 9. Detener y hacer copias de seguridad

Escribe `/stop` en la consola del servidor para guardar y apagar de forma limpia.

Para hacer una copia, detén el servidor (o ejecuta `/save`) y copia la carpeta `worlds/` junto con `cursestone.yml` y `server.properties`.

## 10. Instalar plugins

Copia la carpeta del plugin dentro de `plugins/`, junto al servidor, y ejecuta `/plugins reload` en la consola, o reinicia el servidor. Mira la [guía de plugins](plugins/index-es.md).

## 11. Actualizar

1. Detén el servidor con `/stop`.
2. Haz una copia de la carpeta del servidor.
3. Reemplaza el binario `CurseStone` por el nuevo. Conserva `worlds/`, tus archivos de configuración y `plugins/`.
4. Lee el changelog de la nueva versión para ver si hay cambios que rompan compatibilidad antes de arrancarla. La versión 1.0.1, por ejemplo, renombró las claves `level-*` a `world-*`.
5. Inicia el servidor otra vez.

## 12. Solución de problemas

| Problema | Qué revisar |
|---|---|
| Los jugadores no pueden conectarse | Que el puerto esté abierto para **UDP**, no solo TCP, en el firewall del sistema y en el panel del proveedor. Que el cliente sea 0.15.x. |
| Se queda en "Sincronizando paquetes" | Revisa el puerto UDP y cualquier túnel o red de contenedores delante del servidor. |
| `Permission denied` al iniciar | Ejecuta `chmod +x CurseStone`. |
| Error de librería que falta | Instala los paquetes de zlib y LevelDB. |
| Los ajustes se ignoran | Editaste un archivo en otra carpeta. Comprueba que estás en la carpeta del servidor, o usa `--data`. |
| El servidor se cayó | Mira `crashdumps/` y `server.log`, y adjúntalos al reportar el bug. |
