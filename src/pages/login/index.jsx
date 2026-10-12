import { Box, TextField, Button, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    console.log("Login clicked -> navigating to /home");
    navigate("/home");
  };
  return (
    <Box sx={{minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 3}}>
        <Box sx={{width: { xs: "100%", sm: 400 }, maxWidth: 400, display: "flex", flexDirection: "column", gap: 2}}>
            <Typography variant="h4">Login</Typography>
            <TextField label="Username" variant="outlined" fullWidth />
            <TextField label="Password" variant="outlined" type="password" fullWidth />
            <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>Login</Button>
            <Typography sx={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>Click Login to open Mattermost (or open #/home directly)</Typography>
            <Button component={Link} to="/Register" variant="outlined" color="secondary" fullWidth>Register</Button>
            <Button variant="text" size="small" onClick={handleLogin} sx={{ textTransform: "none" }}>Skip to Home →</Button>
        </Box>
    </Box>
  );
};
export default Login;