import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

const CATEGORIES = [
  "전체",
  "outer",
  "top",
  "bottom",
  "hat",
  "bag",
  "shoes",
  "socks",
  "belt",
];
const CATEGORY_LABELS = {
  전체: "すべて",
  outer: "アウター",
  top: "トップス",
  bottom: "ボトムス",
  hat: "帽子",
  bag: "バッグ",
  shoes: "シューズ",
  socks: "ソックス",
  belt: "ベルト",
};

function BestProductSection() {
  const [bestProducts, setBestProducts] = useState([]);
  const [selected, setSelected] = useState("전체");
  const [loading, setLoading] = useState(false);
  const [catExpanded, setCatExpanded] = useState(false);
  const navigate = useNavigate();

  const cacheRef = useRef({});
  const allRef = useRef([]);
  useEffect(() => {
    import("./BestProductSection.css");
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get("/api/product/best")
      .then((res) => {
        if (!mounted) return;
        const list = res.data || [];
        cacheRef.current["전체"] = list;
        allRef.current = list;
        setBestProducts(list);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setBestProducts([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (selected === "전체") {
      if (cacheRef.current["전체"]) {
        setBestProducts(cacheRef.current["전체"]);
        return;
      }
    }

    if (cacheRef.current[selected]) {
      setBestProducts(cacheRef.current[selected]);
      return;
    }

    setLoading(true);
    axios
      .get("/api/product/best", {
        params: selected === "전체" ? {} : { category: selected },
      })
      .then((res) => {
        const list = res.data || [];
        cacheRef.current[selected] = list;
        setBestProducts(list);
      })
      .catch((err) => {
        console.warn(
          // "백엔드 파라미터 미지원 또는 오류. 프론트 필터로 대체.",
          "バックエンドが未対応のため、フロント側でフィルタリングします。",
          err?.response?.status,
        );
        if (selected === "전체") {
          setBestProducts(allRef.current || []);
        } else {
          const filtered = (allRef.current || []).filter(
            (p) => p.category === selected,
          );
          setBestProducts(filtered);
        }
      })
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="best-product-section">
      {/*베스트*/}
      <h3 className="best-title">ベスト</h3>

      {/* 카테고리 탭 */}
      <div className={`best-category-tabs ${catExpanded ? "expanded" : ""}`}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`best-tag ${selected === cat ? "active" : ""}`}
            onClick={() => setSelected(cat)}
            type="button"
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {loading ? (
        // 로딩중
        <div className="best-loading">読み込み中…</div>
      ) : (
        <div className="best-product-list">
          {bestProducts.map((product) => {
            const rating = Number(product.averageRating ?? 0).toFixed(1);
            const reviews = product.reviewCount ?? 0;
            return (
              <div
                className="best-product-card"
                key={product.id}
                onClick={() => navigate(`/product/view?id=${product.id}`)}
              >
                <img
                  src={product.thumbnailUrl}
                  alt={product.productName}
                  className="best-product-img"
                />
                <div className="best-product-name">{product.productName}</div>
                <div className="best-product-price">
                  {product.price.toLocaleString()} 円
                </div>
                <div className="best-product-rating">
                  ⭐ {rating} 点 ({reviews} 件)
                </div>
              </div>
            );
          })}
          {bestProducts.length === 0 && !loading && (
            <div className="best-empty">
              {/*해당 카테고리의 베스트 상품이 없습니다.*/}
              該当カテゴリーのベスト商品はありません。
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BestProductSection;
