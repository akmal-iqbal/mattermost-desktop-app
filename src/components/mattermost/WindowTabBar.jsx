import { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography, Menu, MenuItem, Divider } from "@mui/material";
import {
  Menu as AppMenuIcon,
  Dns as ServerIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  CloudDownload as DownloadIcon,
  Remove as MinimizeIcon,
  CropSquare as MaximizeIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";
import AppMenu from "./AppMenu";

/**
 * Restore-down glyph (two overlapping squares) drawn with CSS
 * so it never depends on an icon-font export.
 */
function RestoreIcon() {
  return (
    <Box sx={{ position: "relative", width: 12, height: 12, flexShrink: 0 }}>
      <Box sx={{ position: "absolute", right: 0, top: 0, width: 8.5, height: 8.5, border: "1.4px solid currentColor", borderRadius: "1px" }} />
      <Box className="restore-front" sx={{ position: "absolute", left: 0, bottom: 0, width: 8.5, height: 8.5, border: "1.4px solid currentColor", borderRadius: "1px", bgcolor: "#eef0f3" }} />
    </Box>
  );
}

/**
 * Top tab strip — pixel-matched to the desktop screenshot:
 * [≡] | [🗄 IPS-USA • ▾] [IPS Design SD & DM] [+] ........ [⤓] [—] [□] [✕]
 * Server tab opens the "Servers / Ctrl+Shift+S / ✓ IPS-USA / + Add a server" panel.
 * Window buttons use Electron ipc (frameless window) with web no-op fallback.
 * Backend: none (pure chrome).
 */
export default function WindowTabBar({ activeTitle = "IPS Design SD & DM", serverName = "IPS-USA" }) {
  const [serverAnchor, setServerAnchor] = useState(null);
  const serverOpen = Boolean(serverAnchor);
  const [isMaximized, setIsMaximized] = useState(false);
  const [appMenuAnchor, setAppMenuAnchor] = useState(null);

  // Sync maximize/restore icon with the real window state
  useEffect(() => {
    let unsub;
    try {
      const p = window.electronAPI?.windowIsMaximized?.();
      if (p && typeof p.then === "function") p.then(setIsMaximized).catch(() => {});
      unsub = window.electronAPI?.onMaximizedChange?.((v) => setIsMaximized(v));
    } catch {
      /* web preview: no-op */
    }
    return () => {
      try {
        unsub?.();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const win = (fn) => () => {
    try {
      window.electronAPI?.[fn]?.();
    } catch {
      /* web preview: no-op */
    }
  };

  const noDrag = { WebkitAppRegion: "no-drag" };

  return (
    <Box
      sx={{
        height: 36,
        bgcolor: "#eef0f3",
        display: { xs: "none", sm: "flex" },
        alignItems: "stretch",
        pl: 0.5,
        pr: 0,
        gap: 0,
        borderBottom: "1px solid #c9ced8",
        flexShrink: 0,
        userSelect: "none",
        WebkitAppRegion: "drag",
      }}
    >
      {/* app menu (3-dot) — File / Edit / View / History / Window / Help */}
      <Box sx={{ display: "flex", alignItems: "center", ...noDrag }}>
        <IconButton size="small" onClick={(e) => setAppMenuAnchor(e.currentTarget)} sx={{ width: 30, height: 30, color: "#5b6472", borderRadius: 1 }} aria-label="App menu" aria-haspopup="menu">
          <AppMenuIcon sx={{ fontSize: 17 }} />
        </IconButton>
        <Box sx={{ width: 1, height: 20, bgcolor: "#d3d8e0", mx: 0.4 }} />
      </Box>
      <AppMenu anchorEl={appMenuAnchor} onClose={() => setAppMenuAnchor(null)} />

      {/* server tab */}
      <Box sx={{ display: "flex", alignItems: "center", ...noDrag }}>
        <Box
          onClick={(e) => setServerAnchor(e.currentTarget)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setServerAnchor(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.7,
            px: 1,
            height: 27,
            minWidth: 118,
            maxWidth: 150,
            bgcolor: serverOpen ? "#fff" : "#e2e5ea",
            border: "1px solid #c9ced8",
            borderRadius: "7px",
            fontSize: 12,
            color: "#3c4451",
            cursor: "pointer",
            "&:hover": { bgcolor: "#fff" },
          }}
        >
          <ServerIcon sx={{ fontSize: 15, color: "#6b7280", flexShrink: 0 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
            {serverName}
          </Typography>
          <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#2f80ed", flexShrink: 0 }} />
          <ArrowDownIcon sx={{ fontSize: 14, color: "#6b7280", flexShrink: 0 }} />
        </Box>

        {/* Servers dropdown — same as screenshot */}
        <Menu
          anchorEl={serverAnchor}
          open={serverOpen}
          onClose={() => setServerAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{
            paper: {
              sx: {
                mt: 0.6,
                ml: -1,
                width: 300,
                bgcolor: "#fff",
                border: "1px solid #e2e5ea",
                borderRadius: 2,
                boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                p: 0,
                overflow: "hidden",
              },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.8, pt: 1.2, pb: 0.8 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>Servers</Typography>
            <Typography sx={{ fontSize: 11.5, color: "#9aa4b2" }}>Ctrl + Shift + S</Typography>
          </Box>
          <MenuItem
            selected
            onClick={() => setServerAnchor(null)}
            sx={{ px: 1.8, py: 1, gap: 1.2, "&.Mui-selected": { bgcolor: "#f1f5f9" }, "&.Mui-selected:hover": { bgcolor: "#e8eef5" } }}
          >
            <CheckIcon sx={{ fontSize: 16, color: "#2f80ed" }} />
            <Typography sx={{ flex: 1, fontSize: 13, color: "#1f2937" }}>{serverName}</Typography>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2f80ed" }} />
          </MenuItem>
          <Divider sx={{ borderColor: "#eef1f4" }} />
          <MenuItem onClick={() => setServerAnchor(null)} sx={{ px: 1.8, py: 1.1, gap: 1.2 }}>
            <AddIcon sx={{ fontSize: 16, color: "#6b7280" }} />
            <Typography sx={{ fontSize: 13, color: "#374151" }}>Add a server</Typography>
          </MenuItem>
        </Menu>
      </Box>

      {/* active channel tab */}
      <Box sx={{ display: "flex", alignItems: "flex-end", ml: 0.6, ...noDrag }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
            px: 1.2,
            height: 28,
            maxWidth: 220,
            bgcolor: "#fff",
            border: "1px solid #c9ced8",
            borderBottom: "1px solid #fff",
            borderRadius: "7px 7px 0 0",
            fontSize: 12.5,
            color: "#1f2937",
          }}
        >
          <Typography sx={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {activeTitle}
          </Typography>
          <Box
            className="tab-close"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              borderRadius: 1,
              cursor: "pointer",
              color: "#6b7280",
              opacity: 0,
              ".MuiBox-root:hover > &": { opacity: 1 },
              "&:hover": { bgcolor: "rgba(0,0,0,0.07)", color: "#111", opacity: "1 !important" },
            }}
          >
            <CloseIcon sx={{ fontSize: 13 }} />
          </Box>
        </Box>
        <Tooltip title="New tab">
          <IconButton size="small" sx={{ width: 26, height: 26, mb: 0.2, ml: 0.3, color: "#5b6472", borderRadius: 1 }} aria-label="New tab">
            <AddIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* draggable empty area — double-click toggles maximize like a native title bar */}
      <Box sx={{ flex: 1 }} onDoubleClick={win("windowMaximize")} />

      {/* right window controls — same as screenshot, fully functional */}
      <Box sx={{ display: "flex", alignItems: "center", pr: 0.6, gap: 0.2, ...noDrag }}>
        <Tooltip title="Downloads">
          <IconButton size="small" onClick={win("noop")} sx={{ width: 28, height: 28, color: "#5b6472", borderRadius: "50%", border: "1.5px solid #b9c0cc", "&:hover": { bgcolor: "rgba(0,0,0,0.05)" } }} aria-label="Downloads">
            <DownloadIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Box sx={{ width: 8 }} />
        <Tooltip title="Minimize">
          <IconButton size="small" onClick={win("windowMinimize")} sx={{ width: 40, height: 30, borderRadius: 1, color: "#3c4451", "&:hover": { bgcolor: "rgba(0,0,0,0.07)" } }} aria-label="Minimize">
            <MinimizeIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={isMaximized ? "Restore" : "Maximize"}>
          <IconButton
            size="small"
            onClick={win("windowMaximize")}
            sx={{ width: 40, height: 30, borderRadius: 1, color: "#3c4451", "&:hover": { bgcolor: "rgba(0,0,0,0.07)" }, "&:hover .restore-front": { bgcolor: "#e2e4e8" } }}
            aria-label={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <RestoreIcon /> : <MaximizeIcon sx={{ fontSize: 13 }} />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Close">
          <IconButton size="small" onClick={win("windowClose")} sx={{ width: 40, height: 30, borderRadius: 1, color: "#3c4451", "&:hover": { bgcolor: "#e81123", color: "#fff" } }} aria-label="Close">
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
