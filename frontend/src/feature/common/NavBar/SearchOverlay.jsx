import React, { useEffect, useState } from "react";
import { FiChevronLeft, FiSearch } from "react-icons/fi";
import axios from "axios";

function SearchOverlay({
  open,
  onClose,
  keyword,
  setKeyword,
  onSubmit,
  onSelectCategory,
  categories = [],
}) {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    if (open) {
      const token = localStorage.getItem("token");

      if (token) {
        // 로그인 상태 → 서버에서 가져오기
        axios
          .get("/api/product", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setRecentProducts(res.data))
          .catch((err) => {
            console.error("최근 본 상품 서버 불러오기 실패", err);
            setRecentProducts([]);
          });
      } else {
        // 비로그인 상태 → localStorage에서 가져오기
        try {
          const data = JSON.parse(localStorage.getItem("recentProducts"));
          if (Array.isArray(data)) {
            setRecentProducts(data);
          } else {
            setRecentProducts([]);
          }
        } catch (err) {
          setRecentProducts([]);
        }
      }
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-sheet" onClick={(e) => e.stopPropagation()}>
        {/* 상단 입력줄 */}
        <div className="search-input-row">
          <FiChevronLeft className="search-close" onClick={onClose} />
          <input
            autoFocus
            type="text"
            placeholder="キーワードで検索" // 키워드로 검색
            className="search-wide-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && keyword.trim() !== "") onSubmit();
            }}
          />
          <FiSearch
            className="search-go"
            onClick={() => keyword.trim() !== "" && onSubmit()}
          />
        </div>

        {/* 추천 카테고리 */}
        {categories.length > 0 && (
          <>
            {/*추천 카테고리*/}
            <div className="suggest-title">おすすめカテゴリー</div>
            <div className="suggest-scroll">
              {categories.map((c) => (
                <button
                  key={c.key}
                  className="category-chip"
                  onClick={() => onSelectCategory(c.key)}
                >
                  <span className="chip-thumb">
                    {c.image ? <img src={c.image} alt={c.label} /> : c.fallback}
                  </span>
                  <span className="chip-label">{c.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* 최근 본 상품 */}
        {recentProducts.length > 0 && (
          <>
            {/*최근 본 상품*/}
            <div className="suggest-title">最近チェックした商品</div>
            <div className="recent-products-scroll">
              {recentProducts.map((p) => (
                <a
                  key={p.id}
                  href={`/product/view?id=${p.id}`}
                  className="recent-product-card"
                  onClick={onClose}
                >
                  <img src={p.thumbnail} alt={p.productName} />
                  <span className="recent-name">{p.productName}</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SearchOverlay;
