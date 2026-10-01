/** Unified JSON/YAML/XML/CSV conversion — parses any format into a plain JS value, then serializes to any other. */

import { parseYaml, toYaml } from './yaml';
import { parseXml, toXml } from './xmlConvert';
import { parseCsv, toCsv } from './csvConvert';

export type DataFormat = 'json' | 'yaml' | 'xml' | 'csv';

export function parseData(text: string, format: DataFormat): unknown {
  switch (format) {
    case 'json':
      return JSON.parse(text);
    case 'yaml':
      return parseYaml(text);
    case 'xml':
      return parseXml(text);
    case 'csv':
      return parseCsv(text);
  }
}

export function serializeData(value: unknown, format: DataFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(value, null, 2);
    case 'yaml':
      return toYaml(value);
    case 'xml':
      return toXml(value);
    case 'csv':
      return toCsv(value);
  }
}

export function convertData(text: string, from: DataFormat, to: DataFormat): string {
  return serializeData(parseData(text, from), to);
}
