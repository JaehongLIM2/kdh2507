export default function ConfirmEditModal({
  show,
  onClose,
  onSubmit,
  oldPassword,
  setOldPassword,
  isSubmitted,
  setIsSubmitted,
  isEditProcessing,
}) {
  if (!show) return null;
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg mx-4 sm:mx-auto">
        {" "}
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          {/* 회원 정보 수정 확인 */}
          <h3 className="font-bold text-lg">会員情報編集の確認</h3>
          <button
            className="btn btn-sm btn-circle"
            onClick={() => {
              onClose();
              setOldPassword("");
              setIsSubmitted(false);
            }}
          >
            ✕
          </button>
        </div>
        {/* 내용 */}
        <div className="flex items-start gap-6 mb-2">
          <label className="block text-sm font-semibold pt-2">
            {/*비밀번호 입력*/}
            パスワード入力
          </label>

          <div className="flex flex-col flex-1">
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={`input input-bordered ${
                isSubmitted && oldPassword.trim() === "" ? "input-error" : ""
              }`}
              autoFocus
            />
            {isSubmitted && oldPassword.trim() === "" && (
              <span className="text-error text-sm mt-2 ml-3">
                {/*암호를 입력해주세요.*/}
                パスワードを入力してください。
              </span>
            )}
          </div>
        </div>
        {/* 하단 버튼 */}
        <div className="modal-action">
          <button
            className="btn btn-info"
            onClick={onSubmit}
            disabled={isEditProcessing}
          >
            {isEditProcessing ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                {/*저장 중...*/}
                保存中...
              </>
            ) : (
              // "저장"
              "保存"
            )}
          </button>
          <button
            className="btn btn-neutral"
            onClick={() => {
              onClose();
              setOldPassword("");
              setIsSubmitted(false);
            }}
          >
            {/*취소*/}
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}
