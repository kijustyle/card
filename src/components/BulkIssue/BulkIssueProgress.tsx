import React from 'react';
import './BulkIssueProgress.css';

const BulkIssueProgress = ({ 
  isVisible, 
  currentUser, 
  completedCount, 
  totalCount, 
  currentProgress 
}) => {
  if (!isVisible) return null;

  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    
    <div className="bulk-progress-overlay">
      <div className="center-logo-container">
      </div>
      <div className="bulk-progress-container">
        {/* 리퀴드 글래스 카드 */}
        <div className="progress-card">
          <div className="progress-header">
            <div className="progress-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
                  fill="currentColor"
                />
              </svg>
            </div>
            <h3>카드 발급 중</h3>
          </div>

          {/* 현재 처리 중인 사용자 */}
          <div className="current-user">
            <span className="user-name">{currentUser}</span>
            <span className="user-status">처리 중...</span>
          </div>

          {/* 프로그레스 바 */}
          <div className="progress-wrapper">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="progress-shine"></div>
              </div>
            </div>
            <div className="progress-text">
              카드 발급 진행 : <strong>{completedCount} / {totalCount}</strong>
            </div>
          </div>

          {/* 펄스 애니메이션 */}
          <div className="pulse-container">
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default BulkIssueProgress;