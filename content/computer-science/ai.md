---
title: "Claude Fundamentals"
date: 2026-10-08
draft: false
tags:
  - ai
  - anthropic
  - claude
  - llm
---

**Claude** is a family of large language models from Anthropic, and also the name of the apps that give access to those models. A person who uses Claude makes a small number of decisions that control each result: which model answers, how much work the model does, which external information it can read, what it keeps between conversations, and which actions it can do without approval. This entry describes those controls for the 5.5 generation of the three main tiers: **Opus**, **Sonnet**, and **Haiku**.

Three terms occur in each section. A **token** is a small unit of text, and usage limits and API prices are counted in tokens. The **context window** is the maximum quantity of text that a model can read in one conversation. The **knowledge cutoff** is the date where the training data of a model stops. The details in this entry were verified on October 8, 2026. Claude products change frequently, thus the cited sources have priority over this text.

## Model tiers

The three tiers are one trade-off at three points: capability against speed and cost. Opus 5.5 is built for long agentic coding and knowledge work, Sonnet 5.5 gives the best combination of speed and intelligence, and Haiku 5.5 is for high-volume tasks where latency is important, such as classification, extraction, and routing.[^anthropic-nd-f] A more capable model costs more for each token and replies more slowly. The correct tier is thus the smallest one that does the task well, and Anthropic recommends that approach for prototypes, tight latency limits, and simple tasks in high volume.[^anthropic-nd-b]

| | Opus 5.5 | Sonnet 5.5 | Haiku 5.5 |
|---|---|---|---|
| Role | Most capable of the three | Balance of speed and intelligence | Fastest, lowest cost |
| Relative latency | Moderate | Fast | Fastest |
| API price, input / output (per 1M tokens) | $4 / $20 | $2 / $10 | From $0.10 / $0.50 |
| Default effort (API) | `medium` | `high` | `medium` |
| Thinking | Adaptive, always on | Adaptive | Adaptive |
| Typical work | Long, complex tasks; large code changes; deep analysis | Daily code, data analysis, and writing | Quick answers; simple tasks in high volume |
| API ID | `claude-opus-5-5` | `claude-sonnet-5-5` | `claude-haiku-5-5` |

Apart from these differences, the three models have the same limits: text and image input, text output, a context window of 1M tokens, a maximum output of 128K tokens, and a knowledge cutoff of June 2026.[^anthropic-nd-f] Haiku 5.5 is the newest of the three, with a release date of October 7, 2026.[^anthropic-nd-c] The API prices show relative cost only. In the Claude apps, a plan with usage limits replaces the price for each token. Anthropic also has a tier above Opus (for example, Claude Fable 5.1), which is outside the scope of this entry.[^anthropic-nd-f]

## Effort

**Effort** sets how many tokens a model spends on a reply. It applies to all output: thinking, tool calls, and visible text.[^anthropic-nd-d] The setting exists because one model can do the same task at different levels of thoroughness. Effort thus trades quality for speed and cost inside one model, and a change of effort is frequently a better control than a change of model.[^anthropic-nd-b]

| Level | Behavior | Typical use |
|---|---|---|
| `low` | Most efficient. Large token savings with some loss of capability. | Simple tasks; quick chat |
| `medium` | Balance of speed, cost, and quality. | Routine work |
| `high` | Uses as many tokens as the task needs. | Complex reasoning; difficult code problems |
| `xhigh` (Extra high) | More capability for long work. | Code and agent tasks longer than 30 minutes |
| `max` | Maximum capability with no limit on token use. | The most difficult problems only |

Effort is a behavioral signal and not a strict token budget. At a low level, the model still thinks about a sufficiently difficult problem, but it thinks less than it does at a higher level.[^anthropic-nd-d] The 5.5 models use **adaptive thinking**, in which the model decides when to think and how deeply, and effort steers that decision. On Opus 5.5, thinking is always on, which makes effort the primary control for reasoning depth and cost. In the API, the three models accept all five levels. Opus 5.5 and Haiku 5.5 default to `medium`, and Sonnet 5.5 defaults to `high`.[^anthropic-nd-d]

### Changing the setting

In the apps, the model menu adjacent to the send button contains the model and the effort level.[^anthropic-nd-a]

1. Click the model name.
2. Click "Effort".
3. Select a level. The menu shows the recommended level as "Default".

A change can occur at any point in a conversation, and it applies from the next reply. A higher level gives a more thorough reply, but the reply takes longer and uses the usage limit faster.[^anthropic-nd-a] The levels that the app menu shows are not always the same as the API list.

### Selecting a model and an effort level

Anthropic's guidance is that the defaults are sufficient for everyday tasks, that complex tasks get a higher level, and that the maximum level is for the most difficult work where correctness is critical.[^anthropic-nd-a] The table below combines that guidance with the tier roles. It is a set of start points and not an official matrix.

