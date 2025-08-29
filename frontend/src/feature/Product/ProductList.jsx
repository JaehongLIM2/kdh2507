import { Link, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";

export function ProductList() {
  useEffect(() => {
    import("../../style.css");
  }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page")) || 1;
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [sort, setSort] = useState("recent");
  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import("./css/ProductList.css");
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get(
        `/api/product/list?page=${pageParam}${keyword ? `&keyword=${keyword}` : ""}${category ? `&category=${category}` : ""}${sort ? `&sort=${sort}` : ""}`,
      )
      .then((res) => {
        setProducts(res.data.productList);
        setPageInfo(res.data.pageInfo);
      })
      .finally(() => setLoading(false));
  }, [pageParam, keyword, sort, category]);

  const handlePageClick = (page) => {
    const newParams = {};
    if (keyword) newParams.keyword = keyword;
    if (sort) newParams.sort = sort;
    if (category) newParams.category = category;
    newParams.page = page;
    setSearchParams(newParams);
  };

  function isNewProduct(insertedAt) {
    if (!insertedAt) return false;
    const createdDate = new Date(insertedAt);
    const now = new Date();
    const diffInSeconds = (now.getTime() - createdDate.getTime()) / 1000;
    const secondsIn7Days = 60 * 60 * 24 * 7;
    return diffInSeconds <= secondsIn7Days;
  }

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSort(newSort);
    const newParams = {};
    if (keyword) newParams.keyword = keyword;
    if (category) newParams.category = category;
    newParams.page = 1;
    newParams.sort = newSort;
    setSearchParams(newParams);
  };

  const pageNumbers = [];
  if (pageInfo) {
    for (let i = pageInfo.leftPageNumber; i <= pageInfo.rightPageNumber; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="container" id="product-list-container">
      {/* PC와 모바일을 위한 별도의 헤더를 하나로 통합 */}
      <div className="product-list-header">
        {/*상품 목록*/}
        <h2 className="title">商品一覧</h2>
        <select
          className="sort-select"
          value={sort}
          onChange={handleSortChange}
        >
          {/*<option value="recent">기본순</option>*/}
          {/*<option value="popular">인기순</option>*/}
          {/*<option value="price_asc">가격 낮은순</option>*/}
          {/*<option value="price_desc">가격 높은순</option>*/}
          <option value="recent">おすすめ順</option>
          <option value="popular">人気順</option>
          <option value="price_asc">価格が安い順</option>
          <option value="price_desc">価格が高い順</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="loading-spinner" />
          {/*페이지 로딩 중...*/}
          ページを読み込み中…
        </div>
      ) : products.length === 0 ? (
        // 검색 결과가 없습니다.
        <div className="empty-state">検索結果がありません。</div>
      ) : (
        // <div className="product-grid">
        <ul className="productList">
          {products.map((product) => (
            <li>
              <Link
                to={`/product/view?id=${product.id}`}
                className="product-card"
                key={product.id}
              >
                {product.thumbnailPaths?.length > 0 && (
                  <div className="product-image-wrapper">
                    <img
                      src={product.thumbnailPaths[0].storedPath}
                      alt={product.productName}
                      className="product-image"
                    />
                  </div>
                )}
                <div className="product-info-wrapper">
                  <div className="product-name">{product.productName}</div>
                  <div className="product-price">
                    {product.price.toLocaleString()} 円
                  </div>
                  <div className="product-badges">
                    {isNewProduct(product.insertedAt) && (
                      <span className="new-badge">NEW</span>
                    )}
                    {product.hot && <span className="hot-badge">HOT</span>}
                    {product.quantity === 0 && (
                      <span className="sold-out-badge">SOLD OUT</span>
                    )}
                    {product.quantity > 0 && product.quantity < 5 && (
                      <span className="low-stock-badge">
                        🔥 残り{product.quantity} 点
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        // </div>
      )}

      {/* 페이지네이션 컴포넌트 */}
      <div className="pagination">
        {/*<button
          onClick={() => handlePageClick(pageInfo.leftPageNumber - 1)}
          disabled={pageInfo.leftPageNumber < 6}
          className="pagination-button"
        >
          이전
        </button>

        {Array.from(
          { length: pageInfo.rightPageNumber - pageInfo.leftPageNumber + 1 },
          (_, i) => {
            const page = pageInfo.leftPageNumber + i;
            return (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`pagination-button ${page === pageInfo.currentPageNumber ? "active" : ""}`}
              >
                {page}
              </button>
            );
          },
        )}

        <button
          onClick={() => handlePageClick(pageInfo.rightPageNumber + 1)}
          disabled={pageInfo.rightPageNumber > pageInfo.totalPages - 5}
          className="pagination-button"
        >
          다음
        </button>*/}

        <ul className="join flex justify-center">
          {/* 첫 페이지로 이동 */}
          <li>
            <button
              className="join-item btn btn-sm"
              disabled={pageInfo.currentPageNumber === 1}
              onClick={() => handlePageClick(1)}
              aria-label="First Page"
            >
              &laquo;
            </button>
          </li>
          {/* 10페이지 이전 이동 */}
          <li>
            <button
              className="join-item btn btn-sm"
              disabled={pageInfo.leftPageNumber <= 1}
              onClick={() => handlePageClick(pageInfo.leftPageNumber - 10)}
              aria-label="Previous 10 Pages"
            >
              &#8249;
            </button>
          </li>
          {/* 페이지 번호들 */}
          {pageNumbers.map((pageNumber) => (
            <li key={pageNumber}>
              <button
                className={`join-item btn btn-sm ${
                  pageInfo.currentPageNumber === pageNumber
                    ? "btn-active btn-primary"
                    : ""
                }`}
                onClick={() => handlePageClick(pageNumber)}
                aria-current={
                  pageInfo.currentPageNumber === pageNumber ? "page" : undefined
                }
              >
                {pageNumber}
              </button>
            </li>
          ))}
          {/* 10페이지 이후 이동 */}
          <li>
            <button
              className="join-item btn btn-sm"
              disabled={pageInfo.rightPageNumber >= pageInfo.totalPages}
              onClick={() => handlePageClick(pageInfo.rightPageNumber + 1)}
              aria-label="Next 10 Pages"
            >
              &#8250;
            </button>
          </li>
          {/* 마지막 페이지로 이동 */}
          <li>
            <button
              className="join-item btn btn-sm"
              disabled={pageInfo.currentPageNumber === pageInfo.totalPages}
              onClick={() => handlePageClick(pageInfo.totalPages)}
              aria-label="Last Page"
            >
              &raquo;
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
