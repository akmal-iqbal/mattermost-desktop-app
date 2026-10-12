// import { Button, Typography, Box } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme  } from "@mui/material";
import Login from './pages/login'
import Register from './pages/Register'
import Home from './pages/Home'
const FONT =
  '"Plus Jakarta Sans","Inter","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif';
const theme = createTheme({
  typography: {
    fontFamily: FONT,
    button: { fontWeight: 600, letterSpacing: "0.15px" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: FONT,
          textTransform: "none",
          fontWeight: 600,
          letterSpacing: "0.15px",
          borderRadius: 8,
        },
        contained: {
          boxShadow: "0 2px 8px rgba(61,125,232,0.35)",
          "&:hover": { boxShadow: "0 4px 14px rgba(61,125,232,0.45)" },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: FONT, fontWeight: 600 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { fontFamily: FONT, textTransform: "none" },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { fontFamily: FONT },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        {/* Open login automatically at "/" */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;