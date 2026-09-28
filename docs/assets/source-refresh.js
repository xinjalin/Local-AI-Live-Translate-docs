// Material fetches the app's latest release, stars and forks from GitHub for the header once, then
// keeps them for the rest of the tab session, so a tab left open showed an old version after a
// release. Forget them after 15 minutes: the next page load fetches them again.
(function () {
  const MAX_AGE = 15 * 60 * 1000;
  const STAMP = 'lt-source-at';
  try {
    const key = Object.keys(sessionStorage).find(k => k.endsWith('.__source'));
    const at = Number(sessionStorage.getItem(STAMP));
    if (!key) {
      sessionStorage.setItem(STAMP, String(Date.now()));   // being fetched on this load
    } else if (!at || Date.now() - at > MAX_AGE) {
      sessionStorage.removeItem(key);
      sessionStorage.setItem(STAMP, String(Date.now()));
    }
  } catch (e) {
    // Storage blocked: Material fetches on every load anyway
  }
})();
