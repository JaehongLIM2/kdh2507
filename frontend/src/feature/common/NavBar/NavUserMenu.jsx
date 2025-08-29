import { FiUser } from "react-icons/fi";
import { Link, useLocation } from "react-router";

export function NavUserMenu({ user, logout, isAdmin }) {
  const location = useLocation();
  const isRootPath = location.pathname === "/";

  const iconBase =
    "w-10 h-10 rounded-full flex items-center justify-center text-2xl no-animation focus:outline-none focus-visible:outline-none";
  const iconHover = isRootPath ? "no-hover" : "hover:bg-gray-100";

  return (
    <div className="dropdown dropdown-end user-menu">
      <div tabIndex={0} role="button" className={`${iconBase} ${iconHover}`}>
        <FiUser
          className={`text-2xl ${isRootPath ? "text-white" : "text-black"}`}
        />
      </div>
      <ul
        tabIndex={0}
        className="menu dropdown-content z-[999] text-lg p-2 shadow bg-white text-black rounded-box w-52"
      >
        {user ? (
          <>
            <li className="px-3 py-1 font-semibold">{user.name} 님</li>
            <li>
              <Link to={`/member?id=${user.id}`}>会員情報</Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/member/list">会員一覧</Link>
              </li>
            )}
            {!isAdmin && (
              <li>
                <Link to="/order/list">注文履歴</Link>
              </li>
            )}
            <li>
              <Link to="/logout">ログアウト</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">ログイン</Link>
            </li>
            <li>
              <Link to="/signup">新規会員登録</Link>
            </li>
            <li>
              <Link to="/order/guest-order">非会員注文照会</Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
