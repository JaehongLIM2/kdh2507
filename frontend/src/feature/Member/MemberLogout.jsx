import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthenticationContext } from "../common/AuthenticationContextProvider.jsx";
import { useCart } from "../Product/CartContext.jsx";
import { toast } from "sonner";

export function MemberLogout() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthenticationContext);
  const { setCartCount } = useCart();
  useEffect(() => {
    logout();

    // 비회원 기준으로 장바구니 새로고침.
    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    setCartCount(guestCart.length);
    // 로그아웃 되었습니다.
    toast("ログアウトしました。", { type: "success" });
    navigate("/");
  }, []);
  return (
    <div className="flex justify-center items-center h-screen">
      <span className="loading loading-spinner loading-lg text-neutral"></span>
    </div>
  );
}
