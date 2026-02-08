import { NavLink, Outlet, useNavigate } from "react-router";
import {
    FaTachometerAlt,
    FaList,
    FaPlus,
    FaComments,
    FaEnvelopeOpenText,
    FaCog,
    FaUserCog,
    FaHome,
    FaSignOutAlt,
} from "react-icons/fa";

const AdminLayout = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    }
    return (
        <div className="w-full flex">
            <div className="min-w-max bg-stone-800 text-white border-r border-gray-300 shadow-md shadow-gray-500 basis-64 min-h-screen *:*:*:hover:text-stone-800 *:*:*:[&.active]:bg-gray-300 *:*:*:[&.active]:text-stone-800">
                <h1 className="text-2xl font-bold p-4">Admin Panel</h1>
                <ul>
                    <li>
                        <NavLink to="/admin/dashboard" className="block p-4 hover:bg-gray-200 text-xl">
                            <span className="inline-flex items-center gap-2">
                                <FaTachometerAlt />
                                <span>Dashboard</span>
                            </span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/all-post" className="block p-4 hover:bg-gray-200 text-xl">
                            <span className="inline-flex items-center gap-2">
                                <FaList />
                                <span>All Blog Post</span>
                            </span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/add-post" className="block p-4 hover:bg-gray-200 text-xl">
                            <span className="inline-flex items-center gap-2">
                                <FaPlus />
                                <span>Add New Post</span>
                            </span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/comments" className="block p-4 hover:bg-gray-200 text-xl">
                            <span className="inline-flex items-center gap-2">
                                <FaComments />
                                <span>Comments</span>
                            </span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/messages" className="block p-4 hover:bg-gray-200 text-xl">
                            <span className="inline-flex items-center gap-2">
                                <FaEnvelopeOpenText />
                                <span>Messages</span>
                            </span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/settings" className="block p-4 hover:bg-gray-200 text-xl">
                            <span className="inline-flex items-center gap-2">
                                <FaCog />
                                <span>Settings</span>
                            </span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/profile" className="block p-4 hover:bg-gray-200 text-xl">
                            <span className="inline-flex items-center gap-2">
                                <FaUserCog />
                                <span>Update Profile</span>
                            </span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/" className="block p-4 hover:bg-gray-200 text-xl">
                            <span className="inline-flex items-center gap-2">
                                <FaHome />
                                <span>Go to Main Website</span>
                            </span>
                        </NavLink>
                    </li>
                    <li>
                        <button className="block p-4 hover:bg-gray-200 text-xl w-full text-left cursor-pointer" onClick={handleLogout}>
                            <span className="inline-flex items-center gap-2">
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </span>
                        </button>
                    </li>
                </ul>
            </div>
            <div className="grow p-4">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;