#!/usr/bin/env bash
# Sobe o everMind (PWA) localmente.
#   ./iniciar-web.sh          -> só neste computador (http://localhost:8080)
#   ./iniciar-web.sh celular  -> também na sua rede Wi-Fi, para abrir no celular
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-8080}"
BIND="127.0.0.1"
if [ "${1:-}" = "celular" ]; then
  BIND="0.0.0.0"
  IP="$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || true)"
  [ -n "${IP:-}" ] && echo "No celular (mesmo Wi-Fi), abra: http://$IP:$PORT"
fi
echo "No computador, abra: http://localhost:$PORT   (Ctrl+C para parar)"
exec python3 -m http.server "$PORT" --bind "$BIND" --directory web
