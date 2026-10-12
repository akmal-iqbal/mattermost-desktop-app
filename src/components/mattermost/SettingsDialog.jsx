import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Dialog,
  TextField,
  Button,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Close as CloseIcon,
  NotificationsNone as BellIcon,
  RemoveRedEyeOutlined as DisplayIcon,
  ViewSidebarOutlined as SidebarIcon,
  TuneOutlined as AdvancedIcon,
  EditOutlined as EditIcon,
} from "@mui/icons-material";

/**
 * Settings modal (Notifications / Display / Sidebar / Advanced)
 * Backend: GET/PATCH /users/me/settings
 */

const TIMEZONES = [
  "(UTC-08:00) Pacific Time",
  "(UTC-05:00) Eastern Time",
  "(UTC+00:00) UTC",
  "(UTC+01:00) Berlin, Rome",
  "(UTC+05:00) Islamabad, Karachi",
  "(UTC+05:30) Chennai, Kolkata",
  "(UTC+08:00) Singapore",
];

const THEMES = [
  { id: "Denim", sidebar: "#1e325c", center: "#1b2b4d", accent: "#5aa9ff" },
  { id: "Sapphire", sidebar: "#174ab5", center: "#ffffff", accent: "#174ab5" },
  { id: "Quartz", sidebar: "#2e2e30", center: "#ffffff", accent: "#c63a96" },
  { id: "Indigo", sidebar: "#3d2e8f", center: "#ffffff", accent: "#3d2e8f" },
  { id: "Onyx", sidebar: "#131313", center: "#1a1a1a", accent: "#e0b333" },
];

function EditLink({ onClick }) {
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      sx={{ display: "flex", alignItems: "center", gap: 0.4, color: "#5aa9ff", fontSize: 12, cursor: "pointer", flexShrink: 0, "&:hover": { textDecoration: "underline" } }}
    >
      <EditIcon sx={{ fontSize: 11 }} /> Edit
    </Box>
  );
}

function SaveCancel({ onSave, onCancel }) {
  return (
    <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
      <Button size="small" variant="contained" onClick={onSave} sx={{ textTransform: "none", fontSize: 12, bgcolor: "#3d7de8", "&:hover": { bgcolor: "#2f6bd6" } }}>
        Save
      </Button>
      <Button size="small" onClick={onCancel} sx={{ textTransform: "none", fontSize: 12, color: "#9aa4b2" }}>
        Cancel
      </Button>
    </Box>
  );
}

function SettingRow({ title, displayValue, editing, onEdit, children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", py: 1.6, borderBottom: "1px solid rgba(255,255,255,0.06)", gap: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0" }}>{title}</Typography>
        {editing ? (
          <Box sx={{ mt: 0.8 }}>{children}</Box>
        ) : (
          <Typography sx={{ fontSize: 12.5, color: "#9aa4b2", mt: 0.3, wordBreak: "break-word" }}>{displayValue}</Typography>
        )}
      </Box>
      {!editing && <EditLink onClick={onEdit} />}
    </Box>
  );
}

function OnOffEditor({ value, onChange }) {
  return (
    <Box>
      <RadioGroup value={value ? "on" : "off"} onChange={(e) => onChange(e.target.value === "on")}>
        {["on", "off"].map((v) => (
          <FormControlLabel
            key={v}
            value={v}
            control={<Radio size="small" sx={{ color: "#5aa9ff", "&.Mui-checked": { color: "#5aa9ff" } }} />}
            label={v === "on" ? "On" : "Off"}
            sx={{ "& .MuiFormControlLabel-label": { fontSize: 12.5, color: "#cbd5e1" } }}
          />
        ))}
      </RadioGroup>
    </Box>
  );
}

