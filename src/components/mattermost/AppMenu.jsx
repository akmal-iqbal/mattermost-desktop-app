import { useState } from "react";
import { Box, Menu, MenuItem, Divider, Typography, Paper } from "@mui/material";
import { ChevronRight as SubArrow } from "@mui/icons-material";

/**
 * App menu for the top-bar 3-dot button — replaces the removed native
 * Electron menu (File / Edit / View / History / Window / Help).
 * Each row opens a submenu; actions run via Electron ipc with a
 * document.execCommand fallback for Edit ops in web preview.
 * Backend: none (pure chrome, main-process actions via preload).
 */

const EDIT_FALLBACK = {
  undo: "undo",
  redo: "redo",
  cut: "cut",
  copy: "copy",
  selectAll: "selectAll",
};

const MENUS = [
  {
    id: "file",
    label: "File",
    items: [
      { id: "newWindow", label: "New Window" },
      { id: "sep1", sep: true },
      { id: "closeWindow", label: "Close Window" },
      { id: "quit", label: "Quit" },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    items: [
      { id: "undo", label: "Undo" },
      { id: "redo", label: "Redo" },
      { id: "sep1", sep: true },
      { id: "cut", label: "Cut" },
      { id: "copy", label: "Copy" },
      { id: "paste", label: "Paste" },
      { id: "sep2", sep: true },
      { id: "selectAll", label: "Select All" },
    ],
  },
  {
    id: "view",
    label: "View",
    items: [
      { id: "reload", label: "Reload" },
      { id: "forceReload", label: "Force Reload" },
      { id: "toggleDevTools", label: "Toggle Developer Tools" },
      { id: "sep1", sep: true },
      { id: "zoomIn", label: "Zoom In" },
      { id: "zoomOut", label: "Zoom Out" },
      { id: "zoomReset", label: "Reset Zoom" },
      { id: "sep2", sep: true },
      { id: "toggleFullscreen", label: "Toggle Full Screen" },
    ],
  },
  {
    id: "history",
    label: "History",
    items: [
      { id: "back", label: "Back" },
      { id: "forward", label: "Forward" },
    ],
  },
  {
    id: "window",
    label: "Window",
    items: [
      { id: "minimize", label: "Minimize" },
      { id: "maximize", label: "Zoom" },
      { id: "sep1", sep: true },
      { id: "front", label: "Bring All to Front" },
      { id: "sep2", sep: true },
      { id: "close", label: "Close Window" },
    ],
  },
  {
    id: "help",
    label: "Help",
    items: [
      { id: "docs", label: "Documentation" },
      { id: "about", label: "About Mattermost" },
    ],
  },
];

const paperSx = {
  minWidth: 190,
  bgcolor: "#fff",
  border: "1px solid #e5e8ee",
  borderRadius: "10px",
  boxShadow: "0 12px 32px rgba(15,23,42,0.18)",
  p: 0.6,
  overflow: "hidden",
};

const itemSx = {
  px: 1.2,
  py: 0.75,
  borderRadius: "6px",
  fontSize: 13,
  color: "#1f2937",
  gap: 1,
  "&:hover": { bgcolor: "#f1f5f9" },
  "&.Mui-selected": { bgcolor: "#f1f5f9" },
};

export default function AppMenu({ anchorEl, onClose }) {
  const open = Boolean(anchorEl);
  const [subId, setSubId] = useState(null);
  const [subPos, setSubPos] = useState({ left: 0, top: 0 });
  const activeMenu = MENUS.find((m) => m.id === subId) || null;

  const closeAll = () => {
    setSubId(null);
    onClose();
  };

  const openSub = (id) => (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setSubPos({ left: Math.min(r.right - 2, window.innerWidth - 230), top: Math.max(r.top - 6, 8) });
    setSubId(id);
  };

  const runAction = (menuId, actionId) => {
    try {
      const api = window.electronAPI;
      if (menuId === "window") {
        if (actionId === "minimize") api?.windowMinimize?.();
        else if (actionId === "maximize") api?.windowMaximize?.();
        else if (actionId === "close") api?.windowClose?.();
        else api?.menuAction?.(menuId, actionId);
      } else if (api?.menuAction) {
        api.menuAction(menuId, actionId);
      } else if (menuId === "edit" && EDIT_FALLBACK[actionId]) {
        document.execCommand?.(EDIT_FALLBACK[actionId]);
      }
    } catch {
      /* ignore */
    }
    closeAll();
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeAll}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { ...paperSx, mt: 0.5 } } }}
      >
        {MENUS.map((m) => (
          <MenuItem
            key={m.id}
            selected={subId === m.id}
            onMouseEnter={openSub(m.id)}
            onClick={openSub(m.id)}
            sx={itemSx}
          >
            <Typography sx={{ flex: 1, fontSize: 13 }}>{m.label}</Typography>
            <SubArrow sx={{ fontSize: 15, color: "#9aa4b2" }} />
          </MenuItem>
        ))}
      </Menu>

      {open && activeMenu && (
        <Paper sx={{ ...paperSx, position: "fixed", left: subPos.left, top: subPos.top, zIndex: 1400 }}>
          {activeMenu.items.map((it) =>
            it.sep ? (
              <Divider key={it.id} sx={{ borderColor: "#eef1f4", my: 0.4 }} />
            ) : (
              <MenuItem key={it.id} onClick={() => runAction(activeMenu.id, it.id)} sx={itemSx}>
                <Typography sx={{ flex: 1, fontSize: 13 }}>{it.label}</Typography>
              </MenuItem>
            ),
          )}
        </Paper>
      )}
    </>
  );
}
