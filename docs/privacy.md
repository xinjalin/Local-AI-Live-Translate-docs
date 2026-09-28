# Privacy

**Speech recognition and translation run on your PC.** Nothing is sent online unless you turn on
**Cloud AI providers** and pick an online provider as the LLM server.

- **No online fallback.** If the local model can't be reached, a line is shown untranslated; it isn't
  sent anywhere else.
- **With an online provider picked**, the recognised text of each line (with the previous lines as
  context) — or, with a Qwen LiveTranslate model, the tab's audio — is sent to that provider under its
  terms. The popup's footer says *Cloud AI providers on* while the setting is on. See
  [Cloud providers & API keys](guide/cloud-providers.md), including how API keys are kept and cleared.
- **The app server only accepts the extension.** It listens on your PC only (`127.0.0.1`), and refuses
  connections from web pages, so a site open in your browser can't use it or read what it reports.
- **Transcripts** are off by default. When you turn them on, they're saved as files in the app's
  `transcripts/` folder on your PC — nowhere else.
- **Profiles and exports** never contain API keys.
- **Model downloads for imported profiles:** *Find and download* looks a model up on Hugging Face by its
  name, publisher and quantization — only those are sent, and only when you press the button.
