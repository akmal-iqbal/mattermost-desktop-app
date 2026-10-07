/**
 * Mattermost API service abstraction
 * ---------------------------------------------------------
 * Backend dev: replace mock implementations with real HTTP calls.
 * Example:
 *   import apiClient from "./apiClient";
 *   export const fetchChannels = () => apiClient.get("/channels");
 *
 * Frontend can keep using the same function names without changes.
 */
import { INITIAL_CHANNELS, INITIAL_MESSAGES, USERS } from "../data/mockMattermost";

// Simulated latency for realistic UX
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const channelService = {
  /** @returns {Promise<Array>} */
  async list() {
    await delay(150);
    return [...INITIAL_CHANNELS];
  },
  /** @param {string} name @param {"lock"|"globe"} type */
  async create(name, type) {
    await delay(250);
    if (!name?.trim()) throw new Error("Channel name required");
    if (name.length > 22) throw new Error("Channel name too long (max 22)");
    return { id: "c" + Date.now(), name: name.trim(), icon: type, unread: 0, members: 1 };
  },
};

export const messageService = {
  /** @param {string} channelId @returns {Promise<Array>} */
  async list(channelId) {
    await delay(120);
    return [...(INITIAL_MESSAGES[channelId] || [])];
  },
  /** @param {string} channelId @param {string} text @returns {Promise<object>} */
  async send(channelId, text) {
    await delay(150);
    if (!text?.trim()) throw new Error("Message empty");
    if (text.length > 4000) throw new Error("Message too long (4000)");
    return { id: "m" + Date.now(), userId: "me", time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), text, reactions: [], replies: 0 };
  },
};

export const userService = {
  async list() {
    await delay(100);
    return [...USERS];
  },
  async updateProfile(patch) {
    await delay(200);
    // Validate email etc.
    if (patch.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email)) throw new Error("Invalid email");
    return patch;
  },
};

// For future WebSocket:
// export const realtimeService = { subscribe(channelId, cb) { ... } }
