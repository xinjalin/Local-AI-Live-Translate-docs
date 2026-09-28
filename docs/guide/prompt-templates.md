# Prompt templates

A prompt template decides how each subtitle line is put to the translation model. Some models
translate far better with their own prompt format: Tencent Hy-MT, for example, and Xiaomi MiLMMT,
which doesn't translate at all with a general "you are a translator" prompt.

Pick one on the **Model** tab (**Prompt Template**), or leave it on **Auto** to choose by the model's
name. The choice is saved with [profiles](profiles.md) and exported with them. Chinese subtitles are
always converted to the chosen script (Traditional or Simplified), whatever the model writes.

## The app's templates

They're the three files in the app's `templates/` folder:

| File | Template | Used automatically for | What it sends |
|---|---|---|---|
| `generic.json` | **General** | any other model | subtitle-translator instructions as a system prompt, with the earlier lines as conversation history |
| `hy-mt.json` | **Hy-MT (Tencent)** | models whose name contains `hy-mt`, `hymt` or `hunyuan-mt` | Tencent's official templates and sampling |
| `milmmt.json` | **MiLMMT (Xiaomi)** | models whose name contains `milmmt` | `Translate this from Japanese to English:` / `Japanese: …` / `English:`, greedy |

You can edit them: the server uses the changed file from the next subtitle line on. If one of them is
deleted or can't be read, the server falls back to its built-in copy of the original (and says so in
its window), so translation keeps working. To undo your edits, delete the file and restore it from
the release zip or with `git checkout templates/<file>`.

## Adding your own

Put a `.json` file in the `templates/` folder. The file name (without `.json`) is the template's id,
so use letters, digits, `-`, `.` or `_` (not `auto`, and not the three names above unless you mean to
replace those). Files starting with `_` are ignored, like `_example.json`: copy it to a new name to
start. The server picks up new or changed files by itself; reopen the popup to see them in the menu.

```json
{
  "name": "Formal English (Qwen)",
  "description": "Polite, formal wording",
  "match": ["qwen3.8"],
  "system": "Translate each subtitle line into formal, polite {target}. Output only the translation.{target_rules}",
  "user": "{text}",
  "history": true,
  "sampling": { "temperature": 0.2 }
}
```

| Field | Required | Meaning |
|---|---|---|
| `user` | yes | The message with the subtitle line; must contain `{text}` |
| `system` | no | A system prompt, sent first |
| `user_with_context` | no | Used instead of `user` when there are earlier lines; must contain `{text}` and `{context}` |
| `history` | no | `true` sends the earlier lines and their translations as a conversation (user / assistant turns) before the new line |
| `match` | no | Words that make **Auto** pick this template when the model's name contains one (your templates are checked before the built-in ones) |
| `sampling` | no | Any of `temperature`, `top_p`, `top_k`, `min_p`, `repeat_penalty`, `presence_penalty`, `frequency_penalty` |
| `name`, `description` | no | Shown in the menu |

Placeholders, filled in for each line:

| Placeholder | Becomes |
|---|---|
| `{text}` | the subtitle line to translate |
| `{target}` | the subtitle language, e.g. `Traditional Chinese` |
| `{source}` | the speech language when known, e.g. `Japanese`, else `the original language` |
| `{context}` | the earlier lines, one per line as `original => translation` (empty when there are none) |
| `{target_rules}` | extra rules for some subtitle languages (Traditional Chinese: Taiwan usage only), else empty |

Any other text in braces is sent as it is. A file that can't be read, or that breaks one of these
rules, is skipped with a message in the server window saying why.
