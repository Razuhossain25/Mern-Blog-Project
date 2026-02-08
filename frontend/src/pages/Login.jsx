import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useCheckAuth from "../hooks/useCheckAuth";
import { useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { FaSignInAlt } from "react-icons/fa";

const Login = () => {
    const { settings } = useSiteSettings();
    const siteTitle = settings?.websiteTitle || "MERN Blog";
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();


    const onSubmit = async (data) => {
        try {
            const response = await axios.post(
                "http://localhost:4000/api/v1.0.0/login",
                data,
                {
                    validateStatus: () => true,
                }
            );

            if (response.status >= 400) {
                throw new Error(response.data.error);
            }
            // set Token to localStorage
            toast.success("Login Successful", { onClose: () => {
                localStorage.setItem("token", response.data.token);
                window.location.reload();
            }, autoClose: 2000 });
        } catch (error) {
            toast.error(error.message);
        }
    };

    useCheckAuth().then((isAuthenticated) => {
        if (isAuthenticated) {
            navigate("/");
        }
    });

    return (
        <div className="w-max m-auto border border-gray-300 rounded-md shadow-md shadow-gray-300 p-6 my-20 bg-gray-100">
            <Helmet>
                <title>{`Login | ${siteTitle}`}</title>
            </Helmet>
            <h2 className="text-3xl mb-4">Login Page</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mb-3">
                <div className="mb-3 flex flex-col">
                    <label htmlFor="email">Email Address</label>
                    <input type="text" id="email" className="border border-gray-400 w-96 py-2 px-3 rounded-md shadow-md shadow-gray-300" {...register("email", {
                        required: "Email Address is required",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email address"
                        }
                    })} />
                    {errors.email && <p className="text-red-500 mt-1">{errors.email.message}</p>}
                </div>
                <div className="mb-4 flex flex-col">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" className="border border-gray-400 w-96 py-2 px-3 rounded-md shadow-md shadow-gray-300" {...register("password", {
                        required: "Password is required",
                    })} />
                    {errors.password && <p className="text-red-500 mt-1">{errors.password.message}</p>}
                </div>
                <button type="submit" className="border rounded-md border-gray-400 px-6 py-2 shadow-md shadow-gray-300 cursor-pointer font-bold hover:bg-blue-800 hover:text-white text-xl">
                    <span className="inline-flex items-center gap-2">
                        <FaSignInAlt />
                        <span>Log In</span>
                    </span>
                </button>
            </form>
        </div>
    );
};

export default Login;