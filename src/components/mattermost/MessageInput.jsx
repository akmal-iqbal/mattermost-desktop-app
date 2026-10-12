import { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, InputBase, Paper, Badge, Divider, Tooltip, Menu, MenuItem } from "@mui/material";
import { AttachFile as AttachFileIcon, SentimentSatisfiedAltOutlined as EmojiIcon, Send as SendIcon, Close as CloseIcon, DescriptionOutlined as FileIcon, MoreHoriz as MoreIcon, ExpandLess as ExpandLessIcon } from "@mui/icons-material";
import { C } from "../../theme/mattermost";
import { formatFileSize } from "../../utils/files";
import EmojiPicker from "./EmojiPicker";
import UserAvatar from "./UserAvatar";

/**
 * Composer: handles text, mentions, emoji, file attach
 * Matches Mattermost bottom bar: B I S H link <> quote lists etc
 * Backend: onSend -> POST /channels/:id/messages ; onFile -> POST /files
 * Attachments: picker (onAttach) + drag&drop/paste (parent) -> chips -> sent with message
 */
export default function MessageInput({
  value, onChange, onSend, onKeyDown, onPaste, inputRef, fileRef,
  placeholder, mentionOpen, users, onMentionSelect, showEmojiPicker, setShowEmojiPicker, onAttach,
  attachments = [], onRemoveAttachment, canSend = false, showAttach = true,
  variant = "full",
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const applyWrap = (before, after = before) => {
    const el = inputRef.current;
    if (!el) { onChange({ target: { value: value + before + after } }); return; }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const sel = value.slice(start, end);
    const next = value.slice(0, start) + before + (sel || "text") + after + value.slice(end);
    onChange({ target: { value: next } });
    setTimeout(() => { el.focus(); el.setSelectionRange(start + before.length, start + before.length + (sel || "text").length); }, 0);
  };
  const insertAtCursor = (txt) => {
    const el = inputRef.current;
    if (!el) { onChange({ target: { value: value + txt } }); return; }
    const s = el.selectionStart ?? value.length;
    const next = value.slice(0, s) + txt + value.slice(s);
    onChange({ target: { value: next } });
    setTimeout(() => { el.focus(); el.setSelectionRange(s + txt.length, s + txt.length); }, 0);
  };

  const isPickerOpen = showEmojiPicker || pickerOpen;

  // ---- @mention autocomplete (dark, grouped, keyboard navigable) ----
  const mentionQuery = value.slice(value.lastIndexOf("@") + 1).toLowerCase();
  const matchMention = (u) =>
    u.name.toLowerCase().includes(mentionQuery) ||
    String(u.display || "").toLowerCase().includes(mentionQuery);
  const mentionMembers = users.filter((u) => u.inChannel !== false && matchMention(u));
  const mentionOutsiders = users.filter((u) => u.inChannel === false && matchMention(u));
  const mentionFlat = [...mentionMembers, ...mentionOutsiders];
  const [mentionSel, setMentionSel] = useState({ q: "", i: 0 });
  if (mentionSel.q !== mentionQuery) setMentionSel({ q: mentionQuery, i: 0 });
  const mentionIdx = Math.min(mentionSel.i, Math.max(mentionFlat.length - 1, 0));
  const activeMentionId = mentionFlat[mentionIdx]?.id;
  const mentionRefs = useRef({});
  useEffect(() => {
    if (mentionOpen && activeMentionId) mentionRefs.current[activeMentionId]?.scrollIntoView?.({ block: "nearest" });
  }, [mentionOpen, activeMentionId]);

  const handleComposerKey = (e) => {
    if (mentionOpen && mentionFlat.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionSel((s) => ({ ...s, i: (s.i + 1) % mentionFlat.length }));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionSel((s) => ({ ...s, i: (s.i - 1 + mentionFlat.length) % mentionFlat.length }));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const u = mentionFlat[mentionIdx];
        if (u) onMentionSelect(u.name);
        return;
      }
    }
    onKeyDown(e);
  };

  const statusDot = (u) => (u.status === "online" ? "#22c55e" : u.status === "away" ? "#ffbc1f" : "#9aa4b2");

  const renderMentionRow = (u) => {
    const idx = mentionFlat.indexOf(u);
    const isActive = idx === mentionIdx;
    return (
      <Box
        key={u.id}
        ref={(el) => { if (el) mentionRefs.current[u.id] = el; }}
        onClick={() => onMentionSelect(u.name)}
        onMouseEnter={() => setMentionSel((s) => ({ ...s, i: idx }))}
        sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.6, borderRadius: 1, cursor: "pointer", bgcolor: isActive ? "rgba(61,125,232,0.18)" : "transparent", "&:hover": { bgcolor: "rgba(61,125,232,0.14)" } }}
      >
        <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: statusDot(u), border: "2px solid #1e2e46" }} />}>
          <UserAvatar user={u} size={26} fontSize={12} />
        </Badge>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>@{u.name}</Typography>
        <Typography sx={{ fontSize: 12.5, color: "#8b98ab", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.display}{u.id === "me" ? " (you)" : ""}</Typography>
        <Box sx={{ flex: 1 }} />
        {u.statusEmoji && <Typography sx={{ fontSize: 14 }}>{u.statusEmoji}</Typography>}
      </Box>
    );
  };

  // Formatting toolbar variants — full (main chat: B I S H link •••),
  // thread (reply box: B I S •••). Extras live under •••.
  const [moreAnchor, setMoreAnchor] = useState(null);
  const fmtBtn = { width: 26, height: 26, color: C.textMuted };
  // descriptors only (no closures) — executed by runExtra in the click handler
  const moreItems = [
    ...(variant === "thread" ? [{ label: "Heading", act: "insert", text: "\n### " }] : []),
    { label: "Inline code", act: "wrap", before: "`" },
    { label: "Code block", act: "wrap", before: "\n```\n", after: "\n```" },
    { label: "Quote", act: "insert", text: "\n> " },
    { label: "Bulleted list", act: "insert", text: "\n- " },
    { label: "Numbered list", act: "insert", text: "\n1. " },
  ];
  const runExtra = (it) => {
    if (it.act === "wrap") applyWrap(it.before, it.after);
    else insertAtCursor(it.text);
    setMoreAnchor(null);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 1 }, bgcolor: C.channelHeaderBg, borderTop: `1px solid ${C.border}`, flexShrink: 0, position: "relative" }}>
      {mentionOpen && (
        <Paper sx={{ p: 0.6, borderRadius: 1.5, maxHeight: 260, overflowY: "auto", position: "absolute", bottom: 92, left: 8, right: 8, zIndex: 5, bgcolor: "#1e2e46", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 12px 32px rgba(0,0,0,0.5)", "&::-webkit-scrollbar": { width: 5 }, "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.14)", borderRadius: 3 } }}>
          {mentionMembers.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: "#8b98ab", px: 1, pt: 0.4, pb: 0.4 }}>CHANNEL MEMBERS</Typography>
              {mentionMembers.map(renderMentionRow)}
            </Box>
          )}
          {mentionOutsiders.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: "#8b98ab", px: 1, pt: 1, pb: 0.4 }}>NOT IN CHANNEL</Typography>
              {mentionOutsiders.map(renderMentionRow)}
            </Box>
          )}
          {mentionFlat.length === 0 && (
            <Box sx={{ px: 1.5, py: 2, textAlign: "center" }}>
              <Typography sx={{ fontSize: 12.5, color: "#8b98ab" }}>No teammates match “@{value.slice(value.lastIndexOf("@") + 1)}”</Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Emoji picker — anchored above composer like screenshot */}
      {isPickerOpen && (
        <Box sx={{ position: "absolute", bottom: 88, right: 12, zIndex: 10, display: { xs: "none", md: "block" } }}>
          <EmojiPicker onSelect={(e) => { insertAtCursor(e); setPickerOpen(false); setShowEmojiPicker(false); }} />
        </Box>
      )}
      {isPickerOpen && <Box sx={{ display: { xs: "block", md: "none" }, position: "absolute", bottom: 88, left: 8, right: 8, zIndex: 10 }}><EmojiPicker onSelect={(e) => { insertAtCursor(e); setPickerOpen(false); setShowEmojiPicker(false); }} /></Box>}

      <input ref={fileRef} type="file" hidden multiple onChange={onAttach} />
      <Paper sx={{ display: "flex", flexDirection: "column", gap: 0, bgcolor: C.inputBg, borderRadius: 1, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "none", overflow: "hidden", "&:focus-within": { borderColor: "rgba(61,125,232,0.5)" } }}>
        {/* Pending attachments (picker / drop / paste) */}
        {attachments.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", px: 1.2, pt: 1 }}>
            {attachments.map((a) => (
              <Box key={a.id} sx={{ position: "relative", display: "flex", alignItems: "center", gap: 0.8, bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 1.5, p: 0.6, pr: 3, maxWidth: 230 }}>
                {a.kind === "image" ? (
                  <Box component="img" src={a.url} alt={a.name} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: "rgba(90,169,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileIcon sx={{ fontSize: 18, color: "#5aa9ff" }} /></Box>
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{a.name}</Typography>
                  <Typography sx={{ fontSize: 10.5, color: C.textMuted }}>{formatFileSize(a.size)}</Typography>
                </Box>
                <IconButton size="small" onClick={() => onRemoveAttachment?.(a.id)} aria-label={`Remove ${a.name}`} sx={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, color: C.textMuted, "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" } }}><CloseIcon sx={{ fontSize: 12 }} /></IconButton>
              </Box>
            ))}
          </Box>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, px: 1.2, py: 0.85, minHeight: 38 }}>
          <InputBase inputRef={inputRef} value={value} onChange={onChange} onKeyDown={handleComposerKey} onPaste={onPaste} placeholder={placeholder} multiline maxRows={5} sx={{ flex: 1, fontSize: 13.2, color: C.textPrimary, "& textarea::placeholder": { color: C.textMuted, opacity: 1 } }} />
        </Box>

        {/* Formatting toolbar — full: B I S H link ••• · thread: B I S ••• */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, px: 0.8, py: 0.5, borderTop: "1px solid rgba(255,255,255,0.05)", bgcolor: "rgba(0,0,0,0.15)", overflowX: "auto", "&::-webkit-scrollbar": { height: 0 } }}>
          <Tooltip title="Bold (Ctrl+B)"><IconButton size="small" onClick={() => applyWrap("**")} sx={{ ...fmtBtn, fontWeight: 800, fontSize: 12.5 }}>B</IconButton></Tooltip>
          <Tooltip title="Italic"><IconButton size="small" onClick={() => applyWrap("*")} sx={{ ...fmtBtn, fontStyle: "italic", fontSize: 12.5 }}>I</IconButton></Tooltip>
          <Tooltip title="Strikethrough"><IconButton size="small" onClick={() => applyWrap("~~")} sx={{ ...fmtBtn, fontSize: 11.5, textDecoration: "line-through" }}>S</IconButton></Tooltip>
          {variant === "full" && (
            <>
              <Tooltip title="Heading"><IconButton size="small" onClick={() => insertAtCursor("\n### ")} sx={{ ...fmtBtn, fontSize: 11.5 }}>H</IconButton></Tooltip>
              <Tooltip title="Link"><IconButton size="small" onClick={() => applyWrap("[", "](url)")} sx={fmtBtn}><Box sx={{ fontSize: 12.5 }}>🔗</Box></IconButton></Tooltip>
            </>
          )}
          <Tooltip title="More formatting options"><IconButton size="small" onClick={(e) => setMoreAnchor(e.currentTarget)} sx={fmtBtn} aria-label="More formatting"><MoreIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
          <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)} anchorOrigin={{ vertical: "top", horizontal: "left" }} transformOrigin={{ vertical: "bottom", horizontal: "left" }} slotProps={{ paper: { sx: { bgcolor: "#1e2e46", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 1.5, minWidth: 180, p: 0.5 } } }}>
            {moreItems.map((it) => (
              <MenuItem key={it.label} onClick={() => runExtra(it)} sx={{ fontSize: 12.5, color: "#e2e8f0", borderRadius: 1, py: 0.8, "&:hover": { bgcolor: "rgba(255,255,255,0.07)" } }}>{it.label}</MenuItem>
            ))}
          </Menu>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", color: C.textMuted, cursor: "pointer" }}><Typography sx={{ fontSize: 11 }}>Aa</Typography><ExpandLessIcon sx={{ fontSize: 13 }} /></Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.6, borderColor: C.border, height: 16, alignSelf: "center" }} />
          <Tooltip title="Attach file"><IconButton size="small" onClick={() => showAttach && fileRef.current?.click()} sx={{ color: C.textMuted, width: 24, height: 24, display: showAttach ? "inline-flex" : "none" }} aria-label="Attach file"><AttachFileIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
          <Tooltip title="Emoji"><IconButton size="small" onClick={() => { setPickerOpen((v) => !v); setShowEmojiPicker((v) => !v); }} sx={{ color: isPickerOpen ? "#5aa9ff" : C.textMuted, width: 24, height: 24, bgcolor: isPickerOpen ? "rgba(90,169,255,0.12)" : "transparent" }}><EmojiIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
          <Box component="button" onClick={onSend} disabled={!value.trim() && !canSend} aria-label="Send" style={{ width: 28, height: 26, borderRadius: 6, border: "none", background: (value.trim() || canSend) ? C.accent : "#2e3548", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: (value.trim() || canSend) ? "pointer" : "default", marginLeft: 4 }}><SendIcon sx={{ fontSize: 13 }} /></Box>
        </Box>
      </Paper>
    </Box>
  );
}
