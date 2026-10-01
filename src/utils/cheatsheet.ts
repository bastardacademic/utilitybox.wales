/** Shared shape for the Git/Bash/Excel/Regex cheatsheet reference pages. */

export interface CheatSheetEntry {
  term: string;
  category: string;
  description: string;
  example?: string;
}
