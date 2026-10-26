#!/bin/bash
# ダブルクリックでルーレットを起動します（終了するときはこのウインドウを閉じてください）
cd "$(dirname "$0")"
PORT=8765
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
sleep 1
open -a "Google Chrome" "http://localhost:$PORT/" 2>/dev/null || open "http://localhost:$PORT/"
echo "🎃 ルーレットを起動しました： http://localhost:$PORT/"
echo "終了するときはこのウインドウを閉じてください。"
wait $SERVER
