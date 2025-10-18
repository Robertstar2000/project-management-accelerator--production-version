import React from 'react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <h2>Terms of Service & Privacy Policy</h2>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                    
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing and using Project Accelerator ("the Service"), you agree to be bound by these Terms of Service and Privacy Policy. If you do not agree, please do not use the Service.</p>
                    
                    <h3>2. Description of Service</h3>
                    <p>Project Accelerator is an AI-powered project management application that helps users plan, track, and execute projects using artificial intelligence. The Service includes document generation, task management, team collaboration, and agentic workflow automation features.</p>
                    
                    <h3>3. User Accounts & Authentication</h3>
                    <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to update it as necessary. You are responsible for all activities that occur under your account.</p>
                    
                    <h3>4. Data Collection & Storage</h3>
                    <p><strong>What We Collect:</strong></p>
                    <ul>
                        <li>Account information (username, email, password)</li>
                        <li>Usage data (features accessed, actions performed)</li>
                        <li>Browser storage data (localStorage on your browser for data and application state)</li>
                    </ul>
                    <p><strong>How We Store Data:</strong></p>
                    <ul>
                        <li>Account data is stored on our secure backend servers</li>
                        <li>Project data is stored locally in your browser (localStorage). Your private project data is not stored by MIFECO</li>
                        <li>All data transmission uses HTTPS encryption</li>
                        <li>We do not sell or share your personal data with third parties for marketing purposes</li>
                    </ul>
                    
                    <h3>5. Third-Party Services</h3>
                    <p>The Service integrates with third-party AI providers:</p>
                    <ul>
                        <li><strong>Google Gemini AI:</strong> Used for document generation and AI-powered features. Subject to Google's privacy policy and terms of service.</li>
                        <li><strong>AWS Bedrock:</strong> Alternative AI provider. Subject to AWS privacy policy and terms of service.</li>
                        <li><strong>Stripe:</strong> Payment processing for premium features. Subject to Stripe's privacy policy and terms of service.</li>
                    </ul>
                    <p>When you use AI features, your project data may be sent to these providers for processing. We recommend not including sensitive or confidential information in AI-generated content.</p>
                    
                    <h3>6. Cookies & Browser Storage</h3>
                    <p>We use browser localStorage to store your application state, preferences, and project data locally on your device. This data remains on your device and is not automatically transmitted to our servers unless you explicitly sync your projects. You can clear this data at any time through your browser settings.</p>
                    
                    <h3>7. User Rights (GDPR Compliance)</h3>
                    <p>If you are located in the European Union, you have the following rights:</p>
                    <ul>
                        <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                        <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                        <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                        <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                        <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
                        <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
                    </ul>
                    <p>To exercise these rights, contact us at the email provided below.</p>
                    
                    <h3>8. Data Retention & Deletion</h3>
                    <p>We retain your account and project data for as long as your account is active. You may delete your account and all associated data at any time. Upon account deletion, all data will be permanently removed from our servers within 30 days. Browser localStorage data can be cleared immediately through your browser settings.</p>
                    
                    <h3>9. User Responsibilities</h3>
                    <p>You agree to:</p>
                    <ul>
                        <li>Use the Service in compliance with all applicable laws and regulations</li>
                        <li>Not use the Service for any illegal or unauthorized purpose</li>
                        <li>Not attempt to gain unauthorized access to the Service or other users' accounts</li>
                        <li>Not upload malicious code, viruses, or harmful content</li>
                        <li>Review and edit all AI-generated content before use in production environments</li>
                        <li>Not rely solely on AI-generated content for critical business decisions</li>
                    </ul>
                    
                    <h3>10. AI-Generated Content Disclaimer</h3>
                    <p>The Service uses artificial intelligence to generate project documents and recommendations. AI-generated content is provided "as is" without warranties of accuracy, completeness, or suitability for any particular purpose. You are solely responsible for reviewing, editing, and validating all AI-generated content before use. We are not liable for any decisions made based on AI-generated content.</p>
                    
                    <h3>11. Intellectual Property</h3>
                    <p>You retain all rights to the content you create using the Service. We claim no ownership over your projects, documents, or data. The Service's code, design, and functionality are protected by copyright and other intellectual property laws.</p>
                    
                    <h3>12. Limitation of Liability</h3>
                    <p>The Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the past 12 months.</p>
                    
                    <h3>13. Service Availability</h3>
                    <p>We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We may perform maintenance, updates, or modifications that temporarily affect availability. We are not liable for any downtime or data loss.</p>
                    
                    <h3>14. Payment & Subscriptions</h3>
                    <p>Premium features require payment processed through Stripe. Subscription fees are non-refundable except as required by law. You may cancel your subscription at any time, and access to premium features will continue until the end of the current billing period.</p>
                    
                    <h3>15. Accessibility</h3>
                    <p>We are committed to making the Service accessible to all users. We strive to comply with WCAG 2.1 Level AA standards. If you encounter accessibility barriers, please contact us so we can address them.</p>
                    
                    <h3>16. Changes to Terms</h3>
                    <p>We may update these Terms of Service and Privacy Policy from time to time. We will notify you of significant changes by email or through the Service. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
                    
                    <h3>17. Termination</h3>
                    <p>We reserve the right to suspend or terminate your account if you violate these terms or engage in abusive behavior. Upon termination, your access to the Service will be revoked, and your data may be deleted.</p>
                    
                    <h3>18. Governing Law</h3>
                    <p>These terms are governed by the laws of the jurisdiction in which the Service operator is located, without regard to conflict of law principles.</p>
                    
                    <h3>19. Contact Information</h3>
                    <p>For questions, concerns, or to exercise your data rights, contact us at:</p>
                    <p><strong>Email:</strong> support@mifeco.com</p>
                    <p><strong>Website:</strong> http://mifeco.com</p>
                    
                    <h3>20. Data Security</h3>
                    <p>We implement industry-standard security measures to protect your data, including encryption, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
                </div>
                <div className="modal-actions" style={{ marginTop: '2rem' }}>
                    <button onClick={onClose} className="button button-primary">I Understand & Accept</button>
                </div>
            </div>
        </div>
    );
};
