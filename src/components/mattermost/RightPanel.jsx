import { Box, Typography, IconButton, Avatar, Paper, InputBase, Tabs, Tab, Drawer, Badge, TextField } from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon, PushPinOutlined as PinIcon, DescriptionOutlined as FileIcon, ForumOutlined as ThreadsIcon, MoreHoriz as MoreIcon } from "@mui/icons-material";
import { C, LAYOUT } from "../../theme/mattermost";
import { USERS } from "../../data/mockMattermost";

export default function RightPanel({ open, tab, setTab, onClose, threadMsg, getUser, activeMessages, rightSearch, setRightSearch, isMobile }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      variant={isMobile ? "temporary" : "persistent"}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: LAYOUT.rightPanelWidth }, bgcolor: "#fff", borderLeft: "1px solid #e2e8f0", position: isMobile ? "fixed" : "relative", height: "100%", overflow: "hidden" } } }}
      sx={{ width: open ? { xs: "100%", sm: LAYOUT.rightPanelWidth } : 0, flexShrink: 0, display: open ? "block" : "none", "& .MuiDrawer-paper": { position: isMobile ? "fixed" : "relative" } }}
    >
      <Box sx={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ minHeight: 32, "& .MuiTab-root": { minHeight: 32, fontSize: { xs: 10, sm: 11 }, fontWeight: 700, textTransform: "none", px: 1 } }}>
          <Tab label="Thread" value="thread" /><Tab label="Members" value="members" /><Tab label="Pinned" value="pinned" /><Tab label="Files" value="files" /><Tab label="Search" value="search" />
        </Tabs>
        <IconButton size="small" onClick={onClose} aria-label="Close panel"><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 0 }}>
        {tab === "thread" && (
          <Box>
            {!threadMsg ? (
              <Box sx={{ p: 3, textAlign: "center", color: "#64748b" }}>
                <ThreadsIcon sx={{ fontSize: 28, color: "#94a3b8" }} />
                <Typography sx={{ mt: 1, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>No thread selected</Typography>
                <Typography sx={{ fontSize: 12, mt: 0.5 }}>Click <Box component="span" sx={{ fontWeight: 700 }}>Reply</Box> on any message to open its thread.</Typography>
              </Box>
            ) : (
              <Box>
                <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <Box sx={{ display: "flex", gap: 1 }}><Avatar sx={{ width: 28, height: 28, bgcolor: getUser(threadMsg.userId).color, fontSize: 12 }}>{getUser(threadMsg.userId).display[0]}</Avatar><Box><Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{getUser(threadMsg.userId).display}</Typography><Typography sx={{ fontSize: 11, color: "#64748b" }}>{threadMsg.time}</Typography></Box></Box>
                  <Typography sx={{ fontSize: 13, mt: 1, color: "#0f172a", whiteSpace: "pre-wrap" }}>{threadMsg.text}</Typography>
                </Box>
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>REPLIES</Typography>
                  <Box sx={{ display: "flex", gap: 0.7, mt: 1, flexWrap: "wrap" }}>
                    <Avatar sx={{ width: 26, height: 26, bgcolor: "#8d6e63", fontSize: 11 }}>M</Avatar>
                    <Paper sx={{ flex: 1, display: "flex", alignItems: "center", p: 0.5, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                      <InputBase placeholder="Reply..." sx={{ flex: 1, fontSize: 12.5, px: 1 }} onKeyDown={(e) => { if (e.key === "Enter") e.target.value = ""; }} />
                      <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>→</Box>
                    </Paper>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
        {tab === "members" && (
          <Box sx={{ p: 1 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b", px: 1, py: 0.5 }}>MEMBERS</Typography>
            {USERS.map((u) => (
              <Box key={u.id} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.7, borderRadius: 1, "&:hover": { bgcolor: "#f1f5f9" } }}>
                <Badge overlap="circular" badgeContent={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: u.status === "online" ? "#22c55e" : "#9aa4b2", border: "2px solid #fff" }} />} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: u.color, fontSize: 12 }}>{u.display[0]}</Avatar>
                </Badge>
                <Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{u.display}</Typography><Typography sx={{ fontSize: 11, color: "#64748b" }}>@{u.name} · {u.status}</Typography></Box>
                <IconButton size="small"><MoreIcon sx={{ fontSize: 14 }} /></IconButton>
              </Box>
            ))}
          </Box>
        )}
        {tab === "pinned" && (
          <Box sx={{ p: 1.5 }}>
            {activeMessages.filter((m) => m.pinned).length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center", color: "#64748b" }}><PinIcon sx={{ fontSize: 28, color: "#94a3b8" }} /><Typography sx={{ fontSize: 12.5, mt: 1 }}>No pinned messages</Typography></Box>
            ) : (
              activeMessages.filter((m) => m.pinned).map((m) => (
                <Paper key={m.id} sx={{ p: 1.2, mb: 1, borderRadius: 1.5, border: "1px solid #facc15" }}><Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{getUser(m.userId).display}</Typography><Typography sx={{ fontSize: 12, color: "#334155" }}>{String(m.text).slice(0, 120)}</Typography></Paper>
              ))
            )}
          </Box>
        )}
        {tab === "files" && (
          <Box sx={{ p: 1.5 }}>
            <Paper sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid #e2e8f0", display: "flex", gap: 1, alignItems: "center" }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}><FileIcon sx={{ fontSize: 18, color: "#2563eb" }} /></Box>
              <Box><Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>credentialing-course.png</Typography><Typography sx={{ fontSize: 11, color: "#64748b" }}>342 KB · Added by Mahnoor Fatima</Typography></Box>
            </Paper>
          </Box>
        )}
        {tab === "search" && (
          <Box sx={{ p: 1.5 }}>
            <TextField size="small" fullWidth placeholder="Search in this channel" value={rightSearch} onChange={(e) => setRightSearch(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 16, color: "#64748b", mr: 0.7 }} /> }} sx={{ mb: 1 }} />
            <Typography sx={{ fontSize: 11, color: "#64748b" }}>Search is local (backend: GET /search?q=)</Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
