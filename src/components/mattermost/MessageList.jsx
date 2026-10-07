import { Box, Typography, Avatar, Chip, Divider, IconButton, Paper, TextField, Button, Tooltip, Badge } from "@mui/material";
import { PushPin as PinFilledIcon, Bookmark as BookmarkFilledIcon, Reply as ReplyIcon, SentimentSatisfiedAltOutlined as EmojiIcon, BookmarkBorder as BookmarkIcon, PushPinOutlined as PinIcon, MoreHoriz as MoreIcon, StarBorder as StarBorderIcon, EditOutlined as EditIcon, DescriptionOutlined as FileIcon } from "@mui/icons-material";
import { C } from "../../theme/mattermost";
import { renderMessageHtml, REACTION_QUICK } from "../../data/mockMattermost";

/**
 * Message list with DM intro, system messages, dish/image & thread meta
 * Backend: messages -> GET /channels/:id/messages ; reactions -> POST /reactions
 */
export default function MessageList({
  selectedChannel, selectedDM, activeMessages, dmUser, getUser, listRef,
  editingId, editText, setEditText, saveEdit, setEditingId,
  toggleReaction, emojiFor, setEmojiFor, toggleSave, togglePin, setMsgMenu, setThreadFor, setRightTab, setRightOpen,
}) {
  const isDM = Boolean(selectedDM);
  if (!isDM && activeMessages.length === 0 && selectedChannel === "c6") {
    // channel purpose already shown in parent, keep empty handling below
  }

  return (
    <Box ref={listRef} sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", "&::-webkit-scrollbar": { width: 6 }, "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.12)", borderRadius: 3 } }}>
      {/* DM intro header — every DM (responsive) */}
      {isDM && dmUser && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: { xs: 2, md: 3.5 }, px: 2, textAlign: "center" }}>
          <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: "#3db33d", border: "2px solid " + C.mainBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10 }}>✓</Box>}>
            <Avatar sx={{ width: { xs: 64, md: 84 }, height: { xs: 64, md: 84 }, bgcolor: dmUser.color, fontSize: { xs: 22, md: 28 }, fontWeight: 700 }}>{dmUser.display[0]}</Avatar>
          </Badge>
          <Typography sx={{ mt: 1.5, fontSize: { xs: 18, md: 22 }, fontWeight: 800, color: "#fff" }}>{dmUser.display}</Typography>
          <Typography sx={{ mt: 0.8, fontSize: { xs: 11.5, md: 12.5 }, color: "#9aa4b2", maxWidth: 520, lineHeight: 1.5 }}>
            This is the start of your direct message history with <Box component="span" sx={{ color: "#fff", fontWeight: 600 }}>{dmUser.name}</Box>. Messages and files shared here are not shown to anyone else.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1.8, flexWrap: "wrap", justifyContent: "center" }}>
            <Box sx={{ width: 92, height: 60, bgcolor: "#262938", borderRadius: 1.5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.4, cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)", "&:hover": { bgcolor: "#2e3145" } }}><StarBorderIcon sx={{ fontSize: 18, color: "#9aa4b2" }} /><Typography sx={{ fontSize: 10, color: "#9aa4b2" }}>Favorite</Typography></Box>
            <Box sx={{ width: 92, height: 60, bgcolor: "#262938", borderRadius: 1.5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.4, cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)", "&:hover": { bgcolor: "#2e3145" } }}><EditIcon sx={{ fontSize: 16, color: "#9aa4b2" }} /><Typography sx={{ fontSize: 10, color: "#9aa4b2" }}>Set header</Typography></Box>
          </Box>
        </Box>
      )}

      {selectedChannel === "c6" && !isDM && (
        <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: 1.2, borderBottom: `1px solid ${C.border}` }}>
          <Box component="ul" sx={{ m: 0, pl: 2.2, color: "#cbd5e1", fontSize: { xs: 11.5, md: 12.5 }, lineHeight: 1.65 }}>
            <li>Extensive scope of credentialing and provider enrollment in healthcare operations.</li>
            <li>Collect, review, and verify provider information and credentials.</li>
            <li>Manage CAQH profiles and payer enrollment applications.</li>
            <li>Understand Medicare, Medicaid, and commercial payer enrollment processes.</li>
            <li>Navigate payer portals and enrollment systems.</li>
            <li>Manage EFT, ERA, and EDI enrollment processes.</li>
            <li>Track enrollment applications and follow up with payers.</li>
            <li>Identify and resolve enrollment issues and application rejections.</li>
            <li>Perform provider maintenance, recredentialing, and revalidation activities.</li>
          </Box>
        </Box>
      )}

      {activeMessages.length === 0 && !isDM ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, color: C.textMuted, textAlign: "center" }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>💬</Box>
          <Typography sx={{ mt: 1, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>No messages yet</Typography>
          <Typography sx={{ fontSize: 12.5, mt: 0.5 }}>Be the first to post.</Typography>
        </Box>
      ) : activeMessages.length === 0 && isDM ? (
        <Box sx={{ px: 2, pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 1.5 }}><Divider sx={{ flex: 1, borderColor: C.border }} /><Typography sx={{ fontSize: 11, color: C.textMuted, bgcolor: C.mainBg, px: 1 }}>February 25</Typography><Divider sx={{ flex: 1, borderColor: C.border }} /></Box>
          <Typography sx={{ fontSize: 12, color: C.textMuted, textAlign: "center" }}>No messages yet — start the conversation.</Typography>
        </Box>
      ) : (
        <Box sx={{ py: 0.5 }}>
          {isDM && <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, my: 1 }}><Divider sx={{ flex: 1, borderColor: C.border }} /><Typography sx={{ fontSize: 11, color: C.textMuted, bgcolor: C.mainBg, px: 1 }}>February 25</Typography><Divider sx={{ flex: 1, borderColor: C.border }} /></Box>}
          {activeMessages.map((m) => {
            if (m.system) return <Box key={m.id} sx={{ px: { xs: 1.5, md: 2.5 }, py: 0.8, pl: { xs: 3, md: 6.5 } }}><Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: C.textPrimary }}>{m.text}</Typography></Box>;
            const u = getUser(m.userId);
            return (
              <Box key={m.id}>
                {m.divider && <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, my: 1 }}><Divider sx={{ flex: 1, borderColor: C.border }} /><Typography sx={{ fontSize: 11, color: C.textMuted, bgcolor: C.mainBg, px: 1 }}>{m.divider}</Typography><Divider sx={{ flex: 1, borderColor: C.border }} /></Box>}
                <Box sx={{ display: "flex", gap: 1.2, px: { xs: 1, md: 1.8 }, py: 0.9, "&:hover": { bgcolor: "rgba(255,255,255,0.03)" }, position: "relative", borderLeft: m.pinned ? "2px solid #facc15" : "2px solid transparent" }}>
                  <Avatar sx={{ width: { xs: 30, md: 34 }, height: { xs: 30, md: 34 }, bgcolor: u.color, color: "#fff", fontSize: { xs: 11, md: 13 }, fontWeight: 700, mt: 0.2, flexShrink: 0 }}>{(u.display || "?")[0]}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>{u.display}</Typography>
                      <Typography sx={{ fontSize: 11, color: C.textMuted }}>{m.time}</Typography>
                      {m.edited && <Typography sx={{ fontSize: 10, color: C.textMuted }}>(edited)</Typography>}
                      {m.pinned && <Chip icon={<PinFilledIcon sx={{ fontSize: 11 }} />} label="Pinned" size="small" sx={{ height: 16, fontSize: 10, bgcolor: "rgba(250,204,21,0.14)", color: "#facc15" }} />}
                      {m.saved && <BookmarkFilledIcon sx={{ fontSize: 12, color: "#5aa9ff" }} />}
                    </Box>
                    {editingId === m.id ? (
                      <Box sx={{ mt: 0.6 }}>
                        <TextField fullWidth multiline minRows={2} value={editText} onChange={(e) => setEditText(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { bgcolor: C.inputBg, color: "#fff", fontSize: 13 } }} />
                        <Box sx={{ display: "flex", gap: 1, mt: 0.7, flexWrap: "wrap" }}>
                          <Button size="small" variant="contained" onClick={saveEdit} sx={{ textTransform: "none", fontSize: 12 }}>Save</Button>
                          <Button size="small" onClick={() => setEditingId(null)} sx={{ textTransform: "none", fontSize: 12, color: C.textMuted }}>Cancel</Button>
                          <Typography sx={{ fontSize: 11, color: C.textMuted, alignSelf: "center" }}>Enter to save · Esc to cancel</Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: { xs: 12.5, md: 13.2 }, color: C.textPrimary, mt: 0.25, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5, "& strong": { fontWeight: 700, color: "#fff" }, "& code": { bgcolor: "rgba(255,255,255,0.08)", px: 0.5, py: 0.15, borderRadius: 0.5, fontSize: 12, fontFamily: "monospace" } }} dangerouslySetInnerHTML={{ __html: renderMessageHtml(m.text) }} />
                    )}
                    {m.hasImage && (
                      <Box sx={{ mt: 1, borderRadius: 2, overflow: "hidden", border: `1px solid ${C.border}`, maxWidth: { xs: "100%", sm: 520 }, bgcolor: "#fff" }}>
                        <Box sx={{ height: 20, bgcolor: "#f1a7c8", display: "flex", alignItems: "center", gap: 0.5, px: 1, borderBottom: "1px solid #e8a0c0" }}><Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#ff5f56" }} /><Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#ffbd2e" }} /><Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#27c93f" }} /><Box sx={{ flex: 1, mx: 1, height: 12, bgcolor: "#fff", borderRadius: 10 }} /></Box>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.6, py: 0.8, borderBottom: "1px solid #eee" }}><Box sx={{ display: "flex", alignItems: "center", gap: 0.8, bgcolor: "#0b2a5b", color: "#fff", px: 1, py: 0.3, borderRadius: 10, fontSize: 10, fontWeight: 800 }}><Box sx={{ width: 16, height: 16, bgcolor: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#0b2a5b", fontSize: 8, fontWeight: 900 }}>◈</Box> IPS UNI</Box><Box sx={{ border: "1.5px solid #0b2a5b", color: "#0b2a5b", px: 1, py: 0.2, borderRadius: 10, fontSize: 9, fontWeight: 700 }}>Enroll Now</Box></Box>
                        <Box sx={{ background: "linear-gradient(135deg,#1a3a7a 0%,#2a5db0 100%)", px: 2.5, py: 2.2, textAlign: "center", color: "#fff" }}><Typography sx={{ fontSize: 13, fontWeight: 800 }}>Credentialing Specialist Course</Typography><Typography sx={{ fontSize: 10, mt: 0.4, opacity: 0.9 }}><Box component="span" sx={{ fontWeight: 700 }}>Class Mode:</Box> Physical & Online</Typography><Box sx={{ display: "flex", gap: 1.2, justifyContent: "center", mt: 1.5, flexWrap: "wrap" }}><Box sx={{ bgcolor: "#fff", color: "#1a3a7a", px: 1.6, py: 0.7, borderRadius: 1.5, minWidth: 96, border: "2px solid #e53935" }}><Typography sx={{ fontSize: 10, fontWeight: 800 }}>Admission Open</Typography><Typography sx={{ fontSize: 8, color: "#666" }}>Open</Typography></Box><Box sx={{ bgcolor: "#fff", color: "#1a3a7a", px: 1.6, py: 0.7, borderRadius: 1.5, minWidth: 96 }}><Typography sx={{ fontSize: 10, fontWeight: 800 }}>Course Fee</Typography><Typography sx={{ fontSize: 8, color: "#666" }}>PKR 20,000</Typography></Box></Box></Box>
                        <Box sx={{ px: 1.2, py: 0.6, bgcolor: "#f8fafc", display: "flex", alignItems: "center", gap: 0.8, borderTop: "1px solid #e2e8f0" }}><FileIcon sx={{ fontSize: 14, color: "#64748b" }} /><Typography sx={{ fontSize: 11, color: "#334155" }}>credentialing-course.png · 342 KB</Typography><Box sx={{ flex: 1 }} /><Typography sx={{ fontSize: 11, color: C.accent, cursor: "pointer" }}>Download</Typography></Box>
                      </Box>
                    )}
                    {m.hasDishImage && <Box sx={{ mt: 0.8, borderRadius: 1.5, overflow: "hidden", border: `1px solid ${C.border}`, maxWidth: { xs: "100%", sm: 260 }, bgcolor: "#111827" }}><Box component="img" src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=260&fit=crop" alt="dish" sx={{ width: "100%", height: { xs: 140, sm: 160 }, objectFit: "cover", display: "block" }} /></Box>}
                    {(m.replies > 0 || m.replyMeta) && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.7, flexWrap: "wrap" }}>
                        {m.replies > 0 && <><Avatar sx={{ width: 18, height: 18, bgcolor: "#7c4dff", fontSize: 9, fontWeight: 700 }}>S</Avatar><Box onClick={() => { setThreadFor(m.id); setRightTab("thread"); setRightOpen(true); }} sx={{ display: "flex", alignItems: "center", gap: 0.4, color: C.link, fontSize: 11, fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}><ReplyIcon sx={{ fontSize: 11 }} /> {m.replies} {m.replies === 1 ? "reply" : "replies"}</Box><Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: C.border, height: 12, alignSelf: "center" }} /><Typography sx={{ fontSize: 11, color: "#9aa4b2", cursor: "pointer" }}>Follow</Typography></>}
                        {m.replyMeta && <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}><Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: "#ff6d00", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>M</Box><Box onClick={() => { setThreadFor(m.id); setRightTab("thread"); setRightOpen(true); }} sx={{ display: "flex", alignItems: "center", gap: 0.4, color: C.link, fontSize: 11, fontWeight: 600, cursor: "pointer" }}><ReplyIcon sx={{ fontSize: 11 }} /> {m.replyMeta.count} {m.replyMeta.count === 1 ? "reply" : "replies"}</Box><Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: C.border, height: 12, alignSelf: "center" }} /><Typography sx={{ fontSize: 11, color: "#9aa4b2", cursor: "pointer" }}>Follow</Typography></Box>}
                      </Box>
                    )}
                    {m.reactions?.length > 0 && <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.6, flexWrap: "wrap" }}>{m.reactions.map((r) => <Chip key={r.emoji} label={`${r.emoji} ${r.count}`} size="small" onClick={() => toggleReaction(m.id, r.emoji)} sx={{ height: 22, fontSize: 11, bgcolor: r.me ? "rgba(61,125,232,0.18)" : "rgba(255,255,255,0.06)", color: r.me ? "#8ab0ff" : C.textPrimary, border: r.me ? "1px solid rgba(61,125,232,0.35)" : "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }} />)}</Box>}
                  </Box>
                  <Box sx={{ position: "absolute", top: -10, right: 12, display: { xs: "none", sm: "flex" }, gap: 0.2, bgcolor: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 1.5, p: 0.2, opacity: 0, ".MuiBox-root:hover > &": { opacity: 1 }, transition: "opacity 0.12s", zIndex: 1 }}>
                    <Tooltip title="React"><IconButton size="small" onClick={() => setEmojiFor(emojiFor === m.id ? null : m.id)} sx={{ width: 26, height: 26, color: C.textMuted }}><EmojiIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                    <Tooltip title="Reply"><IconButton size="small" onClick={() => { setThreadFor(m.id); setRightTab("thread"); setRightOpen(true); }} sx={{ width: 26, height: 26, color: C.textMuted }}><ReplyIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                    <Tooltip title="Save"><IconButton size="small" onClick={() => toggleSave(m.id)} sx={{ width: 26, height: 26, color: m.saved ? "#5aa9ff" : C.textMuted }}><BookmarkIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                    <Tooltip title="Pin"><IconButton size="small" onClick={() => togglePin(m.id)} sx={{ width: 26, height: 26, color: m.pinned ? "#facc15" : C.textMuted }}><PinIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                    <IconButton size="small" onClick={(e) => setMsgMenu({ id: m.id, anchor: e.currentTarget })} sx={{ width: 26, height: 26, color: C.textMuted }} aria-label="More"><MoreIcon sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                  {emojiFor === m.id && (
                    <Paper sx={{ position: "absolute", bottom: "100%", right: 12, mb: 0.5, p: 0.5, display: "flex", gap: 0.3, zIndex: 10, borderRadius: 2, bgcolor: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }}>
                      {REACTION_QUICK.map((e) => (
                        <Box key={e} onClick={() => { toggleReaction(m.id, e); setEmojiFor(null); }} sx={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 1, cursor: "pointer", fontSize: 16, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}>{e}</Box>
                      ))}
                    </Paper>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
