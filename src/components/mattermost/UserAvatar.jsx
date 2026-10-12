import { Avatar } from "@mui/material";

/**
 * Photo-aware avatar: shows the uploaded profile photo when present,
 * otherwise the initial with the user's color.
 * Backend: user.photoUrl comes from GET /users/me/photo (or user object)
 */
export default function UserAvatar({ user = {}, size = 30, fontSize = 12, sx = {}, children, ...rest }) {
  if (user.photoUrl) {
    return <Avatar src={user.photoUrl} alt={user.display || "user"} sx={{ width: size, height: size, ...sx }} {...rest} />;
  }
  return (
    <Avatar sx={{ width: size, height: size, bgcolor: user.color || "#7c3aed", color: "#fff", fontSize, fontWeight: 700, ...sx }} {...rest}>
      {children || (user.display || "?")[0]}
    </Avatar>
  );
}
