import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Information We Collect</h2>
          <h3>Personal Information</h3>
          <p>
            When you create an account on Thinkaton, we collect:
          </p>
          <ul>
            <li>Username and email address</li>
            <li>Password (encrypted and stored securely)</li>
            <li>Profile information you choose to provide</li>
          </ul>
          
          <h3>Usage Information</h3>
          <p>
            We automatically collect information about how you use our service:
          </p>
          <ul>
            <li>Quiz participation and performance data</li>
            <li>Game sessions and scores</li>
            <li>Device information and IP address</li>
            <li>Browser type and version</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain our quiz platform</li>
            <li>Create and manage your user account</li>
            <li>Track quiz performance and generate leaderboards</li>
            <li>Improve our services and user experience</li>
            <li>Communicate with you about your account</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
        </section>

        <section>
          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties, except:
          </p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>In connection with a business transfer (merger, acquisition, etc.)</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information:
          </p>
          <ul>
            <li>Passwords are encrypted using industry-standard methods</li>
            <li>Secure data transmission protocols (HTTPS)</li>
            <li>Regular security assessments and updates</li>
            <li>Limited access to personal data by authorized personnel only</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed to provide services. 
            You may request deletion of your account and associated data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2>6. Cookies and Tracking</h2>
          <p>
            Our website uses cookies and similar technologies to:
          </p>
          <ul>
            <li>Maintain your login session</li>
            <li>Remember your preferences</li>
            <li>Analyze website usage patterns</li>
            <li>Improve website functionality</li>
          </ul>
          <p>
            You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section>
          <h2>7. Children's Privacy</h2>
          <p>
            Thinkaton is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you believe we have collected information 
            from a child under 13, please contact us immediately.
          </p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes 
            by posting the new policy on this page and updating the "last updated" date.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@thinkaton.com</li>
            <li>Address: [Your Business Address]</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
