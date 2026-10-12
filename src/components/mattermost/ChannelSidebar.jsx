import { useState } from "react";
import { Box, Typography, IconButton, InputBase, Avatar, Badge, Tooltip } from "@mui/material";
import { Search as SearchIcon, Star as StarIcon, LockOutlined as LockIcon, Language as GlobeIcon, Add as AddIcon, ExpandMore as ExpandMoreIcon, FilterList as FilterListIcon, ForumOutlined as ThreadsIcon, Circle as CircleIcon, ChevronLeft as CollapseIcon, ChevronRight as ExpandIcon } from "@mui/icons-material";
import { C, LAYOUT } from "../../theme/mattermost";
import UserAvatar from "./UserAvatar";

/**
 * Channel + DM list sidebar
 * Backend: channels -> GET /channels ; DMs -> GET /users/dms
 */
export default function ChannelSidebar({
  filteredChannels,
  selectedChannel,
  selectedDM,
  searchQuery,
  setSearchQuery,
  favoritesOnly,
  setFavoritesOnly,
  onSelectChannel,
  onSelectDM,
  onCreateChannel,
  onAddDM,
  users,
  onOpenThreads,
  collapsed = false,
  onToggleCollapse,
  width,
  currentUser = { display: "Akmal Iqbal", color: "#7c3aed", photoUrl: null },
}) {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);
  const dmUsers = (users || []).filter((u) => u.id !== "me");
  const toggleOnKey = (fn) => (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn((v) => !v); }
  };
  // Collapsed rail — slim expandable sidebar
  if (collapsed) {
    return (
      <Box
        sx={{
          width: 58,
          bgcolor: C.sidebarBg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          borderRight: `1px solid ${C.border}`,
          overflow: "hidden",
          py: 1,
          gap: 0.8,
          transition: "width 0.2s ease",
        }}
      >
        <Tooltip title="Expand sidebar" placement="right">
          <IconButton size="small" onClick={onToggleCollapse} sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.10)", width: 32, height: 32 }} aria-label="Expand sidebar">
            <ExpandIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Find channel" placement="right">
          <IconButton size="small" onClick={onToggleCollapse} sx={{ color: C.textMuted }}><SearchIcon sx={{ fontSize: 18 }} /></IconButton>
        </Tooltip>
        <Tooltip title="Threads" placement="right">
          <IconButton size="small" onClick={onOpenThreads} sx={{ color: C.textMuted }}><ThreadsIcon sx={{ fontSize: 18 }} /></IconButton>
        </Tooltip>
        <Box sx={{ width: 28, height: 1, bgcolor: C.border, my: 0.5 }} />
        <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 0.7, width: "100%", px: 0.7, "&::-webkit-scrollbar": { width: 0 } }}>
          {(filteredChannels || []).slice(0, 12).map((ch) => (
            <Tooltip key={ch.id} title={ch.name} placement="right">
              <Box
                onClick={() => onSelectChannel(ch.id)}
                sx={{
                  width: 34, height: 34, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: selectedChannel === ch.id && !selectedDM ? C.sidebarActive : "rgba(255,255,255,0.06)",
                  borderLeft: selectedChannel === ch.id && !selectedDM ? "3px solid #5aa9ff" : "3px solid transparent",
                  color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  "&:hover": { bgcolor: C.sidebarHover },
                }}
              >
                {ch.favorite ? <StarIcon sx={{ fontSize: 15, color: "#facc15" }} /> : String(ch.name || "?")[0].toUpperCase()}
              </Box>
            </Tooltip>
          ))}
          <Box sx={{ width: 28, height: 1, bgcolor: C.border, my: 0.5 }} />
          {(users || []).filter((u) => u.id !== "me").slice(0, 8).map((u) => (
            <Tooltip key={u.id} title={u.name} placement="right">
              <Box onClick={() => onSelectDM(u.id)} sx={{ cursor: "pointer" }}>
                <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: u.status === "online" ? "#3db33d" : "#9aa4b2", border: "1.5px solid " + C.sidebarBg }} />}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: u.color, border: selectedDM === u.id ? "2px solid #5aa9ff" : "2px solid transparent" }}>{u.display[0]}</Avatar>
                </Badge>
              </Box>
            </Tooltip>
          ))}
        </Box>
        <Tooltip title="Create channel" placement="right">
          <IconButton size="small" onClick={onCreateChannel} sx={{ color: C.textMuted }}><AddIcon sx={{ fontSize: 18 }} /></IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: { xs: 280, md: width || LAYOUT.sidebarWidth },
        bgcolor: C.sidebarBg,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderRight: "none",
        overflow: "hidden",
        transition: "width 0.2s ease, margin 0.2s ease",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.4, py: 1.1, borderBottom: `1px solid ${C.border}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>IPS-USA</Typography>
          <ExpandMoreIcon sx={{ fontSize: 18, color: C.textMuted }} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Collapse sidebar"><IconButton size="small" onClick={onToggleCollapse} sx={{ color: C.textMuted, width: 26, height: 26, "&:hover": { bgcolor: "rgba(255,255,255,0.10)", color: "#fff" } }} aria-label="Collapse sidebar"><CollapseIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
          <Tooltip title="Create channel"><IconButton size="small" onClick={onCreateChannel} sx={{ bgcolor: "rgba(255,255,255,0.10)", color: "#fff", width: 26, height: 26 }}><AddIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        </Box>
      </Box>

      <Box sx={{ px: 1, py: 0.8, display: "flex", gap: 0.6 }}>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 0.6, bgcolor: "rgba(255,255,255,0.08)", borderRadius: 1.5, px: 1, py: 0.45, border: "1px solid rgba(255,255,255,0.06)" }}>
          <SearchIcon sx={{ fontSize: 14, color: C.textMuted }} />
          <InputBase value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Find channel" sx={{ flex: 1, fontSize: 12.5, color: "#fff", "& input::placeholder": { color: C.textMuted, opacity: 1 } }} aria-label="Find channel" />
          {searchQuery && <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ color: C.textMuted, width: 16, height: 16 }}><Box sx={{ fontSize: 12 }}>✕</Box></IconButton>}
        </Box>
        <Tooltip title={favoritesOnly ? "Show all" : "Favorites only"}>
          <IconButton size="small" onClick={() => setFavoritesOnly((v) => !v)} sx={{ color: favoritesOnly ? "#facc15" : C.textMuted, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1.5, width: 30, height: 30 }} aria-label="Filter favorites">
            {favoritesOnly ? <StarIcon sx={{ fontSize: 16 }} /> : <FilterListIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: 1, py: 0.3 }}>
        <Box onClick={onOpenThreads} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpenThreads()} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.55, borderRadius: 1, color: C.textPrimary, cursor: "pointer", "&:hover": { bgcolor: C.sidebarHover } }}>
          <ThreadsIcon sx={{ fontSize: 17 }} /><Typography sx={{ fontSize: 13.5, fontWeight: 500, flex: 1 }}>Threads</Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 0.7, py: 0.3, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.12)", borderRadius: 2 } }}>
        <Box onClick={() => setChannelsOpen((v) => !v)} role="button" tabIndex={0} onKeyDown={toggleOnKey(setChannelsOpen)} title={channelsOpen ? "Collapse channels" : "Expand channels"} sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 0.8, py: 0.6, borderRadius: 1, cursor: "pointer", color: C.textMuted, "&:hover": { color: C.textPrimary, bgcolor: C.sidebarHover } }}>
          {channelsOpen ? <ExpandMoreIcon sx={{ fontSize: 16 }} /> : <ExpandIcon sx={{ fontSize: 16 }} />}<Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6 }}>CHANNELS</Typography><Box sx={{ flex: 1 }} /><Typography sx={{ fontSize: 11 }}>{filteredChannels.length}</Typography>
        </Box>
        {channelsOpen && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {filteredChannels.map((ch) => (
            <Box
              key={ch.id}
              onClick={() => onSelectChannel(ch.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectChannel(ch.id)}
              sx={{ display: "flex", alignItems: "center", gap: 0.9, px: 1, py: 0.5, borderRadius: 1, cursor: "pointer", bgcolor: selectedChannel === ch.id && !selectedDM ? C.sidebarActive : "transparent", color: selectedChannel === ch.id && !selectedDM ? "#fff" : "#cbd5e1", borderLeft: selectedChannel === ch.id && !selectedDM ? "3px solid #5aa9ff" : "3px solid transparent", "&:hover": { bgcolor: C.sidebarHover } }}
            >
              {ch.favorite ? <StarIcon sx={{ fontSize: 13, color: "#facc15" }} /> : ch.icon === "lock" ? <LockIcon sx={{ fontSize: 14, color: selectedChannel === ch.id ? "#fff" : C.textMuted }} /> : <GlobeIcon sx={{ fontSize: 14, color: C.textMuted }} />}
              <Typography sx={{ fontSize: 13.5, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: selectedChannel === ch.id ? 600 : 400 }}>{ch.name}</Typography>
              {ch.unread > 0 && <Box sx={{ minWidth: 18, height: 18, borderRadius: 9, bgcolor: "#e53935", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", px: 0.5 }}>{ch.unread}</Box>}
            </Box>
          ))}
          <Box onClick={onCreateChannel} role="button" tabIndex={0} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.5, color: C.textMuted, cursor: "pointer", "&:hover": { color: C.textPrimary } }}><AddIcon sx={{ fontSize: 14 }} /><Typography sx={{ fontSize: 13.5 }}>Add channels</Typography></Box>
        </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 0.8, py: 0.8, mt: 1, color: C.textMuted }}>
          <Box onClick={() => setDmsOpen((v) => !v)} role="button" tabIndex={0} onKeyDown={toggleOnKey(setDmsOpen)} title={dmsOpen ? "Collapse direct messages" : "Expand direct messages"} sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 0.4, py: 0.2, ml: -0.4, borderRadius: 1, cursor: "pointer", "&:hover": { color: C.textPrimary, bgcolor: C.sidebarHover } }}>
            {dmsOpen ? <ExpandMoreIcon sx={{ fontSize: 16 }} /> : <ExpandIcon sx={{ fontSize: 16 }} />}<Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6 }}>DIRECT MESSAGES</Typography><Box sx={{ width: 8 }} /><Typography sx={{ fontSize: 11 }}>{dmUsers.length}</Typography>
          </Box>
          <IconButton size="small" onClick={onAddDM} sx={{ color: C.textMuted, width: 18, height: 18 }}><AddIcon sx={{ fontSize: 14 }} /></IconButton>
        </Box>
        {dmsOpen && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {dmUsers.map((u) => (
            <Box key={u.id} onClick={() => onSelectDM(u.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onSelectDM(u.id)} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.5, borderRadius: 1, cursor: "pointer", color: "#cbd5e1", bgcolor: selectedDM === u.id ? C.sidebarActive : "transparent", "&:hover": { bgcolor: C.sidebarHover } }}>
              <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: u.status === "online" ? "#3db33d" : u.status === "away" ? "#ffbc1f" : "#9aa4b2", border: "1.5px solid " + C.sidebarBg }} />}>
                <Avatar sx={{ width: 22, height: 22, fontSize: 11, bgcolor: u.color }}>{u.display[0]}</Avatar>
              </Badge>
              <Typography sx={{ fontSize: 13.5, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</Typography>
              {u.unread && <Box sx={{ minWidth: 18, height: 18, borderRadius: 9, bgcolor: "#e53935", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", px: 0.5 }}>{u.unread}</Box>}
              {u.status === "online" && !u.unread && <CircleIcon sx={{ fontSize: 7, color: "#3db33d" }} />}
            </Box>
          ))}
          <Box onClick={onAddDM} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.5, color: C.textMuted, cursor: "pointer" }}><AddIcon sx={{ fontSize: 14 }} /><Typography sx={{ fontSize: 13.5 }}>Add direct message</Typography></Box>
        </Box>
        )}
      </Box>

      <Box sx={{ p: 1, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 1 }}>
        <Badge overlap="circular" badgeContent={<Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "#3db33d", border: "2px solid " + C.sidebarBg }} />} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <UserAvatar user={currentUser} size={30} fontSize={12} />
        </Badge>
        <Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#fff", lineHeight: 1 }}>{currentUser.display}</Typography><Typography sx={{ fontSize: 11, color: C.textMuted }}>Online</Typography></Box>
      </Box>
    </Box>
  );
}
