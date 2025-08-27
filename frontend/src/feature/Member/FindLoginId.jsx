import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function FindLoginId() {
  // 이메일 정규식
  const emailRegEx =
    /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,3}$/;

  const [email, setEmail] = useState("");
  const [foundLoginId, setFoundLoginId] = useState("");

  // email 인증
  const [emailSent, setEmailSent] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [remainTime, setRemainTime] = useState(0);
  const [authFailed, setAuthFailed] = useState(false);

  // 전송 버튼 클릭 여부
  const [isSubmitted, setIsSubmitted] = useState(false);

  // email 인증 완료
  const [authCompleted, setAuthCompleted] = useState(false);

  // email 전송중 버튼 비활성화
  const [isSending, setIsSending] = useState(false);

  //정규식과 일치하는지
  const [emailValid, setEmailValid] = useState(true);

  const navigate = useNavigate();

  // 이메일 입력 실시간 검사
  useEffect(() => {
    setEmailValid(emailRegEx.test(email));
  }, [email]);

  // email 인증시 남은시간
  useEffect(() => {
    let timer;
    if (remainTime > 0) {
      timer = setTimeout(() => {
        setRemainTime((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [remainTime]);

  // 이메일 인증번호 발송 버튼
  function handleEmailSendButton() {
    // 이메일 입력갑 유효 검사 실행
    const isEmailOk = emailRegEx.test(email);
    setEmailValid(isEmailOk);
    setIsSubmitted(true);

    // 정규식이거나 비어있으면  return
    if (!isEmailOk || email.trim() === "") return;

    if (isSending) return; // 중복 클릭 방지
    setIsSending(true);

    axios
      .get("/api/email/auth", {
        params: { address: email },
      })
      .then((res) => {
        if (res.data.success) {
          toast(res.data.message, "info");
          setEmailSent(true);
          setRemainTime(res.data.remainTimeInSec);
        } else {
          // 인증번호 전송에 실패했습니다.
          toast(res?.data?.message || "認証番号の送信に失敗しました。", {
            type: "error",
          });
          setRemainTime(res.data.remainTimeInSec);
        }
      })
      .catch((err) => {
        toast(err.response?.data || err.message, "error");
      })
      .finally(() => {
        setIsSending(false);
      });
  }

  // 인증번호 인증 확인 버튼
  const handleAuthCodeVerify = () => {
    setIsSubmitted(true);
    setAuthFailed(false);

    if (!authCode.trim()) {
      setAuthFailed(true); // 입력조차 안 했으면 실패로 처리
      return;
    }

    axios
      .post("/api/email/auth", {
        address: email,
        authCode: authCode,
      })
      .then((res) => {
        if (res.data.success) {
          // 이메일 인증이 완료되었습니다.
          toast("メール認証が完了しました。", { type: "success" });
          setAuthCompleted(true); // 이메일 인증 완료 처리
          setIsSubmitted(false); // 경고 문구 방지
          setAuthFailed(false);
          showFoundId();
        } else {
          // 인증번호가 일치하지않습니다
          toast("認証番号が一致しません。", { type: "error" });
          setAuthFailed(true);
        }
      })
      .catch((err) => {
        // 서버오류로 인증번호 확인에 실패했습니다.
        toast("サーバーエラーにより、認証番号の確認に失敗しました。", {
          type: "error",
        });
        setAuthFailed(true);
      });
  };

  const showFoundId = () => {
    axios
      .get("/api/member/find-id", {
        params: { email },
      })
      .then((res) => {
        if (res.data.success) {
          setFoundLoginId(res.data.loginId); // 마스킹된 ID
        } else {
          // 아이디를 찾을 수 없습니다.
          toast(res.data.message || "ログインIDが見つかりません。", {
            type: "error",
          });
        }
      })
      .catch(() => {})
      .finally(() => {});
  };

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full max-w-[400px] mx-auto px-4 sm:px-3">
          <div className="rounded-card">
            <div className="w-full">
              <div>
                <div className="flex items-center justify-center mb-3">
                  <img
                    src="/logo/kdh.png"
                    style={{ width: "50px" }}
                    className="mr-1"
                  />
                  <span className="text-center text-xl font-bold">
                    {/* 로그인 아이디 찾기 */}
                    ログインIDを探す
                  </span>
                </div>
                {!authCompleted && (
                  <div>
                    {/* 회원가입시 등록한 이메일을 입력해주세요. */}
                    <label className="block text-sm ml-1 mb-2">
                      会員登録時に登録したメールアドレスを入力してください。
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      placeholder="メール"
                      className="input input-bordered w-full"
                      disabled={authCompleted}
                    />
                    <div>
                      {isSubmitted && !emailValid && (
                        <p
                          className="ml-1"
                          style={{ color: "red", fontSize: "0.875rem" }}
                        >
                          {/*유효한 이메일 형식이 아닙니다.*/}
                          有効なメールアドレスの形式ではありません。
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end items-center text-end mt-2 gap-2">
                      {remainTime > 0 && !authCompleted && (
                        <p
                          className="text-muted"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {/*인증번호 재전송까지 {remainTime}초 남음*/}
                          再送信可能まで {remainTime}秒
                        </p>
                      )}
                      {authCompleted && (
                        <p
                          className="text-muted"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {/*이메일 인증이 완료되었습니다.*/}
                          メール認証が完了しました。
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleEmailSendButton}
                        hidden={authCompleted}
                        className="btn btn-sm btn-neutral mb-2"
                      >
                        {isSending ? (
                          <>
                            <span className="loading loading-spinner loading-sm mr-2" />
                            {/*전송 중...*/}
                            転送中···
                          </>
                        ) : (
                          // "인증번호 전송"
                          "認証番号送信"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* 인증번호 입력칸 (이메일 전송 후 보여주기) */}
              {emailSent && !authCompleted && (
                <div className="form-control mb-4 mt-4">
                  <label className="block text-sm font-semibold mb-2">
                    認証番号
                  </label>
                  <input
                    type="text"
                    value={authCode}
                    placeholder="認証番号"
                    className="input input-bordered w-full"
                    onChange={(e) => setAuthCode(e.target.value)}
                    isInvalid={authFailed}
                    readOnly={authCompleted}
                    disabled={authCompleted}
                  />
                  <div className="flex justify-end items-center text-end mt-2 gap-2">
                    {authFailed && (
                      <p style={{ color: "red", fontSize: "0.875rem" }}>
                        認証番号の正しい入力してください。
                      </p>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-neutral mt-2"
                      onClick={handleAuthCodeVerify}
                      disabled={authCompleted}
                    >
                      認証番号確認
                    </button>
                  </div>
                </div>
              )}
              {authCompleted && foundLoginId && (
                <>
                  <div className="mt-5">
                    <p className="text-info fw-bold">
                      {/*가입된 아이디는*/}
                      登録されているログインIDは
                      <span className="text-dark"> {foundLoginId} </span>
                      です。
                      {/*입니다.*/}
                    </p>
                  </div>
                  <div className="text-end mt-2">
                    <div>
                      <button
                        type="button"
                        className="btn btn-neutral btn-sm mt-2 me-2"
                        onClick={() =>
                          navigate("/find/password", {
                            state: {
                              loginId: foundLoginId,
                              email: email,
                            },
                          })
                        }
                      >
                        パスワード再設定
                      </button>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="btn btn-neutral btn-sm mt-2 me-2"
                        onClick={() => navigate("/")}
                      >
                        戻る
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
