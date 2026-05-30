import hljs from "highlight.js";

export const supportedLanguages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust",
  "sql",
  "html",
  "css",
  "json",
  "xml",
  "markdown",
  "plaintext",
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

const aliasToLanguageMap: Record<string, SupportedLanguage> = {
  js: "javascript",
  javascript: "javascript",
  jsx: "javascript",
  ts: "typescript",
  typescript: "typescript",
  tsx: "typescript",
  py: "python",
  python: "python",
  java: "java",
  "c++": "c++",
  cpp: "c++",
  cxx: "c++",
  cc: "c++",
  cs: "csharp",
  csharp: "csharp",
  php: "php",
  rb: "ruby",
  ruby: "ruby",
  go: "go",
  golang: "go",
  rs: "rust",
  rust: "rust",
  sql: "sql",
  postgres: "sql",
  postgresql: "sql",
  pgsql: "sql",
  html: "html",
  xml: "xml",
  css: "css",
  json: "json",
  md: "markdown",
  markdown: "markdown",
  txt: "plaintext",
  text: "plaintext",
  plaintext: "plaintext",
};

const languageToFileExtensionMap: Record<SupportedLanguage, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  "c++": "cpp",
  csharp: "cs",
  php: "php",
  ruby: "rb",
  go: "go",
  rust: "rs",
  sql: "sql",
  html: "html",
  css: "css",
  json: "json",
  xml: "xml",
  markdown: "md",
  plaintext: "txt",
};

const languageToHljsMap: Record<SupportedLanguage, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  "c++": "cpp",
  csharp: "csharp",
  php: "php",
  ruby: "ruby",
  go: "go",
  rust: "rust",
  sql: "sql",
  html: "xml",
  css: "css",
  json: "json",
  xml: "xml",
  markdown: "markdown",
  plaintext: "plaintext",
};

export function normalizeLanguage(input: string): SupportedLanguage {
  const key = input.trim().toLowerCase();
  return aliasToLanguageMap[key] ?? "plaintext";
}

export function getLanguageFileExtension(input: string) {
  const normalized = normalizeLanguage(input);
  return languageToFileExtensionMap[normalized];
}

export function getHljsLanguage(input: string) {
  const raw = input.trim().toLowerCase();
  if (raw && hljs.getLanguage(raw)) {
    return raw;
  }

  const normalized = normalizeLanguage(input);
  return languageToHljsMap[normalized];
}

function looksLikeMarkdown(content: string) {
  const trimmed = content.trim();
  return (
    /^#{1,6}\s+\S/m.test(trimmed) ||
    /^[-*+]\s+\S/m.test(trimmed) ||
    /^\d+\.\s+\S/m.test(trimmed) ||
    /```[\s\S]*```/m.test(trimmed) ||
    /\[[^\]]+\]\([^)]+\)/m.test(trimmed)
  );
}

export function detectLanguageFromContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return "plaintext";
  }

  if (looksLikeMarkdown(trimmed)) {
    return "markdown";
  }

  const detected = hljs.highlightAuto(trimmed);
  if (!detected.language) {
    return "plaintext";
  }

  return detected.language;
}

export type LanguageOption = {
  value: string;
  label: string;
};

function toLanguageLabel(language: string) {
  if (language === "c") return "C";
  if (language === "cpp") return "Cpp";
  if (language === "csharp") return "Csharp";
  if (language === "fsharp") return "Fsharp";
  if (language === "javascript") return "Javascript";
  if (language === "typescript") return "Typescript";

  const cleaned = language.replace(/[._-]+/g, " ").trim();
  if (!cleaned) {
    return language;
  }

  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getAllLanguageOptions(): LanguageOption[] {
  const all = Array.from(new Set([...hljs.listLanguages(), "plaintext"]));

  return all
    .sort((a, b) => a.localeCompare(b))
    .map((language) => ({
      value: language,
      label: toLanguageLabel(language),
    }));
}

function hasHighlightTokens(html: string) {
  return /class="hljs-[^"]+"/.test(html);
}

export function highlightCode(content: string, languageInput: string) {
  const hljsLanguage = getHljsLanguage(languageInput);

  if (!content.trim()) {
    return "";
  }

  try {
    if (hljsLanguage !== "plaintext") {
      const result = hljs.highlight(content, {
        language: hljsLanguage,
        ignoreIllegals: true,
      }).value;

      if (hasHighlightTokens(result)) {
        return result;
      }
    }
  } catch {
    // fall back to auto detect below
  }

  try {
    return hljs.highlightAuto(content).value;
  } catch {
    return content;
  }
}
