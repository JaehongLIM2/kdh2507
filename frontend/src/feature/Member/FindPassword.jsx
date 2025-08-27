import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "sonner";

export function FindPassword() {
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");

  // 입력항목 정규식
  const loginIdRegEx = /^[A-Za-z][A-Za-z0-9]{3,19}$/;
  const emailRegEx =
    /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,3}$/;

  // 로그인 중복확인 상태
  const [loginIdExists, setLoginIdExists] = useState(false);
  const [loginIdCheckMessage, setLoginIdCheckMessage] = useState("");
  const [isLoginIdChecked, setIsLoginIdChecked] = useState(false); // 확인 버튼 클릭 여부

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
  const [loginIdValid, setLoginIdValid] = useState(false);
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

  // 이메일 입력값 변경시 상태 초기화
  useEffect(() => {
    setEmailSent(false);
    setAuthCompleted(false);
    setAuthFailed(false);
    setAuthCode("");
    setRemainTime(0);
  }, [email]);

  // 아이디 중복 확인 버튼
  function handleCheckLoginId() {
    // 아이디 정규식 검증
    const isLoginIdOk = loginIdRegEx.test(loginId);
    setLoginIdValid(isLoginIdOk);

    // 정규식이거나 비어있으면  return
    if (!isLoginIdOk || loginId.trim() === "") return;

    if (!loginId.trim()) {
      // 아이디를 입력해주세요
      setLoginIdCheckMessage("ログインIDを入力してください。");
      setLoginIdExists(false);
      setIsLoginIdChecked(true);
      return;
    }

    axios
      .get(`/api/member/check-id?loginId=${loginId}`)
      .then((res) => {
        if (res.data.exists) {
          setLoginIdExists(true);
          // 가입된 아이디입니다.
          setLoginIdCheckMessage("登録されているログインIDです。");
        } else {
          setLoginIdExists(false);
          // 존재하지 않는 아이디입니다.
          setLoginIdCheckMessage("存在しないログインIDです。");
        }
      })
      .catch((err) => {
        setLoginIdExists(false);
        // 획인 중 오류가 발생했습니다.
        setLoginIdCheckMessage("確認中にエラーが発生しました。");
      })
      .finally(() => {
        setIsLoginIdChecked(true);
      });
  }

  const handleEmailSendButton = () => {
    // 아이디와 이메일이 매칭되는지 먼저 확인
    axios
      .get("/api/member/check-id-email", {
        params: { loginId, email },
      })
      .then((res) => {
        if (!res.data.matched) {
          // 입력하신 아이디와 이메일이 일치하지 않습니다.
          toast("入力されたログインIDとメールアドレスが一致しません。", {
            type: "error",
          });
          return;
        }
        sendEmail();
      })
      .catch(() => {
        // 서버 오류로 이메일 확인에 실패했습니다.
        toast("サーバーエラーにより、メールアドレスの確認に失敗しました。", {
          type: "error",
        });
      });
  };

  // 이메일 인증번호 발송 버튼
  function sendEmail() {
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
          toast(res.data.message, { type: "success" });
          setEmailSent(true);
          setRemainTime(res.data.remainTimeInSec);
        } else {
          // 인증번호 전송에 실패했습니다.
          toast(res?.data?.message || "認証番号の送信に失敗しました。", {
            type: "error",
          });
          return;
        }
      })
      .catch((err) => {
        toast(err.response?.data || err.message, { type: "error" });
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
        } else {
          // 인증번호가 일치하지 않습니다.
          toast("認証番号が一致しません。", { type: "error" });
          setAuthFailed(true);
        }
      })
      .catch((err) => {
        // 서버 오류로 인증번호 확인에 실패했습니다.
        toast("サーバーエラーにより、認証番号の確認に失敗しました。", {
          type: "error",
        });
        setAuthFailed(true);
      });
  };

  const handleResetPasswordButton = () => {
    axios
      .post("/api/member/issue-reset-token", {
        loginId,
        email,
      })
      .then((res) => {
        const token = res.data.token;
        navigate("/reset-password", {
          state: {
            token: token,
          },
        });
      })
      .catch((err) => {
        // 토큰 발급 실패
        toast(
          "トークンの発行に失敗しました。: " +
            (err.response?.data || err.message),
          {
            type: "error",
          },
        );
      });
  };

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full max-w-[450px] mx-auto px-4 sm:px-3">
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
                    {/*비밀번호 찾기*/}
                  </span>
                </div>
                <label htmlFor="loginId" className="block text-sm ml-1 mb-2">
                  {/*회원가입시 등록한 아이디를 입력해주세요.*/}
                  会員登録時に登録したログインIDを入力してください。
                </label>
                <input
                  type="text"
                  id="loginId"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                  }}
                  className="input input-bordered w-full"
                  placeholder="ログインID"
                  disabled={authCompleted}
                />
                <div className="flex justify-end items-center text-end mt-2 gap-2">
                  {isLoginIdChecked && (
                    <p
                      style={{ fontSize: "0.875rem" }}
                      className={loginIdExists ? "text-neutral" : "text-error"}
                    >
                      {loginIdCheckMessage}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={authCompleted || remainTime > 0 || isSending}
                    onClick={handleCheckLoginId}
                    className="btn btn-sm btn-neutral mb-2"
                  >
                    {/*확인*/}
                    確認
                  </button>
                </div>
              </div>
              {loginIdExists && (
                <>
                  <div className="form-control mb-4 mt-4">
                    <label htmlFor="email" className="block text-sm ml-1 mb-2">
                      {/*회원가입시 등록한 이메일을 입력해주세요.*/}
                      会員登録時に登録したメールアドレスを入力してください。
                    </label>
                    <input
                      type="text"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      className="input input-bordered w-full"
                      placeholder="メール"
                      disabled={authCompleted}
                    />
                    {isSubmitted && !emailValid && (
                      <p
                        className="ml-1"
                        style={{ color: "red", fontSize: "0.875rem" }}
                      >
                        {/*유효한 이메일 형식이 아닙니다.*/}
                        有効なメールアドレスの形式ではありません。
                      </p>
                    )}
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
                        onClick={handleEmailSendButton}
                        type="button"
                        hidden={authCompleted}
                        className="btn btn-sm btn-neutral mb-2"
                        disabled={authCompleted || remainTime > 0 || isSending}
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
                  {/* 인증번호 입력칸 (이메일 전송 후 보여주기) */}
                  {emailSent && !authCompleted && (
                    <>
                      <hr />
                      <div className="form-control mb-4 mt-4">
                        <label
                          htmlFor="authCode"
                          className="block text-sm font-semibold mb-2"
                        >
                          認証番号
                        </label>
                        <input
                          type="text"
                          value={authCode}
                          id="authCode"
                          placeholder="認証番号"
                          onChange={(e) => setAuthCode(e.target.value)}
                          className={`input input-bordered w-full ${
                            authFailed ? "border-red-500" : "border-gray-300"
                          }`}
                          readOnly={authCompleted}
                          disabled={authCompleted}
                        />
                        <div className="flex justify-end items-center text-end mt-2 gap-2">
                          {authFailed && (
                            <p style={{ color: "red", fontSize: "0.875rem" }}>
                              {/*인증번호를 올바르게 입력하세요.*/}
                              認証番号の正しい入力してください。
                            </p>
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-neutral mt-2"
                            onClick={handleAuthCodeVerify}
                            disabled={authCompleted}
                          >
                            {/*인증번호 확인*/}
                            認証番号確認
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
              {authCompleted && (
                <>
                  <div className="text-end mt-2">
                    <div>
                      <button
                        type="button"
                        className="btn btn-sm btn-neutral mt-2 mr-2"
                        onClick={handleResetPasswordButton}
                      >
                        {/*비밀번호 재설정*/}
                        再設定する
                      </button>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="btn btn-sm btn-neutral mt-2 mr-2"
                        onClick={() => navigate("/")}
                      >
                        {/*돌아가기*/}
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
