import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router";
import NoticeSection from "./util/NoticeSection.jsx";
import ProductComment from "./ProductComment.jsx";
import { useContext, useEffect, useState } from "react";
import BuyButton from "./util/BuyButton.jsx";
import CartAdded from "./util/CartAdded.jsx";
import { useCart } from "../CartContext.jsx";
import {
  handleBuyButton,
  handleBuyCurrentProductOnly,
  handleCartButton,
  handleGoToCartWithCurrenProduct,
} from "./util/ProductDetailUtilButton.jsx";
import ReviewStats from "./util/ReviewStats.jsx";
import axios from "axios";
import ScrollToTopButton from "./util/ScrollToTopButton.jsx";
import ShareModal from "./util/ShareModal.jsx";
import { RxShare1 } from "react-icons/rx";
import LikeButton from "./util/LikeButton.jsx";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import ProductDetailToggle from "./util/ProductDetailToggle.jsx";
import RecommendedProduct from "./util/RecommendedProduct.jsx";
import { toast } from "sonner";

export function ProductDetail() {
  useEffect(() => {
    import("../css/ProductList.css");
    import("../css/ProductDetail.css");
  }, []);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { setCartCount } = useCart();
  const [reviewChanged, setReviewChanged] = useState(false);
  const [showCartConfirmModal, setShowCartConfirmModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const { user, isAdmin } = useContext(AuthenticationContext);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();

  useEffect(() => {
    if (!product) return;
    const token = localStorage.getItem("token");

    if (token) {
      // 로그인 상태 → 서버 저장
      axios
        .post(`/api/product/${product.id}`, null, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((err) => {
          // 최근 본 상품 서버 저장 실패
          console.error(
            "最近チェックした商品をサーバーに保存できませんでした。",
            err,
          );
        });
    } else {
      // 비로그인 상태 → localStorage 저장
      const productData = {
        id: product.id,
        productName: product.productName,
        thumbnail:
          product.thumbnailPaths?.find((t) => t.isMain)?.storedPath ??
          product.thumbnailPaths?.[0]?.storedPath,
        price: product.price,
      };
      let recent = JSON.parse(localStorage.getItem("recentProducts")) || [];
      // 중복 제거
      recent = recent.filter((p) => p.id !== productData.id);
      // 최신 상품 맨 앞에 추가
      recent.unshift(productData);
      // 최대 10개까지만 유지
      if (recent.length > 10) recent.pop();
      localStorage.setItem("recentProducts", JSON.stringify(recent));
    }
  }, [product]);

  useEffect(() => {
    axios
      .get(`/api/product/view?id=${id}`)
      .then((res) => {
        setProduct(res.data);
        const firstThumb = res.data.thumbnailPaths?.[0];
        if (firstThumb) {
          setSelectedThumbnail(firstThumb.storedPath);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  // 추천상품 최대 6개
  useEffect(() => {
    if (product?.category) {
      axios
        .get(`/api/product/best?category=${product.category}&limit=6`)
        .then((res) => {
          // 현재 상품은 제외
          const filtered = res.data.filter((p) => p.id !== product.id);
          setRelatedProducts(filtered);
        })
        .catch(console.error);
    }
  }, [product]);

  if (!product) {
    return <Spinner />;
  }

  function handleDeleteButton() {
    // 정말 삭제하시겠습니까?
    if (!window.confirm("本当に削除しますか？")) return;
    axios
      .delete(`/api/product/delete?id=${id}`)
      .then(() => {
        // 삭제되었습니다.
        toast.success("削除されました。");
        navigate("/product/list");
      })
      .catch(() => {
        // 삭제 실패했습니다.
        toast.error("削除に失敗しました。");
      })
      .finally(() => {});
  }

  function handleEditButton() {
    navigate(`/product/edit?id=${id}`);
  }

  // 썸네일은 isMain == true 인 항목의 storedPath 사용
  const thumbnail =
    product.thumbnailPaths?.find((t) => t.isMain)?.storedPath ??
    product.thumbnailPaths?.[0]?.storedPath;

  function handleQuestionButton() {
    setIsProcessing(true);
    navigate(`/qna/add/${product.id}`);
  }

  return (
    <div className="container">
      <div className="product-detail-layout">
        <div className="product-main-content">
          <div className="thumbnail-section">
            {selectedThumbnail && (
              <img
                className="product-main-thumbnail"
                src={selectedThumbnail}
                alt="대표 썸네일"
              />
            )}
            <div className="thumbnail-list">
              {product.thumbnailPaths?.map((thumb, idx) => (
                <img
                  key={idx}
                  src={thumb.storedPath}
                  alt={`썸네일 ${idx + 1}`}
                  className={`small-thumbnail ${
                    selectedThumbnail === thumb.storedPath ? "active" : ""
                  }`}
                  onClick={() => setSelectedThumbnail(thumb.storedPath)}
                />
              ))}
            </div>
          </div>

          <div className="product-info-section">
            <div className="product-title-header">
              <h2 className="product-name-title">{product.productName}</h2>
              <div className="product-badges-detail">
                {(() => {
                  const insertedAt = new Date(product.insertedAt);
                  const now = new Date();
                  const diffInSeconds = (now - insertedAt) / 1000;
                  const isNew = diffInSeconds <= 60 * 60 * 24 * 7;
                  return isNew ? <span className="new-badge">NEW</span> : null;
                })()}
                {product.hot && <span className="hot-badge">HOT</span>}
                {product.quantity === 0 && (
                  <span className="sold-out-badge">SOLD OUT</span>
                )}
                {product.quantity > 0 && product.quantity < 5 && (
                  <span className="low-stock-badge">
                    🔥 残り{product.quantity} 個
                  </span>
                )}
              </div>
              <div className="product-actions universal-actions">
                <RxShare1
                  className="action-icon"
                  onClick={() => setShowShareModal(true)}
                  title="공유하기"
                />
                <LikeButton size={28} productId={product.id} />
              </div>
            </div>

            <p className="product-price-detail">
              {product.price.toLocaleString()} 円
            </p>

            <hr className="divider" />

            <p
              className="product-info-text"
              dangerouslySetInnerHTML={{ __html: product.info }}
            ></p>

            <hr className="divider" />

            {product.quantity > 0 && (
              <>
                {product.options?.length > 0 && (
                  <div className="option-select-box">
                    {/*선택*/}
                    <label>選択 :</label>
                    <select
                      onChange={(e) => {
                        const selected = product.options?.find(
                          (opt) => opt.optionName === e.target.value,
                        );
                        setSelectedOption(selected);
                      }}
                    >
                      {/*옵션을 선택하세요.*/}
                      <option value="">オプションを選択してください。</option>
                      {product.options?.map((opt, idx) => (
                        <option key={idx} value={opt.optionName}>
                          {opt.optionName} - {opt.price.toLocaleString()} 円
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="quantity-control-box">
                  {/*수량*/}
                  <span className="quantity-label">数量</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        if (val > product.quantity) {
                          toast.error(
                            // 현재 재고 부족으로 ~ 개 이상 구매할 수 없습니다.
                            `在庫不足のため ${product.quantity}点以上は購入できません。`,
                          );
                        }
                        setQuantity(
                          Math.max(1, Math.min(product.quantity, val)),
                        );
                      } else {
                        setQuantity(1);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) =>
                        Math.min(product.quantity, prev + 1),
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <div className="total-price">
                  {/*총 가격*/}
                  合計 :{" "}
                  {(
                    quantity *
                    (selectedOption ? selectedOption.price : product.price)
                  ).toLocaleString()}
                  円（税込）
                </div>
              </>
            )}

            <div className="button-group-wrapper">
              {product.quantity === 0 ? (
                <button disabled className="sold-out-button">
                  {/*품절된 상품입니다*/}
                  在庫切れの商品です。
                </button>
              ) : (
                <div className="action-buttons-group">
                  <button
                    onClick={() =>
                      handleBuyButton({
                        product,
                        selectedOption,
                        quantity,
                        thumbnail,
                        setShowCartConfirmModal,
                        navigate,
                        setCartItems,
                      })
                    }
                    className="btn buy-button"
                  >
                    {/*구매하기*/}
                    購入する
                  </button>
                  <button
                    onClick={() =>
                      handleCartButton({
                        product,
                        selectedOption,
                        quantity,
                        thumbnail,
                        setShowModal,
                        setCartCount,
                      })
                    }
                    className="btn cart-button"
                  >
                    {/*장바구니*/}
                    カート
                  </button>
                </div>
              )}
              {user !== null && isAdmin && (
                <>
                  <div className="flex justify-end admin-buttons">
                    <button
                      className="btn btn-info w-25"
                      onClick={handleEditButton}
                    >
                      {/*수정*/}
                      修正
                    </button>
                    <button
                      className="btn btn-error w-25"
                      onClick={handleDeleteButton}
                    >
                      {/*삭제*/}
                      削除
                    </button>
                  </div>
                </>
              )}
              <div className="flex justify-end me-5">
                <button
                  className="btn btn-info mt-3"
                  onClick={handleQuestionButton}
                  disabled={isProcessing}
                >
                  {/*문의하기*/}
                  お問い合わせ
                </button>
              </div>
              {/*
    todo : faq 페이지, 추천해주는 질문 몇개를 골라서 3개 이상 답하도록

      <div>
        <h2>QnA</h2>

        <div>
          \
          todo : 질문자 아이디나 닉네임 공개할지 여부를 정하고 이후 결정
          <div>
            <img
              src=""
              alt=""
              style={{ width: "50px", height: "50px", backgroundColor: "#ccc" }}
            />
            <span>질문자 이름(DB 연결 예정)</span>
          </div>

          <div>
            <h5>
              <span>Q : </span> 상품 무게가 어느 정도 되나요? (질문 제목)
            </h5>
            <p>A : </p>
            <textarea
              style={{
                width: "100%",
                height: "100px",
                resize: "none",
                overflow: "hidden",
                border: "1px solid #ffffff",
                borderRadius: "20px",
              }}
              readOnly
              value="네 고객님, 상품 무게가 어느 정도 나가는지에 대해 질문 주셨는데요,
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias
              aliquid animi autem beatae deleniti eum incidunt labore nisi
              officia quibusdam quo reiciendis sed suscipit, temporibus
              voluptate? Mollitia nam obcaecati perferendis."
            />
          </div>
        </div>
      </div>*/}
            </div>
          </div>
        </div>

        {/* 상세정보 / 구매평 탭 네비게이션 */}
        <div className="product-tab-nav" id="productTabNav">
          <button
            onClick={() => {
              const el = document.getElementById("detail-section");
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 150; // 150px 위로 보정
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
          >
            {/*상세정보*/}
            詳細情報
          </button>

          <button
            onClick={() => {
              const el = document.getElementById("review-section");
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 150; // 150px 위로 보정
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
          >
            {/*리뷰*/}
            商品レビュー({reviewCount})
          </button>
        </div>
        <hr />
        <div className="product-body-section">
          <div id="detail-section">
            <ProductDetailToggle detailImagePaths={product.detailImagePaths} />
          </div>
          <NoticeSection />
          <hr className="divider" />

          {/* 리뷰 통계 (그래프) */}
          <div id="review-section">
            <ReviewStats
              productId={product.id}
              refreshTrigger={reviewChanged}
            />
          </div>

          {/* 리뷰 코멘트 */}
          <ProductComment
            productId={product.id}
            onReviewChange={() => setReviewChanged((prev) => !prev)}
            onReviewCountChange={(count) => setReviewCount(count)}
          />
        </div>
        {/*<hr className="divider" />*/}
        <RecommendedProduct products={relatedProducts} />
      </div>
      <CartAdded show={showModal} onHide={() => setShowModal(false)} />
      <BuyButton
        show={showCartConfirmModal}
        onHide={() => setShowCartConfirmModal(false)}
        onOnlyBuy={() =>
          handleBuyCurrentProductOnly({
            product,
            selectedOption,
            quantity,
            thumbnail,
            setShowCartConfirmModal,
            navigate,
          })
        }
        onMoveToCart={() =>
          handleGoToCartWithCurrenProduct({
            product,
            selectedOption,
            quantity,
            thumbnail,
            navigate,
            setShowCartConfirmModal,
          })
        }
      />
      <ScrollToTopButton />
      <ShareModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={window.location.href}
        productName={product.productName}
      />
    </div>
  );
}
