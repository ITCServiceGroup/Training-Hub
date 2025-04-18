import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="py-8">
      <section className={`text-center mb-12 py-12 px-4 ${isDark ? 'bg-teal-900/30' : 'bg-teal-50'} rounded-lg`}>
        <h1 className={`text-4xl ${isDark ? 'text-teal-400' : 'text-teal-700'} mb-4`}>Welcome to Training Hub</h1>
        <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-slate-700'} mb-8`}>Your comprehensive platform for training materials and assessments</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/study" className={`${isDark ? 'bg-teal-600 hover:bg-teal-500' : 'bg-teal-700 hover:bg-teal-800'} text-white py-3 px-6 rounded font-bold no-underline transition-colors`}>Study Guides</Link>
          <Link to="/quiz" className={`${isDark ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-700 hover:bg-purple-800'} text-white py-3 px-6 rounded font-bold no-underline transition-colors`}>Take a Quiz</Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className={`text-2xl ${isDark ? 'text-teal-400' : 'text-teal-700'} mb-6`}>Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`${isDark ? 'bg-slate-800 shadow-lg' : 'bg-white shadow'} p-6 rounded`}>
            <h3 className={`text-xl ${isDark ? 'text-teal-400' : 'text-teal-700'} mb-3`}>Study Guides</h3>
            <p className={isDark ? 'text-gray-300' : ''}>Access comprehensive study materials to enhance your knowledge and skills.</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800 shadow-lg' : 'bg-white shadow'} p-6 rounded`}>
            <h3 className={`text-xl ${isDark ? 'text-teal-400' : 'text-teal-700'} mb-3`}>Interactive Quizzes</h3>
            <p className={isDark ? 'text-gray-300' : ''}>Test your understanding with our interactive quizzes and receive immediate feedback.</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800 shadow-lg' : 'bg-white shadow'} p-6 rounded`}>
            <h3 className={`text-xl ${isDark ? 'text-teal-400' : 'text-teal-700'} mb-3`}>Progress Tracking</h3>
            <p className={isDark ? 'text-gray-300' : ''}>Monitor your learning progress and identify areas for improvement.</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800 shadow-lg' : 'bg-white shadow'} p-6 rounded`}>
            <h3 className={`text-xl ${isDark ? 'text-teal-400' : 'text-teal-700'} mb-3`}>Certification</h3>
            <p className={isDark ? 'text-gray-300' : ''}>Achieve certification upon successful completion of assessment requirements.</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className={`text-2xl ${isDark ? 'text-teal-400' : 'text-teal-700'} mb-6`}>Getting Started</h2>
        <ol className={`pl-6 leading-8 ${isDark ? 'text-gray-300' : ''}`}>
          <li>Browse available <Link to="/study" className={`${isDark ? 'text-teal-400' : 'text-teal-700'} font-medium no-underline hover:underline`}>study guides</Link> by category</li>
          <li>Review the material thoroughly</li>
          <li>Test your knowledge with <Link to="/quiz" className={`${isDark ? 'text-teal-400' : 'text-teal-700'} font-medium no-underline hover:underline`}>practice quizzes</Link></li>
          <li>Complete official assessments when ready</li>
        </ol>
      </section>
    </div>
  );
};

export default HomePage;
