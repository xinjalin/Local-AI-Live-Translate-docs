# Troubleshooting

??? question "The popup says the Local AI Live Translate server is not running"
    Start `START_Local_AI_Live_Translate.bat` and leave its window open. The popup checks the server at
    `http://127.0.0.1:8000`; if something else uses port 8000, close it first.

??? question "No models are listed on the Model tab"
    Start LM Studio's server: LM Studio → **Developer** tab → start the server. The popup expects it at
    `http://127.0.0.1:1234` (change **LM Studio Server URL** on the Model tab if yours differs), and
    lists the models you've downloaded in LM Studio.

??? question "Subtitles show the original text, untranslated"
    The translation model couldn't be reached or didn't answer. Check that LM Studio's server is running
    and a model is loaded (the Model tab shows its state). There is no online fallback: until the model
    answers, lines are shown as they were recognised.

??? question "Subtitles are slow"
    Hover over the round-trip time on the status card to see which step takes the time
    ([Live captions](guide/live-captions.md#speed-and-latency)):

    - **Pause detection** — lower the Silence Threshold on the [Tuning](guide/tuning.md) tab.
    - **LLM translation** — a model that doesn't fit in your GPU's memory is much slower; see
      [Translation models](models/index.md) for smaller ones. On AMD GPUs keep LM Studio's Vulkan
      runtime, GPU offload at max and flash attention on.
    - **Speech recognition** — Whisper-Small is the slowest engine; see [Speech engines](models/speech-engines.md).

??? question "Words are misheard, or a language isn't recognised"
    Set the video language instead of *Auto Detect*: SenseVoice's automatic detection only knows
    Chinese, Cantonese, English, Japanese and Korean. For noisy videos, raise the Speech Detection Threshold
    ([Tuning](guide/tuning.md)).

??? question "Two people get the same speaker number (or one person gets two)"
    Adjust **Speaker Separation** on the Tuning tab: raise it if two people share a number, lower it if
    one person is split in two. See [Label speakers](guide/live-captions.md#label-speakers).

??? question "A ⚠ line appears in the subtitles"
    It's an online provider's error — for example a wrong API key, a used-up quota or an unknown model
    name. See [Cloud providers](guide/cloud-providers.md).

??? question "The app won't start after unzipping"
    Unzip it to a folder with a short path, such as `C:\LocalAI\`: Windows limits file paths to 260
    characters, and a very deep folder can stop Python from loading.

Still stuck? [Open an issue](https://github.com/xinjalin/Local-AI-Live-Translate/issues) with the
server window's messages (leave out anything private).
