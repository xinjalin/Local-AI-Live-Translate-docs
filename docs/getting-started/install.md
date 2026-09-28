# Install

## What you need

- **Windows 10 or 11, 64-bit**, and **Google Chrome** (or another Chromium browser).
- **LM Studio** 0.4 or newer — <https://lmstudio.ai> — with a translation model downloaded
  (see [Translation models](../models/index.md); **Hy-MT2-7B** is the recommended one). Ollama works too.
- About **1 GB** of disk space. Python is **not** needed: the app uses its own private copy in
  `runtime/`, which doesn't touch anything else on the PC.

## Option A — download a release (easiest)

Get `Local-AI-Live-Translate-<version>-windows-x64.zip` from the
[Releases page](https://github.com/xinjalin/Local-AI-Live-Translate/releases/latest) and unzip it to a
folder with a short path, such as `C:\LocalAI\`. It contains everything, ready to run offline.

!!! tip "Keep the path short"
    Windows limits file paths to 260 characters, and a very deep folder can stop Python from loading.

Each release also has `SHA256SUMS.txt` with the checksums of its files.

## Option B — from the source code

```bash
git clone https://github.com/xinjalin/Local-AI-Live-Translate.git
```

The first run of `START_Local_AI_Live_Translate.bat` downloads what the app needs (~1.1 GB, one time):
a portable Python 3.14 (python.org's NuGet package — no installer, no admin rights), its packages from
PyPI, and the speech models. Every file is checked against a checksum pinned in `tools/dependencies.json`
before it is used. After a `git pull`, anything new is downloaded the same way on the next start.

## What's in the folder

| Folder / file | Contents |
|---|---|
| `START_Local_AI_Live_Translate.bat` | Starts the server |
| `extension/` | The Chrome extension (load it unpacked) |
| `server/` | Server source: `live_translate_server.py`, `translator.py`, `prompt_templates.py`, `qwen_live.py` |
| `templates/` | Prompt templates (JSON), including your own — see [Prompt templates](../guide/prompt-templates.md) |
| `tools/` | `setup.ps1` (first-run downloads, pinned in `dependencies.json`), `build_package.py` (release bundle) |
| `models/` | Speech models: Silero VAD, SenseVoice, Whisper-Small, Dolphin small, Omnilingual 300M, and the CAM++ speaker model |
| `runtime/` | Private Python 3.14 with all packages installed |
| `transcripts/` | Markdown transcripts, when **Save transcripts** is switched on |

Next: [Quick start](quick-start.md).
