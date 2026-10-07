/**
 * Mock data for Mattermost UI
 * @description Backend developers: replace these exports with API calls.
 * All functions are pure and side-effect free for easy swapping.
 * See src/services/mattermostService.js for API abstraction.
 */

// --- Users ---
export const USERS = [
  { id: "u1", name: "shahrukh.rafi-dm", display: "shahrukh.rafi-dm", color: "#7c4dff", status: "online" },
  { id: "u2", name: "Alisha Noor-SD", display: "Alisha Noor", color: "#4caf50", status: "online" },
  { id: "u3", name: "muhammad.jamal-sd", display: "muhammad.jamal-sd", color: "#ff9800", status: "away" },
  { id: "u4", name: "Muhammad Ali Bin S...", display: "Muhammad Ali Bin S...", color: "#546e7a", status: "offline", unread: 4 },
  { id: "u5", name: "Mahnoor Fatima-SD", display: "Mahnoor Fatima-SD", color: "#ff6d00", status: "offline" },
  { id: "u6", name: "uzair.munirdm", display: "uzair.munirdm", color: "#e91e63", status: "online" },
  { id: "u7", name: "Mirza Arman", display: "Mirza Arman", color: "#8d6e63", status: "online" },
  { id: "u8", name: "rozeena.arif-sd", display: "rozeena.arif-sd", color: "#ff8f00", status: "online" },
  { id: "u9", name: "M.Usman-SD Ext-5504", display: "M.Usman-SD Ext-5504", color: "#00897b", status: "offline" },
  { id: "me", name: "akmal.iqbal", display: "Akmal Iqbal", color: "#7c3aed", status: "online" },
];

// --- Channels ---
export const INITIAL_CHANNELS = [
  { id: "c1", name: "IPS Design SD & DM", icon: "lock", unread: 0, members: 8 },
  { id: "c2", name: "NA-Pakistan", icon: "lock", unread: 2, members: 12 },
  { id: "c3", name: "IPS-Constructem", icon: "lock", unread: 0, members: 5 },
  { id: "c4", name: "IPS-BPO", icon: "lock", unread: 0, members: 9 },
  { id: "c5", name: "IPS-FOODO", icon: "lock", unread: 0, members: 13 },
  { id: "c6", name: "IPS-UNI", icon: "lock", unread: 0, members: 11, pinned: 1, favorite: false },
  { id: "c7", name: "QPPMIPPS-Team", icon: "lock", unread: 0, members: 7 },
  { id: "c8", name: "IPS-Official", icon: "globe", unread: 0, members: 42 },
  { id: "c9", name: "P3care-Team", icon: "lock", unread: 0, members: 15 },
  { id: "c10", name: "IT-Support", icon: "globe", unread: 0, members: 20 },
];

// --- Messages ---
export const INITIAL_MESSAGES = {
  c5: [
    { id: "f1", userId: "sys", time: "", text: "please share the image of this dish", system: true, reactions: [], replies: 0 },
    { id: "f2", userId: "u6", time: "8:51 PM", text: "sharing", reactions: [{ emoji: "👍", count: 1, me: false }], replies: 0, follow: false },
    { id: "f3", userId: "u1", time: "8:55 PM", text: "", hasDishImage: true, reactions: [{ emoji: "😍", count: 3, me: false }, { emoji: "🔥", count: 1, me: true }], replies: 0 },
    { id: "f4", userId: "u7", time: "2:53 PM", text: "@shahrukh.rafi-dm\n alu shimla\n price same , image same , title same , menu ma ak jgha 200g ha , ak jgha 250g . tell me what to consider ?", reactions: [{ emoji: "👀", count: 2, me: false }], replies: 2, follow: true, divider: "Today" },
    { id: "f5", userId: "u5", time: "", text: "mari taraf sy almost ho gya sara", replyMeta: { count: 1, follow: true }, reactions: [], replies: 1 },
    { id: "f6", userId: "u5", time: "", text: "test kr lyn.", replyMeta: { count: 1, follow: true }, reactions: [{ emoji: "✅", count: 1, me: true }], replies: 1 },
    { id: "f7", userId: "u1", time: "2:55 PM", text: "ok sure", reactions: [{ emoji: "👍", count: 2, me: false }], replies: 0 },
  ],
  c6: [
    { id: "m1", userId: "u5", time: "8:12 PM", text: "@shahrukh.rafi-dm what will be the deadline here?", reactions: [{ emoji: "👍", count: 2, me: false }], replies: 1, hasImage: true, pinned: false, saved: false },
    { id: "m2", userId: "u1", time: "8:14 PM", text: "Deadline is **next Friday — 16 May**. Please ensure CAQH is updated before EOD.", reactions: [], replies: 0, pinned: false, saved: true },
    { id: "m3", userId: "me", time: "8:15 PM", text: "Got it — I've added the timeline to the tracker :white_check_mark:\n\n`Enrollment Tracker → IPS-UNI` updated.", reactions: [{ emoji: "✅", count: 1, me: true }], replies: 0 },
  ],
  c1: [
    { id: "m10", userId: "u2", time: "9:02 AM", text: "Design handoff for **SD & DM** is ready. Figma link: https://figma.com/file/ips-design", reactions: [], replies: 0 },
    { id: "m11", userId: "me", time: "9:05 AM", text: "Reviewed — looks great. One comment on the credentialing flow.", reactions: [], replies: 0 },
  ],
  c9: [{ id: "m20", userId: "u3", time: "Yesterday 4:30 PM", text: "P3care pending enrollments: 12. 3 need revalidation.", reactions: [], replies: 0 }],
};

export const THREAD_REPLIES = {
  m1: [{ id: "t1", userId: "u1", time: "8:13 PM", text: "Will confirm with payer and update thread." }],
  f4: [
    { id: "t2", userId: "u7", time: "22 minutes ago", text: "test kr lyn.", replyCount: 1 },
    { id: "t3", userId: "u5", time: "19 minutes ago", text: "ignore", replyCount: 0 },
  ],
  f5: [{ id: "t5", userId: "u7", time: "20 minutes ago", text: "ok noted" }],
  f6: [{ id: "t6", userId: "u7", time: "18 minutes ago", text: "done" }],
};

export const REACTION_QUICK = ["👍", "❤️", "😂", "🎉", "✅", "👀", "🙏", "🔥"];

// --- Helpers ---
/**
 * Safely get user by id, fallback to first user but logs warning in dev.
 * @param {string} id
 * @returns {object}
 */
export function getUser(id) {
  const found = USERS.find((u) => u.id === id);
  if (!found && id !== "sys") {
    if (import.meta.env.DEV) console.warn(`[mock] unknown user id: ${id}`);
    return USERS[0];
  }
  // system message sentinel
  if (id === "sys") return { id: "sys", display: "", color: "transparent", status: "offline", name: "" };
  return found || USERS[0];
}

export function formatNow() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * Sanitize + render markdown-lite safely (backend should sanitize HTML server-side)
 * @param {string} text
 * @returns {string} escaped HTML
 */
export function renderMessageHtml(text) {
  const safe = String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return safe
    .replace(/@([\w.-]+)/g, '<span style="color:#5aa9ff;font-weight:600">@$1</span>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/:white_check_mark:/g, "✅");
}
