---
title: "Scheduling"
date: 2026-04-01
draft: false
tags:
  - automation
---

The three dominant task schedulers on Unix-like operating systems — **cron**, **systemd timers**, and **launchd** — represent three distinct generations of design philosophy, each shaped by the constraints and ambitions of its era. Cron embodies Unix minimalism: a single daemon waking every 60 seconds to check a flat text file. Systemd timers integrate scheduling into Linux's unified service management layer, adding dependency awareness, cgroup-based resource control, and journal-based logging. Apple's launchd collapsed multiple daemon-management mechanisms into one event-driven framework that launches processes on demand.

Understanding these systems — their internals, configuration formats, trade-offs, and appropriate use cases — is essential knowledge for anyone operating infrastructure on modern Unix-like platforms. The sections below cover how each scheduler works mechanically, how it is configured, where it is best applied, and where it falls short.

## How each scheduler works under the hood

### Cron's minute-by-minute polling loop

The cron daemon (`crond`) follows a straightforward execution model. On startup, it reads all crontab files into memory: user crontabs from `/var/spool/cron/` (named after `/etc/passwd` accounts), the system crontab at `/etc/crontab`, and drop-in files from `/etc/cron.d/`. It then enters its main loop, **waking every 60 seconds to examine all loaded crontab entries** against the current time. If a job's time specification matches, cron forks a child process that executes the command via `/bin/sh` (or the shell specified by the `SHELL` variable).[^man7cron]

Change detection is efficient: cron checks the modification time of the spool directory and system crontab each minute, reloading only files whose mtimes have changed. Modern implementations such as **cronie** also use **inotify** to watch for filesystem changes, avoiding unnecessary disk access, though inotify cannot track changes through symlinks — a `SIGHUP` signal is required in that case.

The time-matching logic contains a well-known quirk: when both the day-of-month and day-of-week fields are restricted (not `*`), the command runs when *either* field matches — a logical OR, not AND. The entry `30 4 1,15 * 5` fires at 4:30 AM on the 1st and 15th of every month *and* every Friday. Cron's output handling relies on email: any stdout or stderr from a job is mailed to the crontab owner (or the `MAILTO` address) via `sendmail`. Setting `MAILTO=""` suppresses mail entirely, which is the common practice on modern systems where an MTA is rarely configured.

Cron provides no concurrency control. If a job takes longer than its scheduling interval, multiple instances run simultaneously. The standard workaround is `flock` from util-linux, which uses a lock file to skip execution when a previous instance is still running:

```bash
* * * * * /usr/bin/flock -n /tmp/job.lock /path/to/script.sh
```

### Systemd's integrated timer-service architecture

Systemd timers are not a separate daemon but part of **PID 1 itself**. Every timer is a `.timer` unit file paired with a `.service` unit file (by convention sharing the same base name, though the `Unit=` directive can override this). When the timer elapses, systemd activates the associated service. This tight integration means timer-triggered jobs inherit all of systemd's capabilities: cgroup-based resource limits, dependency ordering, security sandboxing, and journal-based logging.[^man7timer]

Systemd supports two timer paradigms. **Monotonic timers** fire relative to events — `OnBootSec=` (time since boot), `OnStartupSec=` (time since the service manager started), `OnUnitActiveSec=` (time since the triggered service last activated), and `OnUnitInactiveSec=` (time since it last became inactive). **Calendar timers** use the `OnCalendar=` directive with human-readable expressions like `Mon..Fri *-*-* 10:00:00` or shorthand like `daily`, `weekly`, and `quarterly`.

A key architectural feature is **timer coalescing** via `AccuracySec=`, which defaults to one minute. Rather than firing at the exact scheduled time, systemd places the expiry at a host-specific, randomized but stable position within the accuracy window, synchronized across all local timer units. This batches wake-ups for power efficiency. For precise scheduling, `AccuracySec=1us` can be set. The `RandomizedDelaySec=` directive adds deliberate jitter, useful for fleet-wide scheduling where hundreds of machines should not hit a server simultaneously.

**Persistent timers** (`Persistent=true`) store the last trigger timestamp to disk at `/var/lib/systemd/timers/`. If the system was powered off when a calendar timer was due, the service runs immediately upon next boot. Only a single catch-up execution occurs regardless of how many intervals were missed.

