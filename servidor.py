#!/usr/bin/env python3
"""
Servidor local — Tacos Totous POS
Uso: python3 servidor.py
Luego abre en tu navegador: http://localhost:8080
"""
import http.server, socketserver, os, webbrowser, threading, time

PORT = 8080
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # silenciar logs del servidor

def open_browser():
    time.sleep(1)
    webbrowser.open(f"http://localhost:{PORT}")

print(f"\n🌮 Tacos Totous POS")
print(f"   Abriendo en: http://localhost:{PORT}")
print(f"   Presiona Ctrl+C para detener\n")
threading.Thread(target=open_browser, daemon=True).start()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
