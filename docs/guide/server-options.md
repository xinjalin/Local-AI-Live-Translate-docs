# Server options

`START_Local_AI_Live_Translate.bat` starts the server with its defaults. To change them, run it with
the app's own Python:

```
runtime\python.exe server\live_translate_server.py --threads 8 --preroll 0.2
```

| Option | Default | Meaning |
|---|---|---|
| `--threads` | half your CPU cores (2 to 8) | CPU threads for speech recognition |
| `--speaker-threads` | 2 | CPU threads for speaker labels (they run alongside recognition) |
| `--preroll` | 0.2 | seconds of audio kept before each detected speech start, so the first syllable isn't clipped |
| `--port` | 8000 | the port it listens on — the extension always connects to 8000, so change it only for testing |

The server listens on `127.0.0.1` only, and only accepts connections from the extension (and local
tools), so web pages open in the browser can't use it.
