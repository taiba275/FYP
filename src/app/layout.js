import 'react-phone-number-input/style.css';
import './globals.css';
import Footer from './components/Footer';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "./context/AuthContext"; // ✅ NEW CONTEXT PROVIDER

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
          <main>{children}</main>
          <SpeedInsights />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
