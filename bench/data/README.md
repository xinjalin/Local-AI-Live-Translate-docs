# Benchmark test data

These files are **not** under this repository's MIT License; each keeps its source's licence.

## flores_sentences.json

24 sentences per language, matched across languages by FLORES / FLEURS id, chosen for being about 18
words long in English: `{language: [{id, text, en}]}`, where `text` is the sentence in that language
and `en` the English one.

- Source: the FLORES sentences as published in [WueNLP/belebele-fleurs](https://huggingface.co/datasets/WueNLP/belebele-fleurs)
  (Cantonese from [google/fleurs](https://huggingface.co/datasets/google/fleurs), `yue_hant_hk`).
- Licence: [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
  (CC BY-SA 4.0). This file is a selection of those sentences and is shared under the same licence.

## cantonese_conversation.json

24 lines of colloquial Cantonese with English translations: `[{yue, en}]`.

- Source: Pangeanic's Cantonese–English parallel corpus.
- Licence: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/) (CC BY 4.0).
