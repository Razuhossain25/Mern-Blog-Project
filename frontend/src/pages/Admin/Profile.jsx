import axios from "axios";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { FaUserEdit } from "react-icons/fa";

const Profile = () => {
    const { settings } = useSiteSettings();
    const siteTitle = settings?.websiteTitle || "MERN Blog";
    const API_BASE = useMemo(
        () => import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1.0.0",
        []
    );

    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login first");
            return;
        }

        if (!email && !newPassword) {
            toast.error("Please enter email or new password");
            return;
        }

        if (newPassword && newPassword !== confirmNewPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const tId = toast.loading("Updating profile...");
        const res = await axios.put(
            `${API_BASE}/profile`,
            {
                email: email || undefined,
                currentPassword: currentPassword || undefined,
                newPassword: newPassword || undefined,
                confirmNewPassword: confirmNewPassword || undefined,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                validateStatus: () => true,
            }
        );

        if (res.status >= 200 && res.status < 300) {
            toast.update(tId, {
                render: "Profile updated successfully",
                type: "success",
                isLoading: false,
                autoClose: 1500,
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } else {
            toast.update(tId, {
                render: res.data?.error || "Failed to update profile",
                type: "error",
                isLoading: false,
                autoClose: 2500,
            });
        }
    };

    return (
        <div className="w-full">
            <Helmet>
                <title>{`Update Profile | ${siteTitle}`}</title>
            </Helmet>
            <h2 className="text-4xl mb-6">Update Profile</h2>

            <div className="w-full max-w-5xl rounded border border-stone-200 bg-white p-5">
                <form onSubmit={handleUpdateProfile} className="*:mb-4 *:flex *:flex-col *:items-start *:*:first:text-base">
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-stone-400 rounded w-full max-w-2xl p-2"
                            placeholder="New email (optional)"
                        />
                    </div>

                    <div>
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="border border-stone-400 rounded w-full max-w-2xl p-2"
                            placeholder="Required if changing password"
                        />
                    </div>

                    <div>
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="border border-stone-400 rounded w-full max-w-2xl p-2"
                            placeholder="New password (optional)"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmNewPassword">Confirm New Password</label>
                        <input
                            id="confirmNewPassword"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="border border-stone-400 rounded w-full max-w-2xl p-2"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="bg-stone-800 text-white w-44 py-2 rounded-md cursor-pointer hover:shadow-md hover:font-semibold"
                        >
                            <span className="inline-flex items-center justify-center gap-2 w-full">
                                <FaUserEdit />
                                <span>Update Profile</span>
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
