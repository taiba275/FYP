import 'react-phone-number-input/style.css';
import './globals.css';
import Footer from './components/Footer';
import Header from './components/Header';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext"; // ✅ NEW

export const metadata = {
  title: 'Job Finder',
  description: 'A sample Next.js application',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UIProvider> {/* ✅ Wrap UIProvider */}
            <Header />
            <main>{children}</main>
            <Footer />
            <SpeedInsights />
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
