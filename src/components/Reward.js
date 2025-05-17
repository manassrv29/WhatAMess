import React from 'react';
import './Reward.css';

// --- BLACK THEMED PROFESSIONAL REWARD PAGE (MODERN, ATTRACTIVE) ---
const Reward = () => {
  // Static user data
  const userName = "test11";
  const rewardCoins = 50;
  const rewardHistory = [
    { id: 1, title: 'Delivery Completed', date: '23 Apr 2025', points: 50, type: 'earned' },
    { id: 2, title: 'Reward Redeemed', date: '20 Apr 2025', points: 30, type: 'spent' },
    { id: 3, title: 'Delivery Completed', date: '15 Apr 2025', points: 40, type: 'earned' },
  ];

  return (
    <div className="reward-black-bg">
      <div className="reward-black-card big-reward-box">
        <div className="reward-user-section">
          <div className="reward-user-name">Welcome, <b>{userName}</b></div>
        </div>
        <div className="reward-gift-icon-black">🎁</div>
        <div className="reward-title-black">Congratulations!</div>
        <div className="reward-desc-black">You have <b>{rewardCoins} Reward Coins</b> available.</div>
        <div className="reward-history-section-black">
          <div className="reward-history-title-black">Reward History</div>
          <div className="reward-history-list-black">
            {rewardHistory.map((item, idx) => (
              <div className={`reward-history-item-black ${item.type}`} key={item.id} style={{animationDelay: `${idx * 0.10}s`}}>
                <span>{item.title}</span>
                <span className="reward-history-coins-black">{item.type === 'earned' ? '+' : '-'}{item.points}</span>
              </div>
            ))}
          </div>
        </div>
        <button className="reward-delivery-btn-black">Redeem Coins</button>
      </div>
    </div>
  );
};

export default Reward;