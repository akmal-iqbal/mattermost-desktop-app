import { Box, Typography, Paper } from "@mui/material";
import { DescriptionOutlined as FileIcon } from "@mui/icons-material";
import { C } from "../../theme/mattermost";
import { formatFileSize } from "../../utils/files";

/**
 * Shared attachment renderer (main list + thread panel)
 * Images: clickable thumbnails -> onPreview lightbox. Files: dark cards + Download.
 * Backend: swap local object URLs for CDN urls from POST /files
 */
export default function MessageAttachments({ attachments = [], onPreview }) {
  if (!attachments?.length) return null;
  const images = attachments.filter((a) => a.kind === "image");
  const files = attachments.filter((a) => a.kind !== "image");
  return (
    <Box sx={{ mt: 0.8, display: "flex", flexDirection: "column", gap: 0.8, alignItems: "flex-start" }}>
      {images.map((a) => (
        <Box key={a.id} sx={{ maxWidth: "100%" }}>
          <Box component="img" src={a.url} alt={a.name} onClick={() => onPreview?.(a)} sx={{ borderRadius: 1.5, border: `1px solid ${C.border}`, maxWidth: { xs: "100%", sm: 380 }, maxHeight: 280, objectFit: "cover", display: "block", cursor: "zoom-in" }} />
          <Typography sx={{ fontSize: 11, color: C.textMuted, mt: 0.3 }}>{a.name} · {formatFileSize(a.size)}</Typography>
        </Box>
      ))}
      {files.map((a) => (
        <Paper key={a.id} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.2, py: 0.9, borderRadius: 1.5, bgcolor: C.inputBg, border: `1px solid ${C.border}`, boxShadow: "none", width: { xs: "100%", sm: 320 }, maxWidth: "100%" }}>
          <Box sx={{ width: 34, height: 34, borderRadius: 1, bgcolor: "rgba(90,169,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileIcon sx={{ fontSize: 17, color: "#5aa9ff" }} /></Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</Typography>
            <Typography sx={{ fontSize: 11, color: C.textMuted }}>{formatFileSize(a.size)}</Typography>
          </Box>
          <Box component="a" href={a.url} download={a.name} sx={{ fontSize: 11.5, fontWeight: 600, color: C.link, textDecoration: "none", flexShrink: 0, "&:hover": { textDecoration: "underline" } }}>Download</Box>
        </Paper>
      ))}
    </Box>
  );
}
