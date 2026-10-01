/** Reference data for the Excel cheatsheet. */
import type { CheatSheetEntry } from './cheatsheet';

export const EXCEL_CHEATSHEET: CheatSheetEntry[] = [
  { term: 'VLOOKUP(value, table, col_index, [range_lookup])', category: 'Lookup', description: 'Looks up a value in the first column of a range and returns a value from another column in the same row.', example: '=VLOOKUP(D1,A:B,2,FALSE)' },
  { term: 'HLOOKUP(value, table, row_index, [range_lookup])', category: 'Lookup', description: 'The horizontal version of VLOOKUP — looks up a value in the first row of a range instead of the first column.' },
  { term: 'XLOOKUP(value, lookup_array, return_array)', category: 'Lookup', description: 'Modern replacement for VLOOKUP/HLOOKUP: looks up a value in any column and returns from any other column, in either direction.', example: '=XLOOKUP(D1,A:A,B:B)' },
  { term: 'INDEX(array, row, [col])', category: 'Lookup', description: 'Returns the value at a given row/column position within a range.' },
  { term: 'MATCH(value, array, [match_type])', category: 'Lookup', description: 'Returns the relative position of a value within a range, for use with INDEX.' },
  { term: 'INDEX/MATCH', category: 'Lookup', description: 'INDEX and MATCH combined is a flexible alternative to VLOOKUP that can look leftward and doesn\'t break if columns are inserted.', example: '=INDEX(B:B,MATCH(D1,A:A,0))' },

  { term: 'SUM(range)', category: 'Math & stats', description: 'Adds up all numbers in a range.' },
  { term: 'AVERAGE(range)', category: 'Math & stats', description: 'The arithmetic mean of a range of numbers.' },
  { term: 'COUNT(range)', category: 'Math & stats', description: 'Counts how many cells in a range contain numbers.' },
  { term: 'COUNTA(range)', category: 'Math & stats', description: 'Counts how many cells in a range are not empty (numbers, text, or anything else).' },
  { term: 'COUNTIF(range, criteria)', category: 'Math & stats', description: 'Counts cells in a range that match a condition.', example: '=COUNTIF(A:A,">10")' },
  { term: 'COUNTIFS(range1, crit1, ...)', category: 'Math & stats', description: 'Counts cells that match multiple conditions across one or more ranges.' },
  { term: 'SUMIF(range, criteria, [sum_range])', category: 'Math & stats', description: 'Sums cells that match a condition.', example: '=SUMIF(A:A,"Widget",B:B)' },
  { term: 'SUMIFS(sum_range, range1, crit1, ...)', category: 'Math & stats', description: 'Sums cells that match multiple conditions.' },
  { term: 'ROUND(number, digits)', category: 'Math & stats', description: 'Rounds a number to the given number of decimal places.' },

  { term: 'IF(condition, if_true, if_false)', category: 'Logic', description: 'Returns one value if a condition is true, another if it\'s false.' },
  { term: 'IFS(cond1, val1, cond2, val2, ...)', category: 'Logic', description: 'Checks multiple conditions in order and returns the value for the first one that\'s true, without nesting IF statements.' },
  { term: 'IFERROR(value, value_if_error)', category: 'Logic', description: 'Returns a fallback value if a formula would otherwise return an error.' },
  { term: 'AND(cond1, cond2, ...)', category: 'Logic', description: 'True only if every condition is true.' },
  { term: 'OR(cond1, cond2, ...)', category: 'Logic', description: 'True if at least one condition is true.' },

  { term: 'A1 & B1', category: 'Text', description: 'The & operator joins (concatenates) text from two cells.' },
  { term: 'TEXTJOIN(delimiter, ignore_empty, text1, ...)', category: 'Text', description: 'Joins multiple text values with a delimiter between them, optionally skipping blank cells.' },
  { term: 'LEFT(text, num_chars)', category: 'Text', description: 'Returns the first num_chars characters from the start of a text string. RIGHT does the same from the end.' },
  { term: 'MID(text, start, num_chars)', category: 'Text', description: 'Returns a substring starting at a given position.' },
  { term: 'LEN(text)', category: 'Text', description: 'Returns the number of characters in a text string.' },
  { term: 'TRIM(text)', category: 'Text', description: 'Removes leading, trailing, and repeated internal spaces from text.' },
  { term: 'UPPER(text) / LOWER(text) / PROPER(text)', category: 'Text', description: 'Convert text to uppercase, lowercase, or Title Case respectively.' },

  { term: 'TODAY()', category: 'Date & time', description: 'Returns the current date (updates automatically whenever the sheet recalculates).' },
  { term: 'NOW()', category: 'Date & time', description: 'Returns the current date and time.' },
  { term: 'DATEDIF(start, end, unit)', category: 'Date & time', description: 'Returns the difference between two dates in the given unit ("d" days, "m" months, "y" years).' },
  { term: 'EOMONTH(start_date, months)', category: 'Date & time', description: 'Returns the last day of the month that is a given number of months before or after start_date.' },

  { term: 'Ctrl+Arrow key', category: 'Keyboard shortcuts', description: 'Jump to the edge of the current block of data in that direction.' },
  { term: 'Ctrl+Shift+Arrow key', category: 'Keyboard shortcuts', description: 'Select cells from the current position to the edge of the data block.' },
  { term: 'Ctrl+;', category: 'Keyboard shortcuts', description: 'Insert today\'s date as a static value into the selected cell.' },
  { term: 'Ctrl+Shift+L', category: 'Keyboard shortcuts', description: 'Toggle AutoFilter dropdowns on the selected range.' },
  { term: 'F4', category: 'Keyboard shortcuts', description: 'Repeat the last action — or, while editing a formula, cycle a cell reference through absolute/relative ($) forms.' },
  { term: 'Alt+=', category: 'Keyboard shortcuts', description: 'AutoSum — insert a SUM formula for the adjacent cells.' }
];
