import React, { useState } from 'react';
import GoogleMapStatic from './GoogleMapStatic';
import GoogleDistanceDemo from './GoogleDistanceDemo';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import './StaticDeliveryAssigned.css';

// Static data
const USER_NAME = "Jo Paaji";
const DELIVERY_USER = "Virat";
const ORIGIN = { lat: 30.2687, lng: 77.9935, label: 'Waffle World Clement Town' }; // Waffle World Clement Town
const DEST = { lat: 30.2672, lng: 78.0081, label: 'Graphic Era Dehradun' }; // Graphic Era, Dehradun, India
const STATIC_ETA = '7 min';

const StaticDeliveryAssigned = ({ showPanel, blackTheme }) => {
  const [liveDistance, setLiveDistance] = useState('');
  const [liveEta, setLiveEta] = useState('');

  // Get current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className={blackTheme ? "static-delivery-black-bg" : "static-delivery-container cart-bg-fit wide-delivery"}>
      <div className={blackTheme ? "static-delivery-black-card" : "static-delivery-card cart-box-fit wide-delivery-card"}>
        <h2 className={blackTheme ? "static-delivery-black-title" : "static-delivery-title"}>Delivery Assigned!</h2>
        <p className={blackTheme ? "static-delivery-black-status" : "static-delivery-status"}>Your order from <b>{USER_NAME}</b> has been assigned to nearby user <b>{DELIVERY_USER}</b>.</p>
        <div className={blackTheme ? "static-delivery-black-progress" : "static-delivery-progress"}>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{width: '33%'}}></div>
          </div>
          <div className="progress-labels">
            <span className="progress-label active">Assigned</span>
            <span className="progress-label">On the way</span>
            <span className="progress-label">Delivered</span>
          </div>
        </div>
        <div className={blackTheme ? "static-delivery-black-row-flex-equal" : "static-delivery-row-flex-equal"}>
          <div className={blackTheme ? "static-delivery-black-map-section static-delivery-black-map-small static-delivery-black-equal-box" : "static-delivery-map-section wide-map-section static-delivery-map-small static-delivery-equal-box"}>
            <div className="map-icon-bar"><FaMapMarkerAlt size={22} color="#f9d923" style={{marginBottom: 8}} /></div>
            <GoogleMapStatic />
          </div>
          <div className={blackTheme ? "static-delivery-black-datetime static-delivery-black-equal-box" : "static-delivery-datetime static-delivery-equal-box"}>
            <div className="black-date-label"><FaCalendarAlt style={{marginRight: 7, marginBottom: -3}}/>Date</div>
            <div className="black-date-value">{dateStr}</div>
            <div className="black-time-label"><FaClock style={{marginRight: 7, marginBottom: -3}}/>Time</div>
            <div className="black-time-value">{timeStr}</div>
          </div>
          <div className={blackTheme ? "static-delivery-black-info static-delivery-black-info-side static-delivery-black-equal-box" : "static-delivery-info wide-delivery-info static-delivery-info-side static-delivery-equal-box"}>
            <GoogleDistanceDemo onDistanceChange={setLiveDistance} onEtaChange={setLiveEta} blackTheme={blackTheme} />
          </div>
        </div>
        {showPanel && (
          <div className={blackTheme ? "delivery-black-panel static-delivery-black-panel-side" : "delivery-panel cart-panel-fit wide-panel static-delivery-panel-side"}>
            <h3 className={blackTheme ? "delivery-black-panel-title" : undefined}>Delivery Partner Panel</h3>
            <div className={blackTheme ? "delivery-black-panel-grid" : "delivery-panel-grid"}>
              <div className={blackTheme ? "black-panel-info-col" : "panel-info-col"}>
                <span className={blackTheme ? "black-panel-label" : "panel-label"}>Pickup</span>
                <span className={blackTheme ? "black-panel-value" : "panel-value"}>Jo Paaji</span>
              </div>
              <div className={blackTheme ? "black-panel-info-col" : "panel-info-col"}>
                <span className={blackTheme ? "black-panel-label" : "panel-label"}>Drop</span>
                <span className={blackTheme ? "black-panel-value" : "panel-value"}>{DEST.label}</span>
              </div>
              <div className={blackTheme ? "black-panel-info-col" : "panel-info-col"}>
                <span className={blackTheme ? "black-panel-label" : "panel-label"}>Assigned To</span>
                <span className={blackTheme ? "black-panel-value" : "panel-value"}>{DELIVERY_USER}</span>
              </div>
              <div className={blackTheme ? "black-panel-info-col" : "panel-info-col"}>
                <span className={blackTheme ? "black-panel-label" : "panel-label"}>Contact</span>
                <span className={blackTheme ? "black-panel-value" : "panel-value"}>+91-9876543210</span>
              </div>
              <div className={blackTheme ? "black-panel-info-col" : "panel-info-col"}>
                <span className={blackTheme ? "black-panel-label" : "panel-label"}>Instructions</span>
                <span className={blackTheme ? "black-panel-value" : "panel-value"}>Deliver to hostel gate, call on arrival</span>
              </div>
              <div className={blackTheme ? "black-panel-info-col" : "panel-info-col"}>
                <span className={blackTheme ? "black-panel-label" : "panel-label"}>Distance</span>
                <span className={blackTheme ? "black-panel-value" : "panel-value"}>{liveDistance ? liveDistance : '...'}</span>
              </div>
              <div className={blackTheme ? "black-panel-info-col" : "panel-info-col"}>
                <span className={blackTheme ? "black-panel-label" : "panel-label"}>ETA</span>
                <span className={blackTheme ? "black-panel-value" : "panel-value"}>{liveEta ? liveEta : '...'}</span>
              </div>
              <div className={blackTheme ? "black-panel-info-col" : "panel-info-col"}>
                <span className={blackTheme ? "black-panel-label" : "panel-label"}>Status</span>
                <span className={blackTheme ? "black-panel-value black-status-ongoing" : "panel-value status-ongoing"}>Ongoing</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaticDeliveryAssigned;
