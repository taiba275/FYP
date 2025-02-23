import './globals.css'; // Import global styles
import Header from './components/Header';
import Footer from './components/Footer';

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
        <Footer />
      </body>
    </html>
  );
}
