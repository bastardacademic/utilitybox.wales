/** Reference data for the Bash cheatsheet. */
import type { CheatSheetEntry } from './cheatsheet';

export const BASH_CHEATSHEET: CheatSheetEntry[] = [
  { term: 'pwd', category: 'Navigation', description: 'Print the current working directory.' },
  { term: 'cd <dir>', category: 'Navigation', description: 'Change directory. cd - returns to the previous directory; cd ~ goes to your home directory.' },
  { term: 'ls -la', category: 'Navigation', description: 'List all files, including hidden ones, with details (permissions, size, date).' },
  { term: 'find <path> -name "<pattern>"', category: 'Navigation', description: 'Search for files/directories by name under a path.', example: 'find . -name "*.log"' },

  { term: 'cp <src> <dest>', category: 'Files & directories', description: 'Copy a file. Use -r to copy a directory recursively.' },
  { term: 'mv <src> <dest>', category: 'Files & directories', description: 'Move or rename a file or directory.' },
  { term: 'rm <file>', category: 'Files & directories', description: 'Delete a file. -r deletes directories recursively; -f forces deletion without prompting — both are destructive and unrecoverable.' },
  { term: 'mkdir -p <dir>', category: 'Files & directories', description: 'Create a directory, including any missing parent directories.' },
  { term: 'touch <file>', category: 'Files & directories', description: 'Create an empty file if it doesn\'t exist, or update an existing file\'s modified timestamp.' },
  { term: 'chmod <mode> <file>', category: 'Files & directories', description: 'Change a file\'s permissions.', example: 'chmod 755 script.sh' },
  { term: 'chown <user>:<group> <file>', category: 'Files & directories', description: 'Change a file\'s owning user and group (usually needs sudo).' },

  { term: 'cat <file>', category: 'Text processing', description: 'Print a file\'s entire contents to the terminal.' },
  { term: 'grep "<pattern>" <file>', category: 'Text processing', description: 'Search for lines matching a pattern. -r searches recursively, -i ignores case, -v inverts the match.' },
  { term: "sed 's/old/new/g' <file>", category: 'Text processing', description: 'Stream-edit text, replacing every occurrence of "old" with "new" on each line.' },
  { term: "awk '{print $1}' <file>", category: 'Text processing', description: 'Process text by field — this example prints just the first whitespace-separated column of each line.' },
  { term: 'sort <file>', category: 'Text processing', description: 'Sort lines alphabetically. -n sorts numerically, -r reverses the order.' },
  { term: 'uniq', category: 'Text processing', description: 'Remove adjacent duplicate lines — typically piped after sort, since it only collapses consecutive duplicates.' },
  { term: 'wc -l <file>', category: 'Text processing', description: 'Count lines in a file. -w counts words, -c counts bytes.' },
  { term: 'head -n 10 <file>', category: 'Text processing', description: 'Show the first 10 lines of a file. tail -n 10 shows the last 10.' },
  { term: 'tail -f <file>', category: 'Text processing', description: 'Follow a file as it grows, printing new lines as they\'re written — useful for watching logs live.' },

  { term: 'command1 | command2', category: 'Pipes & redirection', description: 'Pipe: feed the output of command1 in as the input to command2.' },
  { term: 'command > file', category: 'Pipes & redirection', description: 'Redirect a command\'s output to a file, overwriting it.' },
  { term: 'command >> file', category: 'Pipes & redirection', description: 'Redirect a command\'s output to a file, appending to the end.' },
  { term: 'command 2>&1', category: 'Pipes & redirection', description: 'Redirect stderr (file descriptor 2) into stdout (file descriptor 1), so both are captured together.' },
  { term: 'command < file', category: 'Pipes & redirection', description: 'Use a file\'s contents as a command\'s standard input.' },

  { term: 'ps aux', category: 'Processes', description: 'List every running process on the system with details.' },
  { term: 'kill <pid>', category: 'Processes', description: 'Ask a process to terminate gracefully by its process ID. kill -9 <pid> forces it immediately.' },
  { term: 'top', category: 'Processes', description: 'Live, auto-updating view of running processes and resource usage.' },
  { term: 'jobs', category: 'Processes', description: 'List background jobs running in the current shell session.' },
  { term: 'command &', category: 'Processes', description: 'Run a command in the background, returning control of the terminal immediately.' },
  { term: 'nohup command &', category: 'Processes', description: 'Run a command in the background that keeps running even after the terminal session closes.' },

  { term: 'VAR=value', category: 'Variables & scripting', description: 'Set a shell variable. No spaces are allowed around the = sign.' },
  { term: 'echo $VAR', category: 'Variables & scripting', description: 'Print the value of a variable.' },
  { term: 'export VAR=value', category: 'Variables & scripting', description: 'Set an environment variable that child processes (programs you run) can also see.' },
  { term: '$1, $2, ...', category: 'Variables & scripting', description: 'Positional parameters — the arguments passed to a script, in order.' },
  { term: 'if [ condition ]; then ... fi', category: 'Variables & scripting', description: 'Basic conditional. Common tests: -f file (exists), -z string (empty), -eq/-ne (numeric equal/not equal).' },
  { term: 'for i in list; do ... done', category: 'Variables & scripting', description: 'Loop over each item in a list, running the body once per item.' }
];
