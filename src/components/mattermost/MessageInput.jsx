import { useState } from "react";
import { Box, Typography, IconButton, InputBase, Paper, Avatar, Divider, Tooltip } from "@mui/material";
import { AttachFile as AttachFileIcon, SentimentSatisfiedAltOutlined as EmojiIcon, Send as SendIcon } from "@mui/icons-material";
import { C } from "../../theme/mattermost";
import EmojiPicker from "./EmojiPicker";

/**
 * Composer: handles text, mentions, emoji, file attach
 * Matches Mattermost bottom bar: B I S H link <> quote lists etc
 * Backend: onSend -> POST /channels/:id/messages ; onFile -> POST /files
 */
export default function MessageInput({
  value, onChange, onSend, onKeyDown, inputRef, fileRef,
  placeholder, mentionOpen, users, onMentionSelect, showEmojiPicker, setShowEmojiPicker, onAttach,
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

  return (
    <Box sx={{ p: { xs: 1, md: 1 }, bgcolor: C.channelHeaderBg, borderTop: `1px solid ${C.border}`, flexShrink: 0, position: "relative" }}>
      {mentionOpen && (
        <Paper sx={{ mb: 0.8, p: 0.6, borderRadius: 1.5, maxHeight: 160, overflowY: "auto", position: "absolute", bottom: 92, left: 8, right: 8, zIndex: 5, boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b", px: 1, py: 0.3 }}>MENTION SOMEONE</Typography>
          {users.filter((u) => u.name.toLowerCase().includes(value.slice(value.lastIndexOf("@") + 1).toLowerCase())).map((u) => (
            <Box key={u.id} onClick={() => onMentionSelect(u.name)} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.6, borderRadius: 1, cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>
              <Avatar sx={{ width: 22, height: 22, fontSize: 11, bgcolor: u.color }}>{u.display[0]}</Avatar>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{u.name}</Typography>
              <Typography sx={{ fontSize: 11, color: "#64748b" }}>{u.display}</Typography>
            </Box>
          ))}
        </Paper>
      )}

      {/* Emoji picker — anchored above composer like screenshot */}
      {isPickerOpen && (
        <Box sx={{ position: "absolute", bottom: 88, right: 12, zIndex: 10, display: { xs: "none", md: "block" } }}>
          <EmojiPicker onSelect={(e) => { insertAtCursor(e); setPickerOpen(false); setShowEmojiPicker(false); }} />
        </Box>
      )}
      {isPickerOpen && <Box sx={{ display: { xs: "block", md: "none" }, position: "absolute", bottom: 88, left: 8, right: 8, zIndex: 10 }}><EmojiPicker onSelect={(e) => { insertAtCursor(e); setPickerOpen(false); setShowEmojiPicker(false); }} /></Box>}

      <input ref={fileRef} type="file" hidden onChange={onAttach} />
      <Paper sx={{ display: "flex", flexDirection: "column", gap: 0, bgcolor: C.inputBg, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "none", overflow: "hidden", "&:focus-within": { borderColor: "rgba(61,125,232,0.5)" } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, px: 1.2, py: 0.85, minHeight: 38 }}>
          <InputBase inputRef={inputRef} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} multiline maxRows={5} sx={{ flex: 1, fontSize: 13.2, color: C.textPrimary, "& textarea::placeholder": { color: C.textMuted, opacity: 1 } }} />
        </Box>

        {/* Formatting toolbar — matches screenshot bottom bar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.15, px: 0.8, py: 0.4, borderTop: "1px solid rgba(255,255,255,0.06)", bgcolor: "rgba(0,0,0,0.15)", overflowX: "auto", "&::-webkit-scrollbar": { height: 0 } }}>
          <Tooltip title="Bold (Ctrl+B)"><IconButton size="small" onClick={() => applyWrap("**")} sx={{ width: 24, height: 24, color: C.textMuted, fontWeight: 800, fontSize: 12 }}>B</IconButton></Tooltip>
          <Tooltip title="Italic"><IconButton size="small" onClick={() => applyWrap("*")} sx={{ width: 24, height: 24, color: C.textMuted, fontStyle: "italic", fontSize: 12 }}>I</IconButton></Tooltip>
          <Tooltip title="Strikethrough"><IconButton size="small" onClick={() => applyWrap("~~")} sx={{ width: 24, height: 24, color: C.textMuted, fontSize: 11, textDecoration: "line-through" }}>S</IconButton></Tooltip>
          <Tooltip title="Heading"><IconButton size="small" onClick={() => insertAtCursor("\n### ")} sx={{ width: 24, height: 24, color: C.textMuted, fontSize: 11 }}>H</IconButton></Tooltip>
          <Tooltip title="Link"><IconButton size="small" onClick={() => applyWrap("[", "](url)")} sx={{ width: 24, height: 24, color: C.textMuted }}><Box sx={{ fontSize: 12 }}>🔗</Box></IconButton></Tooltip>
          <Tooltip title="Code"><IconButton size="small" onClick={() => applyWrap("`")} sx={{ width: 24, height: 24, color: C.textMuted, fontSize: 12 }}>&lt;&gt;</IconButton></Tooltip>
          <Tooltip title="Quote"><IconButton size="small" onClick={() => insertAtCursor("\n> ")} sx={{ width: 24, height: 24, color: C.textMuted, fontSize: 12 }}>“</IconButton></Tooltip>
          <Tooltip title="Bulleted list"><IconButton size="small" onClick={() => insertAtCursor("\n- ")} sx={{ width: 24, height: 24, color: C.textMuted, fontSize: 12 }}>≡</IconButton></Tooltip>
          <Tooltip title="Numbered list"><IconButton size="small" onClick={() => insertAtCursor("\n1. ")} sx={{ width: 24, height: 24, color: C.textMuted, fontSize: 11 }}>1.</IconButton></Tooltip>
          <Tooltip title="Code block"><IconButton size="small" onClick={() => applyWrap("\n```\n", "\n```")} sx={{ width: 24, height: 24, color: C.textMuted, fontSize: 10 }}>◷</IconButton></Tooltip>
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 11, color: C.textMuted, display: { xs: "none", sm: "block" }, cursor: "pointer" }}>Aa ▾</Typography>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.6, borderColor: C.border, height: 16, alignSelf: "center" }} />
          <Tooltip title="Attach file"><IconButton size="small" onClick={() => fileRef.current?.click()} sx={{ color: C.textMuted, width: 24, height: 24 }}><AttachFileIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
          <Tooltip title="Emoji"><IconButton size="small" onClick={() => { setPickerOpen((v) => !v); setShowEmojiPicker((v) => !v); }} sx={{ color: isPickerOpen ? "#5aa9ff" : C.textMuted, width: 24, height: 24, bgcolor: isPickerOpen ? "rgba(90,169,255,0.12)" : "transparent" }}><EmojiIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
          <Box component="button" onClick={onSend} disabled={!value.trim()} aria-label="Send" style={{ width: 28, height: 26, borderRadius: 6, border: "none", background: value.trim() ? C.accent : "#2e3548", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: value.trim() ? "pointer" : "default", marginLeft: 4 }}><SendIcon sx={{ fontSize: 13 }} /></Box>
        </Box>
      </Paper>
    </Box>
  );
}