| Task | Model | Effort |
|---|---|---|
| Quick fact, short rewrite, simple extraction | Haiku 5.5 | `low` or `medium` |
| Daily writing, code, data analysis | Sonnet 5.5 | `medium` or `high` |
| Complex, long work with many steps | Opus 5.5 | `medium`, then `high` |
| Most difficult work where errors are expensive | Opus 5.5 | `xhigh` or `max` |

## Web search

A model does not know events after its knowledge cutoff. **Web search** closes that gap: Claude calls a search tool, reads the results, and grounds the reply in content from the live web. Each reply that uses a search includes citations, which lets the reader verify the sources.[^anthropic-nd-e] With web search on, Claude can also read a full page from a URL that the user supplies, a function with the name **web fetch**, and it can show image results with source links.

How the feature starts depends on the interface. In the classic interface, the user clicks "+" in the chat box and then "Web search". In the new Claude experience there is no switch, and Claude searches when a search helps. On Team and Enterprise plans, an owner must first enable web search for the organization.[^anthropic-nd-e]

The prompt can steer the behavior. An instruction to search the web makes sure that a search occurs, and an instruction not to search prevents it. Search and fetch count against the usage limit. A fetched page goes into the context window in full, thus a long article can use a significant part of that limit. Two more limits apply: some links do not work, and Claude can use an approximate location, inferred from the IP address, for local results.[^anthropic-nd-e]

## Research

**Research** is the agentic form of web search. Claude does multiple searches that build on each other, decides what to examine next, and delivers an answer with citations in minutes.[^anthropic2026a] It reads the web and also the connected apps of the user, such as Gmail, Google Calendar, and Google Docs. The feature is available on the paid plans (Pro, Max, Team, and Enterprise), and web search must be on. To start it, the user clicks "+" in the chat box and then "Research". A blue indicator shows while the mode is active.

Research has the same usage limits as chat, but it uses them faster, because Claude retrieves many sources and writes a long reply.[^anthropic2026a] This cost is the reason to keep the two features apart.

| | Web search | Research |
|---|---|---|
| Speed | Fast | Minutes |
| Depth | A small number of sources | Many sources |
| Output | Short reply with citations | Full report with citations |
| Typical use | Current facts; quick checks | Comparisons; deep topics; decisions |

If Research does not start, an explicit request in the prompt to use the research tool corrects this.[^anthropic2026a]

## Memory

A language model has no state between conversations, thus each new chat starts with no knowledge of the user. Two features change this. **Memory** saves facts as individual topics while the chat occurs, and does not make a summary after the chat ends. A fact from one conversation is thus available in the next one. **Chat search** retrieves content from past conversations when the user asks, shows as a tool call, and is available on the paid plans only.[^anthropic-nd-g]

Memory is on by default on the Free, Pro, and Max plans. On Team and Enterprise plans, an owner controls the feature, and it stays off for each member until that member turns it on. Each project has a separate memory space, which keeps the context of one project apart from other projects and from other chats.[^anthropic-nd-g]

### What is stored

Claude keeps the everyday context that helps it work with a person: role and projects, the people and places in work and life, and preferences for communication, tools, and code. Three categories are outside this default.[^anthropic-nd-g]

| Category | Rule |
|---|---|
| Sensitive topics (health, religion, politics, ethnicity, gender identity) | Not stored by default. The user can turn on "Include sensitive topics in memory". |
| Government ID numbers, financial account numbers, criminal history, immigration status | Never stored, also on request. |
| **Incognito chats** | Never stored in memory or in the chat history. |

### Controls

All memory settings are in Settings > Memory, and some controls are in the chat box.[^anthropic-nd-g]

| Action | Method |
|---|---|
| Turn memory on or off | "Generate memory from chats" |
| Read, edit, or delete memory | Topics list |
| Add or remove a fact during a chat | Tell Claude to remember or to forget it |
| Pause | Claude keeps the memory but does not use it or add to it |
| Reset | Permanently deletes all memory, project memory included |
| No memory for one chat | Click "+", then turn off "Memory", before the first message |
| Incognito chat | Ghost icon in a new chat |
| Stop chat search | "Search and reference chats" |

The difference between pause and reset is important. A pause is reversible. A reset is not.

## Skills

A **skill** is a folder of instructions that teaches Claude a specified task or workflow. Claude identifies and loads the applicable skill automatically, from the task, and each skill has a description that tells Claude when to use it. A request for a PowerPoint presentation, for example, starts the PowerPoint skill with no instruction from the user. Anthropic supplies built-in skills for Excel, Word, PowerPoint, and PDF files.[^anthropic-nd-i]

A user can also upload a custom skill as a ZIP file that contains the skill folder. A custom skill is private to the account of that user. Skills are available on the Pro, Max, Team, and Enterprise plans, need "Code execution and file creation" to be on, and are in Settings > Capabilities. If Claude does not use a skill, the usual causes are a description that is not clear or a skill that is off, and the name of the skill in the prompt is a quick correction.[^anthropic-nd-i]

A skill can contain code, and it can tell Claude to install third-party software. Anthropic names two primary risks. The first is **prompt injection**, in which text manipulates Claude into actions that the user did not intend. The second is data exfiltration through malicious package code. The guidance is to install skills from trusted sources only and to read the files in a skill before use.[^anthropic-nd-i]

