import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-6">
      <div className="w-full px-6">
        <div className="flex justify-between items-center flex-wrap">
          <p className="m-0 text-slate-500">&copy; {currentYear} Training Hub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="text-teal-700 no-underline">Privacy Policy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-teal-700 no-underline">Terms of Service</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-teal-700 no-underline">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
