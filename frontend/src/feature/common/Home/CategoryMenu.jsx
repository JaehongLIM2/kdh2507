import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const categories = [
  { name: "アウター", value: "outer", image: "/CategoryImage/outer.png" },
  { name: "トップス", value: "top", image: "/CategoryImage/top.png" },
  { name: "ボトムス", value: "bottom", image: "/CategoryImage/bottom.png" },
  { name: "帽子", value: "hat", image: "/CategoryImage/hat.png" },
  { name: "バッグ", value: "bag", image: "/CategoryImage/bag.png" },
  { name: "シューズ", value: "shoes", image: "/CategoryImage/shoes.png" },
  { name: "ソックス", value: "socks", image: "/CategoryImage/socks.png" },
  { name: "ベルト", value: "belt", image: "/CategoryImage/belt.png" },
];

function CategoryMenu() {
  useEffect(() => {
    import("./CategoryMenu.css");
  }, []);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const handleScrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(200, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: step, behavior: "smooth" });
  };

  const handleScrollLeft = () => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(200, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: -step, behavior: "smooth" });
  };

  const handleClick = (categoryValue) => {
    navigate(`/product/list?category=${encodeURIComponent(categoryValue)}`);
  };

  return (
    <div className="category-menu-wrapper">
      {/*카테고리별 상품찾기*/}
      <h3 className="category-title">カテゴリーから探す</h3>

      {/* 스크롤 영역 */}
      <div className="category-list-scroll" ref={scrollRef}>
        {categories.map((cat, idx) => (
          <div
            className="category-item"
            key={idx}
            onClick={() => handleClick(cat.value)}
          >
            <img src={cat.image} alt={cat.name} className="category-img" />
            <div className="category-label">{cat.name}</div>
          </div>
        ))}
      </div>

      {/* 작은 화면에서만 보이는 좌/우 스크롤 버튼 */}
      <button
        type="button"
        className="cat-scroll-btn left"
        aria-label="왼쪽으로 이동"
        onClick={handleScrollLeft}
      >
        ‹
      </button>
      <button
        type="button"
        className="cat-scroll-btn right"
        aria-label="오른쪽으로 이동"
        onClick={handleScrollRight}
      >
        ›
      </button>
    </div>
  );
}

export default CategoryMenu;
