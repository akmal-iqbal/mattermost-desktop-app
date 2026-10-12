import { Box, Typography, IconButton, Divider, Tooltip } from "@mui/material";
import { StarBorder as StarBorderIcon, Star as StarIcon, PushPinOutlined as PinIcon, DescriptionOutlined as FileIcon, InfoOutlined as InfoIcon, ExpandMore as ExpandMoreIcon, PeopleAltOutlined as PeopleIcon, VideocamOutlined as VideoIcon, HeadsetMicOutlined as CallIcon, Search as SearchIcon } from "@mui/icons-material";
import { C } from "../../theme/mattermost";

export default function ChannelHeader({ channel, isDM, dmUser, activeMessages, onFavorite, onToggleRight, rightTab, rightOpen }) {
  const name = isDM ? dmUser?.display : channel?.name || "Select channel";
  const members = channel?.members ?? 0;
  const pinned = (activeMessages || []).filter((m) => m.pinned).length;
  return (
    <Box sx={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", px: { xs: 1, md: 1.2 }, bgcolor: C.channelHeaderBg, borderBottom: `1px solid ${C.border}`, flexShrink: 0, gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, minWidth: 0, overflow: "hidden" }}>
        <Tooltip title={channel?.favorite ? "Remove favorite" : "Favorite"}>
          <IconButton size="small" onClick={() => channel && onFavorite(channel.id)} sx={{ color: channel?.favorite ? "#facc15" : C.textMuted }} aria-label="Favorite">{channel?.favorite ? <StarIcon sx={{ fontSize: 18 }} /> : <StarBorderIcon sx={{ fontSize: 18 }} />}</IconButton>
        </Tooltip>
        <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: 13, md: 14.5 }, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</Typography>
        <ExpandMoreIcon sx={{ fontSize: 18, color: C.textMuted, flexShrink: 0 }} />
        {!isDM && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.8, borderColor: C.border, height: 18, alignSelf: "center", display: { xs: "none", sm: "block" } }} />
            <Tooltip title="View members">
              <Box
                onClick={() => onToggleRight("members")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") onToggleRight("members"); }}
                sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.4, px: 0.6, py: 0.3, borderRadius: 1, cursor: "pointer", color: rightTab === "members" && rightOpen ? "#fff" : C.textMuted, bgcolor: rightTab === "members" && rightOpen ? "rgba(255,255,255,0.10)" : "transparent", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" } }}
              >
                <PeopleIcon sx={{ fontSize: 15 }} /><Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>{members}</Typography>
              </Box>
            </Tooltip>
            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.4, color: C.textMuted, ml: 0.8 }}><PinIcon sx={{ fontSize: 15 }} /><Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>{pinned}</Typography></Box>
            <FileIcon sx={{ fontSize: 15, color: C.textMuted, ml: 0.8, display: { xs: "none", sm: "block" } }} />
          </>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, flexShrink: 0 }}>
        {!isDM && (
          <>
            <Tooltip title="Call"><IconButton size="small" sx={{ color: C.textMuted, display: { xs: "none", md: "inline-flex" } }}><CallIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
            <Tooltip title="Video"><IconButton size="small" sx={{ color: C.textMuted, display: { xs: "none", md: "inline-flex" } }}><VideoIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: C.border, height: 18, alignSelf: "center", display: { xs: "none", md: "block" } }} />
          </>
        )}
        <Tooltip title="Search in channel"><IconButton size="small" onClick={() => onToggleRight("search")} sx={{ color: rightTab === "search" && rightOpen ? "#fff" : C.textMuted, bgcolor: rightTab === "search" && rightOpen ? "rgba(255,255,255,0.10)" : "transparent" }}><SearchIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        <Tooltip title="Members"><IconButton size="small" onClick={() => onToggleRight("members")} sx={{ color: rightTab === "members" && rightOpen ? "#fff" : C.textMuted, bgcolor: rightTab === "members" && rightOpen ? "rgba(255,255,255,0.10)" : "transparent", display: { xs: "none", sm: "inline-flex" } }}><PeopleIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        <Tooltip title="Pinned"><IconButton size="small" onClick={() => onToggleRight("pinned")} sx={{ color: rightTab === "pinned" && rightOpen ? "#fff" : C.textMuted }}><PinIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        <Tooltip title="Files"><IconButton size="small" onClick={() => onToggleRight("files")} sx={{ color: rightTab === "files" && rightOpen ? "#fff" : C.textMuted }}><FileIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        <IconButton size="small" onClick={() => onToggleRight("thread")} sx={{ color: C.textMuted }} aria-label="Channel info"><InfoIcon sx={{ fontSize: 19 }} /></IconButton>
      </Box>
    </Box>
  );
} 
