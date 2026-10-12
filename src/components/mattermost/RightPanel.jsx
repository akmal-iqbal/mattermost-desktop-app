import { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, Paper, Tabs, Tab, Drawer, Badge, TextField, Dialog, Button, Tooltip } from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon, PushPinOutlined as PinIcon, DescriptionOutlined as FileIcon, ForumOutlined as ThreadsIcon, OpenInFull as ExpandIcon } from "@mui/icons-material";
import { C, LAYOUT } from "../../theme/mattermost";
import { USERS, renderMessageHtml } from "../../data/mockMattermost";
import { formatFileSize, MAX_ATTACHMENTS, toPendingAttachment, toMessageAttachment } from "../../utils/files";
import { relativeTime } from "../../utils/time";
import MessageInput from "./MessageInput";
import MessageAttachments from "./MessageAttachments";
import UserAvatar from "./UserAvatar";

const PANEL_BG = "#1e2333";
const CARD_BG = "rgba(255,255,255,0.04)";
const sectionSx = { fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: C.textMuted, px: 1, pt: 1, pb: 0.5 };

const memberDot = (u) => (u.status === "online" ? "#22c55e" : u.status === "away" ? "#ffbc1f" : "#9aa4b2");

function MemberRow({ u }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.7, borderRadius: 1, cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}>
      <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: memberDot(u), border: `2px solid ${PANEL_BG}` }} />}>
        <UserAvatar user={u} size={28} fontSize={12} />
      </Badge>
      <Typography sx={{ fontSize: 13, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {u.display}
        {u.name !== u.display && <Box component="span" sx={{ color: C.textMuted }}> @{u.name}</Box>}
      </Typography>
    </Box>
  );
}
const iconBtnSx = { color: C.textMuted, "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" } };
const msgTextSx = {
  fontSize: 13.2,
  color: C.textPrimary,
  mt: 0.25,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  lineHeight: 1.5,
  "& strong": { fontWeight: 700, color: "#fff" },
  "& code": { bgcolor: "rgba(255,255,255,0.08)", px: 0.5, py: 0.15, borderRadius: 0.5, fontSize: 12, fontFamily: "monospace" },
};

