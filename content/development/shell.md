---
title: "Shells and Terminal Emulators"
date: 2026-04-01
draft: false
tags:
  - cli
---

A **shell** is a command interpreter — a user-space program that sits between you and the operating system kernel, reading commands, orchestrating their execution, and returning results. A **terminal emulator** is the graphical application that provides the visual interface to the shell, emulating the behavior of a hardware serial terminal through a kernel-level abstraction called a pseudo-terminal. The two are frequently conflated because they are always used together, but they are distinct programs with separate responsibilities: the terminal emulator handles display and input routing, while the shell handles command interpretation and process management.

Understanding this separation — and the full stack of abstractions between your keypress and a running process — transforms an intermediate CLI user into someone who can reason about broken pipelines, write robust scripts, and make informed choices about tooling. This article covers every major component of that stack.

## The shell's main loop

Every shell operates as a **REPL** — a Read-Eval-Print Loop. The POSIX Shell Command Language specification defines the shell's operation as a repeating seven-step sequence: read input, break it into tokens, parse those tokens into a grammatical structure, perform expansions on the parsed words, set up redirections, execute the resulting command, and collect its exit status.[^opengroup2018shell]

For interactive shells, the loop displays a prompt (from `$PS1`), reads a line through a library like GNU Readline, processes it through all seven stages, stores the exit status in `$?`, and displays the prompt again. The loop terminates on EOF (`Ctrl+D`) or an explicit `exit` command. Interactive shells print an error and continue on failure; non-interactive scripts may exit immediately if `set -e` is active.

### Tokenization and parsing

The POSIX specification defines ten token recognition rules applied character-by-character to the input stream.[^opengroup2018shell] These rules determine how the shell distinguishes operators from words, recognizes quoting, identifies the start of parameter expansions and command substitutions, handles comments, and delimits tokens on whitespace. Tokens are classified as either *words* (command names, arguments, filenames) or *operators*, which include control operators (`||`, `&&`, `&`, `;`, `|`, `(`, `)`, newline) and redirection operators (`<`, `>`, `>>`, `<<`, and variants).

The shell grammar then organizes tokens into structures. A *simple command* is a sequence of optional variable assignments, a command name, and arguments. A *pipeline* connects simple commands with `|`. A *list* chains pipelines with `;`, `&`, `&&`, or `||`. *Compound commands* include `if`/`fi`, `for`/`done`, `while`/`done`, and `case`/`esac`. Reserved words like `if`, `then`, `do`, and `fi` are only recognized in specific grammatical positions and never when quoted.

### Expansion order

Expansions occur in a strict, defined sequence.[^ramey2023bash] **Brace expansion** (bash-specific, not POSIX) happens first. Then a single left-to-right pass performs **tilde expansion**, **parameter expansion**, **command substitution**, and **arithmetic expansion** simultaneously. After this pass, **word splitting** occurs on any unquoted expansion results, followed by **pathname (glob) expansion**, and finally **quote removal**.

This ordering has critical consequences. Brace expansion precedes variable expansion, so `{$a..$b}` does not work as expected — the braces are processed before `$a` and `$b` are resolved. Only brace expansion, word splitting, and pathname expansion can increase the number of words from an expansion; all other types produce exactly one word from one word. Word splitting uses `$IFS` (Internal Field Separator, defaulting to space/tab/newline) as its delimiter; setting `IFS=` to empty disables splitting entirely.[^gnu_wordsplit]

## Fork, exec, and process creation

When you type an external command like `ls -la`, the shell performs a precise sequence of system calls. First, it calls **`fork()`**, which creates a child process that is an exact duplicate of the shell. The child gets its own PID, inherits copies of all open file descriptors, and shares memory via **copy-on-write** — pages are marked read-only and only physically duplicated when either process writes to them.[^man7fork] The call returns 0 to the child and the child's PID to the parent.

The child then calls one of the **`exec()`** family functions (typically `execvp()`), which replaces its entire address space with the new program loaded from disk. If exec succeeds, it never returns. The parent shell calls **`waitpid()`** to block until the child terminates, then collects its exit status and displays the next prompt.[^man7fork]

The separation of fork and exec is a deliberate design choice. Between the two calls, the child can set up its environment — redirecting file descriptors, connecting pipe ends, adjusting signal dispositions — all before the target program begins. This is precisely what makes shell redirection and piping possible.

