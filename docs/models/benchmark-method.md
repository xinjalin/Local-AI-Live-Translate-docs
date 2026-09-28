# How we benchmark

The numbers on the [Translation models](index.md) page come from `bench/translation_bench.py` in the
[docs repository](https://github.com/xinjalin/Local-AI-Live-Translate-docs), run against each model
loaded in LM Studio.

## What is measured

- **The app's own translator.** Each test line goes through the app's `translator.py` exactly as a
  subtitle would: the same prompt template (Auto picks it by the model's name), sampling settings and
  output clean-up. Chinese and Cantonese output is converted to the chosen script with OpenCC, as the
  app server does. Previous lines aren't sent as context, so every model sees the same input.
- **Test set:** 24 sentences per language pair from FLORES (about 18 words each, matched across
  languages): 29 languages into English, and English into 8 (including Cantonese), plus 24 lines of
  colloquial Cantonese conversation in both directions.
- **Quality:** chrF, which measures how many character sequences (1 to 6 characters long) the
  translation shares with the reference translation, from 0 to 100 (higher is better). It works for
  every script, and gives fairer credit than word-based scores for near misses, such as a different
  form of the same word. Differences of a point or two are within noise.
- **"Into English"** averages the 29 languages; **"From English"** averages Traditional and Simplified
  Chinese, Japanese, Korean, Spanish, Portuguese and Turkish.
- **Speed:** the median time to translate one line, the time within which 90 % of lines were done
  (the slowest 10 % took longer), and the model's generation speed in tokens per second, as the app
  measures it (streamed, from the first token to the last).
- **Hardware:** RX 9070 XT (16 GB), LM Studio with the Vulkan runtime, 4K context, one model loaded at a time.

## Run it yourself

With [Local AI Live Translate](../getting-started/install.md) installed and the model loaded in LM Studio:

```bash
git clone https://github.com/xinjalin/Local-AI-Live-Translate-docs.git
cd Local-AI-Live-Translate-docs
<app folder>\runtime\python.exe bench\translation_bench.py --app <app folder> <LM Studio model key>
```

It prints each language pair as it goes and appends the run to `bench/results/translation.jsonl`.
Check the sample translations it prints: a model that answers in the wrong language, or doesn't
answer at all, shows up there (and the script warns about lines that came back untranslated).

To put a model on the site, add it to `bench/models.json` (name, quantization, file size, family),
run `python bench/build_benchmarks.py`, and open a pull request with the results. Please say what
GPU you ran it on — results from different hardware aren't comparable for speed.
