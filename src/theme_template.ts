
(function () {
  const tokenReplacements: { [key: string]: string } = {
    ffc799:
      "color: #f9efe9; text-shadow: 0 0 2px #171200, 0 0 3px #ff7c29[NEON_BRIGHTNESS], 0 0 5px #ff7c29[NEON_BRIGHTNESS], 0 0 8px #ff7c29[NEON_BRIGHTNESS];",
  };

  const themeStylesExist = (
    tokensEl: HTMLElement,
    replacements: { [key: string]: string }
  ): boolean => {
    return (
      tokensEl.innerText !== "" &&
      Object.keys(replacements).every((color) => {
        return tokensEl.innerText.toLowerCase().includes(`#${color}`);
      })
    );
  };

  const replaceTokens = (
    styles: string,
    replacements: { [key: string]: string }
  ): string =>
    Object.keys(replacements).reduce((acc, color) => {
      const re = new RegExp(`color: #${color};`, "gi");
      return acc.replace(re, replacements[color]);
    }, styles);

  const usingSynthwave = (): boolean => {
    const appliedTheme = document.querySelector('[class*="theme-json"]');
    const synthWaveTheme = document.querySelector(
      '[class*="vesper-neon-themes"]'
    );
    return !!appliedTheme && !!synthWaveTheme;
  };

  const readyForReplacement = (
    tokensEl: HTMLElement | null,
    tokenReplacements: { [key: string]: string }
  ): boolean =>
    tokensEl
      ? usingSynthwave() && themeStylesExist(tokensEl, tokenReplacements)
      : false;

  const initNeonDreams = (
    disableGlow: boolean | string,
    obs: MutationObserver | null
  ) => {
    const tokensEl = document.querySelector<HTMLElement>(
      ".vscode-tokens-styles"
    );

    if (!tokensEl || !readyForReplacement(tokensEl, tokenReplacements)) {
      return;
    }

    const initialThemeStyles = tokensEl.innerText;

    let updatedThemeStyles = !disableGlow
      ? replaceTokens(initialThemeStyles, tokenReplacements)
      : initialThemeStyles;

    updatedThemeStyles = `${updatedThemeStyles}[CHROME_STYLES]`;

    const newStyleTag = document.createElement("style");
    newStyleTag.setAttribute("id", "synthwave-84-theme-styles");
    newStyleTag.innerText = updatedThemeStyles.replace(/(\r\n|\n|\r)/gm, "");
    document.body.appendChild(newStyleTag);

    console.log("Vesper neom: NEON DREAMS initialised!");

    if (obs) {
      obs.disconnect();
      obs = null;
    }
  };

  const watchForBootstrap = function (
    mutationsList: MutationRecord[],
    observer: MutationObserver
  ) {
    for (let mutation of mutationsList) {
      if (mutation.type === "attributes") {
        const tokensEl = document.querySelector<HTMLElement>(
          ".vscode-tokens-styles"
        );
        if (readyForReplacement(tokensEl, tokenReplacements)) {
          initNeonDreams("[DISABLE GLOW]", observer);
        } else {
          observer.disconnect();
          if (tokensEl) {
            observer.observe(tokensEl, { childList: true });
          }
        }
      }
      if (mutation.type === "childList") {
        const tokensEl = document.querySelector<HTMLElement>(
          ".vscode-tokens-styles"
        );
        if (readyForReplacement(tokensEl, tokenReplacements)) {
          initNeonDreams("[DISABLE GLOW]", observer);
        }
      }
    }
  };

  initNeonDreams("[DISABLE GLOW]", null);
  const bodyNode = document.querySelector("body");
  if (bodyNode) {
    const observer = new MutationObserver(watchForBootstrap);
    observer.observe(bodyNode, { attributes: true });
  }
})();
