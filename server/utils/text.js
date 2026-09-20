// Small dependency-free helpers (kept separate so they are easy to unit-test).

/** Escape user input before using it inside a RegExp. */
export const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Parse a query-string integer and keep it inside [min, max]. */
export const clampInt = (value, fallback, min, max) => {
    const n = Number.parseInt(value, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(Math.max(n, min), max);
};

export const USERNAME_RE = /^[a-z0-9_.]{3,30}$/;

/** Turn arbitrary text ("Jane.Doe+work") into something that satisfies USERNAME_RE, or "" if impossible. */
export const slugifyUsername = (raw) =>
    String(raw || "")
        .toLowerCase()
        .replace(/[^a-z0-9_.]/g, "")
        .slice(0, 24);

/** Trim and collapse a value into a string of at most `max` characters. */
export const cleanText = (value, max) => String(value ?? "").trim().slice(0, max);