### Launchd's event-driven, on-demand model

Launchd operates as **PID 1 on macOS** — it is the init system, service manager, and task scheduler all in one. Its fundamental design principle is **on-demand launching**: at boot, launchd reads plist configuration files and registers all requested sockets, Mach ports, and file descriptors, but does not actually start processes until something triggers them.[^appledaemons]

Launchd distinguishes between **daemons** (system-wide, loaded at boot, typically run as root, cannot access the GUI) and **agents** (per-user, loaded at login, run in the user's session, can access the window server). Configuration files live in five locations with descending precedence: `/System/Library/LaunchDaemons` and `/System/Library/LaunchAgents` (Apple's own, protected by SIP), `/Library/LaunchDaemons` and `/Library/LaunchAgents` (third-party system-wide), and `~/Library/LaunchAgents` (per-user).

Launchd supports an unusually rich set of launch triggers beyond time-based scheduling. `WatchPaths` monitors filesystem paths for changes, `QueueDirectories` launches a job when a directory becomes non-empty, `StartOnMount` fires when a filesystem is mounted, and `MachServices`/`Sockets` enable on-demand activation via IPC or network connections. The `KeepAlive` directive controls restart behavior with conditional forms — keep alive only if a specific path exists, only if the network is up, or only after a crash.

The management interface, `launchctl`, communicates with launchd over Mach-specific IPC. Launchd itself has no ability to read plist files directly — launchctl parses and serializes them before sending them to the daemon. This architecture changed significantly with launchctl 2.0 in macOS 10.10, which replaced the familiar `load`/`unload` commands with `bootstrap`/`bootout` and introduced a domain-target system (`system/`, `gui/<uid>/`, `user/<uid>/`).[^tn2083]

## Configuration formats

### Cron's five-field expression

Cron's scheduling syntax remains one of the most widely recognized formats in computing. Each line in a crontab specifies five time fields followed by a command:[^man7crontab]

```cron
# minute(0-59) hour(0-23) day-of-month(1-31) month(1-12) day-of-week(0-7)
*/15 * * * *   /usr/local/bin/check-status.sh
0    2 * * *   /usr/bin/flock -n /tmp/backup.lock /usr/local/bin/backup.sh
30   4 1,15 * 5  /home/user/bin/report.sh
```

Operators include asterisk (`*`) for all values, comma for lists, hyphen for ranges, and slash for steps. Special strings — `@reboot`, `@hourly`, `@daily`, `@weekly`, `@monthly`, `@yearly` — provide mnemonic shortcuts. Environment variables can be set at the top of a crontab file (`SHELL`, `PATH`, `MAILTO`), and the system crontab at `/etc/crontab` adds a sixth field specifying the username under which the command runs. A common pitfall is that **cron's default PATH is extremely restricted** (`/usr/bin:/bin`), meaning commands available in interactive shells may not be found; always use absolute paths or explicitly set `PATH` in the crontab.

### Systemd timer and service unit files

Systemd requires two files for a scheduled task. A `.timer` unit defines when to fire:

```ini
[Unit]
Description=Nightly database backup

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true
RandomizedDelaySec=15min

[Install]
WantedBy=timers.target
```

A matching `.service` unit defines what to run:

```ini
[Unit]
Description=Database backup script
After=network-online.target postgresql.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/db-backup.sh
Nice=10
MemoryMax=512M
ProtectSystem=full
PrivateTmp=true
```

Calendar expressions use the format `DayOfWeek Year-Month-Day Hour:Minute:Second` and support named shorthands (`daily`, `weekly`, `quarterly`, `semiannually`). Sub-minute precision is available — `*-*-* *:*:0/30` fires every 30 seconds. The `systemd-analyze calendar` command validates expressions and shows the next elapse time, which is invaluable during development. Timer management follows standard systemctl patterns: `systemctl enable --now backup.timer`, `systemctl list-timers`, and `journalctl -u backup.service` for log inspection.

### Launchd plist files

