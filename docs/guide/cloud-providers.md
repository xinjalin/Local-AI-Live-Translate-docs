# Cloud providers & API keys

Everything runs on your PC by default. Online AI providers are an option you turn on yourself.

## Turning them on

Turn on **Cloud AI providers** at the top of the **Model** tab. Before it turns on, it explains what
that means: while an online provider is the LLM server, the text of everything captured is sent to
it, handled under its privacy terms and billed to your API key. The popup's footer says
*Cloud AI providers on* while the setting is on.

Once on, the **LLM Server** menu also lists:

- **Qwen Cloud**
- **OpenAI**
- **Anthropic Claude**
- **DeepSeek**
- **Google Gemini**
- **xAI Grok**

Turned off, they disappear from the menu and translation goes back to LM Studio.

## Using one

1. Pick the provider under **LLM Server**.
2. Paste your API key (the *Get a key* link opens the provider's key page). It's saved when you leave
   the field, and the field is emptied.
3. Choose a **Model**: the menu lists the models on your account and has a search box; to use a model
   the list doesn't show, type its name and pick **Use "…"**.

Speech is still recognised on your PC; only the text of each line (with the previous lines as context)
goes to the provider. A wrong key, a used-up quota or another provider error shows as a ⚠ line in the
subtitles. [Profiles](profiles.md) remember the provider and model (never the key); a profile with an
online provider uses LM Studio while cloud providers are off, and says so.

## Your API keys

- **Where they're kept:** the extension's own private storage, in your browser on your PC. Web pages
  can't read it, and neither can the extension's script inside them.
- **Where they're sent:** only to their own provider — through the app server on your PC, which sends a
  key only to that provider's official HTTPS address.
- **What you see:** the popup never shows a saved key, only its last four characters.
- **Where they never appear:** profiles, exports, transcripts or the server's log.
- **Deleting them:** **Saved API Keys** (Model tab) lists them. Delete one, or press
  **Clear all API keys** twice. Uninstalling the extension also deletes them.

!!! warning "Shared PCs"
    Keys are stored the way browsers store extension data — not encrypted — so anyone who can use your
    Windows account could read them. Clear them on a shared PC.

## Qwen Cloud

Get a key at [home.qwencloud.com/api-keys](https://home.qwencloud.com/api-keys).

- **LiveTranslate models** (`qwen3.8-livetranslate-flash-realtime`, `qwen3.5-…`): the tab's **audio**
  is streamed to Qwen Cloud, which detects, recognises and translates the speech itself (simultaneous
  interpretation, 60 input languages; Qwen quotes ~2.3 s average lag). The subtitle grows as the
  translation streams in. Local speech recognition and LM Studio aren't used; speaker labels still
  work (they're computed on your PC). A subtitle language must be set. It's billed per second of
  audio, for as long as captions run.
- **Any other model** (e.g. `qwen-mt-flash`, `qwen-plus`): speech is recognised on your PC as usual and
  Qwen Cloud translates the text (Qwen-MT models get their translation options automatically).
- **Endpoint:** Qwen Cloud (`maas.qwencloudapi.com`, the default) or Alibaba Cloud Model Studio
  (International, US or China).
