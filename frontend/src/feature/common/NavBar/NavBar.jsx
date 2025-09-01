import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AuthenticationContext } from "../AuthenticationContextProvider.jsx";
import {
  FiChevronLeft,
  FiMenu,
  FiSearch,
  FiShoppingCart,
  FiUser,
} from "react-icons/fi";
import NavLeft from "./NavLeft.jsx";
import NavRight from "./NavRight.jsx";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import SearchOverlay from "./SearchOverlay.jsx";
import { useAlertWebSocket } from "../../alert/alertContext.jsx";

function NavBar(props) {
  useEffect(() => {
    import("./Navbar.css");
  }, []);
  const [showMobileCategory, setShowMobileCategory] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useContext(AuthenticationContext);
  const [showSearch, setShowSearch] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const { alertCount, sendTestAlert } = useAlertWebSocket();

  // 추천 카테고리
  const RECO_CATEGORIES = [
    { label: "シューズ", key: "shoes", image: "/CategoryImage/shoes.png" },
    { label: "帽子", key: "hat", image: "/CategoryImage/hat.png" },
    { label: "バッグ", key: "bag", image: "/CategoryImage/bag.png" },
    // { label: "アウター", key: "outer", image: "/CategoryImage/outer.png" },
    { label: "トップス", key: "top", image: "/CategoryImage/top.png" },
    // { label: "ボトムス", key: "bottom", image: "/CategoryImage/bottom.png" },
    { label: "ソックス", key: "socks", image: "/CategoryImage/socks.png" },
    { label: "ベルト", key: "belt", image: "/CategoryImage/belt.png" },
  ];

  // 카테고리 키 → 한글/영문 별칭들
  const CATEGORY_ALIASES = {
    outer: ["outer", "겉옷", "아우터", "자켓", "코트", "패딩", "가디건"],
    top: [
      "top",
      "상의",
      "티",
      "반팔",
      "긴팔",
      "맨투맨",
      "후드",
      "셔츠",
      "니트",
    ],
    bottom: ["bottom", "하의", "바지", "청바지", "데님", "슬랙스", "트레이닝"],
    hat: ["hat", "모자", "캡", "버킷햇", "비니"],
    bag: ["bag", "가방", "백", "백팩", "토트", "크로스백", "숄더백"],
    shoes: ["shoes", "신발", "스니커즈", "구두", "샌들", "부츠", "로퍼"],
    socks: ["socks", "양말"],
    belt: ["belt", "벨트", "허리띠"],
  };

  // 카테고리명과 별칭 매칭시 소문자변환 및 공백제거
  const normalize = (s) => s.replace(/\s+/g, "").toLowerCase();

  // 입력문구에서 별칭(카테고리)이 포함되면 매칭
  const resolveCategory = (raw) => {
    const q = normalize(raw);
    for (const [cat, aliases] of Object.entries(CATEGORY_ALIASES)) {
      for (const a of aliases) {
        if (q.includes(normalize(a))) return cat;
      }
    }
    return null;
  };

  // 카테고리 한글로 검색 가능하도록.(모바일/데스크톱)
  const routeSearch = () => {
    const q = keyword.trim();
    if (!q) return;

    const cat = resolveCategory(q);
    if (cat) {
      const params = new URLSearchParams(location.search);
      params.set("category", cat);
      if (!params.get("sort")) params.set("sort", "recent");
      navigate(`/product/list?${params.toString()}`);
    } else {
      navigate(`/product/list?keyword=${encodeURIComponent(q)}`);
    }

    setKeyword("");
    setShowSearch(false);
  };

  const submitSearch = routeSearch;

  const handleMobileSearch = () => {
    routeSearch();
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      const isMenuClick = menuRef.current && menuRef.current.contains(e.target);
      const isHamburgerClick = e.target.closest(".hamburger-icon");

      if (!isMenuClick && !isHamburgerClick) {
        setIsMobileMenuOpen(false);
        setShowMobileCategory(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleCategoryClick = (category) => {
    const params = new URLSearchParams(location.search);
    params.set("category", category);
    if (!params.get("sort")) {
      params.set("sort", "recent");
    }
    navigate(`/product/list?${params.toString()}`);
    setShowMobileCategory(false);
    setIsMobileMenuOpen(false);
  };

  const goCategory = (catKey) => {
    const params = new URLSearchParams(location.search);
    params.set("category", catKey);
    if (!params.get("sort")) params.set("sort", "recent");
    navigate(`/product/list?${params.toString()}`);
    setShowSearch(false);
  };
  // SEND_DEST로 파일 전송
  const sendMessage = () => {
    sendTestAlert(); // Context 함수 사용
  };
  const isRootPath = location.pathname === "/";
  return (
    <>
      <nav className={`navbar-container ${isRootPath && "mainPage"} `}>
        <div className="navbar-inner">
          {/* 모바일 메뉴 아이콘 */}
          <FiMenu
            className={`hamburger-icon ${isRootPath ? "hide-on-root" : ""}`}
            onClick={() =>
              setIsMobileMenuOpen((prev) => {
                const next = !prev;
                if (!next) setShowMobileCategory(false);
                return next;
              })
            }
          />
          <div className="navbar-center">
            <Link to="/Home" className="navbar-logo">
              {/*코데헌*/}
              <img src="/logo/kdh.png" style={{ width: "80px" }} />
            </Link>
          </div>
          {/*왼쪽 메뉴*/}
          <NavLeft
            user={user}
            isAdmin={isAdmin}
            handleCategoryClick={handleCategoryClick}
            isRootPath={isRootPath}
          />
          {/* 오른쪽 아이콘 */}
          <NavRight
            alertidcator={alertCount}
            onSearchToggle={() => setShowSearch((prev) => !prev)}
            isRootPath={isRootPath}
          />
        </div>
        {showSearch && (
          <SearchOverlay
            open={showSearch}
            onClose={() => setShowSearch(false)}
            keyword={keyword}
            setKeyword={setKeyword}
            onSubmit={submitSearch}
            onSelectCategory={goCategory}
            categories={RECO_CATEGORIES}
          />
        )}
      </nav>
      {/* 모바일 메뉴 드롭다운 */}
      {isMobileMenuOpen && (
        <div className="mobile-menu" ref={menuRef}>
          <div className="mobile-search-form">
            <input
              type="text"
              placeholder="キーワードで検索" // 키워드로 검색
              className="mobile-search-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleMobileSearch();
              }}
            />
            <FiSearch
              className="mobile-search-icon"
              onClick={handleMobileSearch}
            />
          </div>
          {user !== null && (
            <Link
              to={`/member?id=${user.id}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn btn-ghost w-full justify-start text-left text-xl"
            >
              {user.name}
            </Link>
          )}

          <div>
            <div
              className="btn btn-sm btn-ghost text-left cursor-pointer text-xl"
              onClick={() => setShowMobileCategory((prev) => !prev)}
            >
              {/*모든상품*/}
              全商品
            </div>
            {showMobileCategory && (
              <div className="mobile-category-list">
                <button
                  className="text-lg btn btn-sm btn-ghost text-left cursor-pointer"
                  onClick={() => handleCategoryClick("")}
                >
                  {/*전체*/}
                  すべて
                </button>
                <button
                  className="text-lg btn btn-sm btn-ghost text-left cursor-pointer"
                  onClick={() => handleCategoryClick("outer")}
                >
                  {/*겉옷*/}
                  アウター
                </button>
                <button
                  className="text-lg btn btn-sm btn-ghost text-left cursor-pointer"
                  onClick={() => handleCategoryClick("top")}
                >
                  {/*상의*/}
                  トップス
                </button>
                <button
                  className="text-lg btn btn-sm btn-ghost text-left cursor-pointer"
                  onClick={() => handleCategoryClick("bottom")}
                >
                  {/*하의*/}
                  ボトムス
                </button>
                <button
                  className="text-lg btn btn-sm btn-ghost text-left cursor-pointer"
                  onClick={() => handleCategoryClick("hat")}
                >
                  {/*모자*/}
                  帽子
                </button>
                <button
                  className="text-lg btn btn-sm btn-ghost text-left cursor-pointer"
                  onClick={() => handleCategoryClick("bag")}
                >
                  {/*가방*/}
                  バッグ
                </button>
                <button
                  className="text-lg btn btn-sm btn-ghost text-left cursor-pointer"
                  onClick={() => handleCategoryClick("shoes")}
                >
                  {/*신발*/}
                  シューズ
                </button>
                <button
                  className="text-lg btn btn-sm btn-ghost text-left cursor-pointer"
                  onClick={() => handleCategoryClick("socks")}
                >
                  {/*양말*/}
                  ソックス
                </button>
                <button
                  className="text-lg btn btn-sm btn-ghost text-left cursor-pointer"
                  onClick={() => handleCategoryClick("belt")}
                >
                  {/*벨트*/}
                  ベルト
                </button>
              </div>
            )}
          </div>
          {user === null && (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn btn-ghost w-full justify-start text-left text-xl"
            >
              {/*로그인*/}
              ログイン
            </Link>
          )}
          {user !== null && (
            <Link
              to="/logout"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn btn-ghost w-full justify-start text-left text-xl"
            >
              {/*로그아웃*/}
              ログアウト
            </Link>
          )}
          {user !== null && isAdmin && (
            <Link
              to="/member/list"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn btn-ghost w-full justify-start text-left text-xl"
            >
              {/*회원목록*/}
              会員一覧
            </Link>
          )}
          {user === null && (
            <Link
              to="/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn btn-ghost w-full justify-start text-left text-xl"
            >
              {/*회원가입*/}
              会員登録
            </Link>
          )}

          {user !== null && (
            <Link
              to="/qna/list"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn btn-ghost w-full justify-start text-left text-xl"
            >
              {/*문의 내역*/}
              お問い合わせ履歴
            </Link>
          )}
        </div>
      )}
    </>
  );
}

export default NavBar;
