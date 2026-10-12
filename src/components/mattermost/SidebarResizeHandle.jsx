import { Box, Tooltip } from "@mui/material";

/**
 * Drag-to-resize divider between sidebar and main (like screenshot blue line).
 * Cursor: col-resize / ew-resize. Drag horizontally to expand/collapse width.
 * Backend: none (pure layout).
 */
export default function SidebarResizeHandle({ onMouseDown, onDoubleClick, isResizing }) {
  return (
    <Tooltip title="Drag to resize • Double-click to collapse/expand" placement="right" arrow>
      <Box
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        sx={{
          width: 7,
          ml: "-3px",
          mr: "-4px",
          zIndex: 10,
          flexShrink: 0,
          alignSelf: "stretch",
          cursor: "ew-resize",
          display: "flex",
          justifyContent: "center",
          "&:hover .resize-bar": {
            bgcolor: "#3d7de8",
            width: 3,
          },
        }}
      >
        <Box
          className="resize-bar"
          sx={{
            width: isResizing ? 3 : 1,
            bgcolor: isResizing ? "#3d7de8" : "rgba(255,255,255,0.10)",
            transition: "width 0.15s, background 0.15s",
            borderRadius: 2,
            my: 0,
          }}
        />
      </Box>
    </Tooltip>
  );
}
