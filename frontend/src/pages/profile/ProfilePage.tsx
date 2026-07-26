/**
 * ProfilePage — Role-aware Profile page for Employee & Manager.
 *
 * Route: /profile
 *
 * Sections:
 *  1. Profile Card  — avatar, identity details, quick info
 *  2. Edit Profile  — first/last name, designation, department, location, phone, bio, photo
 *  3. Security      — change password (old / new / confirm)
 */
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Building2,
  Calendar,
  MapPin,
  Shield,
  Edit3,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  UserCircle,
  Lock,
} from "lucide-react";
import { useAuth } from "@/features/auth/store/AuthContext";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useChangePassword } from "@/features/profile/hooks/useChangePassword";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";

// ─────────────────────────────────────────
// Sub-component: Section Card
// ─────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EFF6FF]">
          <Icon className="h-4 w-4 text-[#2563EB]" />
        </div>
        <h2 className="font-heading font-semibold text-base text-foreground">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────
// Sub-component: Form Field
// ─────────────────────────────────────────
function FormField({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors";

// ─────────────────────────────────────────
// Sub-component: Inline Alert
// ─────────────────────────────────────────
function Alert({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
        type === "success"
          ? "bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]"
          : "bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      {message}
    </div>
  );
}

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
export function ProfilePage() {
  const { user } = useAuth();
  const { isLoading: isSaving, error: saveError, successMessage: saveSuccess, updateProfile, clearMessages: clearProfileMessages } = useProfile();
  const { isLoading: isChangingPwd, error: pwdError, successMessage: pwdSuccess, changePassword, clearMessages: clearPwdMessages } = useChangePassword();

  // ── Profile form state ──
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [designation, setDesignation] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  // Removed profile picture state

  // ── Password form state ──
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync form when user reloads (AuthContext refresh)
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
      setDepartment(user.department ?? "");
      setPhone(user.phone_number ?? "");
    }
  }, [user]);

  const displayName = user?.name || `${user?.first_name} ${user?.last_name}`.trim() || "User";
  const initial = user?.first_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U";
  const roleLabel = user?.role === "ADMIN" ? "Admin" : user?.role === "MANAGER" ? "Manager" : "Employee";

  // Removed photo handlers

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearProfileMessages();
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      department,
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearPwdMessages();
    const ok = await changePassword({
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: confirmPassword,
    });
    if (ok) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        icon={UserCircle}
        title="My Profile"
        subtitle="Manage your personal information, preferences, and account security."
      />

      {/* ── Profile Card ──────────────────────────────────── */}
      <div className="rounded-[18px] border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#6366F1]" />

        <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="h-24 w-24 rounded-2xl border-4 border-white bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center overflow-hidden shadow-md">
              <span className="text-3xl font-bold text-white">{initial}</span>
            </div>
          </div>

          {/* Identity */}
          <div className="flex-1 sm:ml-4 mt-2 sm:mt-0">
            <h1 className="font-heading text-xl font-bold text-foreground leading-tight">
              {displayName}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {designation || roleLabel}
              {user?.department ? ` · ${user.department}` : ""}
            </p>
          </div>

          {/* Role Badge */}
          <span
            className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
              user?.role === "MANAGER"
                ? "bg-[#EDE9FE] text-[#7C3AED]"
                : user?.role === "ADMIN"
                ? "bg-[#FEF3C7] text-[#D97706]"
                : "bg-[#EFF6FF] text-[#2563EB]"
            }`}
          >
            {roleLabel}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-border">
          {[
            { icon: Mail, label: "Email", value: user?.email, color: "text-blue-600", bg: "bg-blue-100" },
            { icon: Briefcase, label: "Employee ID", value: user?.employee_id || "—", color: "text-indigo-600", bg: "bg-indigo-100" },
            { icon: Building2, label: "Department", value: user?.department || "—", color: "text-purple-600", bg: "bg-purple-100" },
            { icon: User, label: "Manager", value: user?.manager_name || "—", color: "text-pink-600", bg: "bg-pink-100" },
            { icon: MapPin, label: "Location", value: location || "—", color: "text-orange-600", bg: "bg-orange-100" },
            { icon: Calendar, label: "Joined", value: user?.date_of_joining ? formatDate(user.date_of_joining) : "—", color: "text-emerald-600", bg: "bg-emerald-100" },
          ].map(({ icon: Icon, label, value, color, bg }, idx) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-5 py-4 ${idx % 3 !== 2 ? "lg:border-r border-border" : ""} ${idx < 3 ? "sm:border-b border-border" : ""}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                <p className="text-[13px] font-medium text-foreground truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Edit Profile Form ─────────────────────────────── */}
      <SectionCard icon={Edit3} title="Edit Profile">
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First Name" id="firstName">
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                placeholder="John"
              />
            </FormField>
            <FormField label="Last Name" id="lastName">
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                placeholder="Doe"
              />
            </FormField>
            <FormField label="Designation" id="designation">
              <input
                id="designation"
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className={inputClass}
                placeholder="Software Engineer"
              />
            </FormField>
            <FormField label="Department" id="department">
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputClass}
                placeholder="Engineering"
              />
            </FormField>
            <FormField label="Phone Number" id="phone">
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+91 98765 43210"
              />
            </FormField>
            <FormField label="Office Location" id="location">
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
                placeholder="Bangalore, India"
              />
            </FormField>
            <FormField label="Emergency Contact" id="emergencyContact">
              <input
                id="emergencyContact"
                type="tel"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className={inputClass}
                placeholder="+91 98765 00000"
              />
            </FormField>
          </div>
          <FormField label="Bio" id="bio">
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="A brief description about yourself..."
            />
          </FormField>

          {/* Photo actions removed */}

          {saveError && <Alert type="error" message={saveError} />}
          {saveSuccess && <Alert type="success" message={saveSuccess} />}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#1D4ED8] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isSaving ? <LoadingSpinner size="sm" /> : null}
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* ── Security Section ──────────────────────────────── */}
      <SectionCard icon={Lock} title="Security">
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <p className="text-sm text-muted-foreground">
            Change your password. You will need your current password to confirm the change.
          </p>

          {[
            { label: "Current Password", id: "oldPwd", value: oldPassword, setter: setOldPassword, show: showOld, toggleShow: () => setShowOld((v) => !v) },
            { label: "New Password", id: "newPwd", value: newPassword, setter: setNewPassword, show: showNew, toggleShow: () => setShowNew((v) => !v) },
            { label: "Confirm New Password", id: "confirmPwd", value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggleShow: () => setShowConfirm((v) => !v) },
          ].map(({ label, id, value, setter, show, toggleShow }) => (
            <FormField key={id} label={label} id={id}>
              <div className="relative">
                <input
                  id={id}
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  required
                  className={`${inputClass} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={toggleShow}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>
          ))}

          {pwdError && <Alert type="error" message={pwdError} />}
          {pwdSuccess && <Alert type="success" message={pwdSuccess} />}

          <div className="flex items-center gap-3 pt-2">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Use at least 8 characters with a mix of letters, numbers, and symbols.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPwd}
              className="flex items-center gap-2 rounded-xl bg-[#111827] px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#1F2937] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isChangingPwd ? <LoadingSpinner size="sm" /> : null}
              {isChangingPwd ? "Updating…" : "Change Password"}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
