# Tuning

The **Tuning** tab adjusts how speech is cut into lines and how long subtitles stay up.

## Speech detection

- **Speech Detection Threshold** — lower picks up quiet voices; raise it (0.5–0.7) for videos with
  music or background noise under the voice.
- **Silence Threshold** — how long the server waits after speech stops before sending a line;
  0.3–0.4 s feels snappier than 0.5 s. It's most of the "pause detection" time in the
  [latency breakdown](live-captions.md#speed-and-latency).
- **Max Speech Duration** — force-splits long monologues into several lines.
- **Speaker Separation** (shown while [Label speakers](live-captions.md#label-speakers) is on) — how
  different two voices must be to count as two people.

These are saved with [profiles](profiles.md).

## Subtitle timing

- **Extra Time On Screen** and **Minimum Display Time** — how long each line stays up.

These are saved with [display configs](profiles.md#display-configs).
