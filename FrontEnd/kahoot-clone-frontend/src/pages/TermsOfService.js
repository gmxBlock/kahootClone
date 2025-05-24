import React from 'react';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-of-service">
      <div className="container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Thinkaton ("the Service"), you accept and agree to be bound by the 
            terms and provision of this agreement. If you do not agree to these terms, you should not 
            use this service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Thinkaton is an online quiz platform that allows users to:
          </p>
          <ul>
            <li>Create and participate in interactive quizzes</li>
            <li>Join real-time multiplayer quiz sessions</li>
            <li>Track performance and view leaderboards</li>
            <li>Manage quiz content and user profiles</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <h3>Registration</h3>
          <p>
            To use certain features of the Service, you must register for an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain and update your information as needed</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>
          
          <h3>Account Responsibility</h3>
          <p>
            You are responsible for all activities that occur under your account. You agree to use 
            the Service only for lawful purposes and in accordance with these Terms.
          </p>
        </section>

        <section>
          <h2>4. Acceptable Use Policy</h2>
          <p>You agree NOT to use the Service to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Upload malicious code or harmful content</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Create fake accounts or impersonate others</li>
            <li>Attempt to gain unauthorized access to the system</li>
            <li>Interfere with the proper functioning of the Service</li>
            <li>Use the Service for commercial purposes without permission</li>
          </ul>
        </section>

        <section>
          <h2>5. Content and Intellectual Property</h2>
          <h3>Your Content</h3>
          <p>
            You retain ownership of any content you create (quizzes, questions, etc.). By uploading 
            content to Thinkaton, you grant us a license to use, display, and distribute your content 
            within the Service.
          </p>
          
          <h3>Our Content</h3>
          <p>
            The Service and its original content, features, and functionality are owned by Thinkaton 
            and are protected by copyright, trademark, and other laws.
          </p>
          
          <h3>Prohibited Content</h3>
          <p>You may not upload content that is:</p>
          <ul>
            <li>Illegal, harmful, or offensive</li>
            <li>Copyrighted material without permission</li>
            <li>Spam or misleading information</li>
            <li>Discriminatory or hateful</li>
            <li>Violates privacy rights</li>
          </ul>
        </section>

        <section>
          <h2>6. Privacy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy, which also governs 
            your use of the Service, to understand our practices.
          </p>
        </section>

        <section>
          <h2>7. Service Availability</h2>
          <p>
            We strive to maintain the Service, but we do not guarantee:
          </p>
          <ul>
            <li>Continuous or uninterrupted access</li>
            <li>Error-free operation</li>
            <li>Specific uptime percentages</li>
          </ul>
          <p>
            We reserve the right to modify, suspend, or discontinue the Service at any time.
          </p>
        </section>

        <section>
          <h2>8. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, 
            for any reason, including but not limited to:
          </p>
          <ul>
            <li>Breach of these Terms</li>
            <li>Violation of our policies</li>
            <li>Harmful or illegal activities</li>
            <li>Extended periods of inactivity</li>
          </ul>
          <p>
            You may terminate your account at any time by contacting us.
          </p>
        </section>

        <section>
          <h2>9. Disclaimers</h2>
          <p>
            The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind. 
            We disclaim all warranties, express or implied, including but not limited to:
          </p>
          <ul>
            <li>Merchantability and fitness for a particular purpose</li>
            <li>Non-infringement of third-party rights</li>
            <li>Accuracy or completeness of content</li>
            <li>Security or reliability of the Service</li>
          </ul>
        </section>

        <section>
          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Thinkaton shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages, including but not limited to 
            loss of profits, data, or use.
          </p>
        </section>

        <section>
          <h2>11. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Thinkaton from and against any claims, 
            damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of any 
            material changes by posting the new Terms on this page and updating the "last updated" date.
          </p>
          <p>
            Your continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2>13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Germany, 
            without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>14. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <ul>
            <li>Email: jakob@masfelder.de</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
