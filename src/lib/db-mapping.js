// camelCase ↔ snake_case conversion for Supabase rows

function toSnakeKey(k) {
  return k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function toCamelKey(k) {
  return k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function toSnake(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[toSnakeKey(k)] = v;
  }
  return out;
}

export function toCamel(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[toCamelKey(k)] = v;
  }
  return out;
}

export function rowsToCamel(rows) {
  return rows.map(toCamel);
}
