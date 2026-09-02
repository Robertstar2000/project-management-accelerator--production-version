import React from 'react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCount: number;
    limit: number;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, currentCount, limit }) => {
    if (!isOpen) return null;

    const handleUpgrade = (plan: string) => {
        let url = '';
        switch(plan) {
            case 'basic':
                url = 'https://buy.stripe.com/4gM6oI0DV0rs0jEeao7Vm01';
                break;
            case 'pro':
                url = 'https://buy.stripe.com/4gM6oI0DV0rs0jEeao7Vm01';
                break;
            case 'unlimited':
                url = 'https://buy.stripe.com/4gM6oI0DV0rs0jEeao7Vm01';
                break;
        }
        if (url) window.open(url, '_blank');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                <h2>Upgrade Your Plan</h2>
                <p style={{ color: 'var(--secondary-text)', marginBottom: '2rem' }}>
                    You've reached your project limit ({currentCount}/{limit}). Upgrade to create more projects.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="tool-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <h3>Basic</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)', margin: '1rem 0' }}>$10<span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/mo</span></p>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                            <li>✓ 2 projects per month</li>
                            <li>✓ All features included</li>
                            <li>✓ Email support</li>
                        </ul>
                        <button className="button button-primary" onClick={() => handleUpgrade('basic')} style={{ width: '100%' }}>
                            Choose Basic
                        </button>
                    </div>

                    <div className="tool-card" style={{ textAlign: 'center', padding: '1.5rem', border: '2px solid var(--accent-color)' }}>
                        <h3>Pro</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)', margin: '1rem 0' }}>$20<span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/mo</span></p>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                            <li>✓ 4 projects per month</li>
                            <li>✓ All features included</li>
                            <li>✓ Priority support</li>
                        </ul>
                        <button className="button button-primary" onClick={() => handleUpgrade('pro')} style={{ width: '100%' }}>
                            Choose Pro
                        </button>
                    </div>

                    <div className="tool-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <h3>Unlimited</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)', margin: '1rem 0' }}>$100<span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/mo</span></p>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                            <li>✓ Unlimited projects</li>
                            <li>✓ All features included</li>
                            <li>✓ Priority support</li>
                        </ul>
                        <button className="button button-primary" onClick={() => handleUpgrade('unlimited')} style={{ width: '100%' }}>
                            Choose Unlimited
                        </button>
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="button">Cancel</button>
                </div>
            </div>
        </div>
    );
};
