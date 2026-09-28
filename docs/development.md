# Development

The app's code, and the notes for working on it, are in the
[Local-AI-Live-Translate](https://github.com/xinjalin/Local-AI-Live-Translate) repository — start with
its [DEVELOPMENT.md](https://github.com/xinjalin/Local-AI-Live-Translate/blob/main/DEVELOPMENT.md).

## Releases

Pushing a version tag (`vX.Y.Z`, matching `VERSION` in `server/live_translate_server.py` and the
extension's `manifest.json`) makes GitHub Actions build the Windows bundle on a clean machine — with
the same `tools/setup.ps1` a first run uses — and publish it with SHA-256 checksums on the
[Releases page](https://github.com/xinjalin/Local-AI-Live-Translate/releases). Every push also runs
syntax, translation and secret-scan checks.

## This site

This site is built from the [Local-AI-Live-Translate-docs](https://github.com/xinjalin/Local-AI-Live-Translate-docs)
repository with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/), and published by
GitHub Actions on every push. The translation model numbers come from its `bench/` folder — see
[How we benchmark](models/benchmark-method.md).
