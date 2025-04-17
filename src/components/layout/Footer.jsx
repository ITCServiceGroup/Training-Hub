import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-6">
      <div className="w-full px-6">
        <div className="flex justify-between items-center flex-wrap">
          <p className="m-0 text-slate-500 dark:text-slate-400">&copy; {currentYear} Training Hub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="text-teal-700 dark:text-teal-500 no-underline hover:text-teal-800 dark:hover:text-teal-400">Privacy Policy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-teal-700 dark:text-teal-500 no-underline hover:text-teal-800 dark:hover:text-teal-400">Terms of Service</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-teal-700 dark:text-teal-500 no-underline hover:text-teal-800 dark:hover:text-teal-400">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