function ThreadRow({ user, time, children }) {
  return (
    <Box sx={{ display: "flex", gap: 1.2, px: 1.8, py: 0.9, "&:hover": { bgcolor: "rgba(255,255,255,0.03)" } }}>
      <UserAvatar user={user} size={34} fontSize={13} sx={{ mt: 0.2, flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>{user.display}</Typography>
          <Typography sx={{ fontSize: 11, color: C.textMuted }}>{time}</Typography>
        </Box>
        {children}
      </Box>
    </Box>
  );
}

export default function RightPanel({
  open, tab, setTab, onClose, threadMsg, getUser, activeMessages,
  rightSearch, setRightSearch, isMobile,
  threadName = "", threadReplies = [], onAddReply, onToggleFollow,
  mePhotoUrl = null,
}) {
  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyEmoji, setReplyEmoji] = useState(false);
  const [replyFiles, setReplyFiles] = useState([]);
  const replyInputRef = useRef(null);
  const replyFileRef = useRef(null);
  const threadScrollRef = useRef(null);

  const inThread = tab === "thread" && threadMsg;
  const inMembers = tab === "members";
  const roster = USERS.map((u) => (u.id === "me" && mePhotoUrl ? { ...u, photoUrl: mePhotoUrl } : u));
  const admins = roster.filter((u) => u.role === "admin");
  const members = roster.filter((u) => u.role !== "admin");
  const panelW = expanded ? { xs: "100%", sm: 520 } : { xs: "100%", sm: LAYOUT.rightPanelWidth };

  // keep latest reply visible
  useEffect(() => {
    const el = threadScrollRef.current;
    if (el && inThread) el.scrollTop = el.scrollHeight;
  }, [threadReplies.length, threadMsg?.id, tab, inThread]);

  const sendReply = () => {
    const atts = replyFiles.map(toMessageAttachment);
    if (!replyText.trim() && !atts.length) return;
    onAddReply?.(replyText, atts);
    setReplyText("");
    setReplyFiles([]);
    replyInputRef.current?.focus();
  };

  const addReplyFiles = (fileList) => {
    const incoming = Array.from(fileList || []).filter((f) => f && (f.size > 0 || f.name));
    if (!incoming.length) return;
    setReplyFiles((prev) => {
      const room = Math.max(MAX_ATTACHMENTS - prev.length, 0);
      return [...prev, ...incoming.slice(0, room).map(toPendingAttachment)];
    });
    replyInputRef.current?.focus();
  };

  const removeReplyFile = (id) => {
    setReplyFiles((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      variant={isMobile ? "temporary" : "persistent"}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: panelW, bgcolor: PANEL_BG, borderLeft: `1px solid ${C.border}`, position: isMobile ? "fixed" : "relative", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" } } }}
      sx={{ width: open ? panelW : 0, flexShrink: 0, display: open ? "block" : "none", "& .MuiDrawer-paper": { position: isMobile ? "fixed" : "relative" } }}
    >
      {inThread ? (
        /* Thread header — pixel-matched: Thread | name ... Follow expand X */
        <Box sx={{ height: 48, display: "flex", alignItems: "center", gap: 0.75, pl: 1.8, pr: 0.8, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", letterSpacing: "-0.1px" }}>Thread</Typography>
          <Box sx={{ width: 1, height: 16, bgcolor: "rgba(255,255,255,0.14)", mx: 0.25 }} />
          <Typography sx={{ fontSize: 12.5, color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>{threadName}</Typography>
          <Button size="small" onClick={onToggleFollow} sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 600, color: threadMsg.follow ? C.link : C.textMuted, minWidth: 0, px: 1 }}>
            {threadMsg.follow ? "Following" : "Follow"}
          </Button>
          <Tooltip title={expanded ? "Collapse" : "Expand"}>
            <IconButton size="small" onClick={() => setExpanded((v) => !v)} sx={iconBtnSx} aria-label="Expand thread"><ExpandIcon sx={{ fontSize: 16 }} /></IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} sx={iconBtnSx} aria-label="Close panel"><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
        </Box>
      ) : inMembers ? (
        /* Members header — pixel-matched: Members | channel ... X */
        <Box sx={{ height: 48, display: "flex", alignItems: "center", gap: 0.75, pl: 1.8, pr: 0.8, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", letterSpacing: "-0.1px" }}>Members</Typography>
          <Box sx={{ width: 1, height: 16, bgcolor: "rgba(255,255,255,0.14)", mx: 0.25 }} />
          <Typography sx={{ fontSize: 12.5, color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>{threadName}</Typography>
          <IconButton size="small" onClick={onClose} sx={iconBtnSx} aria-label="Close panel"><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
        </Box>
      ) : (
        <Box sx={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", pl: 1, pr: 0.8, borderBottom: `1px solid ${C.border}`, flexShrink: 0, gap: 0.5 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 40,
              flex: 1,
              minWidth: 0,
              "& .MuiTab-root": { minHeight: 40, fontSize: { xs: 10.5, sm: 11.5 }, fontWeight: 700, textTransform: "none", px: 1.1, color: C.textMuted, letterSpacing: "0.1px" },
              "& .Mui-selected": { color: C.link },
              "& .MuiTabs-indicator": { bgcolor: C.link, height: 2, borderRadius: 2 },
            }}
          >
            <Tab label="Thread" value="thread" /><Tab label="Members" value="members" /><Tab label="Pinned" value="pinned" /><Tab label="Files" value="files" /><Tab label="Search" value="search" />
          </Tabs>
          <IconButton size="small" onClick={onClose} aria-label="Close panel" sx={iconBtnSx}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
        </Box>
      )}

      <Box sx={{ flex: 1, minHeight: 0, overflowY: inThread ? "hidden" : "auto", p: 0, display: inThread ? "flex" : "block", flexDirection: "column", "&::-webkit-scrollbar": { width: 5 }, "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.14)", borderRadius: 3 } }}>
        {tab === "thread" && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
            {!threadMsg ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <ThreadsIcon sx={{ fontSize: 28, color: "#475569" }} />
                <Typography sx={{ mt: 1, fontSize: 13, fontWeight: 700, color: C.textPrimary }}>No thread selected</Typography>
                <Typography sx={{ fontSize: 12, mt: 0.5, color: C.textMuted }}>Click <Box component="span" sx={{ fontWeight: 700, color: C.textPrimary }}>Reply</Box> on any message to open its thread.</Typography>
              </Box>
            ) : (
              <>
                <Box ref={threadScrollRef} sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 0.5, "&::-webkit-scrollbar": { width: 5 }, "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.14)", borderRadius: 3 } }}>
                  {/* parent message */}
                  <ThreadRow user={getUser(threadMsg.userId)} time={threadMsg.time}>
                    <Typography sx={msgTextSx} dangerouslySetInnerHTML={{ __html: renderMessageHtml(threadMsg.text) }} />
                    <MessageAttachments attachments={threadMsg.attachments} onPreview={setPreview} />
                  </ThreadRow>
                  {/* replies */}
                  {threadReplies.map((r) => (
                    <ThreadRow key={r.id} user={getUser(r.userId)} time={relativeTime(r.ts, r.time)}>
                      <Typography sx={msgTextSx} dangerouslySetInnerHTML={{ __html: renderMessageHtml(r.text) }} />
                      <MessageAttachments attachments={r.attachments} onPreview={setPreview} />
                    </ThreadRow>
                  ))}
                </Box>
                {/* reply composer — same bar as main chat (thread variant) */}
                <MessageInput
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onSend={sendReply}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  inputRef={replyInputRef}
                  fileRef={replyFileRef}
                  placeholder="Reply to this thread..."
                  mentionOpen={false}
                  users={[]}
                  onMentionSelect={() => {}}
                  showEmojiPicker={replyEmoji}
                  setShowEmojiPicker={setReplyEmoji}
                  onAttach={(e) => { addReplyFiles(e.target.files); e.target.value = ""; }}
                  attachments={replyFiles}
                  onRemoveAttachment={removeReplyFile}
                  canSend={replyFiles.length > 0}
                  variant="thread"
                />
              </>
            )}
          </Box>
        )}
        {tab === "members" && (
          <Box sx={{ p: 1, pt: 1.2 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff", px: 1, pb: 0.5 }}>{USERS.length} members</Typography>
            {admins.length > 0 && (
              <Box>
                <Typography sx={sectionSx}>CHANNEL ADMINS</Typography>
                {admins.map((u) => (
                  <MemberRow key={u.id} u={u} />
                ))}
              </Box>
            )}
            <Typography sx={sectionSx}>MEMBERS</Typography>
            {members.map((u) => (
              <MemberRow key={u.id} u={u} />
            ))}
          </Box>
        )}
        {tab === "pinned" && (
          <Box sx={{ p: 1.5 }}>
            {activeMessages.filter((m) => m.pinned).length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}><PinIcon sx={{ fontSize: 28, color: "#475569" }} /><Typography sx={{ fontSize: 12.5, mt: 1, color: C.textMuted }}>No pinned messages</Typography></Box>
            ) : (
              activeMessages.filter((m) => m.pinned).map((m) => (
                <Paper key={m.id} sx={{ p: 1.2, mb: 1, borderRadius: 1.5, border: "1px solid rgba(250,204,21,0.35)", bgcolor: CARD_BG, boxShadow: "none" }}><Typography sx={{ fontSize: 12.5, fontWeight: 600, color: C.textPrimary }}>{getUser(m.userId).display}</Typography><Typography sx={{ fontSize: 12, color: C.textMuted }}>{String(m.text).slice(0, 120)}</Typography></Paper>
              ))
            )}
          </Box>
        )}
        {tab === "files" && (
          <Box sx={{ p: 1.5 }}>
            <Paper sx={{ p: 1.2, borderRadius: 1.5, border: `1px solid ${C.border}`, bgcolor: CARD_BG, boxShadow: "none", display: "flex", gap: 1, alignItems: "center" }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: "rgba(37,99,235,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}><FileIcon sx={{ fontSize: 18, color: "#5aa9ff" }} /></Box>
              <Box><Typography sx={{ fontSize: 12.5, fontWeight: 600, color: C.textPrimary }}>credentialing-course.png</Typography><Typography sx={{ fontSize: 11, color: C.textMuted }}>342 KB · Added by Mahnoor Fatima</Typography></Box>
            </Paper>
          </Box>
        )}
        {tab === "search" && (
          <Box sx={{ p: 1.5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search in this channel"
              value={rightSearch}
              onChange={(e) => setRightSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 16, color: C.textMuted, mr: 0.7 }} /> }}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": { bgcolor: C.inputBg, color: C.textPrimary, fontSize: 12.5, "& fieldset": { borderColor: C.border }, "&:hover fieldset": { borderColor: "rgba(255,255,255,0.16)" }, "& input::placeholder": { color: C.textMuted, opacity: 1 } },
              }}
            />
            <Typography sx={{ fontSize: 11, color: C.textMuted }}>Search is local (backend: GET /search?q=)</Typography>
          </Box>
        )}
      </Box>

      {/* Image lightbox */}
      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} maxWidth="md" slotProps={{ paper: { sx: { bgcolor: "#0f172a", borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)", maxWidth: "92vw", overflow: "hidden" } } }}>
        {preview && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{preview.name}</Typography>
                <Typography sx={{ fontSize: 11, color: C.textMuted }}>{formatFileSize(preview.size)}</Typography>
              </Box>
              <Box component="a" href={preview.url} download={preview.name} sx={{ fontSize: 12, fontWeight: 600, color: C.link, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>Download</Box>
              <IconButton size="small" onClick={() => setPreview(null)} sx={iconBtnSx} aria-label="Close preview"><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
            </Box>
            <Box component="img" src={preview.url} alt={preview.name} sx={{ width: "100%", maxHeight: "78vh", objectFit: "contain", display: "block", bgcolor: "#000" }} />
          </Box>
        )}
      </Dialog>
    </Drawer>
  );
}
