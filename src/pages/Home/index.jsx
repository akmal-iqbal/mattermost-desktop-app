import { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
  LockOutlined as LockIcon,
  Language as GlobeIcon,
  KeyboardArrowDown as ArrowDownIcon,
  CloudUploadOutlined as DropIcon,
} from "@mui/icons-material";

// modular imports — backend dev: swap mockData/services for real API
import { C } from "../../theme/mattermost";
import { USERS } from "../../data/mockMattermost";
import { MAX_ATTACHMENTS, toPendingAttachment, toMessageAttachment } from "../../utils/files";
import { useMattermost } from "../../hooks/useMattermost";
import AppHeader from "../../components/mattermost/AppHeader";
import WindowTabBar from "../../components/mattermost/WindowTabBar";
import ChannelSidebar from "../../components/mattermost/ChannelSidebar";
import SidebarResizeHandle from "../../components/mattermost/SidebarResizeHandle";
import ChannelHeader from "../../components/mattermost/ChannelHeader";
import MessageList from "../../components/mattermost/MessageList";
import MessageInput from "../../components/mattermost/MessageInput";
import RightPanel from "../../components/mattermost/RightPanel";
import QuickSwitcher from "../../components/mattermost/QuickSwitcher";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, width: 256 });

  // Sidebar drag-to-resize (cursor ew-resize divider)
  const handleResizeMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      resizeStart.current = { x: e.clientX, width: sidebarWidth };
      setIsResizing(true);
    },
    [sidebarWidth],
  );

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e) => {
      const dx = e.clientX - resizeStart.current.x;
      const next = Math.min(420, Math.max(180, resizeStart.current.width + dx));
      setSidebarWidth(next);
    };
    const onUp = () => setIsResizing(false);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizing]);
  const [profileData, setProfileData] = useState({
    fullName: "Akmal Iqbal",
    username: "akmal.iqbal-sd",
    nickname: "",
    position: "Web Development",
    email: "akmal.iqbal@ipscloud.co",
    pictureDate: "Dec 06, 2024",
    // restored from previous session (blob: URLs are dead after restart, ignore them)
    photoUrl: (() => {
      try {
        const v = localStorage.getItem("me-photo");
        return v && !v.startsWith("blob:") ? v : null;
      } catch {
        return null;
      }
    })(),
  });
  const [settingsData, setSettingsData] = useState({
    desktopNotif: "All new messages",
    sound: '"Bing" for messages',
    emailEnabled: false,
    keywords: '"akmal.iqbal-sd", "@channel", "@all", "@here"',
    highlight: "None",
    // Display
    theme: "Denim",
    clockDisplay: "12-hour clock (example: 4:00 PM)",
    teammateName: "Show first and last name",
    onlineAvailability: true,
    shareLastActive: true,
    timezone: "(UTC+05:00) Islamabad, Karachi",
    linkPreviews: true,
    imagePreviews: "Expanded",
    // Sidebar
    groupUnread: false,
    dmCount: "40",
    // Advanced
    sendOnCtrlEnter: "On only for code blocks starting with ```",
    postFormatting: true,
    joinLeave: true,
    scrollPosition: "Start me where I left off",
    syncDrafts: true,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [emojiFor, setEmojiFor] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [msgMenu, setMsgMenu] = useState(null);
  // drag & drop attachments
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
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
  // "me" enriched with the uploaded profile photo (null until saved in Profile)
  const usersWithPhoto = useMemo(
    () => USERS.map((u) => (u.id === "me" && profileData.photoUrl ? { ...u, photoUrl: profileData.photoUrl } : u)),
    [profileData.photoUrl],
  );
  const getUserEx = (id) => {
    const u = mm.getUser(id);
    return u.id === "me" && profileData.photoUrl ? { ...u, photoUrl: profileData.photoUrl } : u;
  };
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
      handleSend();
    }
  };

  // ---- drag & drop / paste / picker attachments ----
  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []).filter((f) => f && (f.size > 0 || f.name));
    if (!incoming.length) return;
    setPendingFiles((prev) => {
      const room = Math.max(MAX_ATTACHMENTS - prev.length, 0);
      return [...prev, ...incoming.slice(0, room).map(toPendingAttachment)];
    });
    mm.inputRef.current?.focus();
  };

  const removeAttachment = (id) => {
    setPendingFiles((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleAttachInput = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handlePaste = (e) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      e.preventDefault();
      addFiles(files);
    }
  };

  const handleSend = () => {
    const atts = pendingFiles.map(toMessageAttachment);
    if (!mm.input.trim() && atts.length === 0) return;
    mm.sendMessage(atts);
    setPendingFiles([]);
  };

  // quick switcher (Ctrl+K) selection — mirrors sidebar selection
  const handleSwitcherChannel = (id) => {
    mm.setSelectedChannel(id);
    mm.setSelectedDM(null);
    mm.setSwitcherOpen(false);
  };
  const handleSwitcherDM = (id) => {
    mm.setSelectedDM(id);
    const dmId = "dm_" + id;
    if (!mm.messagesByChannel[dmId]) mm.setMessagesByChannel((p) => ({ ...p, [dmId]: [] }));
    mm.setSelectedChannel(dmId);
    mm.setSwitcherOpen(false);
  };

  // Never let a stray drop navigate the window away (Electron safe)
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  const handleDragEnter = (e) => {
    e.preventDefault();
    if (!e.dataTransfer?.types?.includes("Files")) return;
    dragCounter.current += 1;
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current = Math.max(dragCounter.current - 1, 0);
    if (dragCounter.current === 0) setIsDragging(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  };
  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
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
      {/* Simple window tab strip like desktop screenshot */}
      <WindowTabBar
        activeTitle={isDM ? dmUser?.display : mm.activeChannel?.name || "Mahnoor…"}
      />

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
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        profilePhotoUrl={profileData.photoUrl}
      />

      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
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
                currentUser={{ display: profileData.fullName, color: "#7c3aed", photoUrl: profileData.photoUrl }}
                onOpenThreads={() => {
                  mm.setRightTab("thread");
                  mm.setRightOpen(true);
                  setMobileSidebarOpen(false);
                }}
              />
            </Drawer>
          </>
        ) : (
          <>
            <ChannelSidebar
              channels={mm.channels}
              filteredChannels={mm.filteredChannels}
              selectedChannel={mm.selectedChannel}
              selectedDM={mm.selectedDM}
              searchQuery={mm.searchQuery}
              setSearchQuery={mm.setSearchQuery}
              favoritesOnly={false}
              setFavoritesOnly={() => {}}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
              width={sidebarWidth}
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
            currentUser={{ display: profileData.fullName, color: "#7c3aed", photoUrl: profileData.photoUrl }}
            onOpenThreads={() => {
              mm.setRightTab("thread");
              mm.setRightOpen(true);
            }}
          />
            {!sidebarCollapsed && (
              <SidebarResizeHandle
                onMouseDown={handleResizeMouseDown}
                onDoubleClick={() => setSidebarCollapsed(true)}
                isResizing={isResizing}
              />
            )}
          </>
        )}

        {/* Main column */}
        <Box
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
            bgcolor: C.mainBg,
            position: "relative",
          }}
        >
          {/* Drop overlay */}
          {isDragging && (
            <Box sx={{ position: "absolute", inset: 10, zIndex: 30, borderRadius: 2, border: "2px dashed #3d7de8", bgcolor: "rgba(15,25,45,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, pointerEvents: "none", p: 2, textAlign: "center" }}>
              <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "rgba(61,125,232,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DropIcon sx={{ fontSize: 30, color: "#5aa9ff" }} />
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Drop files to share</Typography>
              <Typography sx={{ fontSize: 12.5, color: "#9aa4b2" }}>
                in {isDM ? dmUser?.display : `#${mm.activeChannel?.name || "channel"}`} · images preview inline, other files attach as cards
              </Typography>
            </Box>
          )}
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
            getUser={getUserEx}
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
            onSend={handleSend}
            onKeyDown={handleSendKey}
            onPaste={handlePaste}
            inputRef={mm.inputRef}
            fileRef={mm.fileRef}
            placeholder={`Write to ${isDM ? dmUser?.display : mm.activeChannel?.name || "channel"}`}
            mentionOpen={mentionOpen}
            users={usersWithPhoto}
            onMentionSelect={insertMention}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={handleSetShowEmojiPicker}
            onAttach={handleAttachInput}
            attachments={pendingFiles}
            onRemoveAttachment={removeAttachment}
            canSend={pendingFiles.length > 0}
          />
        </Box>

        <RightPanel
          open={mm.rightOpen}
          tab={mm.rightTab}
          setTab={mm.setRightTab}
          onClose={() => mm.setRightOpen(false)}
          threadMsg={threadMsg}
          getUser={getUserEx}
          activeMessages={mm.activeMessages}
          rightSearch={mm.rightSearch}
          setRightSearch={mm.setRightSearch}
          isMobile={isMobile}
          mePhotoUrl={profileData.photoUrl}
          threadName={isDM ? dmUser?.display : mm.activeChannel?.name || ""}
          threadReplies={mm.threadFor ? (mm.threadReplies[mm.threadFor] || []) : []}
          onAddReply={(text, attachments) => mm.addThreadReply(mm.threadFor, text, attachments)}
          onToggleFollow={() => mm.toggleFollow(mm.threadFor)}
          onBack={() => mm.setThreadFor(null)}
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
      <QuickSwitcher
        open={mm.switcherOpen}
        onClose={() => mm.setSwitcherOpen(false)}
        channels={mm.channels}
        users={usersWithPhoto}
        selectedChannel={mm.selectedChannel}
        selectedDM={mm.selectedDM}
        onSelectChannel={handleSwitcherChannel}
        onSelectDM={handleSwitcherDM}
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