Launchd uses XML property lists. A job running daily at 2:30 AM looks like this:[^launchdplist]

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.example.nightly-backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/backup.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>30</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/backup.stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/backup.stderr.log</string>
</dict>
</plist>
```

The `StartCalendarInterval` dictionary accepts integer keys for Minute, Hour, Day, Weekday, and Month; omitted keys act as wildcards. Unlike cron's rich operator syntax, there are no range, step, or list operators — scheduling a job for multiple times requires an array of dictionaries. `StartInterval` provides fixed-interval scheduling in seconds. The XML verbosity is a frequent complaint; third-party tools like **LaunchControl** and **Lingon X** exist primarily to alleviate the manual editing burden.

## Real-world applications

All three schedulers serve overlapping real-world needs, though each has domain-specific strengths. Log rotation is perhaps the most universal use case: on traditional Linux systems, `logrotate` runs via `/etc/cron.daily/logrotate`; on systemd-based distributions, it has migrated to `logrotate.timer`. Backup scheduling — from simple `rsync` scripts to database dumps with `pg_dump` or `mysqldump` — is a staple of cron and systemd timer configurations. Certificate renewal for Let's Encrypt (via certbot) is typically scheduled twice daily on both platforms.

System-level maintenance tasks like SSD TRIM (`fstrim.timer`), temporary file cleanup (`systemd-tmpfiles-clean.timer`), and man page database updates (`man-db.timer`) now ship as systemd timer units on most Linux distributions. On macOS, virtually every system service — from `WindowServer` to `mDNSResponder` — is managed by launchd, and Time Machine's periodic backups operate through launchd, layered with the Duet Activity Scheduler for intelligent scheduling based on CPU load and power state.[^eclecticlight]

Monitoring and health-checking scripts — disk space alerts, service availability probes, application metrics collection — represent a large share of cron's workload in production environments. Systemd timers add value here through `OnFailure=` directives that can trigger notification services when a health-check script fails, and through `journalctl` for centralized log analysis.

## Limitations, failure modes, and known pitfalls

Cron's fundamental limitations stem from its deliberate simplicity. It has no dependency management — jobs cannot declare that they require network access or must run after another job completes. There is no mechanism for handling missed jobs when the system was powered off; anacron partially addresses this for daily-or-coarser tasks, but minute-level jobs are simply lost. Cron tracks no job history: it does not record exit codes, execution duration, or success/failure status. There is no resource management — no CPU, memory, or I/O limits — and no built-in concurrency control. Timezone handling during DST transitions produces known anomalies: a job at 02:30 may never fire during spring-forward or fire twice during fall-back.

Systemd timers address many of cron's deficiencies but introduce their own friction. The two-file requirement (timer plus service) makes quick ad-hoc scheduling considerably more verbose than a single crontab line. The default `AccuracySec=1min` means timers never fire at exactly the scheduled time, which surprises users migrating from cron. Systemd silently ignores unknown keys in unit files — a typo like `OnClendar=` (missing 'a') produces no error if another valid timer directive is present, potentially leaving a timer without its intended schedule. User-level timers only run during active login sessions unless `loginctl enable-linger` is explicitly enabled. Systemd timers are also not portable — they are unavailable on BSD, macOS, Alpine Linux, Void Linux, or any non-systemd distribution.

Launchd struggles with documentation and debugging. Apple's official developer documentation is sparse and outdated, and the launchctl 2.0 syntax change in macOS 10.10 was poorly communicated — most online tutorials still describe legacy commands. Plist XML syntax errors can produce cryptic or silent failures. The `StartCalendarInterval` key lacks the expressive power of cron's operators — no ranges, no steps, no lists within a single field — requiring verbose array-of-dictionaries patterns for complex schedules. Sleep behavior is also inconsistent: `StartCalendarInterval` jobs run when a Mac wakes from sleep, but not if it was powered off entirely. Modern macOS security layers — SIP, TCC (Transparency, Consent, and Control), Launch Constraints, and the hardened runtime — add complexity for daemon developers, particularly around Full Disk Access permissions that cannot be prompted from a daemon context.

## Comparison

| Feature | cron | systemd timers | launchd |
|---|---|---|---|
| **Platform** | Unix / Linux / macOS | Linux (systemd only) | macOS |
| **Config format** | Crontab syntax | INI unit files | XML plist |
| **Scheduling precision** | Minute-level | Sub-second | Minute-level |
| **Missed run recovery** | ✗ (anacron needed) | ✓ (`Persistent=true`) | Partial (sleep only) |
| **Dependency management** | ✗ | ✓ (`After=`, `Requires=`) | ✓ (implicit via IPC) |
| **Event-driven triggers** | ✗ | Partial | ✓ |
| **Resource management** | ✗ | ✓ (cgroups) | Partial (`Nice`, `ProcessType`) |
| **Logging** | Email / none | journald (built-in) | Redirect to file |
| **Portability** | ✓ POSIX standard | ✗ | ✗ |
| **Ease of configuration** | ✓ Simple | Moderate | ✗ Verbose |

Configuration complexity favors cron: one line in a crontab versus two unit files for systemd or a multi-line XML plist for launchd. Scheduling expressiveness is strongest in systemd timers, which support sub-second precision, monotonic intervals, calendar expressions, and randomized delays. Dependency management is where the architectures diverge most sharply — systemd provides explicit, declarative ordering while launchd achieves implicit dependency resolution through its on-demand IPC model, and cron has no dependency concept whatsoever. Portability is cron's unique advantage: as a POSIX-standardized utility, it is available on every Unix-like system.

## Beyond the big three: anacron, fcron, and the cloud-native generation

**Anacron** solves cron's inability to handle systems that are not always on. Rather than running as a daemon, anacron is invoked periodically (typically hourly via cron itself) and checks timestamp files in `/var/spool/anacron/` to determine whether daily, weekly, or monthly jobs are overdue.[^man7anacron] If they are, it runs them after a configurable delay. On most modern Linux distributions, anacron is integrated with cronie and invoked via `/etc/cron.hourly/0anacron`. Its limitation is coarse granularity — it cannot schedule anything more frequent than daily.

**Fcron** merges cron and anacron into a single daemon. It supports three scheduling paradigms: standard cron-style fixed-time entries, frequency-based entries that run once within a time window accounting for downtime, and uptime-based entries that fire relative to system uptime. Fcron adds features absent from standard cron: serial execution (only one serial job at a time), load-average-based scheduling (defer jobs until system load drops below a threshold), per-job nice values, and error-only email notifications.

The cloud-native era has produced a fundamentally different category of scheduler. **Kubernetes CronJobs** schedule containerized workloads using standard five-field cron syntax, inheriting Kubernetes resource management and container isolation. **Apache Airflow** models workflows as Directed Acyclic Graphs in Python, with rich dependency management, retry logic, and a web-based monitoring UI. **AWS EventBridge Scheduler** offers serverless scheduling at massive scale, supporting cron expressions, fixed-rate schedules, and direct invocation of over 200 AWS services. These systems represent a generational shift from single-host time-based scheduling toward distributed, event-driven, infrastructure-as-code orchestration. The humble cron expression lives on in all of them.

[^appledaemons]: Apple Inc. (2016). *Daemons and services programming guide*. Apple Developer Documentation. https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/Introduction.html
[^eclecticlight]: Eclectic Light Company. (2023, January 21). *How macOS schedules background activities*. https://eclecticlight.co/2023/01/21/how-macos-schedules-background-activities/
[^launchdplist]: Apple Inc. (n.d.). *launchd.plist(5) man page*. https://manpagez.com/man/5/launchd.plist/
[^man7anacron]: Kerrisk, M. (Ed.). (2023). *anacron(8) — Linux manual page*. https://www.man7.org/linux/man-pages/man8/anacron.8.html
[^man7cron]: Kerrisk, M. (Ed.). (2023). *cron(8) — Linux manual page*. https://man7.org/linux/man-pages/man8/cron.8.html
[^man7crontab]: Kerrisk, M. (Ed.). (2023). *crontab(5) — Linux manual page*. https://man7.org/linux/man-pages/man5/crontab.5.html
[^man7timer]: Kerrisk, M. (Ed.). (2023). *systemd.timer(5) — Linux manual page*. https://www.man7.org/linux/man-pages/man5/systemd.timer.5.html
[^tn2083]: Apple Inc. (2012). *Technical note TN2083: Daemons and agents*. Apple Developer Documentation. https://developer.apple.com/library/archive/technotes/tn2083/_index.html