### Pipelines

For a pipeline like `cmd1 | cmd2 | cmd3`, the shell calls `pipe()` for each `|` operator, creating a unidirectional data channel with a read end (`fd[0]`) and a write end (`fd[1]`).[^tldp_pipes] Data flows through a kernel buffer, typically 64 KB on Linux. The shell forks each command, uses `dup2()` to wire the appropriate ends of each pipe to stdin/stdout, then closes all unused pipe file descriptor copies in every process. Crucially, **all unused copies of pipe file descriptors must be closed**: if a writer file descriptor remains open in the reading process, that reader will never see EOF and will hang.

All commands in a pipeline run concurrently. If the writer produces data faster than the reader consumes it, the buffer fills and the writer's `write()` call blocks — this backpressure prevents unbounded memory consumption without any explicit coordination.[^harvard_shell2]

### Job control

Every process belongs to a **process group** identified by a PGID; all processes in a pipeline share one group. Only one process group at a time is the **foreground process group** for the controlling terminal — it receives keyboard-generated signals.[^opengroup2018terminal] `Ctrl+C` sends `SIGINT` to the entire foreground group; `Ctrl+Z` sends `SIGTSTP`, suspending it. The `fg` builtin resumes a stopped job and restores it to the foreground via `SIGCONT` and `tcsetpgrp()`; `bg` resumes it without making it the foreground group.[^gnu_jobbuiltins]

When the terminal disconnects or the shell exits, `SIGHUP` is sent to all jobs. Background processes that attempt to read from the terminal receive `SIGTTIN`, which stops them. Before each prompt, the shell calls `waitpid()` with `WNOHANG` to check for status changes without blocking.

### Builtins

Shell builtins are commands implemented inside the shell's own executable rather than as external programs. The distinction matters because `fork()` creates a child process — any changes a child makes to its state (working directory, environment, signal handlers) vanish when it exits. Commands like `cd` (which calls `chdir()`), `export`, `exit`, `source`, `read`, `eval`, and `trap` must execute in the shell's own process to have any lasting effect.[^wikipedia_builtin]

Performance is the secondary benefit: builtins run with no fork, no exec, and no disk I/O. The shell resolves commands in this order: special builtins, shell functions, regular builtins, then `$PATH` search for external commands.[^tldp_builtins]

### Exit codes

Every process terminates with a status from 0 to 255. By convention, **0 means success** and any non-zero value means failure. Exit code 126 means the command was found but not executable; 127 means command not found; 128+N means the process was killed by signal N (so 137 = SIGKILL, 139 = SIGSEGV). By default, a pipeline's exit status reflects only its last command, silently masking earlier failures. Enabling **`set -o pipefail`** changes this: the pipeline returns the exit status of the rightmost command that failed.[^baeldung_pipefail] Bash's `PIPESTATUS` array captures the exit code of every command in the most recent pipeline. The combination `set -euo pipefail` at the top of scripts provides robust error handling — `-e` exits on error, `-u` treats undefined variables as errors, and `-o pipefail` catches failures anywhere in a pipeline.

## Inside the terminal emulator

A terminal emulator is a graphical application that emulates the behavior of a hardware serial terminal. It creates a **pseudo-terminal (PTY)**, connects a shell to it, captures keyboard input, writes it to the PTY, reads the shell's output (including escape sequences), and renders the result on screen.

### Pseudo-terminals

A **pseudo-terminal** is a pair of virtual character devices: a master side and a slave (or subsidiary) side. Anything written to the master appears as input on the slave, as if typed on a physical terminal; anything written to the slave can be read from the master. Modern Linux uses UNIX 98 PTYs via the `/dev/ptmx` multiplexer device.[^man7pty]

Creating a PTY follows a specific sequence: `posix_openpt(O_RDWR)` opens `/dev/ptmx` and returns a master file descriptor, `grantpt()` sets permissions on the corresponding slave, `unlockpt()` unlocks it for use, and `ptsname()` returns the slave path (e.g., `/dev/pts/3`). The `devpts` virtual filesystem dynamically manages numbered entries under `/dev/pts/` as PTYs are allocated.

