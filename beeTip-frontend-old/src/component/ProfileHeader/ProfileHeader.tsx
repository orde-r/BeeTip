import ThemeToggle from "../ThemeToggle/ThemeToggle";
import "./ProfileHeader.css";

interface ProfileHeaderProps {
  email?: string;
}

export default function ProfileHeader({ email }: ProfileHeaderProps) {
  return (
    <div className="profile-header">
      <div>
        <p className="profile-title">Profile</p>
        <p className="profile-email">{email}</p>
      </div>
      <ThemeToggle />
    </div>
  );
}