## Permissions

Permissions decide what Claude can access and what it can do without approval. They become important when Claude uses a **connector**, which links Claude to an app or service. Through a connector, Claude can retrieve data and do actions, such as create an issue in Linear, send a message in Slack, or search files in Google Drive.[^anthropic-nd-h] Control comes from four layers, and each layer can only make the access smaller.

| Layer | What it controls | Who sets it |
|---|---|---|
| Source service | Claude inherits the permissions of the person in the connected app. It cannot get more. | The app |
| Connector tool permissions | Each tool of a connector: allowed, approval necessary, or blocked | The user or an owner |
| Permission mode | How frequently Claude stops for approval during a task | The user |
| Organization controls | The features, connectors, and websites that are permitted | Owner (Team, Enterprise) |

### Connector tool permissions

Each connector lists its tools in Customize > Connectors, in groups such as read-only tools and write or delete tools. Each tool or group has one of three settings.[^anthropic-nd-h]

| Setting | Behavior |
|---|---|
| Always allow | Claude uses the tool with no prompt. |
| Needs approval | Claude stops and asks each time. |
| Blocked | Claude cannot use the tool. |

A usual configuration allows the tools that read and puts approval on the tools that write or delete. An example is a connector that can search and summarize email but cannot send a message. A setting in Claude never gives more access than the source system permits.[^anthropic-nd-h]

### Permission modes

When Claude does actions in a browser through Claude in Chrome, a menu on the chat input sets one of three modes.[^anthropic2026b]

| Mode | Behavior | Risk |
|---|---|---|
| Manually approve | Claude asks before each action. The user selects Allow or Deny. | Lowest |
| Automatically approve | Claude continues. A safety check examines each action and blocks unsafe actions. | Medium |
| Skip all approvals | Claude does not ask, and no automatic check occurs. | Highest |

The automatic mode trades prompts for a background check, and that check uses more of the usage limit than the other modes. Anthropic states that no mode replaces the judgment of the user. For work with real consequences, such as money, messages sent in the name of the user, and important files, the manual mode is the recommended selection. The mode that skips all approvals is only for a task where the user fully trusts each action, connector, file, and app.[^anthropic2026b]

### Fixed limits

Some rules apply in Claude in Chrome in all modes.[^anthropic2026b] Claude always asks for explicit permission before it does these actions:

- Change permission settings
- Grant authorizations
- Enter potentially sensitive information in a website

Claude never does these actions:

- Purchases or financial transactions
- Account creation
- Permanent deletion of files, emails, or messages
- Financial trades
- Instructions that come from emails or web content

The last rule is a direct defense against prompt injection. Text in a web page or an email is data for Claude to read, not a command for Claude to obey.

[^anthropic-nd-a]: Anthropic. (n.d.-a). [*Change the model, effort, and thinking settings*](https://support.claude.com/en/articles/8664678). Claude Help Center. Retrieved October 8, 2026.
[^anthropic-nd-b]: Anthropic. (n.d.-b). [*Choosing the right model*](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model). Claude Platform Docs. Retrieved October 8, 2026.
[^anthropic-nd-c]: Anthropic. (n.d.-c). [*Claude Haiku 5.5*](https://platform.claude.com/docs/en/models/haiku-5-5/overview). Claude Platform Docs. Retrieved October 8, 2026.
[^anthropic-nd-d]: Anthropic. (n.d.-d). [*Effort*](https://platform.claude.com/docs/en/build-with-claude/effort). Claude Platform Docs. Retrieved October 8, 2026.
[^anthropic-nd-e]: Anthropic. (n.d.-e). [*Enable and use web search*](https://support.claude.com/en/articles/10684626-enable-and-use-web-search). Claude Help Center. Retrieved October 8, 2026.
[^anthropic-nd-f]: Anthropic. (n.d.-f). [*Models overview*](https://platform.claude.com/docs/en/models/overview). Claude Platform Docs. Retrieved October 8, 2026.
[^anthropic-nd-g]: Anthropic. (n.d.-g). [*Use Claude's chat search and memory to build on previous context*](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context). Claude Help Center. Retrieved October 8, 2026.
[^anthropic-nd-h]: Anthropic. (n.d.-h). [*Use connectors to extend Claude's capabilities*](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities). Claude Help Center. Retrieved October 8, 2026.
[^anthropic-nd-i]: Anthropic. (n.d.-i). [*Using Skills in Claude*](https://support.claude.com/en/articles/12512180-using-skills-in-claude). Claude Help Center. Retrieved October 8, 2026.
[^anthropic2026a]: Anthropic. (2026a, June 2). [*Use research on Claude*](https://support.claude.com/en/articles/11088861-use-research-on-claude). Claude Help Center.
[^anthropic2026b]: Anthropic. (2026b, August 12). [*Claude in Chrome permissions guide*](https://support.claude.com/en/articles/12902446-claude-in-chrome-permissions-guide). Claude Help Center.
