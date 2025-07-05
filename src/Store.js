import React, { useState, useEffect } from 'react';
import { userManager } from './userManager';
import { notificationManager } from './notificationManager';
import './Store.css';

const Store = ({ currentUser, isOpen, onClose, onPointsUpdate }) => {
  const [pulsarPoints, setPulsarPoints] = useState(0);
  const [customMessage, setCustomMessage] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Store items configuration
  const storeItems = [
    {
      id: 'screen_effects',
      name: 'Sparkle Effects',
      description: 'Trigger sparkle effects on all screens for 30 seconds',
      price: 50,
      icon: '✨'
    },
    {
      id: 'custom_announcement',
      name: 'Custom Announcement',
      description: 'Send a custom message to all connected users',
      price: 25,
      icon: '📢'
    },
    {
      id: 'fire_emoji',
      name: 'Fire Status',
      description: 'Add a fire emoji next to your name for 24 hours',
      price: 100,
      icon: '🔥'
    }
  ];

  // Load user's current points
  useEffect(() => {
    if (currentUser) {
      const points = userManager.getPulsarPoints(currentUser.username);
      setPulsarPoints(points);
    }
  }, [currentUser, isOpen]);

  const handlePurchase = (item) => {
    if (!currentUser) return;

    // Check if user has enough points
    if (pulsarPoints < item.price) {
      alert('Insufficient Pulsar Points!');
      return;
    }

    // Handle custom announcement input
    if (item.id === 'custom_announcement') {
      if (!showCustomInput) {
        setShowCustomInput(true);
        return;
      }
      
      if (!customMessage.trim()) {
        alert('Please enter a message!');
        return;
      }
    }

    // Spend points
    const result = userManager.spendPulsarPoints(currentUser.username, item.price);
    if (!result.success) {
      alert(result.error);
      return;
    }

    // Update local state
    setPulsarPoints(result.remainingPoints);
    onPointsUpdate(result.remainingPoints);

    // Handle different item types
    switch (item.id) {
      case 'screen_effects':
        // Broadcast screen effects event
        notificationManager.broadcastEvent(
          notificationManager.EVENT_TYPES.SCREEN_EFFECTS,
          currentUser.username,
          null,
          { duration: 30000 } // 30 seconds
        );
        break;

      case 'custom_announcement':
        // Broadcast custom announcement
        notificationManager.broadcastEvent(
          notificationManager.EVENT_TYPES.CUSTOM_ANNOUNCEMENT,
          currentUser.username,
          null,
          { message: customMessage }
        );
        setCustomMessage('');
        setShowCustomInput(false);
        break;

      case 'fire_emoji':
        // Set fire emoji effect for 24 hours
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
        userManager.setStoreEffect(currentUser.username, 'fireEmoji', expirationTime);
        
        // Broadcast fire emoji activation
        notificationManager.broadcastEvent(
          notificationManager.EVENT_TYPES.FIRE_EMOJI_ACTIVATED,
          currentUser.username,
          null,
          { expirationTime }
        );
        break;

      default:
        break;
    }

    alert(`Successfully purchased ${item.name}!`);
  };

  const handleCustomAnnouncementCancel = () => {
    setShowCustomInput(false);
    setCustomMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="store-overlay">
      <div className="store-modal">
        <div className="store-header">
          <h2>🛍️ Pulsar Store</h2>
          <button className="store-close" onClick={onClose}>×</button>
        </div>
        
        <div className="store-points">
          <span className="points-label">Your Pulsar Points:</span>
          <span className="points-value">{pulsarPoints}</span>
        </div>

        <div className="store-items">
          {storeItems.map((item) => {
            const canAfford = pulsarPoints >= item.price;
            const isFireEmojiActive = item.id === 'fire_emoji' && 
              userManager.hasFireEmoji(currentUser?.username);

            return (
              <div key={item.id} className={`store-item ${!canAfford ? 'disabled' : ''}`}>
                <div className="item-icon">{item.icon}</div>
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-price">{item.price} PP</div>
                </div>
                <button
                  className={`item-buy-btn ${!canAfford ? 'disabled' : ''} ${isFireEmojiActive ? 'active' : ''}`}
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford || isFireEmojiActive}
                >
                  {isFireEmojiActive ? 'Active' : canAfford ? 'Buy' : 'Not enough PP'}
                </button>
              </div>
            );
          })}
        </div>

        {showCustomInput && (
          <div className="custom-input-overlay">
            <div className="custom-input-modal">
              <h3>Enter your announcement:</h3>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your message here..."
                maxLength={200}
                rows={4}
              />
              <div className="custom-input-buttons">
                <button onClick={handleCustomAnnouncementCancel}>Cancel</button>
                <button 
                  onClick={() => handlePurchase(storeItems.find(item => item.id === 'custom_announcement'))}
                  disabled={!customMessage.trim()}
                >
                  Send ({storeItems.find(item => item.id === 'custom_announcement').price} PP)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;
