# Mattermost Desktop App — Complete Project Documentation

> Electron + React desktop client replicating the Mattermost UI (dark theme), with messaging, threads, panels, settings, file sharing, and a documented backend-integration seam.
> Generated from a full code + structure audit. Stack versions from `package.json`.

---

## 1. Tech Stack

| Layer      | Technology (version)                              |
| ---------- | ------------------------------------------------- |
| Desktop    | Electron 44 (`electron/main.js`, `electron/preload.js`) |
| UI         | React 19, MUI 9 (`@mui/material`, `@mui/icons-material`) |
| Build      | Vite 8 (`base: "./"`, dev port `5173`, `strictPort`) |
| Routing    | React Router 7 — **HashRouter** (required for Electron `file://`) |
| Emoji      | `emoji-picker-react` 4 (full library in message picker) |
| Fonts      | Plus Jakarta Sans (Google Fonts) + Inter/system fallback |
| Lint       | ESLint 10 + React Hooks + React Compiler plugins (`npm run lint` is clean) |
| Packaging  | electron-builder (`npm run dist`) |

---

## 2. Repository Map

```
mattermost_desktop_app/
├── electron/
│   ├── main.js          ✅ Frameless window (frame:false, 1400×900, min 800×560),
│   │                       no native menu, ipcMain handlers (window + menu-action),
│   │                       maximize/unmaximize event bridge
│   ├── preload.js       ✅ contextBridge `window.electronAPI` (contextIsolation, no nodeIntegration)
│   ├── ipc/             ⚠️ EMPTY directory (scaffolding, see §10)
│   └── services/        ⚠️ EMPTY directory (scaffolding, see §10)
├── src/
│   ├── main.jsx         ✅ React root + HashRouter + global CSS
│   ├── App.jsx          ✅ MUI theme (Jakarta font, button/chip/tab overrides) + ErrorBoundary + routes
│   ├── theme/
│   │   ├── mattermost.js ✅ Design tokens C (colors) + LAYOUT + breakpoints
│   │   └── index.css     ✅ Global font var, smoothing, mono for code
│   ├── data/
│   │   └── mockMattermost.js ✅ USERS, INITIAL_CHANNELS, INITIAL_MESSAGES,
│   │                             THREAD_REPLIES, helpers (getUser/formatNow/renderMessageHtml)
│   ├── hooks/
│   │   └── useMattermost.js  ✅ ALL chat state + handlers (single source of truth)
│   ├── services/
│   │   └── mattermostService.js ⚠️ Written backend contract, currently NOT imported (see §8)
│   ├── utils/
│   │   ├── files.js     ✅ Attachments (formatFileSize, toPending/MessageAttachment, MAX=10)
│   │   └── time.js      ✅ relativeTime ("4 minutes ago")
│   ├── components/
│   │   ├── ErrorBoundary.jsx ✅ Dark crash screen + Reload (no more white windows)
│   │   └── mattermost/ (16 components — all live EXCEPT ServerSidebar.jsx ⚠️)
│   ├── pages/
│   │   ├── Home/index.jsx    ✅ Main screen orchestrator (~850 lines)
│   │   ├── login/index.jsx   ✅ Login (responsive) → /home
│   │   └── Register/index.jsx✅ Register (responsive)
│   ├── layouts/         ⚠️ EMPTY directory (see §10)
│   └── assets/          ⚠️ hero.png / react.svg / vite.svg unreferenced (see §10)
├── public/icons/        ✅ favicon.svg (used) · ⚠️ icons.svg (unreferenced)
├── index.html           ✅ Fonts preconnect + Jakarta/Inter links
├── package.json         ✅ scripts: dev / build / electron / preview / lint / dist
├── vite.config.js / eslint.config.js / README.md / .gitignore ✅
└── dist/                build output (gitignored)
```

---

## 3. Architecture

```
┌─ Electron MAIN (main.js) ─────────────────────────┐
│ Frameless BrowserWindow · Menu=null · ipcMain:     │
│  window-minimize/maximize/close/is-maximized,      │
│  menu-action(File/Edit/View/History/Window/Help)   │
└──────────────▲───────────────────────▲─────────────┘
               │ preload bridge        │ events (maximized-change)
┌──────────────┴───────────────────────┴─────────────┐
│ RENDERER (React)                                    │
│  useMattermost()  ← single state hook (channels,   │
│   messages, threads, replies, panels, input, user)  │
│        │                                            │
│  Home/index.jsx (thin orchestrator: layout + wiring)│
│   ├── WindowTabBar / AppHeader / ChannelSidebar /   │
│   │   ChannelHeader / MessageList / MessageInput /  │
│   │   RightPanel / dialogs / QuickSwitcher / menus  │
│  data/mockMattermost.js ← swap point for real API   │
│  services/mattermostService.js ← backend contract   │
└─────────────────────────────────────────────────────┘
```

**State flow:** `useMattermost` owns everything → `Home` selects/wires → presentational components render. New messages/replies/reactions update `messagesByChannel` / `threadReplies` maps keyed by channel/message id.

---

## 4. Run / Build / Operate (learned the hard way)

| Command | Purpose |
|---|---|
| `npm run dev` | Vite (5173) + Electron together (dev servers run in **separate** consoles) |
| `npx vite` / `npx electron .` | Run each side independently |
| `npm run build` | Production `dist/` for the packaged app |
| `npm run dist` | electron-builder installer (then reinstall to update a Start-Menu copy) |
| `npx eslint src/` | Full lint (currently clean) |