When a terminal emulator launches, it opens a PTY master, then forks a child process. The child calls `setsid()` to create a new session with no controlling terminal, opens the PTY slave (which becomes its controlling terminal), uses `dup2()` to redirect stdin/stdout/stderr to the slave, and execs the shell. The parent process (the emulator) enters an event loop: it reads keyboard events from the GUI, encodes them, and writes them to the PTY master; it reads output from the PTY master, interprets escape sequences, and renders to the display.[^biriukov_pty]

### ANSI escape sequences

**ANSI escape sequences** are in-band signaling commands embedded in text streams to control cursor position, color, and formatting. They begin with the ESC character (byte `0x1B`). The most common format is the CSI (Control Sequence Introducer): `ESC [` followed by parameters and a final character that determines the command. For example, `ESC[5;10H` moves the cursor to row 5, column 10; `ESC[1;34m` enables bold blue text; `ESC[2J` clears the entire screen.[^wikipedia_ansi]

The SGR (Select Graphic Rendition) sequence `ESC[n;...m` controls text styling: `0` resets attributes, `1` enables bold, `30–37` set foreground colors, `38;5;n` selects from the 256-color palette, and `38;2;r;g;b` specifies 24-bit RGB. Programs like `ls --color` wrap filenames in SGR sequences. Full-screen applications like `vim` and `htop` use cursor positioning and alternate screen buffers (`ESC[?1049h`) to render their interfaces. The standard was first codified as ECMA-48 (ISO/IEC 6429); many widely-used sequences — mouse reporting, bracketed paste — originate from xterm extensions.[^jvns_escapes]

### The terminfo database

Because different terminals support different escape sequences, programs need an abstraction layer. **Terminfo** provides a database of terminal capabilities, keyed by the `$TERM` environment variable (e.g., `xterm-256color`). Database entries are compiled binary files stored in `/usr/share/terminfo/`, organized by first character of the terminal name. Each entry defines boolean capabilities (like `am` for auto-margin), numeric capabilities (like `colors#256`), and string capabilities (like `cup` for cursor positioning).[^wikipedia_terminfo]

Programs query terminfo through the **ncurses** library or the `tput` shell utility — for example, `tput cup 5 10` outputs the correct cursor-positioning sequence for the current terminal. This abstraction means a single program can run correctly on many terminal types without any code changes.

### The line discipline

The **line discipline** is a kernel-level processing layer sitting between the PTY driver and the reading process. It implements terminal policy — echoing characters, line editing (backspace, kill-line), signal generation, and input/output translation — while the PTY driver provides the transport mechanism.[^lam_linedisc]

