import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { AuthenticationContext } from "../common/AuthenticationContextProvider.jsx";
import WithdrawModal from "./Modal/WithDrawModal.jsx";

export function MemberDetail() {
  const [member, setMember] = useState(null);
  const [withdrawModalShow, setWithdrawModalShow] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // 버튼 중복 클릭 방어
  const [isWithdrawProcessing, setIsWithdrawProcessing] = useState(false);

  const [memberParams] = useSearchParams();

  const navigate = useNavigate();

  const { logout, hasAccess } = useContext(AuthenticationContext);

  // 회원 정보 조회
  useEffect(() => {
    axios
      .get(`/api/member?id=${memberParams.get("id")}`)
      .then((res) => {
        setMember(res.data);
      })
      .catch(() => {})
      .finally(() => {});
  }, [memberParams]);

  // 회원 정보 없을때 (ex: null)
  if (!member) {
    return (
      <div>
        <div>
          <span className="loading loading-spinner loading-sm mr-2" />
        </div>
        {/*회원 정보를 불러오는 중 . . .{" "}*/}
        会員情報を読み込み中...{" "}
      </div>
    );
  }

  // 회원 탈퇴
  function handleWithdrawButtonClick() {
    if (isWithdrawProcessing) return; // 중복 클릭 방어
    setIsWithdrawProcessing(true);

    axios
      .delete(`/api/member`, {
        data: { id: member.id, oldPassword: oldPassword },
      })
      .then(() => {
        navigate("/");
        logout();
      })
      .catch(() => {
        // 비밀번호가 일치하지 않습니다.
        setPasswordError("パスワードが一致しません。");
      })
      .finally(() => {
        setIsWithdrawProcessing(false);
      });
  }

  function handleCloseWithdrawModal() {
    setWithdrawModalShow(false);
    setOldPassword("");
    setPasswordError("");
  }

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full max-w-[600px] mx-auto px-4 max-[500px]:px-4">
          <div className="rounded-card">
            <div className="w-full">
              {/*회원정보*/}
              <h2 className="mb-6 text-center text-2xl font-bold">会員情報</h2>
              <div className="space-y-4">
                {/* 아이디 */}
                <div className="flex items-center gap-4 mb-4">
                  <label
                    htmlFor="loginId"
                    className="label w-24 shrink-0 font-semibold px-0 py-0 min-h-0"
                  >
                    {/*아이디*/}
                    ログインID
                  </label>
                  <input
                    type="text"
                    id="loginId"
                    readOnly
                    value={member.loginId}
                    className="input input-bordered flex-1 w-full px-3 py-2"
                  />
                </div>

                {/* 이름 */}
                <div className="flex items-center gap-4 mb-4">
                  <label
                    htmlFor="name"
                    className="label w-24 shrink-0 font-semibold px-0 py-0 min-h-0"
                  >
                    {/*이름*/}
                    氏名
                  </label>
                  <input
                    type="text"
                    id="name"
                    readOnly
                    value={member.name}
                    className="input input-bordered flex-1 w-full px-3 py-2"
                  />
                </div>

                {/* 생년월일 */}
                <div className="flex items-center gap-4 mb-4">
                  <label
                    htmlFor="birthDate"
                    className="label w-24 shrink-0 font-semibold px-0 py-0 min-h-0"
                  >
                    {/*생년월일*/}
                    生年月日
                  </label>
                  <input
                    type="text"
                    id="birthDate"
                    readOnly
                    value={member.birthday}
                    className="input input-bordered flex-1 w-full px-3 py-2"
                  />
                </div>

                {/* 전화번호 */}
                <div className="flex items-center gap-4 mb-4">
                  <label
                    htmlFor="phone"
                    className="label w-24 shrink-0 font-semibold px-0 py-0 min-h-0"
                  >
                    {/*전화번호*/}
                    電話番号
                  </label>
                  <input
                    type="text"
                    id="phone"
                    readOnly
                    value={member.phone}
                    className="input input-bordered flex-1 w-full px-3 py-2"
                  />
                </div>

                {/* 이메일 */}
                <div className="flex items-center gap-4 mb-4">
                  <label
                    htmlFor="email"
                    className="label w-24 shrink-0 font-semibold px-0 py-0 min-h-0"
                  >
                    {/*이메일*/}
                    メール
                  </label>
                  <input
                    type="text"
                    id="email"
                    readOnly
                    value={member.email}
                    className="input input-bordered flex-1 w-full px-3 py-2"
                  />
                </div>

                {/* 주소 */}
                <div className="flex items-start gap-4 mb-4">
                  <label className="label w-24 shrink-0 font-semibold px-0 py-0 min-h-0">
                    {/*주소*/}
                    住所
                  </label>
                  <div className="flex flex-col flex-1 gap-2">
                    <input
                      type="text"
                      readOnly
                      value={member.zipCode}
                      className="input input-bordered px-3 py-2 w-full"
                    />
                    <input
                      type="text"
                      readOnly
                      value={member.address}
                      className="input input-bordered px-3 py-2 w-full hidden md:block"
                    />
                    {/* 주소: md 미만에서는 textarea(두 줄) */}
                    <textarea
                      readOnly
                      rows={2} // 두 줄
                      value={member.address}
                      className="textarea textarea-bordered w-full px-3 py-2
                       resize-none md:hidden break-words"
                    />
                    <input
                      type="text"
                      readOnly
                      value={member.addressDetail}
                      className="input input-bordered px-3 py-2 w-full hidden md:block"
                    />
                    <textarea
                      readOnly
                      rows={2}
                      value={member.addressDetail}
                      className="textarea textarea-bordered w-full px-3 py-2
                       resize-none md:hidden break-words"
                    />
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              {hasAccess(member.loginId) && (
                <div className="flex space-x-2 justify-content-end mt-10">
                  <button
                    className="btn btn-info"
                    onClick={() => navigate(`/member/edit?id=${member.id}`)}
                  >
                    {/*수정*/}
                    更新
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={() => setWithdrawModalShow(true)}
                  >
                    {/*탈퇴*/}
                    退会
                  </button>
                </div>
              )}
            </div>
            <WithdrawModal
              show={withdrawModalShow}
              onClose={handleCloseWithdrawModal}
              oldPassword={oldPassword}
              setOldPassword={setOldPassword}
              passwordError={passwordError}
              setPasswordError={setPasswordError}
              handleWithdrawButtonClick={handleWithdrawButtonClick}
              isWithdrawProcessing={isWithdrawProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
