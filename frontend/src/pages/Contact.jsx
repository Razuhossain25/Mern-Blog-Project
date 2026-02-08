import { FaFacebookF, FaGithub, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

const Contact = () => {
    const { settings } = useSiteSettings();
    const siteTitle = settings?.websiteTitle || "MERN Blog";

    const API_BASE = useMemo(
        () => import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1.0.0",
        []
    );

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        if (!name.trim() || !email.trim() || !message.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        const tId = toast.loading("Sending message...");
        const res = await axios.post(
            `${API_BASE}/contact`,
            { name, email, message },
            { validateStatus: () => true }
        );

        if (res.status >= 200 && res.status < 300) {
            toast.update(tId, {
                render: "Message sent successfully",
                type: "success",
                isLoading: false,
                autoClose: 1500,
            });
            setName("");
            setEmail("");
            setMessage("");
        } else {
            toast.update(tId, {
                render: res.data?.error || "Failed to send message",
                type: "error",
                isLoading: false,
                autoClose: 2500,
            });
        }
        setSubmitting(false);
    };
    return (
        <section className="text-gray-600 body-font relative">
            <Helmet>
                <title>{`Contact | ${siteTitle}`}</title>
            </Helmet>
            <div className="container px-5 py-24 mx-auto flex sm:flex-nowrap flex-wrap">
                <div className="lg:w-2/3 md:w-1/2 bg-gray-300 rounded-lg overflow-hidden sm:mr-10 p-10 flex items-end justify-start relative">
                    <iframe width="100%" height="100%" className="absolute inset-0" frameBorder={0} title="map" marginHeight={0} marginWidth={0} scrolling="no" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.3978091170275!2d90.3699062!3d23.7331895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bfbe6c0bab8b%3A0x8784d7f5150e9ae3!2z4KaG4Ka44Ka_4KarIOCmhuCmrOCmv-CmsA!5e0!3m2!1sbn!2sbd!4v1765275814095!5m2!1sbn!2sbd" style={{ filter: 'grayscale(0) contrast(1.2) opacity(0.9)' }} />
                    <div className="bg-white relative flex flex-wrap py-6 rounded shadow-md">
                        <div className="lg:w-1/2 px-6">
                            <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs">ADDRESS</h2>
                            <p className="mt-1">9 Sher-E-Bangla Road, Hazaribagh, Dhaka-1209</p>
                        </div>
                        <div className="lg:w-1/2 px-6 mt-4 lg:mt-0">
                            <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs">EMAIL</h2>
                            <a className="text-indigo-500 leading-relaxed">asif.abir@hotmail.com</a>
                            <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs mt-4">PHONE</h2>
                            <p className="leading-relaxed">+8801955517560</p>
                            <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs mt-4">SOCIAL</h2>
                            <ul className="leading-relaxed flex space-x-4 mt-1">
                                <li>
                                    <a href="https://fb.com/abir.upwork" target="_blank" rel="noreferrer">
                                        <FaFacebookF />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://bd.linkedin.com/in/asif-abir-5a5a5927b" target="_blank" rel="noreferrer">
                                        <FaLinkedinIn />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://github.com/asif-daffodil" target="_blank" rel="noreferrer">
                                        <FaGithub />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.youtube.com/@abir.upwork" target="_blank" rel="noreferrer">
                                        <FaYoutube />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/3 md:w-1/2 bg-white flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0">
                    <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">Feedback</h2>
                    <p className="leading-relaxed mb-5 text-gray-600">Post-ironic portland shabby chic echo park, banjo fashion axe</p>
                    <form onSubmit={handleSubmit}>
                        <div className="relative mb-4">
                            <label htmlFor="name" className="leading-7 text-sm text-gray-600">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={submitting}
                                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={submitting}
                                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="message" className="leading-7 text-sm text-gray-600">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={submitting}
                                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg disabled:opacity-60"
                        >
                            {submitting ? "Sending..." : "Send"}
                        </button>
                    </form>
                    <p className="text-xs text-gray-500 mt-3">Chicharrones blog helvetica normcore iceland tousled brook viral artisan.</p>
                </div>
            </div>
        </section>
    );
};

export default Contact;