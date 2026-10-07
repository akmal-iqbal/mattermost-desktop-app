import { useState, useMemo } from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Typography,
  Paper,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  LockOutlined as LockIcon,
  Language as GlobeIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";

// modular imports — backend dev: swap mockData/services for real API
import { C } from "../../theme/mattermost";
import { USERS } from "../../data/mockMattermost";
import { useMattermost } from "../../hooks/useMattermost";
import ServerSidebar from "../../components/mattermost/ServerSidebar";
import AppHeader from "../../components/mattermost/AppHeader";
import ChannelSidebar from "../../components/mattermost/ChannelSidebar";
import ChannelHeader from "../../components/mattermost/ChannelHeader";
import MessageList from "../../components/mattermost/MessageList";
import MessageInput from "../../components/mattermost/MessageInput";
import RightPanel from "../../components/mattermost/RightPanel";
import ProfileDialog from "../../components/mattermost/ProfileDialog";
import SettingsDialog from "../../components/mattermost/SettingsDialog";

/**
 * Home — Mattermost main screen (thin orchestrator)
 * Responsibilities:
 *  - layout & responsiveness only
 *  - delegates all chat logic to useMattermost hook
 *  - delegates UI to small components (readable for backend team)
 * Backend integration: replace useMattermost internals with API calls (see src/services/)
 */
