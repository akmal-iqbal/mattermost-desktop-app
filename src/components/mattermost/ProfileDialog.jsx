import { useState, useRef } from "react";
import { Box, Typography, IconButton, Divider, Dialog, TextField, Button, Avatar } from "@mui/material";
import { Close as CloseIcon, SettingsOutlined as SettingsIcon, LockOutlined as LockIcon, EditOutlined as EditIcon } from "@mui/icons-material";

/**
 * Profile settings modal (matches reference)
 * Rows: Nickname / Position / Email + Profile Picture block (preview, X remove,
 * BMP/JPG/JPEG/PNG ≤ 50MB hint, Select/Save/Cancel).
 * Backend: PATCH /users/me {nickname, position, email} + POST /users/me/photo
 */
export default function ProfileDialog({ open, onClose, profileTab, setProfileTab, profileData, setProfileData }) {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [photoPreview, setPhotoPreview] = useState(profileData.photoUrl || null);
  const photoInputRef = useRef(null);

  const closeAll = () => {
    onClose();
    setEditingField(null);
    setPhotoPreview(profileData.photoUrl || null);
  };

  const rows = [
    { key: "nickname", label: "Nickname", value: profileData.nickname || "Click 'Edit' to add a nickname", isPlaceholder: !profileData.nickname },
    { key: "position", label: "Position", value: profileData.position },
    { key: "email", label: "Email", value: profileData.email },
  ];

  const handleSave = (key) => {
    if (key === "nickname") setProfileData((p) => ({ ...p, nickname: editValue }));
    else if (key === "position") setProfileData((p) => ({ ...p, position: editValue || p.position }));
    else if (key === "email") {
      if (editValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editValue)) { alert("Invalid email"); return; }
      setProfileData((p) => ({ ...p, email: editValue || p.email }));
    }
    setEditingField(null);
  };

  const persistPhoto = (url) => {
    try {
      if (url) localStorage.setItem("me-photo", url);
      else localStorage.removeItem("me-photo");
    } catch {
      /* storage unavailable: photo lives in memory only */
    }
  };

  // Convert uploads to a small data URL (blob: URLs die on reload/restart,
  // so they can never be "saved"). Downscaled to 512px for avatars.
  const fileToPhotoUrl = (file, done) => {
    const reader = new FileReader();
    reader.onerror = () => { alert("Could not read that image."); };
    reader.onload = () => {
      const src = reader.result;
      const img = new Image();
      img.onerror = () => done(src);
      img.onload = () => {
        try {
          const max = 512;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          if (scale >= 1) return done(src);
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          done(c.toDataURL("image/jpeg", 0.92));
        } catch {
          done(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const selectPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/\.(bmp|jpe?g|png)$/i.test(file.name)) { alert("Upload a picture in BMP, JPG, JPEG, or PNG format."); return; }
    if (file.size > 50 * 1024 * 1024) { alert("Maximum file size: 50MB"); return; }
    fileToPhotoUrl(file, (url) => setPhotoPreview(url));
  };

  const clearPhoto = () => setPhotoPreview(null);

  const savePicture = () => {
    setProfileData((p) => ({ ...p, photoUrl: photoPreview, pictureDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) }));
    persistPhoto(photoPreview);
  };

  const cancelPicture = () => setPhotoPreview(profileData.photoUrl || null);

  const pictureChanged = photoPreview !== (profileData.photoUrl || null);

  return (
    <Dialog
      open={open}
      onClose={closeAll}
      maxWidth={false}
      slotProps={{ paper: { sx: { width: { xs: "96vw", md: 780 }, height: { xs: "90vh", md: 580 }, maxHeight: "90vh", bgcolor: "#1e293b", borderRadius: 2, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column" } } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.6, borderBottom: "1px solid rgba(255,255,255,0.08)", bgcolor: "#162032", flexShrink: 0 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Profile</Typography>
        <IconButton size="small" onClick={closeAll} sx={{ color: "#9aa4b2" }} aria-label="Close"><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </Box>
      <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", sm: "row" }, overflow: "hidden" }}>
        <Box sx={{ width: { xs: "100%", sm: 190 }, bgcolor: "#162032", borderRight: { sm: "1px solid rgba(255,255,255,0.06)" }, borderBottom: { xs: "1px solid rgba(255,255,255,0.06)", sm: "none" }, p: 1, display: "flex", flexDirection: { xs: "row", sm: "column" }, gap: 0.5 }}>
          <Box onClick={() => setProfileTab("profile")} role="button" tabIndex={0} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.2, py: 0.7, borderRadius: 1, cursor: "pointer", bgcolor: profileTab === "profile" ? "rgba(61,125,232,0.16)" : "transparent", color: profileTab === "profile" ? "#5aa9ff" : "#9aa4b2", fontSize: 13, fontWeight: profileTab === "profile" ? 600 : 400 }}><SettingsIcon sx={{ fontSize: 16 }} /> Profile Settings</Box>
          <Box onClick={() => setProfileTab("security")} role="button" tabIndex={0} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.2, py: 0.7, borderRadius: 1, cursor: "pointer", bgcolor: profileTab === "security" ? "rgba(61,125,232,0.16)" : "transparent", color: profileTab === "security" ? "#5aa9ff" : "#9aa4b2", fontSize: 13 }}><LockIcon sx={{ fontSize: 16 }} /> Security</Box>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 1.5, md: 2.5 }, py: 1.5, bgcolor: "#1e293b", "&::-webkit-scrollbar": { width: 6 }, "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.12)", borderRadius: 3 } }}>
          {profileTab === "profile" ? (
            <>
              <Typography sx={{ fontSize: 13, color: "#9aa4b2", mb: 1 }}>{profileData.username}</Typography>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1 }} />
              {rows.map((row) => {
                const isActive = editingField === row.key;
                return (
                  <Box key={row.key} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.6, px: isActive ? 1.5 : 0, border: isActive ? "1px solid rgba(255,255,255,0.10)" : "1px solid transparent", borderBottom: isActive ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(255,255,255,0.06)", borderRadius: isActive ? 1.5 : 0, bgcolor: isActive ? "rgba(255,255,255,0.03)" : "transparent", flexWrap: { xs: "wrap", md: "nowrap" }, gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0, pr: 2 }}>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0" }}>{row.label}</Typography>
                      {isActive ? (
                        <Box sx={{ display: "flex", gap: 1, mt: 0.6, flexWrap: "wrap" }}>
                          <TextField size="small" value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder={row.label} sx={{ flex: 1, minWidth: 140, "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#fff", fontSize: 12.5 }, "& .MuiInputBase-input": { py: 0.7 } }} autoFocus />
                          <Button size="small" variant="contained" onClick={() => handleSave(row.key)} sx={{ textTransform: "none", fontSize: 12, minWidth: 56 }}>Save</Button>
                          <Button size="small" onClick={() => setEditingField(null)} sx={{ textTransform: "none", fontSize: 12, color: "#9aa4b2" }}>Cancel</Button>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: 12.5, color: row.isPlaceholder ? "#64748b" : "#9aa4b2", mt: 0.2, fontStyle: row.isPlaceholder ? "italic" : "normal", wordBreak: "break-all" }}>{row.value}</Typography>
                      )}
                    </Box>
                    {!isActive && (
                      <Box onClick={() => { setEditingField(row.key); setEditValue(profileData[row.key] || ""); }} role="button" tabIndex={0} sx={{ display: "flex", alignItems: "center", gap: 0.4, color: "#5aa9ff", fontSize: 12, cursor: "pointer", flexShrink: 0, "&:hover": { textDecoration: "underline" } }}><EditIcon sx={{ fontSize: 12 }} /> Edit</Box>
                    )}
                  </Box>
                );
              })}
              {/* Profile picture block — always expanded like reference */}
              <Box sx={{ mt: 0.5, py: 1.8, px: 1.5, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 1.5, bgcolor: "rgba(255,255,255,0.02)" }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0" }}>Profile Picture</Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
                  <Box sx={{ position: "relative", width: 110, height: 110 }}>
                    {photoPreview ? (
                      <Box component="img" src={photoPreview} alt="Profile" sx={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <Avatar sx={{ width: 110, height: 110, bgcolor: "#7c3aed", fontSize: 38, fontWeight: 700 }}>{(profileData.fullName || "A")[0]}</Avatar>
                    )}
                    {photoPreview && (
                      <IconButton size="small" onClick={clearPhoto} aria-label="Remove photo" sx={{ position: "absolute", top: 0, right: 0, width: 24, height: 24, bgcolor: "#0f172a", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", "&:hover": { bgcolor: "#1e293b" } }}>
                        <CloseIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 12.5, color: "#cbd5e1", textAlign: "center", mt: 1.5, lineHeight: 1.6 }}>
                  Upload a picture in BMP, JPG, JPEG, or PNG format.<br />Maximum file size: 50MB
                </Typography>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />
                <input ref={photoInputRef} type="file" hidden accept=".bmp,.jpg,.jpeg,.png,image/bmp,image/jpeg,image/png" onChange={selectPhoto} />
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Button size="small" variant="contained" onClick={() => photoInputRef.current?.click()} sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 600, px: 2.5 }}>Select</Button>
                  <Button size="small" variant="contained" disabled={!pictureChanged} onClick={savePicture} sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 600, px: 2, bgcolor: "#2e3548", "&:hover": { bgcolor: "#3a4358" }, "&.Mui-disabled": { bgcolor: "#232a3d", color: "#5b6472" } }}>Save</Button>
                  <Button size="small" onClick={cancelPicture} sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 600, color: "#5aa9ff", bgcolor: "rgba(90,169,255,0.08)", px: 2, "&:hover": { bgcolor: "rgba(90,169,255,0.14)" } }}>Cancel</Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <LockIcon sx={{ fontSize: 36, color: "#475569" }} />
              <Typography sx={{ mt: 1, fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Security</Typography>
              <Typography sx={{ fontSize: 12, color: "#9aa4b2", mt: 0.5 }}>Password, sessions and 2FA settings would appear here.</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1.5, textTransform: "none", color: "#5aa9ff", borderColor: "rgba(90,169,255,0.35)" }}>Change Password</Button>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