export default function SettingsDialog({ open, onClose, settingsTab, setSettingsTab, settingsData, setSettingsData }) {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editBool, setEditBool] = useState(false);

  const startEdit = (key, isBool = false) => {
    setEditingField(key);
    if (isBool) setEditBool(Boolean(settingsData[key]));
    else setEditValue(settingsData[key] ?? "");
  };

  const saveText = (key, transform) => {
    const v = transform ? transform(editValue) : editValue;
    setSettingsData((s) => ({ ...s, [key]: v }));
    setEditingField(null);
  };

  const saveBool = (key) => {
    setSettingsData((s) => ({ ...s, [key]: editBool }));
    setEditingField(null);
  };

  const boolLabel = (v) => (v ? "On" : "Off");

  const radioStyle = { "& .MuiFormControlLabel-label": { fontSize: 12.5, color: "#cbd5e1" } };
  const radioSx = { color: "#5aa9ff", "&.Mui-checked": { color: "#5aa9ff" } };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{ paper: { sx: { width: { xs: "96vw", md: 780 }, height: { xs: "90vh", md: 560 }, maxHeight: "90vh", bgcolor: "#1e293b", borderRadius: 2, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column" } } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.6, borderBottom: "1px solid rgba(255,255,255,0.08)", bgcolor: "#162032", flexShrink: 0 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Settings</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#9aa4b2" }} aria-label="Close"><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </Box>
      <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", sm: "row" }, overflow: "hidden" }}>
        <Box sx={{ width: { xs: "100%", sm: 190 }, bgcolor: "#162032", borderRight: { sm: "1px solid rgba(255,255,255,0.06)" }, borderBottom: { xs: "1px solid rgba(255,255,255,0.06)", sm: "none" }, p: 1, display: "flex", flexDirection: { xs: "row", sm: "column" }, gap: 0.3, overflowX: { xs: "auto", sm: "visible" }, flexShrink: 0 }}>
          {[
            { id: "notifications", label: "Notifications", icon: <BellIcon sx={{ fontSize: 16 }} /> },
            { id: "display", label: "Display", icon: <DisplayIcon sx={{ fontSize: 15 }} /> },
            { id: "sidebar", label: "Sidebar", icon: <SidebarIcon sx={{ fontSize: 15 }} /> },
            { id: "advanced", label: "Advanced", icon: <AdvancedIcon sx={{ fontSize: 15 }} /> },
          ].map((tab) => (
            <Box key={tab.id} onClick={() => { setSettingsTab(tab.id); setEditingField(null); }} role="button" tabIndex={0} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.2, py: 0.7, borderRadius: 1, cursor: "pointer", bgcolor: settingsTab === tab.id ? "rgba(61,125,232,0.16)" : "transparent", color: settingsTab === tab.id ? "#5aa9ff" : "#9aa4b2", fontSize: 13, fontWeight: settingsTab === tab.id ? 600 : 400, whiteSpace: "nowrap" }}>
              {tab.icon} {tab.label}
            </Box>
          ))}
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 1.5, md: 2.5 }, py: 1.5, bgcolor: "#1e293b", "&::-webkit-scrollbar": { width: 6 }, "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.12)", borderRadius: 3 } }}>

          {/* ---------------- Notifications ---------------- */}
          {settingsTab === "notifications" && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Notifications</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, color: "#5aa9ff", fontSize: 11, cursor: "pointer" }}><Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "rgba(90,169,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>💡</Box> Learn more about notifications</Box>
              </Box>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1 }} />
              {[
                { label: "Desktop and mobile notifications", value: settingsData.desktopNotif, key: "desktopNotif" },
                { label: "Desktop notification sounds", value: settingsData.sound, key: "sound" },
                { label: "Email notifications", value: settingsData.emailEnabled ? "Email notifications are enabled" : "Email notifications are not enabled", key: "emailEnabled" },
                { label: "Keywords that trigger notifications", value: settingsData.keywords, key: "keywords" },
              ].map((row) => (
                <Box key={row.label} sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", py: 1.6, borderBottom: "1px solid rgba(255,255,255,0.06)", gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0" }}>{row.label}</Typography>
                    {editingField === row.key ? (
                      <Box sx={{ mt: 0.6 }}>
                        <TextField size="small" fullWidth value={editValue} onChange={(e) => setEditValue(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#fff", fontSize: 12.5 } }} />
                        <SaveCancel
                          onSave={() => {
                            if (row.key === "emailEnabled") setSettingsData((s) => ({ ...s, emailEnabled: editValue.toLowerCase().includes("enable") }));
                            else setSettingsData((s) => ({ ...s, [row.key]: editValue }));
                            setEditingField(null);
                          }}
                          onCancel={() => setEditingField(null)}
                        />
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 12.5, color: "#9aa4b2", mt: 0.2, wordBreak: "break-word" }}>{row.value}</Typography>
                    )}
                  </Box>
                  {editingField !== row.key && (
                    <EditLink onClick={() => { setEditingField(row.key); setEditValue(row.key === "emailEnabled" ? (settingsData.emailEnabled ? "enabled" : "not enabled") : settingsData[row.key]); }} />
                  )}
                </Box>
              ))}
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", py: 1.6, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <Box sx={{ flex: 1 }}><Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0" }}>Keywords that get highlighted (without notifications)</Typography><Typography sx={{ fontSize: 12.5, color: "#56647a", mt: 0.2 }}>{settingsData.highlight}</Typography></Box>
                <Chip label="✎ Professional" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 600, bgcolor: "rgba(90,169,255,0.12)", color: "#5aa9ff", borderRadius: 8 }} />
              </Box>
            </>
          )}

          {/* ---------------- Display ---------------- */}
          {settingsTab === "display" && (
            <>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff", mb: 1 }}>Display Settings</Typography>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1 }} />

              {/* Theme */}
              <SettingRow
                title="Theme"
                displayValue="Open to manage your theme"
                editing={editingField === "theme"}
                onEdit={() => { setEditingField("theme"); setEditValue(settingsData.theme || "Denim"); }}
              >
                <Typography sx={{ fontSize: 12, color: "#9aa4b2", mb: 1 }}>Select a theme (currently: {settingsData.theme})</Typography>
                <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
                  {THEMES.map((t) => (
                    <Box
                      key={t.id}
                      onClick={() => setEditValue(t.id)}
                      sx={{ cursor: "pointer", border: editValue === t.id ? "2px solid #5aa9ff" : "2px solid transparent", borderRadius: 1.5, p: 0.4 }}
                    >
                      <Box sx={{ display: "flex", width: 96, height: 52, borderRadius: 1, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
                        <Box sx={{ width: 32, bgcolor: t.sidebar }} />
                        <Box sx={{ flex: 1, bgcolor: t.center, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Box sx={{ width: 36, height: 6, borderRadius: 3, bgcolor: t.accent }} />
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: 11, color: editValue === t.id ? "#fff" : "#9aa4b2", textAlign: "center", mt: 0.4 }}>{t.id}</Typography>
                    </Box>
                  ))}
                </Box>
                <SaveCancel onSave={() => saveText("theme")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              {/* Clock Display */}
              <SettingRow
                title="Clock Display"
                displayValue={settingsData.clockDisplay}
                editing={editingField === "clockDisplay"}
                onEdit={() => startEdit("clockDisplay")}
              >
                <RadioGroup value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                  {["12-hour clock (example: 4:00 PM)", "24-hour clock (example: 16:00)"].map((opt) => (
                    <FormControlLabel key={opt} value={opt} control={<Radio size="small" sx={radioSx} />} label={opt} sx={radioStyle} />
                  ))}
                </RadioGroup>
                <SaveCancel onSave={() => saveText("clockDisplay")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              {/* Teammate Name Display */}
              <SettingRow
                title="Teammate Name Display"
                displayValue={settingsData.teammateName}
                editing={editingField === "teammateName"}
                onEdit={() => startEdit("teammateName")}
              >
                <RadioGroup value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                  {["Show username", "Show nickname if one exists, otherwise show first and last name", "Show first and last name"].map((opt) => (
                    <FormControlLabel key={opt} value={opt} control={<Radio size="small" sx={radioSx} />} label={opt} sx={radioStyle} />
                  ))}
                </RadioGroup>
                <SaveCancel onSave={() => saveText("teammateName")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              {/* Online availability */}
              <SettingRow
                title="Show online availability on profile images"
                displayValue={boolLabel(settingsData.onlineAvailability)}
                editing={editingField === "onlineAvailability"}
                onEdit={() => startEdit("onlineAvailability", true)}
              >
                <OnOffEditor value={editBool} onChange={setEditBool} />
                <SaveCancel onSave={() => saveBool("onlineAvailability")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              {/* Share last active */}
              <SettingRow
                title="Share last active time"
                displayValue={boolLabel(settingsData.shareLastActive)}
                editing={editingField === "shareLastActive"}
                onEdit={() => startEdit("shareLastActive", true)}
              >
                <OnOffEditor value={editBool} onChange={setEditBool} />
                <SaveCancel onSave={() => saveBool("shareLastActive")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              {/* Timezone */}
              <SettingRow
                title="Timezone"
                displayValue={settingsData.timezone}
                editing={editingField === "timezone"}
                onEdit={() => startEdit("timezone")}
              >
                <Select
                  fullWidth
                  size="small"
                  value={TIMEZONES.includes(editValue) ? editValue : TIMEZONES[4]}
                  onChange={(e) => setEditValue(e.target.value)}
                  sx={{ bgcolor: "#0f172a", color: "#fff", fontSize: 12.5, "& .MuiSvgIcon-root": { color: "#9aa4b2" }, "& fieldset": { borderColor: "rgba(255,255,255,0.12)" } }}
                  MenuProps={{ PaperProps: { sx: { bgcolor: "#0f172a", color: "#fff" } } }}
                >
                  {TIMEZONES.map((tz) => (
                    <MenuItem key={tz} value={tz} sx={{ fontSize: 12.5 }}>{tz}</MenuItem>
                  ))}
                </Select>
                <SaveCancel onSave={() => saveText("timezone")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              {/* Website Link Previews */}
              <SettingRow
                title="Website Link Previews"
                displayValue={boolLabel(settingsData.linkPreviews)}
                editing={editingField === "linkPreviews"}
                onEdit={() => startEdit("linkPreviews", true)}
              >
                <OnOffEditor value={editBool} onChange={setEditBool} />
                <SaveCancel onSave={() => saveBool("linkPreviews")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              {/* Default Appearance of Image Previews */}
              <SettingRow
                title="Default Appearance of Image Previews"
                displayValue={settingsData.imagePreviews}
                editing={editingField === "imagePreviews"}
                onEdit={() => startEdit("imagePreviews")}
              >
                <RadioGroup value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                  {["Expanded", "Collapsed"].map((opt) => (
                    <FormControlLabel key={opt} value={opt} control={<Radio size="small" sx={radioSx} />} label={opt} sx={radioStyle} />
                  ))}
                </RadioGroup>
                <SaveCancel onSave={() => saveText("imagePreviews")} onCancel={() => setEditingField(null)} />
              </SettingRow>
            </>
          )}

          {/* ---------------- Sidebar ---------------- */}
          {settingsTab === "sidebar" && (
            <>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff", mb: 1 }}>Sidebar Settings</Typography>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1 }} />

              <SettingRow
                title="Group unread channels separately"
                displayValue={boolLabel(settingsData.groupUnread)}
                editing={editingField === "groupUnread"}
                onEdit={() => startEdit("groupUnread", true)}
              >
                <OnOffEditor value={editBool} onChange={setEditBool} />
                <Typography sx={{ fontSize: 11.5, color: "#64748b", mt: 0.5 }}>Group unread channels separately above recent channels.</Typography>
                <SaveCancel onSave={() => saveBool("groupUnread")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              <SettingRow
                title="Number of direct messages to show"
                displayValue={String(settingsData.dmCount)}
                editing={editingField === "dmCount"}
                onEdit={() => startEdit("dmCount")}
              >
                <TextField
                  size="small"
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  inputProps={{ min: 5, max: 200 }}
                  sx={{ width: 160, "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#fff", fontSize: 12.5 } }}
                />
                <SaveCancel onSave={() => saveText("dmCount")} onCancel={() => setEditingField(null)} />
              </SettingRow>
            </>
          )}

          {/* ---------------- Advanced ---------------- */}
          {settingsTab === "advanced" && (
            <>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff", mb: 1 }}>Advanced Settings</Typography>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1 }} />

              <SettingRow
                title="Send Messages on CTRL+ENTER"
                displayValue={settingsData.sendOnCtrlEnter}
                editing={editingField === "sendOnCtrlEnter"}
                onEdit={() => startEdit("sendOnCtrlEnter")}
              >
                <RadioGroup value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                  {["On", "Off", "On only for code blocks starting with ```"].map((opt) => (
                    <FormControlLabel key={opt} value={opt} control={<Radio size="small" sx={radioSx} />} label={opt} sx={radioStyle} />
                  ))}
                </RadioGroup>
                <SaveCancel onSave={() => saveText("sendOnCtrlEnter")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              <SettingRow
                title="Enable Post Formatting"
                displayValue={boolLabel(settingsData.postFormatting)}
                editing={editingField === "postFormatting"}
                onEdit={() => startEdit("postFormatting", true)}
              >
                <OnOffEditor value={editBool} onChange={setEditBool} />
                <SaveCancel onSave={() => saveBool("postFormatting")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              <SettingRow
                title="Enable Join/Leave Messages"
                displayValue={boolLabel(settingsData.joinLeave)}
                editing={editingField === "joinLeave"}
                onEdit={() => startEdit("joinLeave", true)}
              >
                <OnOffEditor value={editBool} onChange={setEditBool} />
                <SaveCancel onSave={() => saveBool("joinLeave")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              <SettingRow
                title="Scroll position when viewing an unread channel"
                displayValue={settingsData.scrollPosition}
                editing={editingField === "scrollPosition"}
                onEdit={() => startEdit("scrollPosition")}
              >
                <RadioGroup value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                  {["Start me where I left off", "Start me at the newest message"].map((opt) => (
                    <FormControlLabel key={opt} value={opt} control={<Radio size="small" sx={radioSx} />} label={opt} sx={radioStyle} />
                  ))}
                </RadioGroup>
                <SaveCancel onSave={() => saveText("scrollPosition")} onCancel={() => setEditingField(null)} />
              </SettingRow>

              <SettingRow
                title="Allow message drafts to sync with the server"
                displayValue={boolLabel(settingsData.syncDrafts)}
                editing={editingField === "syncDrafts"}
                onEdit={() => startEdit("syncDrafts", true)}
              >
                <OnOffEditor value={editBool} onChange={setEditBool} />
                <SaveCancel onSave={() => saveBool("syncDrafts")} onCancel={() => setEditingField(null)} />
              </SettingRow>
            </>
          )}

        </Box>
      </Box>
    </Dialog>
  );
}
