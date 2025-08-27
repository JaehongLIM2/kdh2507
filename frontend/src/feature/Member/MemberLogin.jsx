import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router";
import axios from "axios";
import { AuthenticationContext } from "../common/AuthenticationContextProvider.jsx";
import { useCart } from "../Product/CartContext.jsx";
import { toast } from "sonner";

export function MemberLogin() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthenticationContext);
  const { setCartCount } = useCart();

  const navigate = useNavigate();

  function handleLogInButtonClick(e) {
    e.preventDefault(); // form submit 기본 동작 방지(리로드 X)

    if (!loginId.trim()) {
      // 아이디를 입력하세요 toast
      toast("ログインIDを入力してください。", { type: "error" });
      return;
    }
    if (!password.trim()) {
      // 패스워드를 입력해주세요 toast
      toast("パスワードを入力してください。", { type: "error" });
      return;
    }

    axios
      .post("/api/member/login", {
        loginId: loginId,
        password: password,
      })
      .then((res) => {
        const token = res.data.token;
        login(token);

        // 로그인시 회원장바구니 새로고침.
        axios
          .get("/api/product/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            setCartCount(res.data.length);
          });

        const message = res.data.message;
        navigate("/");
      })
      .catch((err) => {
        // 아이디 혹은 패스워드가 일치하지 않습니다.
        toast("IDまたはパスワードが一致しません。", { type: "error" }); // { type: 'error', text: '...' }
      })
      .finally(() => {});
  }

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full max-w-[400px] mx-auto px-4 sm:px-3">
          <div className="rounded-card">
            <div className="w-full">
              <Link
                to="/home"
                className="navbar-logo !flex justify-center items-center
                 w-full !mb-8 md:!mb-8"
              >
                <img
                  src="/logo/kdh.png"
                  style={{ width: "80px" }}
                  className="mr-2"
                />
                {/* 코데헌 로고 */}
                <span className="text-4xl font-bold">コーデハン</span>
              </Link>
              {/* 로그인 */}
              <h3 className="text-center text-xl font-bold mb-6">ログイン</h3>

              <form onSubmit={handleLogInButtonClick}>
                {/* 아이디 */}
                <div className="form-control mb-4">
                  <label
                    htmlFor="loginId"
                    className="block text-sm font-semibold mb-2"
                  >
                    ログインID
                  </label>
                  <input
                    id="loginId"
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>

                {/* 비밀번호 */}
                <div className="form-control mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold mb-2"
                  >
                    パスワード
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>

                {/* 로그인 버튼 */}
                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-neutral w-full font-bold py-2"
                  >
                    ログイン
                  </button>
                </div>
              </form>

              {/* 회원가입 링크 */}
              <div className="text-right mt-2 text-sm">
                <Link to="/signup" className="link link-hover text-gray-700">
                  会員登録
                </Link>
              </div>

              {/* 아이디/비밀번호 찾기 링크 */}
              <div className="text-right mt-2 text-sm">
                <Link to="/find/id" className="link link-hover text-gray-700">
                  ログインIDを忘れた方
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <Link
                  to="/find/password"
                  className="link link-hover text-gray-700"
                >
                  パスワード再設定
                </Link>
              </div>

              {/* 비회원 주문 조회 */}
              <div className="text-right mt-2 text-sm">
                <Link
                  to="/order/guest-order"
                  className="link link-hover text-gray-700"
                >
                  非会員注文照会
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