In **canonical (cooked) mode**, the line discipline buffers input in a 4 KB ring buffer and delivers complete lines to `read()` only when a newline, EOF, or EOL character arrives. It echoes input characters back to the terminal, processes the ERASE character (backspace) and KILL character (`Ctrl+U`), converts CR to LF if `ICRNL` is set, and generates signals when `ISIG` is set: `Ctrl+C` generates `SIGINT`, `Ctrl+Z` generates `SIGTSTP`, and `Ctrl+\` generates `SIGQUIT`. These control characters are consumed and never reach the reading process.

In **raw mode** (configured via `cfmakeraw()`), virtually all processing is disabled — no echo, no signal generation, no line editing, and data is available immediately character-by-character. Modern interactive shells put the terminal into raw mode while displaying the prompt and handle all line editing themselves through GNU Readline, then restore terminal settings before executing each command.[^linux_termios] The `stty` command provides shell-level access to these settings; `stty -a` shows all current values, and `stty sane` resets to reasonable defaults.

## Shell features in depth

### Parameter expansion

Bash's parameter expansion system provides rich string manipulation directly within variable references.[^gnu_paramexp] **Conditional expansions** test whether a variable is set or null: `${var:-default}` expands to `default` if `var` is unset or null; `${var:=default}` additionally assigns the default; `${var:+alt}` expands to `alt` only if `var` is set and non-null; `${var:?message}` prints an error and exits if `var` is unset. Removing the colon (e.g., `${var-default}`) tests only for unset, not null.

**String manipulation** operators work with glob patterns: `${var%pattern}` removes the shortest suffix match, `${var%%pattern}` the longest, `${var#pattern}` the shortest prefix, `${var##pattern}` the longest. These are standard for path manipulation — `${path##*/}` extracts a basename, `${file%.txt}` strips an extension. `${var/pattern/replacement}` replaces the first match, `${var//pattern/replacement}` replaces all, and `${#var}` returns the string length.

### Quoting

**Single quotes** preserve the literal value of every character — no expansion of any kind occurs. **Double quotes** allow parameter expansion, command substitution, and arithmetic expansion, but suppress word splitting and globbing. **`$'...'` (ANSI-C quoting)** enables escape sequences like `\n`, `\t`, and `\xHH`, producing the result as a single-quoted literal — essential for `IFS=$'\n'`.

The universal rule: always double-quote variable expansions (`"$var"`, `"$(cmd)"`, `"${arr[@]}"`) unless you specifically need word splitting or globbing. An unquoted `$var` whose value contains `*` could expand to matching filenames — a pervasive source of bugs.

### Subshells and current-shell execution

Parentheses `(...)` create a **subshell** — a forked child process where variable changes, directory changes, and trap modifications do not affect the parent. Braces `{ ...; }` execute in the **current shell**, so all changes persist. Several constructs create subshells implicitly: each command in a pipeline runs in its own subshell (which is why `echo x | read var` does not set `var` in the parent shell in bash), command substitution `$(cmd)` runs in a subshell, and the `&` operator backgrounds a command in a subshell. Bash 4.2+ offers `shopt -s lastpipe` to run the last pipeline command in the current shell.

### Redirection and file descriptors

The shell translates redirection syntax into `open()`, `dup2()`, and `close()` system calls. `> file` opens the file (creating or truncating), then calls `dup2()` to make fd 1 point to it. `2>&1` duplicates fd 2 to wherever fd 1 currently points — the `&` distinguishes a file descriptor reference from a filename.[^catonmat_redir] **Order matters critically**: `> file 2>&1` sends both stdout and stderr to the file, but `2>&1 > file` sends stderr to the terminal and only stdout to the file, because `2>&1` captures where fd 1 points at that moment, before any further redirection.

**Here-documents** (`<<EOF...EOF`) provide inline input to commands; quoting the delimiter (`<<'EOF'`) suppresses all expansion in the body. **Here-strings** (`<<<`) pass a single string as stdin. **Process substitution** (`<(cmd)` and `>(cmd)`) creates a named pipe backed by a background process, enabling patterns like `diff <(sort file1) <(sort file2)`. The `exec` builtin without a command argument creates permanent redirections for the current shell — `exec 2>error.log` sends all subsequent stderr to a file.

### Interactive features: Readline and completion

GNU Readline puts the terminal into raw mode and implements its own input handling, supporting **emacs mode** (default) and **vi mode** (enabled with `set -o vi`). Key bindings include `Ctrl+A`/`Ctrl+E` for beginning/end of line, `Ctrl+R` for reverse history search, and `Ctrl+K` to kill to end of line. Configuration lives in `~/.inputrc`, where options like `completion-ignore-case on` can be set and keys rebound.

**Tab completion** defaults to filename, command, and variable completion. Bash's **programmable completion** system (`complete`, `compgen`, `compopt` builtins) enables context-sensitive completion for individual commands — the `bash-completion` package ships specialized completions for thousands of commands.

### Shell startup files

A **login shell** is started when you authenticate (SSH, TTY login, `bash --login`). An **interactive shell** is connected to a terminal and reads commands from the user. These categories are independent.

For bash, an interactive login shell reads `/etc/profile`, then the first file found among `~/.bash_profile`, `~/.bash_login`, and `~/.profile`. An interactive non-login shell reads `~/.bashrc`. The standard practice is to put all interactive configuration in `~/.bashrc` and have `~/.bash_profile` source it:

```bash
[[ -f ~/.bashrc ]] && source ~/.bashrc
```

On macOS, Terminal.app opens login shells by default, so `~/.bash_profile` is read instead of `~/.bashrc` — a common source of confusion. Zsh loads files in a different order: `~/.zshenv` (always), `~/.zprofile` (login shells, before `.zshrc`), `~/.zshrc` (interactive shells), and `~/.zlogin` (login shells, after `.zshrc`). Zsh sources both profile and rc files for interactive login shells, while bash reads only the profile files.[^zsh_startup]

### Background process management

The `disown` builtin removes a job from the shell's job table, preventing `SIGHUP` from being sent when the shell exits. `disown -h %1` keeps the job in the table but marks it as hangup-immune. The `nohup` external command takes a different approach: it sets `SIGHUP` to be ignored and redirects stdout/stderr to `nohup.out` before the command starts.[^wikipedia_nohup] The key distinction: **`nohup` is used before starting a command; `disown` is used after**. A common workflow for a forgotten long-running task is to press `Ctrl+Z` to suspend, `bg %1` to resume in the background, then `disown -h %1` to protect it before safely exiting.

## Terminal multiplexers

### Architecture

**tmux** uses a client-server architecture where a persistent server process manages all sessions, windows, and panes, while lightweight clients connect via Unix domain sockets (typically at `/tmp/tmux-<UID>/default`). The server daemonizes via `fork()` and `setsid()`, has no controlling terminal, and is immune to terminal hangups.[^linux_tmux]

The critical insight is that **tmux itself acts as a terminal emulator**. For each pane, it creates a PTY pair. The shell in a pane connects to the slave end; the tmux server holds the master end. The server parses ANSI escape sequences from programs using a state machine, updates an internal virtual screen buffer (a grid-based data structure storing cell content with attributes), and re-renders visible panes to the real terminal. Inside tmux, `TERM` is set to `tmux-256color` because programs are communicating with tmux's virtual terminal, not the outer terminal.[^augment_tmux]

The server's event loop simultaneously polls all pane PTYs for output, processes client keyboard input, handles window resize events, and manages client connections. When the terminal resizes, the server adjusts layouts, resizes pane PTYs via `ioctl(TIOCSWINSZ)`, and sends `SIGWINCH` to programs in affected panes.

### Session persistence

When you detach (`Ctrl+B D`), the client process disconnects from the server's Unix socket. The server drops the file descriptor for the client's real terminal but keeps every pane's PTY master open. The shells and programs in those panes remain connected to their respective slave PTY ends and never know anything changed. When you reattach, a new client connects to the server socket and receives the current screen state.

This differs fundamentally from `nohup` or `disown`, which protect individual processes from `SIGHUP` but lose the shell environment, history, and visual context. A multiplexer preserves the **entire terminal session** — all running programs, their output, scrollback buffers, and window arrangements.

**GNU Screen** provides similar functionality with a different architecture: it launches a separate server process per session (versus tmux's single server for all sessions), communicates via named pipes instead of Unix sockets, and its split regions differ from tmux panes — Screen regions can share the same underlying window, while tmux panes are independent PTYs.[^hyperpolyglot_mux]

### Session, window, and pane hierarchy

tmux organizes state as: server → sessions → windows → panes. Each pane has a dedicated PTY pair and virtual screen buffer. When a pane is created via `split-window`, tmux opens a new PTY master, gets the corresponding slave, forks a child shell connected to that slave, and creates a new screen buffer. Windows have a layout tree defining each pane's position and dimensions.

## Comparison of major shells

### POSIX sh and the portability baseline

The POSIX Shell Command Language specification defines a standard command interpreter that all conformant systems must provide, covering core syntax, control flow, builtins, and special parameters.[^opengroup2018shell] **dash** (Debian Almquist Shell) is a minimal, strictly POSIX-compliant shell used as `/bin/sh` on Debian and Ubuntu. It is roughly four times faster than bash for script execution and contains no extensions. Using `#!/bin/sh` invokes whatever `/bin/sh` points to on the current system — which may be dash, bash in POSIX mode, or another shell. Scripts with this shebang must use only POSIX syntax; using `#!/bin/bash` explicitly invokes bash with all extensions enabled.[^baeldung_shvsbash]

### Bash

Bash adds **indexed and associative arrays** (`declare -A`), the **`[[ ]]` extended test** keyword (supporting pattern matching, regex with `=~`, and no word splitting on variables), **process substitution**, **here-strings**, **brace expansion**, and **extended globbing** (`!(pattern)`, `*(pattern)`, `+(pattern)` via `shopt -s extglob`). The `BASH_REMATCH` array captures regex groups, `$RANDOM` generates random integers, and `coproc` creates co-processes. Tools like `checkbashisms` and ShellCheck can identify non-POSIX constructs in scripts.

### Zsh

Zsh's most significant difference from bash is that **unquoted variable expansion does not undergo word splitting by default**. In bash, `var="foo bar"; echo $var` produces two arguments; in zsh, it stays as one, eliminating an entire class of quoting bugs. Zsh arrays are 1-indexed (bash uses 0-indexed), and `$array` expands all elements without requiring `${array[@]}`.

Zsh's **glob qualifiers** are unique and powerful — appended in parentheses after a glob pattern to filter by file attributes: `**/*.log(.Lm+10mw-1)` finds regular log files larger than 10 MB modified in the last week, eliminating many uses of `find`.[^refining_linux_glob] **Parameter expansion flags** (`${(L)var}` for lowercase, `${(s:,:)var}` for splitting on comma, `${(u)array}` for unique elements) surpass bash's capabilities. The **completion system** (`compsys`) provides context-sensitive completion with menu selection, grouped candidates, and descriptions, configured via the `zstyle` pattern-based system.[^dev_zshcompletion] The right side of pipelines runs in the parent shell, so `echo foo | read var` works correctly.[^zsh_startup]

### Fish

Fish (Friendly Interactive Shell) is **intentionally not POSIX-compatible**. Its syntax uses `end` to close all blocks (`if...end`, `for...end`, `function...end`), sets variables with `set -gx` instead of assignment, uses `(command)` for command substitution, and replaces glob-based parameter manipulation with the `string` builtin. There are no heredocs, no `$((expr))` arithmetic (use the `math` builtin), and all variables are lists with no word splitting.

Fish's standout interactive features all work out of the box with zero configuration: real-time **syntax highlighting** (invalid commands shown in red), history-based **autosuggestions** accepted with the right arrow key, and a web-based configuration UI launched via `fish_config`. **Universal variables** (`set -U`) persist across all running sessions and reboots, propagating changes immediately.

### PowerShell

PowerShell's fundamental architectural difference is that **pipelines pass .NET objects, not byte streams**. `Get-Process` returns `System.Diagnostics.Process` objects with typed properties like `.Id`, `.CPU`, and `.Name`. Filtering uses `Where-Object { $_.Length -gt 10000 }` on actual numeric properties rather than parsing text with grep and awk. Objects carry all metadata through the pipeline and are formatted for display only at the final stage.

All cmdlets follow a **Verb-Noun naming convention** (`Get-Process`, `Set-Location`, `New-Item`), making commands discoverable. PowerShell provides strong typing, structured `try`/`catch`/`finally` error handling, and a module system with a package gallery. PowerShell 7 runs cross-platform on Windows, macOS, and Linux via `pwsh`, built on .NET Core.

The table below summarizes the key functional differences between the major shells:

| Feature | POSIX sh | Bash | Zsh | Fish | PowerShell |
|---|---|---|---|---|---|
| Arrays | No | Indexed + assoc | Full array support | Lists | Typed arrays |
| Word splitting on `$var` | Yes | Yes | No | No | N/A |
| Extended globbing | No | `extglob` opt-in | Built-in qualifiers | No | No |
| Pipeline data type | Text | Text | Text | Text | .NET objects |
| Programmable completion | No | `bash-completion` | `compsys` | Built-in | Built-in |
| Config files | `/etc/profile`, `~/.profile` | `.bash_profile`, `.bashrc` | `.zshenv`, `.zshrc` | `~/.config/fish/` | `$PROFILE` |
| POSIX compatible | Yes | Mostly | Mostly | No | No |

[^augment_tmux]: Augment Code. (n.d.). [*tmux — Terminal Multiplexer*](https://www.augmentcode.com/open-source/tmux/tmux). Augment Code.
[^baeldung_pipefail]: Baeldung. (n.d.). [*The exit status of piped processes*](https://www.baeldung.com/linux/exit-status-piped-processes). Baeldung on Linux.
[^baeldung_shvsbash]: Baeldung. (n.d.). [*What's the difference between sh and Bash?*](https://www.baeldung.com/linux/sh-vs-bash). Baeldung on Linux.
[^biriukov_pty]: Biriukov, V. (n.d.). [*Terminals and pseudoterminals*](https://biriukov.dev/docs/fd-pipe-session-terminal/4-terminals-and-pseudoterminals/). biriukov.dev.
[^catonmat_redir]: Skalberg, P. (n.d.). [*Bash one-liners explained, Part III: All about redirections*](https://catonmat.net/bash-one-liners-explained-part-three). catonmat.net.
[^dev_zshcompletion]: Fabre, G. (n.d.). [*A guide to the Zsh completion with examples*](https://dev.to/phantas0s/a-guide-to-the-zsh-completion-with-examples-2jhe). DEV Community.
[^gnu_jobbuiltins]: Free Software Foundation. (2023). [*Job control builtins*](https://www.gnu.org/software/bash/manual/html_node/Job-Control-Builtins.html). *Bash Reference Manual*.
[^gnu_paramexp]: Free Software Foundation. (2023). [*Shell parameter expansion*](https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html). *Bash Reference Manual*.
[^gnu_wordsplit]: Free Software Foundation. (2023). [*Word splitting*](https://www.gnu.org/software/bash/manual/html_node/Word-Splitting.html). *Bash Reference Manual*.
[^harvard_shell2]: Harvard CS 61. (2018). [*Shell 2: Process creation and interprocess communication*](https://cs61.seas.harvard.edu/site/2018/Shell2/). Harvard University.
[^hyperpolyglot_mux]: Hyperpolyglot. (n.d.). [*Terminal multiplexers: Screen, Tmux*](https://hyperpolyglot.org/multiplexers). hyperpolyglot.org.
[^jvns_escapes]: Evans, J. (2025, March 7). [*Standards for ANSI escape codes*](https://jvns.ca/blog/2025/03/07/escape-code-standards/). jvns.ca.
[^lam_linedisc]: Lam, J. (n.d.). [*Understanding the tty subsystem: Line discipline*](https://lambdalambda.ninja/blog/56/). lambdalambda.ninja.
[^linux_termios]: Linux man pages. (n.d.). [*termios(3)*](https://linux.die.net/man/3/termios). linux.die.net.
[^linux_tmux]: Linux man pages. (n.d.). [*tmux(1): Terminal multiplexer*](https://linux.die.net/man/1/tmux). linux.die.net.
[^man7fork]: Linux man pages. (n.d.). [*fork(2)*](https://man7.org/linux/man-pages/man2/fork.2.html). man7.org.
[^man7pty]: Linux man pages. (n.d.). [*pty(7)*](https://man7.org/linux/man-pages/man7/pty.7.html). man7.org.
[^opengroup2018shell]: The Open Group. (2018). [*Shell command language*](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html). *The Open Group Base Specifications Issue 7, 2018 Edition* (IEEE Std 1003.1-2017).
[^opengroup2018terminal]: The Open Group. (2018). [*General terminal interface*](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap11.html). *The Open Group Base Specifications Issue 7, 2018 Edition* (IEEE Std 1003.1-2017).
[^ramey2023bash]: Ramey, C. (2023). [*Bash Reference Manual*](https://www.gnu.org/software/bash/manual/bash.html). Free Software Foundation.
[^refining_linux_glob]: Refining Linux. (n.d.). [*ZSH Gem #2: Extended globbing and expansion*](https://www.refining-linux.org/archives/37-ZSH-Gem-2-Extended-globbing-and-expansion.html). refining-linux.org.
[^tldp_builtins]: Cooper, M. (n.d.). [*Chapter 15: Internal commands and builtins*](https://tldp.org/LDP/abs/html/internal.html). *Advanced Bash-Scripting Guide*. The Linux Documentation Project.
[^tldp_pipes]: The Linux Documentation Project. (n.d.). [*Creating pipes in C*](https://tldp.org/LDP/lpg/node11.html). tldp.org.
[^wikipedia_ansi]: Wikipedia contributors. (n.d.). [*ANSI escape code*](https://en.wikipedia.org/wiki/ANSI_escape_code). Wikipedia.
[^wikipedia_builtin]: Wikipedia contributors. (n.d.). [*Shell builtin*](https://en.wikipedia.org/wiki/Shell_builtin). Wikipedia.
[^wikipedia_nohup]: Wikipedia contributors. (n.d.). [*nohup*](https://en.wikipedia.org/wiki/Nohup). Wikipedia.
[^wikipedia_terminfo]: Wikipedia contributors. (n.d.). [*Terminfo*](https://en.wikipedia.org/wiki/Terminfo). Wikipedia.
[^zsh_startup]: Thornton, A. (2019, June). [*Moving to zsh, part 2: Configuration files*](https://scriptingosx.com/2019/06/moving-to-zsh-part-2-configuration-files/). Scripting OS X.