**Operational rules:**
1. `electron/main.js` + `preload.js` load **only at app start** → restart Electron after touching them (renderer HMR does not apply them).
2. Renderer (React) updates **live via HMR** while vite runs — no restart needed for `src/` changes.
3. If the window looks stale: check `netstat` for `:5173`; if vite is down the window is frozen on old code — restart vite, the window live-updates.
4. Never two `vite` instances on 5173; kill stale `electron.exe` by PID (not `/IM`) when a new instance is already up.

---

## 5. Feature Catalog

**Window chrome** — custom light tab strip (server tab + Servers menu, channel tab, new-tab, Downloads, working — □ ✕, drag region, double-click toggles maximize); 3-dot app menu (File/Edit/View/History/Window/Help, dark, real actions via ipc); ErrorBoundary (dark crash panel, never white).
**Navigation** — collapsible channel sidebar (animated, 58px rail, drag-to-resize 180–420px, collapsible CHANNELS / DIRECT MESSAGES groups with counts); Ctrl+K QuickSwitcher (channels+DMs, ↑↓/Enter/Esc); mobile drawer mode <900px; fully shrinkable to 800×560.
**Chat** — send/edit/delete, markdown-lite (`**bold**`, ``code``, `@mention` links), reactions (hover quick strip removed by request; 😊 full 1500-emoji library appends any emoji), pin/save with chips, date dividers, system messages, hover toolbar (Reply/Save/Pin/More menu), message menu (Edit/Copy/Pin/Save/Delete).
**Files** — drag & drop anywhere on chat (dashed overlay), paste from clipboard, 📎 picker (multi), preview chips with remove, images inline + lightbox + Download, file cards, max 10/message; stray drops can never navigate the window away.
**Threads** — screenshot-faithful panel (`Thread | name … Follow ⤢ ✕`, 360→520px expand), parent + real replies with relative times, follow toggle, reply composer (thread toolbar variant `B I S •••`, working 📎), auto-scroll, seeded `THREAD_REPLIES`.
**Right panel tabs** — Members (`N members`, CHANNEL ADMINS/MEMBERS, name+@handle rows, clickable 👥13 count in channel header opens it), Pinned, Files, Search — all dark.
**Mentions** — dark @-popup with CHANNEL MEMBERS / NOT IN CHANNEL sections, status dots, `(you)`, status emoji, ↑↓/Enter/Tab selection.
**Profile modal** — username header, Nickname/Position/Email inline edit, always-expanded Picture block (110px circle, ⓧ remove, BMP/JPG/PNG ≤50MB, Select/Save/Cancel); photo downscaled to 512px data-URL, persisted in `localStorage`, shown via shared `UserAvatar` (topbar, sidebar, messages, threads, members, mentions, switcher).
**Settings modal** — Notifications / Display (theme swatches, clock, teammate names, availability, last-active, timezone select, link/image previews) / Sidebar / Advanced tabs, all editable with Save/Cancel.
**Shortcuts** — `Ctrl/⌘+K` switcher · `Ctrl/⌘+F` focus composer · `Enter` send (`Shift+Enter` newline) · `Esc` closes dialogs.

---

## 6. Data Models

```js
User    { id, name, display, color, status, unread?, inChannel?, statusEmoji?, role? }
Channel { id, name, icon: "lock"|"globe", unread, members, favorite? }
Message { id, userId, time, ts?, text, reactions:[{emoji,count,me}], replies,
          pinned?, saved?, edited?, follow?, divider?, replyMeta?,
          attachments?, threadReplies?, hasImage?, hasDishImage?, system? }
Attachment { id, name, size, type, kind: "image"|"file", url }
Reply   { id, userId, time, ts?, text, attachments? }
Settings { desktopNotif, sound, emailEnabled, keywords, highlight, theme,
           clockDisplay, teammateName, onlineAvailability, shareLastActive,
           timezone, linkPreviews, imagePreviews, groupUnread, dmCount,
           sendOnCtrlEnter, postFormatting, joinLeave, scrollPosition, syncDrafts }
Profile { fullName, username, nickname, position, email, pictureDate, photoUrl }
```

---

## 7. IPC Contract (`window.electronAPI`)

| Call | Direction | Effect |
|---|---|---|
| `windowMinimize / windowMaximize / windowClose` | send | Real frameless window controls |
| `windowIsMaximized()` | invoke → bool | Initial □/❐ icon |
| `onMaximizedChange(cb)` | event → bool | Icon stays correct (Win+arrows included) |
| `menuAction(menu, action)` | send | File(newWindow/closeWindow/quit) · Edit(undo/redo/cut/copy/paste/selectAll via webContents, execCommand fallback in browser) · View(reload/forceReload/devTools/zoom±/reset/fullscreen) · History(back/forward) · Window(front) · Help(docs/about dialog) |
| `sendMessage(msg)` | send | Stub (reserved) |

Security posture: `contextIsolation: true`, `nodeIntegration: false`, minimal exposed surface. ✅

---

## 8. Backend Integration Guide

| To make real… | Swap this → with this |
|---|---|
| Channels/DMs | `INITIAL_CHANNELS` + `USERS` → `GET /channels`, `GET /users/dms` (`channelService.list`, `userService.list` already specify the contract) |
| Messages | `INITIAL_MESSAGES` → `GET /channels/:id/messages` (`messageService.list/send` specify shapes + validation: 4000 chars, 22-char names) |
| Realtime | Add `realtimeService.subscribe` (stub comment in services file) → websocket → same setters |
| Re
...[truncated 4048 chars]