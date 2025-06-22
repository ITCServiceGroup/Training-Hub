import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-6">
      <div className="w-full px-6">
        <div className="flex justify-between items-center flex-wrap">
          <p className="m-0 text-slate-500 dark:text-slate-400">&copy; {currentYear} Training Hub. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-primary no-underline hover:text-primary-dark transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-primary no-underline hover:text-primary-dark transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact-us" className="text-primary no-underline hover:text-primary-dark transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
