import React, { useState } from 'react';
import './DeliveryRating.css';

const fields = [
  { key: 'timeliness', label: 'Timeliness' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'communication', label: 'Communication' },
  { key: 'overall', label: 'Overall Experience' }
];

const DeliveryRating = ({ onSubmit }) => {
  const [ratings, setRatings] = useState({ timeliness: 0, packaging: 0, communication: 0, overall: 0 });
  const [comment, setComment] = useState('');

  const handleStar = (field, value) => {
    setRatings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(ratings, comment);
  };

  return (
    <div className="rating-orange-container">
      <div className="rating-orange-card">
        <h2 className="rating-title">Rate Your Delivery</h2>
        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div className="rating-field" key={field.key}>
              <span className="rating-label">{field.label}</span>
              <span className="rating-stars">
                {[1,2,3,4,5].map(star => (
                  <span
                    key={star}
                    className={star <= ratings[field.key] ? 'star filled' : 'star'}
                    onClick={() => handleStar(field.key, star)}
                    role="button"
                    aria-label={`Rate ${star} stars`}
                  >★</span>
                ))}
              </span>
            </div>
          ))}
          <textarea
            className="rating-comment"
            placeholder="Leave a comment (optional)"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button className="rating-submit-btn orange" type="submit">Submit Rating</button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryRating;
