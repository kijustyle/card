import React from 'react';

export function CardTemplate({ 
  name, 
  position, 
  department, 
  employeeId, 
  photo, 
  issueDate 
}) {
  // Base64 이미지 URL 생성
  const getImageUrl = (photoData) => {
    if (!photoData) return null;
    
    // 이미 data URL 형태라면 그대로 사용
    if (typeof photoData === 'string' && photoData.startsWith('data:')) {
      return photoData;
    }
    
    // Base64 문자열이라면 data URL로 변환
    if (typeof photoData === 'string') {
      return `data:image/jpeg;base64,${photoData}`;
    }
    
    return null;
  };

  const imageUrl = getImageUrl(photo);

  return (
    <div className="w-64 h-96 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg overflow-hidden">
      <div className="relative p-6 h-full flex flex-col">
        {/* 상단 사진 영역 */}
        <div className="flex justify-center mb-6 mt-4">
          <div className="w-32 h-40 bg-white/30 rounded-lg overflow-hidden flex items-center justify-center" 
            style={{ minWidth: '128px', minHeight: '160px', maxWidth: '128px', maxHeight: '160px' }}>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={name} 
                className="w-full h-full object-cover"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  console.error('이미지 로드 실패:', imageUrl);
                  e.target.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('이미지 로드 성공:', name);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16" fill="#666666" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* 중앙 정보 영역 */}
        <div className="text-center mb-6 flex-1">
          <h3 className="text-xl font-bold mb-2">{name}</h3>
          <p className="text-red-100 text-base mb-2">{department}</p>
          <p className="text-red-100 text-sm">{employeeId}</p>
        </div>

        {/* 하단 발급일 */}
        <div className="text-center mt-auto">
          <p className="text-xs text-red-200">발급일: {issueDate}</p>
        </div>
      </div>
    </div>
  );
}