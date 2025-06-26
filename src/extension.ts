import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";

interface IConfig {
  brightness: string;
  isGlowDisabled: boolean;
}

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("activating vesper neon");
  const config = parseVesperNeonConfig();
  console.log(config)
  const disposable = vscode.commands.registerCommand(
    "vesper-neon.enableNeon",
    () => enableGlow(config)
  );

  const disable = vscode.commands.registerCommand(
    "vesper-neon.disableNeon",
    uninstall
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disable);
}

export function uninstall() {
  const { htmlFile } = getWorkbenchFiles();
  const html = fs.readFileSync(htmlFile, "utf-8");
  const isEnabled = html.includes("neondreams.js");

  if (isEnabled) {
    let output = html.replace(
      /^.*(<!-- vesper neon --><script src="neondreams.js"><\/script><!-- NEON DREAMS -->).*\n?/gm,
      ""
    );
    fs.writeFileSync(htmlFile, output, "utf-8");

    vscode.window
      .showInformationMessage(
        "Neon Dreams disabled. VS code must reload for this change to take effect",
        { title: "Restart editor to complete" }
      )
      .then(function (msg) {
        vscode.commands.executeCommand("workbench.action.reloadWindow");
      });
  } else {
    vscode.window.showInformationMessage("Neon dreams isn't running.");
  }
}

function isVSCodeBelowVersion(version: any) {
	const vscodeVersion = vscode.version;
	const vscodeVersionArray = vscodeVersion.split('.').map(Number);
	const versionArray = version.split('.').map(Number);

	const len = Math.max(vscodeVersionArray.length, versionArray.length);
	
	for (let i = 0; i < len; i++) {
		const vscodePart = vscodeVersionArray[i] ?? 0;
		const versionPart = versionArray[i] ?? 0;

		if (vscodePart < versionPart) {
			return true;
		}
		if (vscodePart > versionPart) {
			return false;
		}
	}

	return false;
}


function parseVesperNeonConfig(): IConfig {
  const config = vscode.workspace.getConfiguration("vesper-neon");
  let isGlowDisabled: boolean =
    config && typeof config.disableGlow === "boolean"
      ? config.disableGlow
      : false;

  let brightness =
    parseFloat(config.brightness) > 1 ? 1 : parseFloat(config.brightness);
  brightness = brightness < 0 ? 0 : brightness;
  brightness = isNaN(brightness) ? 0.45 : brightness;

  const parsedBrightness = Math.floor(brightness * 255)
    .toString(16)
    .toUpperCase();

  return {
    brightness: parsedBrightness,
    isGlowDisabled,
  };
}

function getWorkbenchFiles() {
  const appDir = path.dirname(vscode.env.appRoot);
  const base = path.join(appDir, 'app', 'out', 'vs', 'code');
  const electronBase = isVSCodeBelowVersion("1.70.0") ? "electron-browser" : "electron-sandbox";
  const workBenchFilename = vscode.version == "1.94.0" ? "workbench.esm.html" : "workbench.html";

  const htmlFile = path.join(base, electronBase, "workbench", workBenchFilename);
  const templateFile = path.join(base, electronBase, "workbench", "neondreams.js");

  return { htmlFile, templateFile };
}

function enableGlow(config: IConfig) {
  const { htmlFile, templateFile } = getWorkbenchFiles();
  const { brightness, isGlowDisabled } = config;
  try {
    const chromeStyles = fs.readFileSync(
      __dirname + "/css/editor_chrome.css",
      "utf-8"
    );
    const jsTemplate = fs.readFileSync(
      __dirname + "/theme_template.js",
      "utf-8"
    );
    const themeWithGlow = jsTemplate.replace(
      /"\[DISABLE GLOW\]"/g,
      String(isGlowDisabled)
    );
    const themeWithChrome = themeWithGlow.replace(
      /\[CHROME_STYLES\]/g,
      chromeStyles
    );

    const finalTheme = themeWithChrome.replace(
      /\[NEON_BRIGHTNESS\]/g,
      brightness
    );
    fs.writeFileSync(templateFile, finalTheme, "utf-8");

    const html = fs.readFileSync(htmlFile, "utf-8");
    const isEnabled = html.includes("neondreams.js");
    if (!isEnabled) {
      let output = html.replace(
        /^.*(<!-- vesper neon --><script src="neondreams.js"><\/script><!-- NEON DREAMS -->).*\n?/gm,
        ""
      );
      output = html.replace(
        /\<\/html\>/g,
        `	<!-- vesper neon --><script src="neondreams.js"></script><!-- NEON DREAMS -->\n`
      );
      output += "</html>";

      fs.writeFileSync(htmlFile, output, "utf-8");

      vscode.window
        .showInformationMessage(
          "Neon Dreams enabled. VS code must reload for this change to take effect. Code may display a warning that it is corrupted, this is normal. You can dismiss this message by choosing 'Don't show this again' on the notification.",
          { title: "Restart editor to complete" }
        )
        .then(function (msg) {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        });
    }
  } catch (e: any) {
    console.error(e);
    if (/ENOENT|EACCES|EPERM/.test(e.code)) {
      vscode.window.showInformationMessage(
        "Neon Dreams was unable to modify the core VS code files needed to launch the extension. You may need to run VS code with admin privileges in order to enable Neon Dreams."
      );
      return;
    } else {
      vscode.window.showErrorMessage(
        "Something went wrong when starting neon dreams"
      );
      return;
    }
  }
}
