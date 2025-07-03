import 'react-phone-number-input/style.css';
import './globals.css'; // Import global styles
import Header from './components/Header';
import Footer from './components/Footer';
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: 'Job Finder',
  description: 'A sample Next.js application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <SpeedInsights />
        <Footer />
      </body>
    </html>
  );
}
