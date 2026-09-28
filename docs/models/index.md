---
description: Which local translation model to load in LM Studio for Local AI Live Translate - accuracy and speed of every model we've tested, by language.
hide:
  - toc
---

# Translation models

Which local model should you load in LM Studio? Every model here was run through the app's own
translator — with the same prompt templates and settings the app uses — on the same test sentences, so
the numbers compare directly. Quality is **chrF** (higher is better; differences of a point or two are within noise).
How it's measured: [How we benchmark](benchmark-method.md).

<div id="lt-dashboard" data-src="../data/benchmarks.json" markdown="0">
  <div class="lt-meta" id="lt-meta"></div>
  <div class="lt-kpis" id="lt-kpis"></div>

  <section class="lt-panel">
    <div class="lt-panel-head">
      <div>
        <h2 id="quality-vs-speed">Quality vs speed</h2>
        <p class="lt-sub">Up is more accurate, left is faster (median time per subtitle line). Bubble size: file size.</p>
      </div>
      <div class="lt-toolbar">
        <div class="lt-seg" id="lt-dir-chart"><button data-v="intoEn" class="lt-on">Into English</button><button data-v="fromEn">From English</button></div>
        <div class="lt-seg" id="lt-vram" title="Only models whose file fits in this much video memory"><button data-v="99" class="lt-on">Any size</button><button data-v="16">≤ 16 GB</button><button data-v="8">≤ 8 GB</button><button data-v="4">≤ 4 GB</button></div>
      </div>
    </div>
    <div class="lt-chart"><canvas id="lt-chart" aria-label="Quality against speed for each model" role="img"></canvas></div>
  </section>

  <section class="lt-panel">
    <div class="lt-panel-head">
      <div>
        <h2 id="by-language">By language</h2>
        <p class="lt-sub">chrF for each language, best-translated first. Hover to compare the models at one language; click a model to show or hide it. * marks languages the app doesn't offer yet.</p>
      </div>
      <div class="lt-toolbar">
        <div class="lt-seg" id="lt-dir-lang"><button data-v="into" class="lt-on">Into English</button><button data-v="from">From English</button></div>
      </div>
    </div>
    <div class="lt-legend" id="lt-lang-legend"></div>
    <div class="lt-chart lt-chart-tall"><canvas id="lt-lang-chart" aria-label="Translation quality per language for each model" role="img"></canvas></div>
  </section>

  <section class="lt-panel">
    <div class="lt-panel-head">
      <div>
        <h2 id="all-results">All results</h2>
        <p class="lt-sub">Click a column to sort. Rings show chrF out of 100. Hover a row for notes.</p>
      </div>
    </div>
    <div class="lt-table-wrap"><table class="lt-table" id="lt-table"></table></div>
  </section>
</div>

## Notes

- :warning: in the table marks results measured before the benchmark converted Chinese output to the
  chosen script, as the app has done since 1.5.0. It only affects English → Chinese (part of the
  "From English" average), and mostly for models that write Simplified Chinese when asked for
  Traditional — like Hy-MT2-1.8B, whose Traditional Chinese subtitles still come out right in the app.
- MiLMMT (Xiaomi, Gemma licence) and Hy-MT2-30B-A3B write real colloquial Cantonese when asked;
  Hy-MT2-7B writes formal written Chinese, which is why Cantonese is a video language only.
- Hy-MT2 and MiLMMT get their own prompt format and sampling settings automatically
  ([Prompt templates](../guide/prompt-templates.md)); every other model gets general
  subtitle-translator instructions. Hybrid "thinking" models are asked not to reason, so they answer
  immediately.
- On AMD GPUs keep LM Studio's **Vulkan** runtime; set GPU offload to max and flash attention on.
- Older, informal tests: **Qwen2.5-7B-Instruct** Q8_0 (~0.40 s a line, 43 tok/s) made more literal
  mistakes; **Qwen3.8-27B** UD-Q3_K_XL (1.0–1.3 s, 18–25 tok/s) had good wording but left very little VRAM.

Raw results: [benchmarks.json](../data/benchmarks.json) · Test sentences: FLORES (CC BY-SA 4.0) and the
Pangeanic Cantonese–English corpus (CC BY 4.0) — see [Credits](../credits.md).
