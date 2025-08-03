import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useFullscreen } from '../contexts/FullscreenContext';
import { Link } from 'react-router-dom';
import { BiBook, BiQuestionMark } from 'react-icons/bi';
import { MdQuiz, MdTouchApp, MdAdminPanelSettings } from 'react-icons/md';
import { FiEdit3, FiKey } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';

const HomePage = () => {
  const { theme } = useTheme();
  const { isFullscreen, exitFullscreen } = useFullscreen();
  const isDark = theme === 'dark';

  // Auto-exit fullscreen when navigating to home page
  React.useEffect(() => {
    if (isFullscreen) {
      exitFullscreen();
    }
  }, [isFullscreen, exitFullscreen]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/30' : 'bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/20'}`}></div>
        <div className="relative text-center py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className={`text-5xl md:text-6xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-6 leading-tight`}>
              Welcome to <span className={`${isDark ? 'text-primary-light' : 'text-primary-dark'}`}>Training Hub</span>
            </h1>
            <p className={`text-xl md:text-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-10 max-w-3xl mx-auto leading-relaxed`}>
              Your comprehensive platform for interactive training materials, assessments, and knowledge management
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                to="/study"
                className={`${isDark ? 'bg-primary hover:bg-primary-light' : 'bg-primary hover:bg-primary-dark'} text-white py-4 px-8 rounded-lg font-semibold no-underline transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2`}
              >
                <BiBook className="text-xl" />
                Learn
              </Link>
              <Link
                to="/quiz"
                className={`${isDark ? 'bg-transparent hover:bg-secondary text-secondary hover:text-white border-secondary' : 'bg-white hover:bg-secondary text-secondary hover:text-white border-secondary'} border-2 py-4 px-8 rounded-lg font-semibold no-underline transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2`}
              >
                <MdQuiz className="text-xl" />
                Quiz
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
              Powerful Learning Features
            </h2>
            <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-2xl mx-auto`}>
              Discover the tools and capabilities that make Training Hub your complete learning solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Interactive Study Guides */}
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-8 rounded-xl shadow-lg border hover:shadow-xl transition-shadow duration-200`}>
              <div className={`${isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                <MdTouchApp className={`text-2xl ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>
                Interactive Learning
              </h3>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                Rich content with interactive elements, collapsible sections, tables, and multimedia support for engaging learning experiences.
              </p>
            </div>

            {/* Advanced Quiz System */}
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-8 rounded-xl shadow-lg border hover:shadow-xl transition-shadow duration-200`}>
              <div className={`${isDark ? 'bg-indigo-500/20' : 'bg-indigo-500/10'} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                <BiQuestionMark className={`text-2xl ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>
                Advanced Quiz System
              </h3>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                Multiple question types including multiple choice, check-all-that-apply, and true/false with immediate feedback and explanations.
              </p>
            </div>

            {/* Practice Mode */}
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-8 rounded-xl shadow-lg border hover:shadow-xl transition-shadow duration-200`}>
              <div className={`${isDark ? 'bg-green-500/20' : 'bg-green-500/10'} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                <HiOutlineAcademicCap className={`text-2xl ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>
                Practice Mode
              </h3>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                Learn at your own pace with practice quizzes that provide instant feedback and detailed explanations for every answer.
              </p>
            </div>

            {/* Content Editor */}
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-8 rounded-xl shadow-lg border hover:shadow-xl transition-shadow duration-200`}>
              <div className={`${isDark ? 'bg-purple-500/20' : 'bg-purple-500/10'} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                <FiEdit3 className={`text-2xl ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>
                Visual Content Editor
              </h3>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                Drag-and-drop content creation with rich components, templates, and real-time preview for building engaging study materials.
              </p>
            </div>

            {/* Access Code System */}
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-8 rounded-xl shadow-lg border hover:shadow-xl transition-shadow duration-200`}>
              <div className={`${isDark ? 'bg-orange-500/20' : 'bg-orange-500/10'} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                <FiKey className={`text-2xl ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>
                Secure Access Codes
              </h3>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                Generate unique access codes for controlled quiz distribution with detailed tracking and user information management.
              </p>
            </div>

            {/* Admin Dashboard */}
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-8 rounded-xl shadow-lg border hover:shadow-xl transition-shadow duration-200`}>
              <div className={`${isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                <MdAdminPanelSettings className={`text-2xl ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>
                Comprehensive Admin Tools
              </h3>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                Full administrative control with content management, quiz builder, results analytics, and user management capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className={`py-16 px-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
              Get Started in Minutes
            </h2>
            <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Follow these simple steps to begin your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`${isDark ? 'bg-primary text-white' : 'bg-primary text-white'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1`}>
                  1
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
                    Browse Study Materials
                  </h3>
                  <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Explore our organized collection of <Link to="/study" className={`${isDark ? 'text-primary-light' : 'text-primary-dark'} font-medium hover:underline`}>study guides</Link> by section and category to find the content you need.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`${isDark ? 'bg-primary text-white' : 'bg-primary text-white'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1`}>
                  2
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
                    Learn Interactively
                  </h3>
                  <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Engage with rich content including interactive elements, collapsible sections, and multimedia components designed for effective learning.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`${isDark ? 'bg-primary text-white' : 'bg-primary text-white'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1`}>
                  3
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
                    Practice Your Knowledge
                  </h3>
                  <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Test your understanding with practice quizzes that provide immediate feedback and detailed explanations for every question.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`${isDark ? 'bg-primary text-white' : 'bg-primary text-white'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1`}>
                  4
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
                    Take Official Assessments
                  </h3>
                  <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    When ready, complete official quizzes using access codes provided by your instructor or administrator.
                  </p>
                </div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-slate-700/50' : 'bg-white'} p-8 rounded-xl shadow-lg border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
                Quick Access
              </h3>
              <div className="space-y-4">
                <Link
                  to="/study"
                  className={`block w-full ${isDark ? 'bg-primary/20 hover:bg-primary/30 text-primary-light border-primary/30' : 'bg-primary/10 hover:bg-primary/20 text-primary-dark border-primary/20'} border-2 py-3 px-4 rounded-lg font-medium no-underline transition-colors duration-200 text-center`}
                >
                  Browse All Learning Materials
                </Link>
                <Link
                  to="/quiz"
                  className={`block w-full ${isDark ? 'bg-secondary/20 hover:bg-secondary/30 text-secondary-light border-secondary/30' : 'bg-secondary/10 hover:bg-secondary/20 text-secondary-dark border-secondary/20'} border-2 py-3 px-4 rounded-lg font-medium no-underline transition-colors duration-200 text-center`}
                >
                  Enter Quiz Access Code
                </Link>
              </div>

              <div className={`mt-6 pt-6 border-t ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
                  Need Help?
                </h4>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-3`}>
                  Contact your instructor or system administrator for access codes and additional support.
                </p>
                <Link
                  to="/contact-us"
                  className={`text-sm ${isDark ? 'text-primary-light' : 'text-primary-dark'} hover:underline font-medium`}
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-6`}>
            Ready to Start Learning?
          </h2>
          <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-8 max-w-2xl mx-auto`}>
            Join thousands of learners who have enhanced their skills with Training Hub's comprehensive learning platform.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/study"
              className={`${isDark ? 'bg-primary hover:bg-primary-light' : 'bg-primary hover:bg-primary-dark'} text-white py-4 px-8 rounded-lg font-semibold no-underline transition-all duration-200 transform hover:scale-105 shadow-lg`}
            >
              Start Learning Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
