import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ScrollToTop from './ScrollToTop.jsx';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <ScrollToTop />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}