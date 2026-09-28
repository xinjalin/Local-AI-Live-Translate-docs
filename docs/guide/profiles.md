# Profiles & import/export

## Profiles

**Profiles** (top of the Live tab) save the translation setup under a name (e.g. "Anime JP → EN"):
the LLM server and address, model, context size, prompt template, video and translation languages,
speech engine, bilingual mode, speaker labels, and the speech detection tuning (detection threshold,
silence threshold, max speech duration, speaker separation).

Switch between them from the menu: choosing a profile applies it at once and loads its model into LM
Studio. API keys are never stored in profiles.

## Display configs

**Display configs** (Display tab) save the subtitle look, layout and timing (the *Subtitle Timing*
settings on the Tuning tab) and the popup's theme — with your Custom theme's colours — separately from
profiles, so any profile can be combined with any display style. Display configs saved before 1.6.0
don't include a theme and leave it as it is.

## Buttons

Both panels have the same controls:

- **+** saves the current settings as a new config;
- **✓** updates the selected config after you've changed something (the panel says when it differs);
- the bin deletes it — press twice: the first press says so, with a countdown line.

## Export and import

*Export* (under each panel) saves all your profiles (or display configs) to a `.json` file to back up
or share.

*Import* opens a page in a new tab (a file picker would close the popup), where you choose the file,
see what's in it and tick what to add. Imported configs are added next to yours (a name that's taken
gets " (2)"), and nothing you have is changed. Every value is checked before it's saved, and the page
warns if a profile points to an LLM server on another computer or uses an online provider.

## Profiles whose model you don't have

The import page shows each profile's model as installed or missing, and offers to download missing
ones through LM Studio (with the size). You can click *Later* — the profile is imported anyway.

When you choose such a profile, the model you were using keeps translating, the panel says the model
isn't installed, and the Model tab offers the download with a progress bar. Downloads keep running in
LM Studio when the popup closes; once finished, the profile's model is selected and loaded
automatically.

Exported profiles record where their model comes from (LM Studio catalog or Hugging Face repo, read by
the app server) and who published it. When the source isn't known (exported while the app server was
off, or by an older version), **Find and download** looks the model up on Hugging Face by its name,
publisher and quantization — only those are sent, and only when you press the button.
