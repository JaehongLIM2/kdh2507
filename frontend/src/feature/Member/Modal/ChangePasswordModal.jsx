export default function ChangePasswordModal({
  show,
  onClose,
  oldPassword,
  setOldPassword,
  newPassword1,
  setNewPassword1,
  newPassword2,
  setNewPassword2,
  passwordConfirm,
  handleChangePasswordClick,
  changePasswordButtonDisabled,
  isPasswordProcessing,
}) {
  if (!show) return null;

  const handleClose = () => {
    onClose();
    setOldPassword("");
    setNewPassword1("");
    setNewPassword2("");
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg mx-4 sm:mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-2">
          {/* 비밀번호 변경 */}
          <h3 className="font-bold text-lg">パスワード変更</h3>
          <button className="btn btn-sm btn-circle" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* 설명 */}
        <p className="text-sm text-gray-600 mb-4">
          {/*비밀번호는 영문+숫자 조합, 8~20자 사이로 입력하세요.*/}
          パスワードは英字と数字の組み合わせで、8～20文字で入力してください。
        </p>

        {/* 현재 비밀번호 */}
        <div className="form-control mb-4">
          <label className="block text-sm font-semibold mb-1">
            {/*현재 비밀번호*/}
            現在のパスワード
          </label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="input input-bordered w-full"
            autoFocus
          />
        </div>

        {/* 새 비밀번호 */}
        <div className="form-control mb-4">
          {/*변경할 비밀번호*/}
          <label className="block text-sm font-semibold">
            新しいパスワード
          </label>
          <input
            type="password"
            value={newPassword1}
            onChange={(e) => setNewPassword1(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        {/* 새 비밀번호 확인 */}
        <div className="form-control mb-2">
          <label className="block text-sm font-semibold mb-1">
            {/*변경할 비밀번호 확인*/}
            新しいパスワード（再入力）
          </label>
          <input
            type="password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            className={`input input-bordered w-full ${
              !passwordConfirm ? "input-error" : ""
            }`}
          />
          {!passwordConfirm && (
            <span className="text-error text-sm mt-1">
              {/*비밀번호가 일치하지 않습니다.*/}
              パスワードが一致しません。
            </span>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="modal-action">
          <button
            className="btn btn-info"
            onClick={handleChangePasswordClick}
            disabled={changePasswordButtonDisabled || isPasswordProcessing}
          >
            {isPasswordProcessing ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2" />
                {/*저장 중...*/}
                保存中...
              </>
            ) : (
              // "저장"
              "保存"
            )}
          </button>
          <button className="btn btn-neutral" onClick={handleClose}>
            {/*취소*/}
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}
