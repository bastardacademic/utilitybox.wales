/** Reference data for the Git cheatsheet. */
import type { CheatSheetEntry } from './cheatsheet';

export const GIT_CHEATSHEET: CheatSheetEntry[] = [
  { term: 'git init', category: 'Setup', description: 'Create a new, empty Git repository in the current directory.' },
  { term: 'git clone <url>', category: 'Setup', description: 'Copy a remote repository to your local machine.', example: 'git clone https://github.com/user/repo.git' },
  { term: 'git config --global user.name "<name>"', category: 'Setup', description: 'Set the name attached to your commits, for every repository on this machine.' },
  { term: 'git config --global user.email "<email>"', category: 'Setup', description: 'Set the email attached to your commits, for every repository on this machine.' },

  { term: 'git status', category: 'Staging & committing', description: 'Show which files are staged, unstaged, or untracked.' },
  { term: 'git add <file>', category: 'Staging & committing', description: 'Stage a file\'s changes for the next commit.', example: 'git add .' },
  { term: 'git commit -m "<message>"', category: 'Staging & committing', description: 'Record staged changes as a new commit with a message.' },
  { term: 'git commit --amend', category: 'Staging & committing', description: 'Change the most recent commit — its message, or add more staged changes to it.' },
  { term: 'git diff', category: 'Staging & committing', description: 'Show changes in tracked files that are not yet staged.' },
  { term: 'git diff --staged', category: 'Staging & committing', description: 'Show staged changes that are not yet committed.' },

  { term: 'git branch', category: 'Branching', description: 'List local branches; the current branch is marked with an asterisk.' },
  { term: 'git branch <name>', category: 'Branching', description: 'Create a new branch from the current commit, without switching to it.' },
  { term: 'git switch <branch>', category: 'Branching', description: 'Switch to an existing branch (the modern replacement for git checkout <branch>).' },
  { term: 'git switch -c <name>', category: 'Branching', description: 'Create a new branch and switch to it in one step.' },
  { term: 'git merge <branch>', category: 'Branching', description: 'Merge the named branch into the current branch.' },
  { term: 'git rebase <branch>', category: 'Branching', description: 'Reapply the current branch\'s commits on top of another branch, producing a linear history.' },
  { term: 'git branch -d <name>', category: 'Branching', description: 'Delete a branch — refuses if it has unmerged changes.' },
  { term: 'git branch -D <name>', category: 'Branching', description: 'Force-delete a branch, even with unmerged changes.' },

  { term: 'git remote -v', category: 'Remotes', description: 'List configured remotes and their URLs.' },
  { term: 'git fetch', category: 'Remotes', description: 'Download commits and branches from a remote, without merging them into your work.' },
  { term: 'git pull', category: 'Remotes', description: 'Fetch from a remote and merge (or rebase, if configured) into the current branch.' },
  { term: 'git push', category: 'Remotes', description: 'Upload local commits on the current branch to its remote.' },
  { term: 'git push -u origin <branch>', category: 'Remotes', description: 'Push a branch and set it to track the matching remote branch, so future git push/pull need no arguments.' },

  { term: 'git log', category: 'History', description: 'Show commit history for the current branch, newest first.' },
  { term: 'git log --oneline --graph', category: 'History', description: 'Show a compact, one-line-per-commit history with a text graph of branches/merges.' },
  { term: 'git show <commit>', category: 'History', description: 'Show the full diff and metadata for a single commit.' },
  { term: 'git blame <file>', category: 'History', description: 'Show which commit (and author) last changed each line of a file.' },

  { term: 'git reset <file>', category: 'Undoing changes', description: 'Unstage a file, keeping its changes in the working directory.' },
  { term: 'git restore <file>', category: 'Undoing changes', description: 'Discard uncommitted changes to a file, reverting it to the last commit.' },
  { term: 'git reset --hard <commit>', category: 'Undoing changes', description: 'Move the branch to a commit and discard all changes since — destructive, uncommitted work is lost.' },
  { term: 'git revert <commit>', category: 'Undoing changes', description: 'Create a new commit that undoes the changes from a previous commit, without rewriting history.' },
  { term: 'git stash', category: 'Undoing changes', description: 'Temporarily shelve uncommitted changes, restoring a clean working directory.' },
  { term: 'git stash pop', category: 'Undoing changes', description: 'Reapply the most recently stashed changes and remove them from the stash list.' },

  { term: 'git cherry-pick <commit>', category: 'Collaboration', description: 'Apply the changes from a specific commit (often from another branch) onto the current branch.' },
  { term: 'git tag <name>', category: 'Collaboration', description: 'Create a lightweight tag pointing at the current commit — often used to mark releases.' },
  { term: 'git fetch --all --prune', category: 'Collaboration', description: 'Fetch every remote and remove local references to branches that no longer exist on them.' }
];
