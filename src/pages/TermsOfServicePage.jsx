import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const TermsOfServicePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Terms of Service
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                By accessing and using the Training Hub platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                2. Description of Service
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Training Hub is a web-based platform that provides:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Access to training materials and study guides</li>
                <li>Interactive quizzes and assessments</li>
                <li>Progress tracking and certification management</li>
                <li>Administrative tools for content management</li>
                <li>Results reporting and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                3. User Responsibilities
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                As a user of Training Hub, you agree to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Provide accurate and truthful information when taking quizzes</li>
                <li>Use the platform only for its intended training and educational purposes</li>
                <li>Maintain the confidentiality of any access codes or login credentials</li>
                <li>Not attempt to circumvent security measures or access unauthorized content</li>
                <li>Not share quiz content or answers with unauthorized individuals</li>
                <li>Report any technical issues or security concerns promptly</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                4. Administrator Responsibilities
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Administrators with access to the admin portal agree to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Maintain the security and confidentiality of admin credentials</li>
                <li>Use administrative functions responsibly and ethically</li>
                <li>Ensure training content is accurate and up-to-date</li>
                <li>Protect user privacy and handle personal information appropriately</li>
                <li>Comply with organizational policies regarding training administration</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                5. Intellectual Property
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                The Training Hub platform and its content are protected by intellectual property rights:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>All training materials, quizzes, and content remain the property of their respective owners</li>
                <li>Users may not reproduce, distribute, or modify platform content without authorization</li>
                <li>The platform software and design are proprietary and protected</li>
                <li>User-generated content may be used to improve the platform with appropriate attribution</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                6. Quiz Integrity and Academic Honesty
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                To maintain the integrity of our assessment system:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>All quiz attempts must be completed independently unless otherwise specified</li>
                <li>Use of unauthorized materials or assistance is prohibited</li>
                <li>Quiz results are recorded and may be audited for compliance purposes</li>
                <li>Violations of quiz integrity may result in invalidated results and disciplinary action</li>
                <li>Practice quizzes are for learning purposes and should be used ethically</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                7. Data and Privacy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Your use of the platform is also governed by our Privacy Policy. Key points include:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Quiz results and training progress may be shared with supervisors</li>
                <li>Data is stored securely and used only for training and compliance purposes</li>
                <li>You have rights regarding your personal information as outlined in our Privacy Policy</li>
                <li>Platform usage data may be collected to improve services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                8. Service Availability
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                While we strive to provide reliable service:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>The platform may be temporarily unavailable for maintenance or updates</li>
                <li>We do not guarantee uninterrupted access to the service</li>
                <li>Technical issues should be reported promptly for resolution</li>
                <li>Critical training deadlines should account for potential service interruptions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                To the fullest extent permitted by law:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>The platform is provided "as is" without warranties of any kind</li>
                <li>We are not liable for any indirect, incidental, or consequential damages</li>
                <li>Users are responsible for maintaining backup records of important training data</li>
                <li>Our liability is limited to the extent permitted by applicable law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                10. Prohibited Uses
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                You may not use the Training Hub platform to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to other users' accounts or data</li>
                <li>Upload malicious code or attempt to disrupt platform functionality</li>
                <li>Use automated tools to access or interact with the platform</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Share access credentials with unauthorized individuals</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                11. Termination
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We reserve the right to terminate or suspend access to the platform:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>For violations of these Terms of Service</li>
                <li>For misuse of the platform or its content</li>
                <li>For security reasons or to protect other users</li>
                <li>Upon reasonable notice for operational reasons</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                12. Changes to Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We may modify these Terms of Service at any time. Material changes will be communicated through the platform, and continued use constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                13. Contact Information
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                For questions about these Terms of Service or to report violations, please contact your system administrator or use the platform's contact form.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                14. Governing Law
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                These Terms of Service are governed by applicable local and federal laws. Any disputes will be resolved through appropriate legal channels in accordance with your organization's policies.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
