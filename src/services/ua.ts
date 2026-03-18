import { UAParser } from "ua-parser-js";

export interface ParsedUA {
  browser: string | null;
  os: string | null;
  device: string | null;
}

export function parseUA(uaString: string | null): ParsedUA {
  if (!uaString) return { browser: null, os: null, device: null };

  try {
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    const browser = result.browser.name
      ? `${result.browser.name}${result.browser.version ? ` ${result.browser.version}` : ""}`
      : null;

    const os = result.os.name
      ? `${result.os.name}${result.os.version ? ` ${result.os.version}` : ""}`
      : null;

    const deviceType = result.device.type || "desktop";

    return { browser, os, device: deviceType };
  } catch {
    return { browser: null, os: null, device: null };
  }
}
