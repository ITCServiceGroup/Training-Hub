import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const PrivacyPolicyPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Privacy Policy
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Training Hub collects information to provide and improve our training platform services:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Account Information:</strong> Email address and authentication credentials for admin access</li>
                <li><strong>Quiz Data:</strong> LDAP usernames, supervisor information, market data, and quiz results for assessment tracking</li>
                <li><strong>Study Progress:</strong> Information about study guide usage and progress tracking</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our platform, including time spent on content</li>
                <li><strong>Technical Data:</strong> Browser type, device information, and IP address for security and functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Providing access to study guides and training materials</li>
                <li>Administering quizzes and tracking assessment results</li>
                <li>Generating progress reports and certificates</li>
                <li>Maintaining platform security and preventing unauthorized access</li>
                <li>Improving our training content and platform functionality</li>
                <li>Communicating important updates about the training platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                3. Information Sharing and Disclosure
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>With Supervisors:</strong> Quiz results and training progress may be shared with designated supervisors for training compliance</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Service Providers:</strong> With trusted third-party services (like Supabase) that help us operate our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                4. Data Storage and Security
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Data is stored securely using Supabase's enterprise-grade infrastructure</li>
                <li>All data transmission is encrypted using industry-standard protocols</li>
                <li>Access to personal information is restricted to authorized personnel only</li>
                <li>Regular security audits and updates are performed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                5. Data Retention
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Quiz results and training records are retained for compliance and certification purposes</li>
                <li>Account information is retained while your account is active</li>
                <li>Usage data may be retained in aggregated, anonymized form for platform improvement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                6. Your Rights
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Access to your personal information and training records</li>
                <li>Correction of inaccurate or incomplete information</li>
                <li>Request deletion of your personal information (subject to legal retention requirements)</li>
                <li>Opt-out of non-essential communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                7. Cookies and Local Storage
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Our platform uses local storage and session management to enhance your experience:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Authentication tokens to maintain your login session</li>
                <li>Theme preferences and user interface settings</li>
                <li>Progress tracking for study guides and content editor state</li>
                <li>No third-party tracking cookies are used</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                8. Changes to This Privacy Policy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                9. Contact Us
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us through the platform's contact form or reach out to your system administrator.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
