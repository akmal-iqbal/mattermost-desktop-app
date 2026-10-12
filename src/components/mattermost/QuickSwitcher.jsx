import { useState, useEffect, useRef } from "react";
import { Box, Typography, Dialog, InputBase, Badge, IconButton } from "@mui/material";
import { Search as SearchIcon, LockOutlined as LockIcon, Language as GlobeIcon, Star as StarIcon, Close as CloseIcon } from "@mui/icons-material";
import { C } from "../../theme/mattermost";
import UserAvatar from "./UserAvatar";

/**
 * Quick switcher (Ctrl+K): search + jump to any channel or DM.
 * ↑↓ to navigate, Enter to open, Esc to close.
 * Backend: channels/DMs -> GET /channels + GET /users/dms ; ranking server-side later
 */
export default function QuickSwitcher({ open, onClose, channels = [], users = [], selectedChannel, selectedDM, onSelectChannel, onSelectDM }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [open ]);

  const q = query.trim().toLowerCase();
  const matchedChannels = (channels || []).filter((c) => !q || c.name.toLowerCase().includes(q));
  const matchedDMs = (users || []).filter(
    (u) => u.id !== "me" && (!q || u.name.toLowerCase().includes(q) || String(u.display || "").toLowerCase().includes(q)),
  );
  const rows = [
    ...matchedChannels.map((c) => ({ key: `c:${c.id}`, kind: "channel", data: c })),
    ...matchedDMs.map((u) => ({ key: `d:${u.id}`, kind: "dm", data: u })),
  ];
  const safeActive = rows.length ? Math.min(active, rows.length - 1) : 0;
  const activeKey = rows[safeActive]?.key;

  useEffect(() => {
    if (activeKey) itemRefs.current[activeKey]?.scrollIntoView?.({ block: "nearest" });
  }, [activeKey]);

  const choose = (row) => {
    if (!row) return;
    if (row.kind === "channel") onSelectChannel(row.data.id);
    else onSelectDM(row.data.id);
  };

  const handleClose = () => {
    setQuery("");
    setActive(0);
    onClose();
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (rows.length ? (a + 1) % rows.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (rows.length ? (a - 1 + rows.length) % rows.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(rows[safeActive]);
    }
  };

  const setRowRef = (key) => (el) => {
    if (el) itemRefs.current[key] = el;
  };

  const rowSx = (idx, isCurrent) => ({
    display: "flex",
    alignItems: "center",
    gap: 1,
    px: 1.2,
    py: 0.7,
    borderRadius: 1,
    cursor: "pointer",
    bgcolor: idx === safeActive ? "rgba(61,125,232,0.20)" : isCurrent ? "rgba(255,255,255,0.05)" : "transparent",
    "&:hover": { bgcolor: "rgba(61,125,232,0.14)" },
  });

  const unreadBadge = (n) =>
    n > 0 ? (
      <Box sx={{ minWidth: 18, height: 18, borderRadius: 9, bgcolor: "#e53935", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", px: 0.5 }}>{n}</Box>
    ) : null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      slotProps={{ paper: { sx: { width: "min(580px, 94vw)", bgcolor: "#1e2333", borderRadius: 2, border: "1px solid rgba(255,255,255,0.10)", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.55)" } } }}
      sx={{ "& .MuiDialog-container": { alignItems: "flex-start", justifyContent: "center", pt: { xs: "6vh", md: "10vh" } } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.6, py: 1.2, borderBottom: `1px solid ${C.border}` }}>
        <SearchIcon sx={{ fontSize: 18, color: C.textMuted, flexShrink: 0 }} />
        <InputBase
          inputRef={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={onKey}
          placeholder="Search channels and direct messages…"
          sx={{ flex: 1, fontSize: 14, color: "#fff", "& input::placeholder": { color: C.textMuted, opacity: 1 } }}
        />
        {query && (
          <IconButton size="small" onClick={() => setQuery("")} sx={{ color: C.textMuted, width: 22, height: 22 }} aria-label="Clear search">
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ maxHeight: 340, overflowY: "auto", p: 0.8, "&::-webkit-scrollbar": { width: 5 }, "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.14)", borderRadius: 3 } }}>
        {matchedChannels.length > 0 && (
          <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: C.textMuted, px: 1.2, pt: 0.6, pb: 0.4 }}>CHANNELS</Typography>
        )}
        {matchedChannels.map((c) => {
          const idx = rows.findIndex((r) => r.key === `c:${c.id}`);
          const isCurrent = selectedChannel === c.id && !selectedDM;
          return (
            <Box key={c.id} ref={setRowRef(`c:${c.id}`)} onClick={() => choose(rows[idx])} onMouseEnter={() => setActive(idx)} sx={rowSx(idx, isCurrent)}>
              {c.favorite ? <StarIcon sx={{ fontSize: 14, color: "#facc15" }} /> : c.icon === "lock" ? <LockIcon sx={{ fontSize: 14, color: C.textMuted }} /> : <GlobeIcon sx={{ fontSize: 14, color: C.textMuted }} />}
              <Typography sx={{ fontSize: 13.5, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: C.textPrimary, fontWeight: isCurrent ? 600 : 400 }}>{c.name}</Typography>
              {unreadBadge(c.unread)}
            </Box>
          );
        })}

        {matchedDMs.length > 0 && (
          <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: C.textMuted, px: 1.2, pt: 1, pb: 0.4 }}>DIRECT MESSAGES</Typography>
        )}
        {matchedDMs.map((u) => {
          const idx = rows.findIndex((r) => r.key === `d:${u.id}`);
          const isCurrent = selectedDM === u.id;
          return (
            <Box key={u.id} ref={setRowRef(`d:${u.id}`)} onClick={() => choose(rows[idx])} onMouseEnter={() => setActive(idx)} sx={rowSx(idx, isCurrent)}>
              <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: u.status === "online" ? "#3db33d" : u.status === "away" ? "#ffbc1f" : "#9aa4b2", border: "1.5px solid #1e2333" }} />}>
                <UserAvatar user={u} size={24} fontSize={11} />
              </Badge>
              <Typography sx={{ fontSize: 13.5, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.display}</Typography>
              <Typography sx={{ fontSize: 11.5, color: C.textMuted, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>@{u.name}</Typography>
              {unreadBadge(u.unread)}
            </Box>
          );
        })}

        {rows.length === 0 && (
          <Box sx={{ px: 1.2, py: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>No results for “{query.trim()}”</Typography>
            <Typography sx={{ fontSize: 12, color: C.textMuted, mt: 0.5 }}>Try a different channel or teammate name.</Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1.6, px: 1.6, py: 0.9, borderTop: `1px solid ${C.border}` }}>
        {[
          ["↑↓", "navigate"],
          ["Enter", "open"],
          ["Esc", "close"],
        ].map(([k, label]) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Box sx={{ px: 0.7, py: 0.15, borderRadius: 0.75, bgcolor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)", fontSize: 10.5, fontWeight: 700, color: C.textPrimary }}>{k}</Box>
            <Typography sx={{ fontSize: 11, color: C.textMuted }}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}
