const express = require('express');
const router = express.Router();

// GET /api/legal/privacy-policy
router.get('/privacy-policy', (req, res) => {
  try {
    const privacyPolicy = {
      title: 'Privacy Policy',
      lastUpdated: new Date().toISOString(),
      content: {
        introduction: 'Thinkaton is committed to protecting your privacy and ensuring the security of your personal information.',
        dataCollection: {
          personalInfo: [
            'Username and email address',
            'Password (encrypted and stored securely)',
            'Profile information you choose to provide'
          ],
          usageInfo: [
            'Quiz participation and performance data',
            'Game sessions and scores',
            'Device information and IP address',
            'Browser type and version'
          ]
        },
        dataUsage: [
          'Provide and maintain our quiz platform',
          'Create and manage your user account',
          'Track quiz performance and generate leaderboards',
          'Improve our services and user experience',
          'Communicate with you about your account',
          'Ensure platform security and prevent fraud'
        ],
        dataSharing: {
          policy: 'We do not sell, trade, or otherwise transfer your personal information to third parties',
          exceptions: [
            'With your explicit consent',
            'To comply with legal obligations',
            'To protect our rights and safety',
            'In connection with a business transfer (merger, acquisition, etc.)'
          ]
        },
        security: [
          'Passwords are encrypted using industry-standard methods',
          'Secure data transmission protocols (HTTPS)',
          'Regular security assessments and updates',
          'Limited access to personal data by authorized personnel only'
        ],
        contact: {
          email: 'privacy@thinkaton.com',
          address: '[Your Business Address]'
        }
      }
    };

    res.json(privacyPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving privacy policy' });
  }
});

// GET /api/legal/terms-of-service
router.get('/terms-of-service', (req, res) => {
  try {
    const termsOfService = {
      title: 'Terms of Service',
      lastUpdated: new Date().toISOString(),
      content: {
        acceptance: 'By accessing and using Thinkaton, you accept and agree to be bound by the terms and provision of this agreement.',
        serviceDescription: {
          description: 'Thinkaton is an online quiz platform that allows users to:',
          features: [
            'Create and participate in interactive quizzes',
            'Join real-time multiplayer quiz sessions',
            'Track performance and view leaderboards',
            'Manage quiz content and user profiles'
          ]
        },
        userAccounts: {
          registration: [
            'Provide accurate and complete information',
            'Maintain and update your information as needed',
            'Keep your password secure and confidential',
            'Notify us immediately of any unauthorized use'
          ],
          responsibility: 'You are responsible for all activities that occur under your account.'
        },
        prohibitedUse: [
          'Violate any applicable laws or regulations',
          'Infringe on intellectual property rights',
          'Upload malicious code or harmful content',
          'Harass, abuse, or harm other users',
          'Create fake accounts or impersonate others',
          'Attempt to gain unauthorized access to the system',
          'Interfere with the proper functioning of the Service',
          'Use the Service for commercial purposes without permission'
        ],
        termination: [
          'Breach of these Terms',
          'Violation of our policies',
          'Harmful or illegal activities',
          'Extended periods of inactivity'
        ],
        contact: {
          email: 'legal@thinkaton.com',
          address: '[Your Business Address]'
        }
      }
    };

    res.json(termsOfService);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving terms of service' });
  }
});

// GET /api/legal/both - Returns both privacy policy and terms of service
router.get('/both', (req, res) => {
  try {
    const response = {
      privacyPolicy: {
        title: 'Privacy Policy',
        lastUpdated: new Date().toISOString(),
        url: '/privacy-policy'
      },
      termsOfService: {
        title: 'Terms of Service',
        lastUpdated: new Date().toISOString(),
        url: '/terms-of-service'
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving legal documents' });
  }
});

module.exports = router;
