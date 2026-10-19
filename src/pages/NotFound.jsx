import Seo from '../components/ui/Seo.jsx';
import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" path="/404" />
      <div className="container-premium flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-6xl font-bold text-navy-900">404</h1>
        <p className="mt-4 text-navy-600">The page you are looking for does not exist.</p>
        <Link to="/" className="btn-gold mt-8">Back to Home</Link>
      </div>
    </>
  );
}
