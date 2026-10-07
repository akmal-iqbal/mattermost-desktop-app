import { Box, Typography, IconButton, InputBase, Paper, Avatar, Badge, Divider, Tooltip, Menu, MenuItem } from "@mui/material";
import {
  Search as SearchIcon,
  AlternateEmail as AtIcon,
  BookmarkBorder as BookmarkIcon,
  SettingsOutlined as SettingsIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Apps as AppsIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { C } from "../../theme/mattermost";

/**
 * Top app header: logo, nav, global search, user menu
 * Backend: search -> GET /search?q= ; userStatus -> PATCH /users/me/status
 */
export default function AppHeader({ globalSearch, setGlobalSearch, globalResults, userStatus, setUserStatus, anchorEl, setAnchorEl, onOpenProfile, onOpenSettings, onLogout }) {
  const statusColor = userStatus === "online" ? "#3db33d" : userStatus === "away" ? "#ffbc1f" : userStatus === "dnd" ? "#e53935" : "#9aa4b2";
  return (
    <Box sx={{ height: 48, bgcolor: C.headerBg, display: "flex", alignItems: "center", px: { xs: 1, md: 1.2 }, gap: 1, flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
      <IconButton size="small" sx={{ color: C.textMuted, display: { xs: "none", sm: "inline-flex" } }} aria-label="App switcher">
        <AppsIcon fontSize="small" />
      </IconButton>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, minWidth: 0 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: C.headerBg, fontSize: 13, flexShrink: 0 }}>M</Box>
        <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: 14, md: 15 }, letterSpacing: -0.3, whiteSpace: "nowrap" }}>Mattermost</Typography>
        <Box sx={{ display: { xs: "none", sm: "block" }, ml: 0.5, px: 0.6, py: 0.15, bgcolor: "rgba(255,255,255,0.10)", borderRadius: "4px", fontSize: 9, fontWeight: 700, color: "#cbd5e1" }}>FREE EDITION</Box>
      </Box>
      <Box sx={{ display: { xs: "none", md: "flex" }, ml: 0.5 }}>
        <IconButton size="small" sx={{ color: C.textMuted }}><ArrowBackIcon sx={{ fontSize: 17 }} /></IconButton>
        <IconButton size="small" sx={{ color: "#4b5563" }}><ArrowForwardIcon sx={{ fontSize: 17 }} /></IconButton>
      </Box>

      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", position: "relative", mx: 1 }}>
        <Paper sx={{ display: "flex", alignItems: "center", px: 1.2, py: 0.35, bgcolor: "#23365a", borderRadius: 1.5, width: { xs: "100%", md: 440 }, maxWidth: "100%", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "none" }}>
          <SearchIcon sx={{ fontSize: 16, color: C.textMuted, mr: 1 }} />
          <InputBase id="global-search" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} placeholder="Search (Ctrl+K)" sx={{ flex: 1, fontSize: 13, color: C.textPrimary, "& input::placeholder": { color: C.textMuted, opacity: 1 } }} />
          {globalSearch && <IconButton size="small" onClick={() => setGlobalSearch("")} sx={{ color: C.textMuted }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>}
        </Paper>
        {globalResults.length > 0 && (
          <Paper sx={{ position: "absolute", top: 38, width: { xs: "100%", md: 440 }, maxHeight: 320, overflowY: "auto", zIndex: 20, borderRadius: 2, p: 1 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b", px: 1, py: 0.5 }}>MESSAGES — {globalResults.length}</Typography>
            {globalResults.map((r) => (
              <Box key={`${r.cid}-${r.id}`} sx={{ px: 1, py: 0.7, borderRadius: 1, cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }} onClick={() => setGlobalSearch("")}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{r.channelName}</Typography>
                <Typography sx={{ fontSize: 12, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{String(r.text || "").slice(0, 80)}</Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, flexShrink: 0 }}>
        <Tooltip title="Mentions"><IconButton size="small" sx={{ color: C.textMuted }}><AtIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Saved"><IconButton size="small" sx={{ color: C.textMuted }}><BookmarkIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Settings"><IconButton size="small" onClick={onOpenSettings} sx={{ color: C.textMuted }}><SettingsIcon fontSize="small" /></IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.7, borderColor: C.border, height: 20, alignSelf: "center", display: { xs: "none", sm: "block" } }} />
        <Box sx={{ position: "relative" }}>
          <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: statusColor, border: "2px solid " + C.headerBg }} />}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: "#b08968", fontSize: 12, cursor: "pointer" }} onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="User menu">A</Avatar>
          </Badge>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: { sx: { mt: 0.8, width: 260, bgcolor: "#1e2e46", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 1.5, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", p: 0 } } }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, px: 1.6, py: 1.2 }}>
            <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: statusColor, border: "2px solid #1e2e46" }} />}>
              <Avatar sx={{ width: 38, height: 38, bgcolor: "#b08968", fontSize: 14 }}>A</Avatar>
            </Badge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Akmal Iqbal</Typography>
              <Typography sx={{ fontSize: 12, color: "#9aa4b2", lineHeight: 1 }}>@akmal.iqbal-sd</Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ px: 1.6, py: 1, gap: 1.2, color: "#e2e8f0", fontSize: 13, "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}>
            <Box sx={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #9aa4b2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>☺</Box>
            <Typography sx={{ flex: 1, fontSize: 13 }}>Set a custom status</Typography>
            <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: "#3db33d", border: "2px solid #1e2e46" }} />
          </MenuItem>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          {[
            ["online", "Online", "#3db33d", "✓"],
            ["away", "Away", "#ffbc1f", "◷"],
            ["dnd", "Do not disturb", "#e53935", "—"],
            ["offline", "Offline", "#9aa4b2", ""],
          ].map(([id, label, col]) => (
            <MenuItem key={id} onClick={() => { setUserStatus(id); setAnchorEl(null); }} sx={{ px: 1.6, py: 0.9, gap: 1.2, color: "#e2e8f0", bgcolor: userStatus === id ? "rgba(255,255,255,0.04)" : "transparent", "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}>
              <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: id === "offline" ? "transparent" : col, border: id === "offline" ? "1.5px solid #9aa4b2" : "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9 }}>{id !== "offline" ? ["online", "away", "dnd"].indexOf(id) >= 0 ? (id === "online" ? "✓" : id === "away" ? "◷" : "—") : "" : ""}</Box>
              <Typography sx={{ flex: 1, fontSize: 13 }}>{label}</Typography>
              {userStatus === id && <CheckIcon sx={{ fontSize: 16, color: "#5aa9ff" }} />}
            </MenuItem>
          ))}
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <MenuItem onClick={() => { setAnchorEl(null); onOpenProfile(); }} sx={{ px: 1.6, py: 1, gap: 1.2, color: "#e2e8f0", fontSize: 13, "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}>
            <PersonIcon sx={{ fontSize: 16, color: "#9aa4b2" }} /> Profile
          </MenuItem>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <MenuItem onClick={onLogout} sx={{ px: 1.6, py: 1, gap: 1.2, color: "#e2e8f0", fontSize: 13, "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}>
            <LogoutIcon sx={{ fontSize: 16, color: "#9aa4b2" }} /> Log Out
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
