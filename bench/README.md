# Translation benchmark

Measures a translation model's accuracy and speed through Local AI Live Translate's own translator,
for the site's [Translation models](https://xinjalin.github.io/Local-AI-Live-Translate-docs/models/)
page. The method is described on
[How we benchmark](https://xinjalin.github.io/Local-AI-Live-Translate-docs/models/benchmark-method/).

| File | Contents |
|---|---|
| `translation_bench.py` | Runs the benchmark for one model |
| `build_benchmarks.py` | Turns the results into `docs/data/benchmarks.json` (`--check`: fail if it's out of date) |
| `models.json` | How each model is shown on the site: name, quantization, file size, family, tag, note |
| `data/` | Test sentences (see [data/README.md](data/README.md) for sources and licences) |
| `results/translation.jsonl` | One line per run: per-pair chrF, times and a sample output. The latest run of a model counts |

## Adding a model

1. Load the model in LM Studio (4K context), with nothing else loaded.
2. Run the benchmark with the app's Python (it uses the app's server code):

   ```bash
   <app folder>\runtime\python.exe bench\translation_bench.py --app <app folder> <LM Studio model key>
   ```

   Watch the sample outputs it prints: each should be a real translation in the right language. It
   warns if lines came back untranslated.
3. Add the model to `models.json`, keyed by the same LM Studio model key.
4. `python bench/build_benchmarks.py`, then commit `bench/results/`, `bench/models.json` and
   `docs/data/benchmarks.json`. The site updates when it's pushed to `main`.

`--zh-only` re-runs just English → Chinese (into `results/translation_zh.jsonl`), for results measured
before the benchmark converted Chinese output to the chosen script; `build_benchmarks.py` uses those
for that model's Chinese scores.
