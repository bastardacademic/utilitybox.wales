/**
 * JSON <-> XML conversion. Parsing uses the browser's native DOMParser (no hand-rolled
 * XML parser needed); serialization is hand-built string output. Attributes become
 * "@name" keys, text content becomes a "#text" key, and repeated child tags become an array
 * — a common, if not universal, JSON/XML convention.
 */

export class XmlError extends Error {}

function xmlElementToJson(el: Element): unknown {
  const attributes: Record<string, unknown> = {};
  for (const attr of Array.from(el.attributes)) {
    attributes['@' + attr.name] = attr.value;
  }

  const childElements = Array.from(el.children);
  const textContent = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent ?? '')
    .join('')
    .trim();

  if (childElements.length === 0) {
    if (Object.keys(attributes).length === 0) return textContent;
    const leaf: Record<string, unknown> = { ...attributes };
    if (textContent) leaf['#text'] = textContent;
    return leaf;
  }

  const result: Record<string, unknown> = { ...attributes };
  for (const child of childElements) {
    const childValue = xmlElementToJson(child);
    const name = child.tagName;
    if (name in result) {
      const existing = result[name];
      result[name] = Array.isArray(existing) ? [...existing, childValue] : [existing, childValue];
    } else {
      result[name] = childValue;
    }
  }
  if (textContent) result['#text'] = textContent;
  return result;
}

export function parseXml(text: string): unknown {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new XmlError('Invalid XML — could not parse.');
  }
  const root = doc.documentElement;
  return { [root.tagName]: xmlElementToJson(root) };
}

function escapeXmlText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeXmlAttr(s: string): string {
  return escapeXmlText(s).replace(/"/g, '&quot;');
}

function jsonValueToXml(value: unknown, tagName: string, indent: number): string {
  const pad = '  '.repeat(indent);

  if (Array.isArray(value)) {
    return value.map((item) => jsonValueToXml(item, tagName, indent)).join('\n');
  }

  if (value !== null && typeof value === 'object') {
    const attrParts: string[] = [];
    const childParts: string[] = [];
    let text = '';
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith('@')) attrParts.push(`${key.slice(1)}="${escapeXmlAttr(String(v))}"`);
      else if (key === '#text') text = String(v);
      else childParts.push(jsonValueToXml(v, key, indent + 1));
    }
    const attrStr = attrParts.length ? ' ' + attrParts.join(' ') : '';
    if (childParts.length === 0 && !text) return `${pad}<${tagName}${attrStr} />`;
    if (childParts.length === 0) return `${pad}<${tagName}${attrStr}>${escapeXmlText(text)}</${tagName}>`;
    return `${pad}<${tagName}${attrStr}>\n${childParts.join('\n')}\n${pad}</${tagName}>`;
  }

  const text = value === null || value === undefined ? '' : escapeXmlText(String(value));
  return `${pad}<${tagName}>${text}</${tagName}>`;
}

export function toXml(value: unknown, defaultRootName = 'root'): string {
  let bodyValue = value;
  let tagName = defaultRootName;
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value as object);
    if (keys.length === 1) {
      tagName = keys[0];
      bodyValue = (value as Record<string, unknown>)[keys[0]];
    }
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + jsonValueToXml(bodyValue, tagName, 0);
}
