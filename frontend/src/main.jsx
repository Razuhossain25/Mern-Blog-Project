import { createRoot } from 'react-dom/client'
import './index.css'
import router from './router'
import { RouterProvider } from 'react-router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import { HelmetProvider } from 'react-helmet-async'

createRoot(document.getElementById('root')).render(
    <>
        <ToastContainer className="mt-16" />
        <HelmetProvider>
            <SiteSettingsProvider>
                <RouterProvider router={router} />
            </SiteSettingsProvider>
        </HelmetProvider>
    </>
)
