import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { AuthenticationContext } from "../common/AuthenticationContextProvider.jsx";
import PrivacyModal from "./Modal/PrivacyModal.jsx";

export function MemberSignup() {
  // 입력 항목 정규식
  const loginIdRegEx = /^[A-Za-z][A-Za-z0-9]{3,19}$/;
  const hasAdmin = /admin/i; // 'admin' 포함 여부(대소문자 무시)
  const emailRegEx =
    /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,3}$/;
  const passwordRegEx = /^[A-Za-z0-9]{8,20}$/;
  // const nameRegEx = /^[가-힣]{2,5}$/; // 한글 이름만
  const nameRegEx = /^[가-힣a-zA-Z\s]{2,20}$/; // 한글 + 영문 이름 허용 시
  const phoneRegEx = /^01[016789][0-9]{7,8}$/;

  // 오늘 날짜를 yyyy-MM-dd 형식으로 반환하는 함수
  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 로그인 입력 항목
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [customDomain, setCustomDomain] = useState(false);
  const [fullEmail, setFullEmail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  // 주소 입력 api
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState(getToday()); // 초기값은 오늘 날짜

  // email 인증
  const [emailSent, setEmailSent] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [remainTime, setRemainTime] = useState(0);
  const [authFailed, setAuthFailed] = useState(false);

  // email 인증 완료
  const [authCompleted, setAuthCompleted] = useState(false);

  // email 전송중 버튼 비활성화
  const [isSending, setIsSending] = useState(false);

  // 회원가입 버튼 클릭시 비활성화
  const [isProcessing, setIsProcessing] = useState(false);

  // 정규식과 일치하는지
  const [loginIdValid, setLoginIdValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [nameValid, setNameValid] = useState(true);
  const [phoneValid, setPhoneValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);

  // 가입 버튼 클릭 여부
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 로그인 중복확인 상태
  const [loginIdChecked, setLoginIdChecked] = useState(false);
  const [loginIdCheckMessage, setLoginIdCheckMessage] = useState("");

  // 개인정보 수집
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  // 로그인 여부
  const { user } = useContext(AuthenticationContext);

  const navigate = useNavigate();

  // 각 항목을 입력하지 않으면 가입 버튼 비활성화
  const requiredFields = [
    loginId,
    password,
    name,
    birthday,
    phone,
    emailId,
    zipCode,
    address,
  ];
  const allFieldsFilled = requiredFields.every((field) => field.trim() !== "");

  // password 와 password2(비밀번호 확인)이 일치하지 않으면 가입버튼 비활성화
  const passwordConfirm = password === password2;
  const disabled =
    !allFieldsFilled ||
    !passwordConfirm ||
    !loginIdChecked ||
    !authCompleted ||
    !privacyAgreed;

  // 로그인 되어 있을때 회원가입 접속 차단
  useEffect(() => {
    if (user) {
      // 이미 로그인 되어있을때 toast
      toast("すでにログインされています。", { type: "error" });
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    setFullEmail(`${emailId}@${emailDomain}`);
  }, [emailId, emailDomain]);

  // 이메일 입력 실시간 검사
  useEffect(() => {
    setEmailValid(emailRegEx.test(fullEmail));
  }, [fullEmail]);

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

  // 회원가입 버튼
  function handleSignUpClick() {
    // 모든 입력값 유효성 검사 실행
    const isLoginIdOk = loginIdRegEx.test(loginId);
    const isPasswordOk = passwordRegEx.test(password);
    const isEmailOk = emailRegEx.test(fullEmail);
    const isNameOk = nameRegEx.test(name);
    const isPhoneOk = phoneRegEx.test(phone);
    // 상태값 업데이트
    setLoginIdValid(isLoginIdOk);
    setPasswordValid(isPasswordOk);
    setEmailValid(isEmailOk);
    setNameValid(isNameOk);
    setPhoneValid(isPhoneOk);
    setIsSubmitted(true);

    if (
      !isLoginIdOk ||
      !isPasswordOk ||
      !isNameOk ||
      !isPhoneOk ||
      !passwordConfirm ||
      !authCompleted
    ) {
      return;
    }
    if (!privacyAgreed) {
      // 개인정보 수집이용 안내 toast
      toast(
        "個人情報の収集および利用に同意していただくことで登録が可能です。",
        {
          type: "error",
        },
      );
      return;
    }

    if (isProcessing) return; // 중복 클릭 방지
    setIsProcessing(true);

    axios
      .post("/api/member/signup", {
        loginId: loginId,
        password: password,
        name: name,
        birthday: birthday,
        phone: phone,
        email: fullEmail,
        zipCode: zipCode,
        address: address,
        addressDetail: addressDetail,
        privacyAgreed: privacyAgreed,
      })
      .then(() => {
        // 회원 가입 완료 안내 toast
        toast("会員登録が完了しました。", { type: "success" });
        navigate("/login");
      })
      .catch((err) => {
        // 잠시 후 다시 시도해주십시오 toast
        toast("しばらく経ってから再度お試しください。", {
          type: "error",
        });
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }

  // 아이디 중복 확인 버튼
  function handleCheckLoginId() {
    if (!loginId.trim()) {
      // 아이디를 입력하세요
      setLoginIdCheckMessage("ログインIDを入力してください。");
      return;
    }

    if (hasAdmin.test(loginId.trim())) {
      // 아이디에 admin을 포함할 수 없습니다
      setLoginIdCheckMessage("ログインIDに「admin」を含めることはできません。");
      setLoginIdChecked(false);
      return;
    }

    if (!loginIdRegEx.test(loginId.trim())) {
      // 유효한 아이디 형식이 아닙니다.
      setLoginIdCheckMessage("有効なログインIDの形式ではありません。");
      setLoginIdChecked(false);
      return;
    }

    axios
      .get(`/api/member/check-id?loginId=${loginId}`)
      .then((res) => {
        if (res.data.exists) {
          setLoginIdChecked(false);
          // 이미 사용 중인 아이디입니다.
          setLoginIdCheckMessage("既に使用されているログインIDです。");
        } else {
          setLoginIdChecked(true);
          // 사용 가능한 아이디입니다.
          setLoginIdCheckMessage("使用可能なログインIDです。");
        }
      })
      .catch((err) => {
        setLoginIdChecked(false);
        // 확인 중 오류가 발생했습니다.
        setLoginIdCheckMessage("確認中にエラーが発生しました。");
      })
      .finally(() => {});
  }

  // 주소 확인
  const handleSearchAddress = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setAddress(data.address); // 도로명 주소
        setZipCode(data.zonecode); // 우편번호 필요하면 이것도
      },
    }).open();
  };

  // 이메일 인증번호 발송 버튼
  // 1. 이메일 중복여부 확인
  const handleEmailSendButton = () => {
    axios
      .get("/api/member/check-email", {
        params: { email: fullEmail },
      })
      .then((res) => {
        if (res.data.exists) {
          // 이미 사용중인 이메일입니다.
          toast("既に使用されているメールアドレスです。", { type: "error" });
        } else {
          // 중복이 아니면 인증번호 전송
          sendEmail();
        }
      });
  };
  // 이메일 인증번호 발송 버튼
  // 중복여부 확인되면 인증번호 발송
  const sendEmail = () => {
    // 정규식이거나 비어있으면  return
    if (!emailValid || emailId.trim() === "") return;

    if (isSending) return; // 중복 클릭 방지
    setIsSending(true);

    axios
      .get("/api/email/auth", {
        params: { address: fullEmail },
      })
      .then((res) => {
        if (res.data.success) {
          toast(res.data.message, { type: "success" });
          setEmailSent(true);
          setRemainTime(res.data.remainTimeInSec);
        } else {
          // 인증 번호 전송에 실패했습니다.
          toast("認証番号の送信に失敗しました。", { type: "error" });
          setRemainTime(res.data.remainTimeInSec);
        }
      })
      .catch((err) => {
        // 인증 번호 전송에 실패했습니다.
        toast("認証番号の送信に失敗しました。", { type: "error" });
      })
      .finally(() => {
        setIsSending(false);
      });
  };

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
        address: fullEmail,
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
          //인증번호가 일치하지 않습니다.
          toast("認証番号が一致しません。", { type: "error" });
          setAuthFailed(true);
        }
      })
      .catch((err) => {
        // console.error("인증번호 검증 실패", err.response?.data || err.message);
        // 서버 오류로 인증 번호 확인에 실패했습니다.
        toast("サーバーエラーにより、認証番号の確認に失敗しました。", {
          type: "error",
        });
        setAuthFailed(true);
      });
  };

  // 개인정보 수집 모달
  const privacyModalShow = () => {
    const scrollY = window.scrollY;
    setShowPrivacyModal(true);

    setTimeout(() => {
      window.scrollTo({ top: scrollY });
    }, 50);
  };

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full max-w-[600px] mx-auto px-4">
          <div className="rounded-card">
            <div>
              <div className="flex items-center justify-center mb-5">
                <img
                  src="/logo/kdh.png"
                  style={{ width: "50px" }}
                  className="mr-1"
                />
                {/* 회원 등록*/}
                <span className="text-center text-2xl font-bold">会員登録</span>
              </div>
              {/* 아이디 */}
              <div className="flex items-start gap-6 mb-2">
                <div className="w-full">
                  <label className="block font-semibold mb-1">ログインID</label>
                  <p className="text-xs text-muted mb-1">
                    ログインIDはアルファベットで始まり、4～20文字、アルファベット+数字の組み合わせのみ可能です。
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={loginId}
                      placeholder="ログインID"
                      autoComplete="username"
                      onChange={(e) => {
                        setLoginId(e.target.value);
                        setLoginIdChecked(false);
                        setLoginIdCheckMessage("");
                      }}
                      className={`w-full rounded px-3 py-2 bg-gray-100 mb-2 ${
                        isSubmitted && !loginIdValid
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCheckLoginId()}
                      className="btn btn-outline btn-sm btn-neutral mt-1 mb-2"
                    >
                      ログインID確認
                    </button>
                    {/* 아이디 형식이 맞지않을때 (정규식은 최상단 위치) */}
                    {isSubmitted && !loginIdValid && (
                      <p style={{ color: "red", fontSize: "0.875rem" }}>
                        有効なID形式ではありません。
                      </p>
                    )}
                    {/* 아이디 중복 관련 메세지 */}
                    {loginIdCheckMessage && (
                      <p
                        style={{ fontSize: "0.875rem" }}
                        className={`${loginIdChecked ? "text-info" : "text-red-500"}`}
                      >
                        {loginIdCheckMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* 비밀번호 */}
              <div>
                <label className="block font-semibold mb-1">パスワード</label>
                <p className="text-xs text-muted mb-1">
                  パスワードは、英字+数字の組み合わせ、8 ~ 20
                  文字の間で入力します。
                </p>
                <input
                  type="password"
                  value={password}
                  placeholder="パスワード"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className={`w-full rounded px-3 py-2 bg-gray-100 mb-3 ${
                    isSubmitted && !passwordValid
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {isSubmitted && !passwordValid && (
                  <p style={{ color: "red", fontSize: "0.875rem" }}>
                    有効なパスワード形式ではありません。
                  </p>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  パスワード(確認用)
                </label>
                <input
                  type="password"
                  value={password2}
                  placeholder="パスワード(確認用)"
                  className="w-full rounded px-3 py-2 bg-gray-100 mb-2"
                  onChange={(e) => {
                    setPassword2(e.target.value);
                  }}
                />
                {password2 && password !== password2 && (
                  <p style={{ color: "red", fontSize: "0.875rem" }}>
                    パスワードが一致しません。
                  </p>
                )}
              </div>
              <div>
                {/* TODO : 일본어 정규식 추가 + 일본어 성, 이름으로 테이블 추가 */}
                <label className="block font-semibold mb-1">氏名</label>
                <p className="text-xs text-muted mb-1">
                  名前はハングルまたは英文2~20文字まで入力可能です。
                </p>
                <input
                  type="text"
                  value={name}
                  placeholder="氏名"
                  autoComplete="name"
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  className={`w-full rounded px-3 py-2 bg-gray-100 mb-3 ${
                    isSubmitted && !nameValid
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {isSubmitted && !nameValid && (
                  <p style={{ color: "red", fontSize: "0.875rem" }}>
                    有効な名前形式ではありません。
                  </p>
                )}
              </div>
              {/* 생년월일 */}
              <div>
                <label className="block font-semibold mb-1">生年月日</label>
                <input
                  type="date"
                  value={birthday}
                  autoComplete="bday"
                  className="w-full rounded px-3 py-2 bg-gray-100 mb-3"
                  onChange={(e) => {
                    const val = e.target.value;
                    setBirthday(val === "" ? getToday() : val);
                  }}
                />
              </div>
              {/* 전화번호 */}
              {/*TODO : 전화번호 정규식 변경 080~ */}
              <div>
                <label className="block font-semibold mb-1">電話番号</label>
                <p className="text-xs text-muted mb-1">
                  ハイフン(-)なしで数字のみ入力お願いします。 (例:01012345678)
                </p>
                <input
                  type="text"
                  value={phone}
                  placeholder="電話番号"
                  autoComplete="tel"
                  className={`w-full rounded px-3 py-2 bg-gray-100 mb-3 ${
                    isSubmitted && !phoneValid
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  onChange={(e) => {
                    setPhone(e.target.value);
                  }}
                />
                {isSubmitted && !phoneValid && (
                  <p style={{ color: "red", fontSize: "0.875rem" }}>
                    有効な電話番号の形式ではありません。
                  </p>
                )}
              </div>
              {/* 이메일 */}
              <div>
                <label className="block font-semibold mb-1">メール</label>
                <p className="text-xs text-muted mb-1">
                  example@domain.com 形式のメールアドレスを入力お願いします。
                </p>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    className="basis-0 grow-[2] min-w-0 rounded px-3 py-2 bg-gray-100 mb-2"
                  />
                  <span className="shrink-0">@</span>
                  {customDomain ? (
                    <>
                      <input
                        type="text"
                        value={emailDomain}
                        onChange={(e) => setEmailDomain(e.target.value)}
                        className="basis-0 grow-[3] min-w-0 rounded px-3 py-2 bg-gray-100 mb-2"
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost px-2 h-9 min-h-0 text-lg mb-2 shrink-0"
                        onClick={() => setCustomDomain(false)}
                      >
                        x
                      </button>
                    </>
                  ) : (
                    <select
                      className="flex-1 rounded px-3 py-2 bg-gray-100 mb-2"
                      value={emailDomain}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "custom") {
                          setCustomDomain(true);
                          setEmailDomain("");
                        } else {
                          setEmailDomain(value);
                        }
                      }}
                    >
                      <option value="">選択お願いします。</option>
                      <option value="naver.com">naver.com</option>
                      <option value="hanmail.net">hanmail.net</option>
                      <option value="daum.net">daum.net</option>
                      <option value="gmail.com">gmail.com</option>
                      <option value="nate.com">nate.com</option>
                      <option value="hotmail.com">hotmail.com</option>
                      <option value="outlook.com">outlook.com</option>
                      <option value="icloud.com">icloud.com</option>
                      <option value="custom">直接入力</option>
                    </select>
                  )}
                </div>
                {isSubmitted && !emailValid && (
                  <p style={{ color: "red", fontSize: "0.875rem" }}>
                    有効な電子メール形式ではありません。
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm mt-1 mb-2"
                    onClick={handleEmailSendButton}
                    disabled={
                      emailId.trim() === "" ||
                      !emailValid ||
                      remainTime > 0 ||
                      isSending ||
                      authCompleted
                    }
                  >
                    {isSending ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2" />
                        転送中···
                      </>
                    ) : (
                      "認証番号送信"
                    )}
                  </button>
                  {remainTime > 0 && !authCompleted && (
                    <p className="text-sm text-muted">
                      認証番号再送信まで{remainTime}秒残っています
                    </p>
                  )}
                  {authCompleted && (
                    <p className="text-sm text-info">
                      メール認証が完了しました。
                    </p>
                  )}
                </div>
              </div>

              {/* 인증번호 입력 */}
              {emailSent && (
                <div>
                  <label className="block font-semibold mb-1 mt-2">
                    認証番号
                  </label>
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="メールで送信された認証番号を入力します。"
                    className={`w-full rounded px-3 mb-2 bg-gray-100 py-2 border ${authFailed ? "border-red-500" : "border-gray-300"}`}
                    disabled={authCompleted}
                    readOnly={authCompleted}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="btn btn-dark btn-sm mt-2"
                      onClick={handleAuthCodeVerify}
                      disabled={authCompleted}
                    >
                      認証番号確認
                    </button>
                    {authFailed && (
                      <p className="text-error text-sm mt-1">
                        認証番号の正しい入力をお願いします。
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div>
                <label className="block font-semibold mb-1 mt-2">住所</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={zipCode}
                    placeholder="郵便番号"
                    className="w-full rounded px-3 py-2 bg-gray-100 mb-2"
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-neutral mb-2"
                    onClick={handleSearchAddress}
                  >
                    住所検索
                  </button>
                </div>
                <input
                  type="text"
                  value={address}
                  placeholder="住所"
                  className="w-full rounded px-3 py-2 bg-gray-100 mb-2"
                  autoComplete="address-line1"
                  readOnly
                />
                <input
                  type="text"
                  value={addressDetail}
                  placeholder="詳細住所を入力してください。"
                  className="w-full rounded px-3 py-2 bg-gray-100 mb-2"
                  onChange={(e) => setAddressDetail(e.target.value)}
                />
              </div>
              {/* 개인정보 수집 이용 동의 */}
              <div className="d-flex justify-content-end mt-2 items-center">
                {privacyAgreed && (
                  <p className="text-info me-2">
                    個人情報の収集と利用に同意されました。
                  </p>
                )}
                <button
                  type="button"
                  className={`mt-2 btn btn-outline ${
                    privacyAgreed ? "btn-info" : "btn-neutral"
                  }`}
                  disabled={privacyAgreed}
                  onClick={privacyModalShow}
                >
                  {privacyAgreed ? "同意完了" : "個人情報の取扱いに同意"}
                </button>
              </div>
              <div className="text-end mt-2">
                <button
                  type="button"
                  onClick={handleSignUpClick}
                  className="mt-2 btn btn-outline btn-neutral"
                  disabled={disabled || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2" />
                      転送中···
                    </>
                  ) : (
                    "登録する"
                  )}
                </button>
              </div>
            </div>
            {/* 동의 모달 */}
            <PrivacyModal
              show={showPrivacyModal}
              onClose={() => setShowPrivacyModal(false)}
              onAgree={(agreed) => setPrivacyAgreed(agreed)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
