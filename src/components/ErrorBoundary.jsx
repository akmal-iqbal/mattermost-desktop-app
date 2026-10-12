import { Component } from "react";
import { Box, Typography, Button } from "@mui/material";

/**
 * Catches render crashes anywhere below it and shows a dark recovery panel
 * instead of a blank white window. The message helps diagnose which
 * interaction crashed (please report it with a screenshot).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[app crash]", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const msg = String(this.state.error?.message || this.state.error);
    return (
      <Box sx={{ height: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, bgcolor: "#1c1e2a", color: "#e2e8f0", p: 3, textAlign: "center", fontFamily: "inherit" }}>
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Something went wrong</Typography>
        <Typography sx={{ fontSize: 13, color: "#9aa4b2" }}>The app hit an error instead of going white. Please screenshot this and share it.</Typography>
        <Box sx={{ maxWidth: 560, px: 2, py: 1, borderRadius: 1.5, bgcolor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "#f87171", wordBreak: "break-word", fontFamily: "monospace" }}>
          {msg}
        </Box>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ textTransform: "none", fontWeight: 600 }}>
          Reload app
        </Button>
      </Box>
    );
  }
}
