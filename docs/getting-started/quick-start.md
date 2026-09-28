# Quick start

1. **Start the server:** double-click `START_Local_AI_Live_Translate.bat`. Leave the window open;
   it shows each recognised and translated line.
2. **Start LM Studio's server:** open LM Studio → **Developer** tab → start the server
   (default `http://127.0.0.1:1234`).
3. **Install the extension (first time only):** open `chrome://extensions`, turn on
   **Developer mode**, click **Load unpacked** and select the `extension` folder.
4. **Open a video**, click the extension icon, pick your languages on the **Live** tab and a model on
   the **Model** tab, then press **Start Live Translate**.

Picking a model in the list loads it into LM Studio (and ejects any other loaded model); the ▶ / ⏏
button loads or ejects it manually. **Context Size** (4K / 8K / 16K) is applied when a model loads;
4K is plenty for subtitles.

!!! tip "Keyboard shortcut"
    ++alt+shift+l++ starts or stops live translation on the current tab without opening the popup.

Next: see what the status card tells you in [Live captions](../guide/live-captions.md), or save your
setup as a [profile](../guide/profiles.md).
