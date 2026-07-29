type DocumentPictureInPictureWindowOptions = {
  width?: number;
  height?: number;
  disallowReturnToOpener?: boolean;
  preferInitialWindowPlacement?: boolean;
};

type DocumentPictureInPicture = {
  requestWindow: (options?: DocumentPictureInPictureWindowOptions) => Promise<Window>;
  window: Window | null;
};

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

export const INCIDENT_PIP_WIDTH = 420;
export const INCIDENT_PIP_HEIGHT = 720;

export function isDocumentPipSupported() {
  return typeof window !== "undefined" && "documentPictureInPicture" in window;
}

export async function openIncidentPipWindow() {
  if (!isDocumentPipSupported()) {
    throw new Error("Document Picture-in-Picture is not supported.");
  }

  const pipWindow = await window.documentPictureInPicture!.requestWindow({
    width: INCIDENT_PIP_WIDTH,
    height: INCIDENT_PIP_HEIGHT,
    disallowReturnToOpener: true,
    preferInitialWindowPlacement: true,
  });

  preparePipDocument(pipWindow);
  return pipWindow;
}

export function preparePipDocument(pipWindow: Window) {
  copyStylesToWindow(pipWindow);

  pipWindow.document.documentElement.style.height = "100%";
  pipWindow.document.body.style.margin = "0";
  pipWindow.document.body.style.height = "100%";
  pipWindow.document.body.style.overflow = "hidden";
  pipWindow.document.body.style.background = "var(--background, #fff)";
}

export function copyStylesToWindow(targetWindow: Window) {
  const targetDoc = targetWindow.document;

  document.querySelectorAll('link[rel="stylesheet"]').forEach((node) => {
    const link = node as HTMLLinkElement;
    if (!link.href) return;
    const clone = targetDoc.createElement("link");
    clone.rel = "stylesheet";
    clone.href = link.href;
    targetDoc.head.appendChild(clone);
  });

  [...document.styleSheets].forEach((sheet) => {
    try {
      const cssText = [...sheet.cssRules].map((rule) => rule.cssText).join("\n");
      if (!cssText) return;
      const style = targetDoc.createElement("style");
      style.textContent = cssText;
      targetDoc.head.appendChild(style);
    } catch {
      if (sheet.href) {
        const clone = targetDoc.createElement("link");
        clone.rel = "stylesheet";
        clone.href = sheet.href;
        targetDoc.head.appendChild(clone);
      }
    }
  });
}

export function watchIncidentPipClosed(pipWindow: Window, onClosed: () => void) {
  pipWindow.addEventListener(
    "pagehide",
    () => {
      onClosed();
    },
    { once: true },
  );
}
