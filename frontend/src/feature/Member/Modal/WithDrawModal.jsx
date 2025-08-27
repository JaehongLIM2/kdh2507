export default function WithdrawModal({
  show,
  onClose,
  oldPassword,
  setOldPassword,
  passwordError,
  handleWithdrawButtonClick,
  isWithdrawProcessing,
}) {
  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg mx-4 sm:mx-auto">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center mb-2">
          {/*회원 탈퇴 확인*/}
          <h3 className="text-lg font-bold">退会の確認</h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 설명 */}
        <p className="text-sm text-gray-600 mb-4">
          {/*정말 탈퇴하시겠습니까? 탈퇴를 위해 비밀번호를 입력해주세요.*/}
          本当に退会しますか？ 退会するにはパスワードを入力してください。
        </p>

        {/* 비밀번호 입력란 */}
        <div className="flex items-start gap-6 mb-4">
          {/* 왼쪽 라벨 */}
          <label
            htmlFor="withdraw-password"
            className="w-24 pt-2 font-semibold text-sm text-gray-700"
          >
            {/*비밀번호*/}
            パスワード
          </label>

          {/* 오른쪽 input + 에러 */}
          <div className="flex flex-col flex-1">
            <input
              id="withdraw-password"
              type="password"
              className={`input input-bordered ${
                passwordError ? "input-error" : ""
              }`}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoFocus
            />
            {passwordError && (
              <span className="text-error text-sm mt-1">{passwordError}</span>
            )}
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="modal-action">
          <button
            className="btn btn-error"
            onClick={handleWithdrawButtonClick}
            disabled={!oldPassword || isWithdrawProcessing}
          >
            {isWithdrawProcessing && (
              <span className="loading loading-spinner loading-sm mr-2" />
            )}
            {/*탈퇴*/}
            退会する
          </button>
          <button className="btn btn-neutral" onClick={onClose}>
            {/*취소*/}
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}
