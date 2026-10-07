import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { INITIAL_CHANNELS, INITIAL_MESSAGES, getUser, formatNow } from "../data/mockMattermost";

/**
 * Central hook for Mattermost state
 * - Keeps all chat state in one place for easy backend replacement
 * - Returns memoized handlers with useCallback to avoid re-renders
 * - All mutations guard against undefined channel (new DM race)
 */
export function useMattermost() {
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState("c5");
  const [selectedDM, setSelectedDM] = useState(null);
  const [messagesByChannel, setMessagesByChannel] = useState(INITIAL_MESSAGES);
  const [threadForRaw, setThreadFor] = useState("f4");
  const [rightTab, setRightTab] = useState("thread");
  const [rightOpen, setRightOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // left sidebar filter
  const [rightSearch, setRightSearch] = useState(""); // right panel search (separate!)
  const [globalSearch, setGlobalSearch] = useState("");
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState("lock");
  const [showAddDM, setShowAddDM] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState("profile");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState("notifications");
  const [userStatus, setUserStatus] = useState("online");

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  const activeChannel = useMemo(() => channels.find((c) => c.id === selectedChannel), [channels, selectedChannel]);
  const activeMessages = useMemo(() => messagesByChannel[selectedChannel] || [], [messagesByChannel, selectedChannel]);
  const threadFor = useMemo(() => {
    if (!threadForRaw) return null;
    return (messagesByChannel[selectedChannel] || []).some((m) => m.id === threadForRaw) ? threadForRaw : null;
  }, [threadForRaw, selectedChannel, messagesByChannel]);

  // auto scroll
  useEffect(() => {
    if (listRef.current) requestAnimationFrame(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; });
  }, [activeMessages, selectedChannel]);

  // hotkeys
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); document.getElementById("global-search")?.focus(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const newMsg = { id: "m" + Date.now(), userId: "me", time: formatNow(), text, reactions: [], replies: 0, pinned: false, saved: false };
    setMessagesByChannel((prev) => ({ ...prev, [selectedChannel]: [...(prev[selectedChannel] || []), newMsg] }));
    setInput("");
  }, [input, selectedChannel]);

  const deleteMessage = useCallback((id) => {
    setMessagesByChannel((prev) => ({ ...prev, [selectedChannel]: (prev[selectedChannel] || []).filter((m) => m.id !== id) }));
    setThreadFor((prev) => (prev === id ? null : prev));
  }, [selectedChannel]);

  const startEdit = useCallback((m) => { setEditingId(m.id); setEditText(m.text); }, []);
  const saveEdit = useCallback(() => {
    if (!editText.trim()) return;
    setMessagesByChannel((prev) => ({ ...prev, [selectedChannel]: (prev[selectedChannel] || []).map((m) => (m.id === editingId ? { ...m, text: editText, edited: true } : m)) }));
    setEditingId(null);
  }, [editText, editingId, selectedChannel]);

  const toggleReaction = useCallback((msgId, emoji) => {
    setMessagesByChannel((prev) => ({
      ...prev,
      [selectedChannel]: (prev[selectedChannel] || []).map((m) => {
        if (m.id !== msgId) return m;
        const idx = (m.reactions || []).findIndex((r) => r.emoji === emoji);
        if (idx >= 0) {
          const copy = [...m.reactions];
          if (copy[idx].me) {
            copy[idx] = { ...copy[idx], count: copy[idx].count - 1, me: false };
            if (copy[idx].count <= 0) copy.splice(idx, 1);
          } else copy[idx] = { ...copy[idx], count: copy[idx].count + 1, me: true };
          return { ...m, reactions: copy };
        }
        return { ...m, reactions: [...(m.reactions || []), { emoji, count: 1, me: true }] };
      }),
    }));
  }, [selectedChannel]);

  const toggleFavorite = useCallback((id) => setChannels((p) => p.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))), []);
  const togglePin = useCallback((id) => {
    setMessagesByChannel((prev) => ({ ...prev, [selectedChannel]: (prev[selectedChannel] || []).map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)) }));
  }, [selectedChannel]);
  const toggleSave = useCallback((id) => {
    setMessagesByChannel((prev) => ({ ...prev, [selectedChannel]: (prev[selectedChannel] || []).map((m) => (m.id === id ? { ...m, saved: !m.saved } : m)) }));
  }, [selectedChannel]);

  const createChannel = useCallback(() => {
    const name = newChannelName.trim();
    if (!name) return;
    if (channels.some((c) => c.name.toLowerCase() === name.toLowerCase())) { alert("Channel already exists"); return; }
    const id = "c" + Date.now();
    setChannels((p) => [...p, { id, name, icon: newChannelType, unread: 0, members: 1 }]);
    setMessagesByChannel((p) => ({ ...p, [id]: [] }));
    setSelectedChannel(id);
    setSelectedDM(null);
    setNewChannelName("");
    setShowCreateChannel(false);
  }, [newChannelName, newChannelType, channels]);

  const filteredChannels = useMemo(() => {
    let list = channels;
    if (searchQuery) list = list.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [channels, searchQuery]);

  const globalResults = useMemo(() => {
    if (!globalSearch.trim()) return [];
    const q = globalSearch.toLowerCase();
    const results = [];
    Object.entries(messagesByChannel).forEach(([cid, msgs]) => {
      msgs.forEach((m) => {
        if (String(m.text || "").toLowerCase().includes(q)) {
          const ch = channels.find((c) => c.id === cid);
          results.push({ ...m, channelName: ch?.name || cid, cid });
        }
      });
    });
    return results.slice(0, 8);
  }, [globalSearch, messagesByChannel, channels]);

  return {
    // state
    channels, selectedChannel, selectedDM, messagesByChannel, activeChannel, activeMessages, threadFor, rightTab, rightOpen, searchQuery, rightSearch, globalSearch, input, editingId, editText, showCreateChannel, newChannelName, newChannelType, showAddDM, showProfile, profileTab, showSettings, settingsTab, userStatus,
    // setters
    setSelectedChannel, setSelectedDM, setMessagesByChannel, setThreadFor, setRightTab, setRightOpen, setSearchQuery, setRightSearch, setGlobalSearch, setInput, setEditingId, setEditText, setShowCreateChannel, setNewChannelName, setNewChannelType, setShowAddDM, setShowProfile, setProfileTab, setShowSettings, setSettingsTab, setUserStatus,
    // refs
    listRef, inputRef, fileRef,
    // handlers
    sendMessage, deleteMessage, startEdit, saveEdit, toggleReaction, toggleFavorite, togglePin, toggleSave, createChannel, filteredChannels, globalResults, getUser,
  };
}
