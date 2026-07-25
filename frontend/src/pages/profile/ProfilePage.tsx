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
import { useState, useRef, useEffect } from "react";
import {
  User,
  Mail,
  Building2,
  Calendar,
  MapPin,
  Shield,
  Edit3,
  Camera,
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
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EFF6FF]">
          <Icon className="h-4 w-4 text-[#2563EB]" />
        </div>
        <h2 className="font-heading font-semibold text-base text-[#111827]">{title}</h2>
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
      <label htmlFor={id} className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors";

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
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.profile_picture ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setPhotoPreview(user.profile_picture ?? null);
    }
  }, [user]);

  const displayName = user?.name || `${user?.first_name} ${user?.last_name}`.trim() || "User";
  const initial = user?.first_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U";
  const roleLabel = user?.role === "ADMIN" ? "Admin" : user?.role === "MANAGER" ? "Manager" : "Employee";

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearProfileMessages();
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      department,
      ...(photoFile ? { profile_picture: photoFile } : {}),
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
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        icon={UserCircle}
        title="My Profile"
        subtitle="Manage your personal information, preferences, and account security."
      />

      {/* ── Profile Card ──────────────────────────────────── */}
      <div className="rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#6366F1]" />

        <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="h-24 w-24 rounded-2xl border-4 border-white bg-[#E2E8F0] flex items-center justify-center overflow-hidden shadow-md">
              {photoPreview ? (
                <img src={photoPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-[#1E293B]">{initial}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-md hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              title="Upload photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Identity */}
          <div className="flex-1 sm:ml-4 mt-2 sm:mt-0">
            <h1 className="font-heading text-xl font-bold text-[#111827] leading-tight">
              {displayName}
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-[#E5E7EB]">
          {[
            { icon: Mail, label: "Email", value: user?.email },
            { icon: Briefcase, label: "Employee ID", value: user?.employee_id || "—" },
            { icon: Building2, label: "Department", value: user?.department || "—" },
            { icon: User, label: "Manager", value: user?.manager_name || "—" },
            { icon: MapPin, label: "Location", value: location || "—" },
            { icon: Calendar, label: "Joined", value: user?.date_of_joining ? formatDate(user.date_of_joining) : "—" },
          ].map(({ icon: Icon, label, value }, idx) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-6 py-4 ${idx % 3 !== 2 ? "lg:border-r border-[#E5E7EB]" : ""} ${idx < 3 ? "sm:border-b border-[#E5E7EB]" : ""}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9]">
                <Icon className="h-4 w-4 text-[#64748B]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">{label}</p>
                <p className="text-sm font-medium text-[#111827] truncate">{value}</p>
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

          {/* Photo actions */}
          {photoPreview && (
            <div className="flex items-center gap-3">
              <img src={photoPreview} alt="Preview" className="h-12 w-12 rounded-xl object-cover border border-[#E5E7EB]" />
              <div className="text-xs text-[#64748B]">
                {photoFile ? `New photo selected: ${photoFile.name}` : "Current profile photo"}
              </div>
              {photoFile && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs text-[#EF4444] hover:underline ml-auto"
                >
                  Remove
                </button>
              )}
            </div>
          )}

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
          <p className="text-sm text-[#64748B]">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors cursor-pointer"
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
            <Shield className="h-4 w-4 text-[#64748B] shrink-0" />
            <p className="text-xs text-[#64748B]">
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
