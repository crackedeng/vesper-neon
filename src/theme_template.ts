(function () {
  console.log("🌟 VESPER NEON THEME: Script started loading");
  
  const tokenReplacements: { [key: string]: string } = {
    de92b8:
    "color: #f9efe9; text-shadow: 0 0 2px #171200, 0 0 3px #ff46a2[NEON_BRIGHTNESS], 0 0 5px #ff46a2[NEON_BRIGHTNESS], 0 0 8px #ff46a2[NEON_BRIGHTNESS];",
  };

  console.log("🔧 VESPER NEON THEME: Token replacements defined:", tokenReplacements);

  const themeStylesExist = (
    tokensEl: HTMLElement,
    replacements: { [key: string]: string }
  ): boolean => {
    const hasText = tokensEl.innerText !== "";
    const hasColors = Object.keys(replacements).every((color) => {
      const includes = tokensEl.innerText.toLowerCase().includes(`#${color}`);
      console.log(`🎨 VESPER NEON THEME: Checking for color #${color}:`, includes);
      return includes;
    });
    
    console.log("📊 VESPER NEON THEME: Theme styles exist check:", { hasText, hasColors, result: hasText && hasColors });
    return hasText && hasColors;
  };

  const replaceTokens = (
    styles: string,
    replacements: { [key: string]: string }
  ): string => {
    console.log("🔄 VESPER NEON THEME: Starting token replacement");
    console.log("📝 VESPER NEON THEME: Original styles length:", styles.length);
    
    const result = Object.keys(replacements).reduce((acc, color) => {
      const re = new RegExp(`color: #${color};`, "gi");
      const matches = acc.match(re);
      console.log(`🎯 VESPER NEON THEME: Replacing color #${color}, found ${matches ? matches.length : 0} matches`);
      return acc.replace(re, replacements[color]);
    }, styles);
    
    console.log("📝 VESPER NEON THEME: Final styles length:", result.length);
    console.log("✅ VESPER NEON THEME: Token replacement completed");
    return result;
  };

  const usingVesperNeon = (): boolean => {
    const appliedTheme = document.querySelector('[class*="theme-json"]');
    const vesperNeonTheme = document.querySelector(
      '[class*="vesper-neon-themes"]'
    );
    
    console.log("🔍 VESPER NEON THEME: Theme detection:");
    console.log("  - Applied theme element:", !!appliedTheme, appliedTheme?.className);
    console.log("  - Vesper neon theme element:", !!vesperNeonTheme, vesperNeonTheme?.className);
    
    const result = !!appliedTheme && !!vesperNeonTheme;
    console.log("🎯 VESPER NEON THEME: Using Vesper Neon:", result);
    return result;
  };

  const readyForReplacement = (
    tokensEl: HTMLElement | null,
    tokenReplacements: { [key: string]: string }
  ): boolean => {
    console.log("🔍 VESPER NEON THEME: Checking if ready for replacement");
    console.log("  - Tokens element exists:", !!tokensEl);
    
    if (!tokensEl) {
      console.log("❌ VESPER NEON THEME: No tokens element found");
      return false;
    }
    
    const vesperNeonActive = usingVesperNeon();
    const stylesExist = themeStylesExist(tokensEl, tokenReplacements);
    
    const result = vesperNeonActive && stylesExist;
    console.log("📊 VESPER NEON THEME: Ready for replacement:", result);
    return result;
  };

  const initNeonDreams = (
    disableGlow: boolean | string,
    obs: MutationObserver | null
  ) => {
    console.log("🚀 VESPER NEON THEME: Initializing Neon Dreams");
    console.log("⚙️ VESPER NEON THEME: Disable glow setting:", disableGlow);
    
    const tokensEl = document.querySelector<HTMLElement>(
      '.vscode-tokens-styles'
    );

    console.log("🔍 VESPER NEON THEME: Tokens element found:", !!tokensEl);
    if (tokensEl) {
      console.log("📊 VESPER NEON THEME: Tokens element text length:", tokensEl.innerText.length);
      console.log("📝 VESPER NEON THEME: First 200 chars of tokens:", tokensEl.innerText.substring(0, 200));
    }

    if (!tokensEl || !readyForReplacement(tokensEl, tokenReplacements)) {
      console.log("⏳ VESPER NEON THEME: Not ready for replacement, exiting");
      return;
    }

    console.log("✅ VESPER NEON THEME: Ready to apply neon effects!");
    const initialThemeStyles = tokensEl.innerText;

    let updatedThemeStyles = !disableGlow
      ? replaceTokens(initialThemeStyles, tokenReplacements)
      : initialThemeStyles;

    console.log("🎨 VESPER NEON THEME: Glow applied:", !disableGlow);
    
    updatedThemeStyles = `${updatedThemeStyles}[CHROME_STYLES]`;

    console.log("🔧 VESPER NEON THEME: Creating new style tag");
    const newStyleTag = document.createElement("style");
    newStyleTag.setAttribute("id", "vesper-neon-theme-styles");
    newStyleTag.innerText = updatedThemeStyles.replace(/(\r\n|\n|\r)/gm, "");
    
    // Check if style tag already exists
    const existingStyle = document.getElementById("vesper-neon-theme-styles");
    if (existingStyle) {
      console.log("🔄 VESPER NEON THEME: Removing existing style tag");
      existingStyle.remove();
    }
    
    document.body.appendChild(newStyleTag);
    console.log("✅ VESPER NEON THEME: Style tag added to document");
    console.log("📊 VESPER NEON THEME: Final style content length:", newStyleTag.innerText.length);

    console.log("🎉 VESPER NEON THEME: NEON DREAMS initialised!");

    if (obs) {
      console.log("🔄 VESPER NEON THEME: Disconnecting observer");
      obs.disconnect();
      obs = null;
    }
  };

  const watchForBootstrap = function(mutationsList: any, observer: any) {
    for(let mutation of mutationsList) {
      if (mutation.type === 'attributes' || mutation.type === 'childList') {
        // does the style div exist yet?
        const tokensEl = document.querySelector<HTMLElement>('.vscode-tokens-styles');
        if (readyForReplacement(tokensEl, tokenReplacements)) {
          // If everything we need is ready, then initialise
          initNeonDreams("[DISABLE GLOW]", observer);
        } else {
          if (tokensEl) {
            // sometimes VS code takes a while to init the styles content, so if there stop this observer and add an observer for that
            observer.disconnect();
            observer.observe(tokensEl, { childList: true });
          }
        }
      }
    }
  };

  const bodyNode = document.querySelector('body');
  // Use a mutation observer to check when we can bootstrap the theme
  const observer = new MutationObserver(watchForBootstrap);
  /* watch for both attribute and childList changes because, depending on 
  the VS code version, the mutations might happen on the body, or they might 
  happen on a nested div */
  observer.observe(bodyNode!, { attributes: true, childList: true });
  console.log("🎯 VESPER NEON THEME: Script setup completed");
})();
