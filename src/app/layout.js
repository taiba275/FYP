import 'react-phone-number-input/style.css';
import './globals.css';
import Footer from './components/Footer';
import Header from './components/Header';
import ScrollToTop from './components/Home/ScrollToTop';
import ChatbotWidget from './components/ChatbotWidget';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";

export const metadata = {
  title: 'JobFinder.',
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
          <UIProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <ScrollToTop />
            <ChatbotWidget />
            <SpeedInsights />
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
