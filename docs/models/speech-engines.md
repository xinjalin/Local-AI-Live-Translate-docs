# Speech engines

Speech is recognised on your PC's CPU by one of four engines. Pick one on the **Live** tab; if it
can't recognise the video language, the server switches to the best one that can, and the popup says so.

| Engine | Recognises | Speed (per line) | Used automatically for |
|---|---|---|---|
| **SenseVoice** | Chinese, Cantonese, English, Japanese, Korean | ~0.1 s | The default; best for these |
| **Dolphin** (small) | 40 Asian languages | ~0.2–0.7 s | Indonesian, Vietnamese, Thai, Malay, Filipino |
| **Omnilingual** (Meta, 300M) | 1,600+ languages | ~0.3–0.8 s | Hindi, Bengali, Arabic, Portuguese, Italian, Dutch, Ukrainian, Polish, Turkish |
| **Whisper-Small** | 99 languages | ~1.5–4 s | Everything else (Spanish, French, German, Russian, …) |

Fallbacks: Dolphin for Hindi, Bengali and Arabic; Whisper-Small for the European languages and Turkish.

!!! tip "Set the video language"
    Set the video language rather than *Auto Detect* for languages SenseVoice doesn't know: its
    auto-detect only knows its five.

## Accuracy

Measured on Google FLEURS recordings. WER is the share of words recognised wrongly (CER: characters),
so lower is better.

### South-East Asian languages

| Language | Dolphin small | Whisper-Small |
|---|---|---|
| Indonesian | 18.4 % WER | 18.0 % WER |
| Vietnamese | 10.3 % WER | 10.8 % WER |
| Malay | 9.9 % WER | 12.6 % WER |
| Filipino | 28.8 % WER | 35.3 % WER |
| Thai (per character) | 9.9 % CER | 49.3 % CER |

Dolphin is also ~9× faster: a full subtitle into English took 1.1–1.8 s, against 2.8–5.3 s with
Whisper-Small.

### Hindi and Arabic

| Language | Omnilingual | Dolphin small | Whisper-Small |
|---|---|---|---|
| Hindi | 6.1 % WER | 14.3 % WER | 79 % WER (unusable) |
| Arabic | 15.8 % WER | 19.4 % WER | 25.5 % WER |

Hy-MT2-7B translates both well (chrF into English 65 / 66). The Arabic test is Modern Standard
Arabic; dialects (Egyptian, Gulf, …) are untested.

### Newer languages

10 FLEURS recordings each. The last column shows how much of the translation survives recognition
errors: chrF into English with Hy-MT2-7B, from the recognised speech against a perfect transcript.

| Language | Engine | Errors (word / character) | Into English (from speech / perfect transcript) |
|---|---|---|---|
| Cantonese | SenseVoice | 4.7 % CER (Dolphin 12.0 %) | 56 / 55 |
| Portuguese | Omnilingual | 14.3 % / 4.0 % | 65 / 71 |
| Italian | Omnilingual | 13.4 % / 1.7 % | 56 / 62 |
| Dutch | Omnilingual | 22.7 % / 7.1 % | 55 / 66 |
| Ukrainian | Omnilingual | 25.7 % / 4.6 % | 55 / 60 |
| Polish | Omnilingual | 24.9 % / 4.1 % | 52 / 54 |
| Turkish | Omnilingual | 22.2 % / 4.0 % | 62 / 67 |
| Bengali | Omnilingual | 15.5 % / 7.2 % (Dolphin 32 %, Whisper 100 %) | 54 / 57 |

Omnilingual writes no punctuation or capitals in the original-language line (the translation is
unaffected). Whisper-Small is a little more accurate for Italian and Dutch (61 / 62 into English) but
adds 1–2 s per line; pick it on the Live tab if accuracy matters more than delay there.
Urdu isn't offered yet: no engine recognises it well in Urdu script.