export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // 900px

  const mm = useMattermost();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Akmal Iqbal",
    username: "akmal.iqbal-sd",
    nickname: "",
    position: "Web Development",
    email: "akmal.iqbal@ipscloud.co",
    pictureDate: "Dec 06, 2024",
  });
  const [settingsData, setSettingsData] = useState({
    desktopNotif: "All new messages",
    sound: '"Bing" for messages',
    emailEnabled: false,
    keywords: '"akmal.iqbal-sd", "@channel", "@all", "@here"',
    highlight: "None",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [emojiFor, setEmojiFor] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [msgMenu, setMsgMenu] = useState(null);
  // mutual exclusion: only one picker at a time
  const handleSetEmojiFor = (val) => {
    if (val) setShowEmojiPicker(false);
    setEmojiFor(val);
  };
  const handleSetShowEmojiPicker = (val) => {
    const next = typeof val === "function" ? val(showEmojiPicker) : val;
    if (next) setEmojiFor(null);
    setShowEmojiPicker(next);
  };

  const dmUser = useMemo(
    () => (mm.selectedDM ? USERS.find((u) => u.id === mm.selectedDM) : null),
    [mm.selectedDM],
  );
  const isDM = Boolean(mm.selectedDM);
  const threadMsg = useMemo(
    () =>
      mm.threadFor
        ? mm.activeMessages.find((m) => m.id === mm.threadFor) || null
        : null,
    [mm.threadFor, mm.activeMessages],
  );

  const handleInputChange = (e) => {
    const v = e.target.value;
    mm.setInput(v);
    setMentionOpen(v.includes("@") && !v.endsWith(" "));
  };
  const insertMention = (username) => {
    const atIdx = mm.input.lastIndexOf("@");
    const before = atIdx >= 0 ? mm.input.slice(0, atIdx) : mm.input;
    mm.setInput(before + "@" + username + " ");
    setMentionOpen(false);
    mm.inputRef.current?.focus();
  };
  const handleSendKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      mm.sendMessage();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        bgcolor: C.mainBg,
        overflow: "hidden",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}
    >
      {/* Tab bar — hidden on very small screens to save space */}
      <Box
        sx={{
          height: C.tabBarHeight || 34,
          bgcolor: C.tabBg,
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          px: 1,
          gap: 0.5,
          borderBottom: "1px solid #c5cddb",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {["IPS-USA", "IPS-UNI"].map((t, i) => (
            <Box
              key={t}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.4,
                py: 0.45,
                bgcolor: i === 0 ? "#fff" : "#f1f2f4",
                borderRadius: "8px 8px 0 0",
                border: "1px solid #c5cddb",
                borderBottom: i === 0 ? "1px solid #fff" : undefined,
                fontSize: 13,
                fontWeight: 500,
                color: "#333",
              }}
            >
              {i === 0 && (
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: "#2e7d32",
                  }}
                />
              )}{" "}
              {t}{" "}
              {i === 0 && (
                <ExpandMoreIcon sx={{ fontSize: 14, color: "#666" }} />
              )}
            </Box>
          ))}
          <IconButton size="small" sx={{ width: 22, height: 22 }}>
            <AddIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: "flex", gap: 1, color: "#6b7280", fontSize: 14 }}>
          ─ &nbsp; □ &nbsp; ✕
        </Box>
      </Box>

      <AppHeader
        globalSearch={mm.globalSearch}
        setGlobalSearch={mm.setGlobalSearch}
        globalResults={mm.globalResults}
        userStatus={mm.userStatus}
        setUserStatus={mm.setUserStatus}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        onOpenProfile={() => {
          setAnchorEl(null);
          mm.setShowProfile(true);
          mm.setProfileTab("profile");
        }}
        onOpenSettings={() => mm.setShowSettings(true)}
        onLogout={() => navigate("/login")}
      />

      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <ServerSidebar />
        {/* Sidebar: drawer on mobile, permanent on desktop */}
        {isMobile ? (
          <>
            <Drawer
              open={mobileSidebarOpen}
              onClose={() => setMobileSidebarOpen(false)}
              slotProps={{
                paper: { sx: { width: 280, bgcolor: C.sidebarBg } },
              }}
            >
              <ChannelSidebar
                channels={mm.channels}
                filteredChannels={mm.filteredChannels}
                selectedChannel={mm.selectedChannel}
                selectedDM={mm.selectedDM}
                searchQuery={mm.searchQuery}
                setSearchQuery={mm.setSearchQuery}
                favoritesOnly={false}
                setFavoritesOnly={() => {}}
                onSelectChannel={(id) => {
                  mm.setSelectedChannel(id);
                  mm.setSelectedDM(null);
                  setMobileSidebarOpen(false);
                }}
                onSelectDM={(id) => {
                  mm.setSelectedDM(id);
                  const dmId = "dm_" + id;
                  if (!mm.messagesByChannel[dmId])
                    mm.setMessagesByChannel((p) => ({ ...p, [dmId]: [] }));
                  mm.setSelectedChannel(dmId);
                  setMobileSidebarOpen(false);
                }}
                onCreateChannel={() => mm.setShowCreateChannel(true)}
                onAddDM={() => mm.setShowAddDM(true)}
                users={USERS}
                onOpenThreads={() => {
                  mm.setRightTab("thread");
                  mm.setRightOpen(true);
                  setMobileSidebarOpen(false);
                }}
              />
            </Drawer>
          </>
        ) : (
          <ChannelSidebar
            channels={mm.channels}
            filteredChannels={mm.filteredChannels}
            selectedChannel={mm.selectedChannel}
            selectedDM={mm.selectedDM}
            searchQuery={mm.searchQuery}
            setSearchQuery={mm.setSearchQuery}
            favoritesOnly={false}
            setFavoritesOnly={() => {}}
            onSelectChannel={(id) => {
              mm.setSelectedChannel(id);
              mm.setSelectedDM(null);
            }}
            onSelectDM={(id) => {
              mm.setSelectedDM(id);
              const dmId = "dm_" + id;
              if (!mm.messagesByChannel[dmId])
                mm.setMessagesByChannel((p) => ({ ...p, [dmId]: [] }));
              mm.setSelectedChannel(dmId);
            }}
            onCreateChannel={() => mm.setShowCreateChannel(true)}
            onAddDM={() => mm.setShowAddDM(true)}
            users={USERS}
            onOpenThreads={() => {
              mm.setRightTab("thread");
              mm.setRightOpen(true);
            }}
          />
        )}

        {/* Main column */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
            bgcolor: C.mainBg,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 0.5,
              bgcolor: C.channelHeaderBg,
              borderBottom: `1px solid ${C.border}`,
              flexShrink: 0,
            }}
          >
            {isMobile && (
              <IconButton
                size="small"
                onClick={() => setMobileSidebarOpen(true)}
                sx={{ color: C.textMuted }}
                aria-label="Open channels"
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ChannelHeader
                channel={mm.activeChannel}
                isDM={isDM}
                dmUser={dmUser}
                activeMessages={mm.activeMessages}
                onFavorite={mm.toggleFavorite}
                onToggleRight={(tab) => {
                  if (mm.rightTab === tab && mm.rightOpen && !isMobile)
                    mm.setRightOpen(false);
                  else {
                    mm.setRightTab(tab);
                    mm.setRightOpen(true);
                  }
                }}
                rightTab={mm.rightTab}
                rightOpen={mm.rightOpen}
              />
            </Box>
          </Box>

          {/* Banners — stack on mobile */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 0.7,
              bgcolor: C.channelHeaderBg,
              borderBottom: `1px solid ${C.border}`,
              flexShrink: 0,
              flexWrap: "wrap",
              px: 1,
            }}
          >
            <Paper
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                px: 1,
                py: 0.4,
                bgcolor: "#2a3347",
                borderRadius: 1.5,
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "none",
              }}
            >
              <ArrowDownIcon sx={{ fontSize: 14, color: C.textPrimary }} />
              <Typography
                sx={{ fontSize: 11.5, fontWeight: 600, color: C.textPrimary }}
              >
                Jump to recents
              </Typography>
              <IconButton
                size="small"
                sx={{ width: 16, height: 16, color: C.textMuted }}
              >
                <CloseIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Paper>
            <Paper
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 0.7,
                px: 1,
                py: 0.4,
                bgcolor: "#2a3347",
                borderRadius: 1.5,
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "none",
              }}
            >
              <Typography sx={{ fontSize: 11, color: C.textMuted }}>
                Tip: Try
              </Typography>
              <Chip
                label="Ctrl"
                size="small"
                sx={{
                  height: 16,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: "#3a455c",
                  color: C.textPrimary,
                  borderRadius: "4px",
                }}
              />
              <Chip
                label="F"
                size="small"
                sx={{
                  height: 16,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: "#3a455c",
                  color: C.textPrimary,
                  borderRadius: "4px",
                }}
              />
              <Typography sx={{ fontSize: 11, color: C.textPrimary }}>
                to search this channel
              </Typography>
              <IconButton
                size="small"
                sx={{ width: 16, height: 16, color: C.textMuted }}
              >
                <CloseIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Paper>
          </Box>

          <MessageList
            selectedChannel={mm.selectedChannel}
            selectedDM={mm.selectedDM}
            activeMessages={mm.activeMessages}
            dmUser={dmUser}
            getUser={mm.getUser}
            listRef={mm.listRef}
            editingId={mm.editingId}
            editText={mm.editText}
            setEditText={mm.setEditText}
            saveEdit={mm.saveEdit}
            setEditingId={mm.setEditingId}
            toggleReaction={mm.toggleReaction}
            emojiFor={emojiFor}
            setEmojiFor={handleSetEmojiFor}
            toggleSave={mm.toggleSave}
            togglePin={mm.togglePin}
            setMsgMenu={setMsgMenu}
            setThreadFor={mm.setThreadFor}
            setRightTab={mm.setRightTab}
            setRightOpen={mm.setRightOpen}
          />

          <MessageInput
            value={mm.input}
            onChange={handleInputChange}
            onSend={mm.sendMessage}
            onKeyDown={handleSendKey}
            inputRef={mm.inputRef}
            fileRef={mm.fileRef}
            placeholder={`Write to ${isDM ? dmUser?.display : mm.activeChannel?.name || "channel"}`}
            mentionOpen={mentionOpen}
            users={USERS}
            onMentionSelect={insertMention}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={handleSetShowEmojiPicker}
            onAttach={() => {}}
          />
        </Box>

        <RightPanel
          open={mm.rightOpen}
          tab={mm.rightTab}
          setTab={mm.setRightTab}
          onClose={() => mm.setRightOpen(false)}
          threadMsg={threadMsg}
          getUser={mm.getUser}
          activeMessages={mm.activeMessages}
          rightSearch={mm.rightSearch}
          setRightSearch={mm.setRightSearch}
          isMobile={isMobile}
        />
      </Box>

      {/* Create channel dialog */}
      <Dialog
        open={mm.showCreateChannel}
        onClose={() => mm.setShowCreateChannel(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create channel</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1.5 }}
        >
          <TextField
            label="Channel name"
            value={mm.newChannelName}
            onChange={(e) => mm.setNewChannelName(e.target.value)}
            placeholder="e.g. IPS-Marketing"
            fullWidth
            autoFocus
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              icon={<LockIcon sx={{ fontSize: 14 }} />}
              label="Private"
              clickable
              color={mm.newChannelType === "lock" ? "primary" : "default"}
              onClick={() => mm.setNewChannelType("lock")}
            />
            <Chip
              icon={<GlobeIcon sx={{ fontSize: 14 }} />}
              label="Public"
              clickable
              color={mm.newChannelType === "globe" ? "primary" : "default"}
              onClick={() => mm.setNewChannelType("globe")}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => mm.setShowCreateChannel(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={mm.createChannel}
            disabled={!mm.newChannelName.trim()}
            sx={{ textTransform: "none" }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={mm.showAddDM}
        onClose={() => mm.setShowAddDM(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Direct message</DialogTitle>
        <DialogContent>
          {USERS.filter((u) => u.id !== "me").map((u) => (
            <Box
              key={u.id}
              onClick={() => {
                mm.setSelectedDM(u.id);
                mm.setSelectedChannel("dm_" + u.id);
                if (!mm.messagesByChannel["dm_" + u.id])
                  mm.setMessagesByChannel((p) => ({
                    ...p,
                    ["dm_" + u.id]: [],
                  }));
                mm.setShowAddDM(false);
                if (isMobile) setMobileSidebarOpen(false);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
            >
              <Avatar
                sx={{ width: 28, height: 28, bgcolor: u.color, fontSize: 12 }}
              >
                {u.display[0]}
              </Avatar>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {u.display}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                @{u.name}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => mm.setShowAddDM(false)}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={msgMenu?.anchor}
        open={Boolean(msgMenu)}
        onClose={() => setMsgMenu(null)}
      >
        <MenuItem
          onClick={() => {
            const m = mm.activeMessages.find((x) => x.id === msgMenu?.id);
            if (m) mm.startEdit(m);
            setMsgMenu(null);
          }}
        >
          <ListItemIcon>
            <Box sx={{ fontSize: 14 }}>✎</Box>
          </ListItemIcon>{" "}
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigator.clipboard?.writeText(
              mm.activeMessages.find((x) => x.id === msgMenu?.id)?.text || "",
            );
            setMsgMenu(null);
          }}
        >
          <ListItemIcon>
            <Box sx={{ fontSize: 14 }}>⧉</Box>
          </ListItemIcon>{" "}
          Copy
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (msgMenu?.id) mm.togglePin(msgMenu.id);
            setMsgMenu(null);
          }}
        >
          <ListItemIcon>
            <Box sx={{ fontSize: 14 }}>📌</Box>
          </ListItemIcon>{" "}
          {mm.activeMessages.find((x) => x.id === msgMenu?.id)?.pinned
            ? "Unpin"
            : "Pin"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (msgMenu?.id) mm.toggleSave(msgMenu.id);
            setMsgMenu(null);
          }}
        >
          <ListItemIcon>
            <Box sx={{ fontSize: 14 }}>🔖</Box>
          </ListItemIcon>{" "}
          {mm.activeMessages.find((x) => x.id === msgMenu?.id)?.saved
            ? "Unsave"
            : "Save"}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() =>
            msgMenu?.id && (mm.deleteMessage(msgMenu.id), setMsgMenu(null))
          }
          sx={{ color: "#e53935" }}
        >
          <ListItemIcon>
            <Box sx={{ fontSize: 14, color: "#e53935" }}>🗑</Box>
          </ListItemIcon>{" "}
          Delete
        </MenuItem>
      </Menu>

      <ProfileDialog
        open={mm.showProfile}
        onClose={() => mm.setShowProfile(false)}
        profileTab={mm.profileTab}
        setProfileTab={mm.setProfileTab}
        profileData={profileData}
        setProfileData={setProfileData}
      />
      <SettingsDialog
        open={mm.showSettings}
        onClose={() => mm.setShowSettings(false)}
        settingsTab={mm.settingsTab}
        setSettingsTab={mm.setSettingsTab}
        settingsData={settingsData}
        setSettingsData={setSettingsData}
      />
    </Box>
  );
}
