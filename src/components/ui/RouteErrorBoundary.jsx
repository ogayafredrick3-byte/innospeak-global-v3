import { Component } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

/** Keeps a rendering error from leaving the entire app as a blank screen. */
export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Replace with your error-monitoring provider when one is configured.
    if (import.meta.env.DEV) console.error('InnoSpeak page rendering error:', error, info);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-cream px-5 py-16" role="alert">
        <div className="w-full max-w-xl rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-premium sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <AlertTriangle size={25} aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-gold-700">InnoSpeak Global</p>
          <h1 className="mt-3 font-display text-2xl font-bold text-navy-900 sm:text-3xl">This page could not load</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-navy-600">A page-level error interrupted this view. You can retry or return to the homepage. If it continues, contact the support team and mention which page you were visiting.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={this.reset} className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-800">
              <RefreshCw size={15} aria-hidden="true" /> Try again
            </button>
            <Link to="/" onClick={this.reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 px-5 py-3 text-sm font-bold text-navy-900 transition hover:border-gold-400">
              <ArrowLeft size={15} aria-hidden="true" /> Return home
            </Link>
          </div>
        </div>
      </main>
    );
  }
}
