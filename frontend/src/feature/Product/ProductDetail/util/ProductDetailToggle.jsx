import React, { useRef, useState, useEffect } from "react";

export default function ProductDetailToggle({ detailImagePaths }) {
  const detailRef = useRef(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showDetailToggle, setShowDetailToggle] = useState(false);

  const COLLAPSED_MAX = 1200; // 데스크톱 기준

  const recheckDetailHeight = () => {
    if (detailRef.current) {
      setShowDetailToggle(detailRef.current.scrollHeight > COLLAPSED_MAX);
    }
  };

  useEffect(() => {
    recheckDetailHeight();
  }, [detailImagePaths]);

  if (!detailImagePaths) return null;

  return (
    <div className="product-body-section">
      <div
        ref={detailRef}
        className={`detail-collapsible ${isDetailOpen ? "is-open" : "is-closed"}`}
      >
        <div className="detail-images-container">
          {detailImagePaths.map((path, index) => (
            <img
              key={index}
              src={path}
              alt={`상세 이미지 ${index + 1}`}
              className="product-detail-image"
              onLoad={recheckDetailHeight}
            />
          ))}
        </div>
      </div>

      {showDetailToggle && !isDetailOpen && (
        <div className="detail-toggle-bottom">
          <button
            type="button"
            className="detail-toggle-btn-out"
            onClick={() => setIsDetailOpen(true)}
          >
            {/*상세정보 펼쳐보기*/}
            詳細を見る
          </button>
        </div>
      )}

      {showDetailToggle && isDetailOpen && (
        <div className="detail-toggle-bottom">
          <button
            type="button"
            className="detail-toggle-btn-out"
            onClick={() => setIsDetailOpen(false)}
          >
            {/*상세정보 접기*/}
            詳細情報を閉じる
          </button>
        </div>
      )}
    </div>
  );
}
