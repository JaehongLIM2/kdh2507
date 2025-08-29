import { useLocation, useNavigate } from "react-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useCart } from "./CartContext.jsx";
import { useAlertWebSocket } from "../alert/alertContext.jsx";
import { AuthenticationContext } from "../common/AuthenticationContextProvider.jsx";
import { toast } from "sonner";

function Order() {
  useEffect(() => {
    import("./css/ProductOrder.css");
  }, []);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverZipcode, setReceiverZipcode] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverAddressDetail, setReceiverAddressDetail] = useState("");
  const [memo, setMemo] = useState("");
  const [customMemo, setCustomMemo] = useState("");
  const [sameAsOrderer, setSameAsOrderer] = useState(false);
  const [ordererName, setOrdererName] = useState("");
  const [ordererZipcode, setOrdererZipcode] = useState("");
  const [ordererAddress, setOrdererAddress] = useState("");
  const [ordererAddressDetail, setOrdererAddressDetail] = useState("");
  const [ordererPhone, setOrdererPhone] = useState("");
  const [ordererEmail, setOrdererEmail] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [loadingMember, setLoadingMember] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { state } = useLocation();
  const { setCartCount } = useCart();
  const isMember = !!localStorage.getItem("token");
  // items가 배열이 아니더라도 자동으로 배열로 감싸줌.
  const items = state?.items ?? (state ? [state] : []);
  const totalItemPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const navigate = useNavigate();
  const checkoutWindow = useRef(null);
  const formDataRef = useRef({});
  const { sendOrderAlert } = useAlertWebSocket();

  // 이메일 정규식
  const emailRegEx =
    /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,3}$/;

  useEffect(() => {
    const fee = totalItemPrice >= 100000 ? 0 : 3000;
    setShippingFee(fee);
  }, [totalItemPrice]);

  useEffect(() => {
    formDataRef.current = {
      receiverName,
      receiverPhone,
      receiverAddress,
      receiverAddressDetail,
      receiverZipcode,
      memo,
      customMemo,
    };
  }, [
    receiverName,
    receiverPhone,
    receiverAddress,
    receiverAddressDetail,
    receiverZipcode,
    memo,
    customMemo,
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoadingMember(true);
      axios
        .get("/api/product/member/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setOrdererName(res.data.name);
          setOrdererPhone(res.data.phone);
          setOrdererEmail(res.data.email);
          setOrdererZipcode(res.data.zipCode ?? "");
          setOrdererAddress(res.data.address);
          setOrdererAddressDetail(res.data.addressDetail);
        })
        .catch(() => {})
        .finally(() => setLoadingMember(false));
    }
  }, []);

  useEffect(() => {
    if (ordererEmail == null) return;
    const handlePopupMessage = (event) => {
      switch (event.data.type) {
        case "POPUP_READY":
          // console.log("팝업 준비 완료!");
          // 팝업이 준비되면 데이터 전송
          sendDataToPopup();
          break;

        case "PAY_SUCCESS":
          // 결제 완료 처리
          handleOrderButton();
          setIsProcessing(false);
          window.onbeforeunload = null;
          break;

        case "PAY_FAIL":
          // 결제 실패 처리
          // 결제에 실패하였습니다. 다시 시도해주세요.
          toast.error("決済に失敗しました。もう一度お試しください。");
          setIsProcessing(false);
          break;

        default:
          console.log("알 수 없는 오류:", event.data.type);
      }
    };
    window.addEventListener("message", handlePopupMessage);

    // cleanup 함수로 이벤트 리스너 제거
    return () => {
      window.removeEventListener("message", handlePopupMessage);
    };
  }, [ordererEmail]);

  function handlePaymentConnection() {
    // 폼 검증
    if (!validateForm()) {
      return;
    }

    window.onbeforeunload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    setIsProcessing(true);
    if (!isProcessing) {
      checkoutWindow.current = window.open(
        "/pay/Checkout", // 새 창에서 열 주소
        "_blank", // 새 창
        "width=600,height=800",
      );

      // 팝업 창 확인
      if (!checkoutWindow.current) {
        toast.warning(
          // 팝업이 차단되었습니다. 팝업 차단을 해제해주세요.
          "ポップアップがブロックされました。解除してから再度お試しください。",
        );
        setIsProcessing(false);
        return;
      }

      // 팝업이 닫혔을 때를 감지 (혹시 사용자가 직접 닫을 경우 대비)
      // setInterval (일정 시간 간격으로 함수를 반복해서 실행)
      const checkClosed = setInterval(() => {
        if (checkoutWindow.current && checkoutWindow.current.closed) {
          setIsProcessing(false);
          checkoutWindow.current = null;
          clearInterval(checkClosed);
        }
      }, 1000); // 1초 간격

      // 10분 뒤 인터벌 정리 (메모리 누수 방지)
      const forceCloseTimeout = setTimeout(() => {
        // 팝업이 아직 열려있다면 강제로 닫기
        if (checkoutWindow.current && !checkoutWindow.current.closed) {
          checkoutWindow.current.close(); // 팝업 강제 종료!
          checkoutWindow.current = null;
          // 사용자에게 알림
          // 결제 시간이 초과되었습니다. 다시 시도해주세요.
          toast.error("決済時間がタイムアウトしました。再度お試しください。");
        }

        // 상태 정리
        setIsProcessing(false);
        clearInterval(checkClosed); // 인터벌도 정리
      }, 600_000); // 10분 = 600,000ms

      // 팝업이 정상적으로 닫혔을 때는 강제 종료 타이머도 취소
      // const originalInterval = checkClosed;
      const enhancedCheckClosed = setInterval(() => {
        if (checkoutWindow.current && checkoutWindow.current.closed) {
          setIsProcessing(false);
          checkoutWindow.current = null;
          clearInterval(enhancedCheckClosed);
          clearTimeout(forceCloseTimeout); // 강제 종료 타이머 취소
        }
      }, 1000);
    }
  }

  function sendDataToPopup() {
    if (checkoutWindow.current && !checkoutWindow.current.closed) {
      const fee = Number(shippingFee) || 0;
      const amount = totalItemPrice + fee;

      checkoutWindow.current.postMessage(
        {
          type: "CHECKOUT_DATA",
          data: {
            orderId: "12345",
            amount,
            productName:
              items[0].productName +
              (items.length > 1 ? ` 외 ${items.length - 1}건` : ""),
            username: ordererName,
            phoneNum: ordererPhone,
            emailAddr: ordererEmail ?? "",
          },
        },
        window.location.origin,
      );
    }
  }

  if (!state || items.length === 0) {
    return <div>잘못된 접근입니다.</div>;
  }

  function handleCancelButton() {
    // 주문이 취소되었습니다.
    toast.error("ご注文はキャンセルされました。");
    navigate(-1);
  }

  function validateForm() {
    if (
      !ordererName.trim() ||
      !ordererPhone.trim() ||
      (isMember && !ordererAddress.trim())
    ) {
      // 주문자 정보를 모두 입력해주세요.
      toast.error("ご注文者情報をすべて入力してください。");
      return false;
    }

    if (!isMember) {
      if (!emailRegEx.test(ordererEmail.trim())) {
        // 유효한 이메일 형식이 아닙니다.
        toast.error("有効なメールアドレス形式ではありません。");
        return false;
      }
    }

    const currentData = formDataRef.current;
    // 배송 정보
    if (
      !currentData.receiverName.trim() ||
      !currentData.receiverPhone.trim() ||
      !currentData.receiverZipcode.trim() ||
      !currentData.receiverAddress.trim() ||
      !currentData.receiverAddressDetail.trim()
    ) {
      // 배송지 정보를 모두 입력해주세요.
      toast.error("お届け先情報をすべて入力してください。");

      return false;
    }
    return true;
  }

  function handleOrderButton() {
    const currentData = formDataRef.current;
    if (!validateForm()) {
      return;
    }
    const token = localStorage.getItem("token");
    // const orderMemo = memo === "직접 작성" ? customMemo : memo;
    // const totalPrice = state.price * state.quantity;
    const payloadList = items.map((item) => ({
      productId: item.productId ?? item.product?.id,
      optionId: item.optionId ?? item.option?.id,
      productName: item.productName,
      optionName: item.optionName ?? item.option,
      quantity: item.quantity,
      price: item.price,

      // 주문자 정보
      ordererName: ordererName,
      ordererPhone: ordererPhone,

      // 수령인 정보
      receiverName: currentData.receiverName,
      receiverPhone: currentData.receiverPhone,
      receiverZipcode: currentData.receiverZipcode,
      receiverAddress: currentData.receiverAddress,
      receiverAddressDetail: currentData.receiverAddressDetail,

      memo:
        // 직접 작성
        currentData.memo === "その他（自由記入）"
          ? currentData.customMemo
          : currentData.memo,
      totalPrice: item.price * item.quantity,
    }));

    if (token) {
      // 회원 주문
      let orderToken = "";
      axios
        .post("/api/product/order", payloadList, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          orderToken = res.data.orderToken;

          // 구매한 상품들의 cartId 목록
          const cartIdsToDelete = items
            .map((item) => ({ cartId: item.cartId }))
            .filter((id) => id.cartId != null);

          if (cartIdsToDelete.length === 0) return;
          return axios.delete("/api/product/cart/delete", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: cartIdsToDelete,
          });
        })
        .then(() => {
          return axios.get("/api/product/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        })
        .then((res) => {
          setCartCount(res.data.length);
        })
        .then(() => {
          sendOrderAlert(
            `${items[0].productName} ${items.length <= 1 ? "의" : `외 ${items.length - 1}개의`} 주문이 완료되었습니다`,
            `/order/detail/${orderToken}`,
          );
          // 주문이 완료되었습니다.
          toast.success("ご注文が完了しました。ありがとうございます。");
          navigate("/product/order/complete", {
            state: {
              items,
              orderToken,
              orderer: {
                name: ordererName,
                phone: ordererPhone,
                address: ordererAddress,
              },
              receiver: {
                name: currentData.receiverName,
                phone: currentData.receiverPhone,
                address: currentData.receiverAddress,
                zipcode: currentData.receiverZipcode,
                addressDetail: currentData.receiverAddressDetail,
              },
              memo:
                // 직접 작성
                currentData.memo === "その他（自由記入）"
                  ? currentData.customMemo
                  : currentData.memo,
            },
          });
        })
        .catch((err) => {
          // 주문 실패
          toast.error("ご注文に失敗しました。");
        });
    } else {
      // 비회원
      const payloadList = items.map((item) => ({
        productId: item.productId ?? item.product?.id,
        optionId: item.optionId ?? item.option?.id,
        productName: item.productName,
        optionName: item.optionName ?? item.option,
        quantity: item.quantity,
        price: item.price,
        memo:
          // 직접 작성
          currentData.memo === "その他（自由記入）"
            ? currentData.customMemo
            : currentData.memo,
        totalPrice: item.price * item.quantity,
        guestName: ordererName,
        guestPhone: ordererPhone,
        receiverName: currentData.receiverName,
        receiverPhone: currentData.receiverPhone,
        shippingAddress: currentData.receiverAddress,
        zipcode: currentData.receiverZipcode,
        addressDetail: currentData.receiverAddressDetail,
      }));
      axios.post("/api/product/order/guest", payloadList).then((res) => {
        const token = res.data.guestOrderToken;
        // 주문이 완료되었습니다.
        toast.success("ご注文が完了しました。ありがとうございます。");
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

        const updatedCart = guestCart.filter(
          (cartItem) =>
            !items.some(
              (ordered) =>
                cartItem.productId === ordered.productId &&
                cartItem.optionId === ordered.optionId,
            ),
        );
        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
        setCartCount(updatedCart.length);
        navigate("/product/order/complete", {
          state: {
            items,
            orderToken: token,
            orderer: {
              name: ordererName,
              phone: ordererPhone,
              address: ordererAddress,
            },
            receiver: {
              name: currentData.receiverName,
              phone: currentData.receiverPhone,
              address: currentData.receiverAddress,
              zipcode: currentData.receiverZipcode,
              addressDetail: currentData.receiverAddressDetail,
            },
            memo:
              // 직접 작성
              currentData.memo === "その他（自由記入）"
                ? currentData.customMemo
                : currentData.memo,
          },
        });
      });
    }
  }

  // 주문자 정보와 동일 체크박스
  function handleSameAsOrdererChange(e) {
    const checked = e.target.checked;
    setSameAsOrderer(checked);
    const token = localStorage.getItem("token");
    if (!checked) {
      setReceiverName("");
      setReceiverPhone("");
      setReceiverAddress("");
      setReceiverZipcode("");
      setReceiverAddressDetail("");
      return;
    }
    if (token) {
      // 회원: DB 에서 배송정보 불러오기
      axios
        .get("/api/product/member/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setReceiverName(res.data.name);
          setReceiverPhone(res.data.phone);
          setReceiverAddress(res.data.address);
          setReceiverZipcode(res.data.zipCode);
          setReceiverAddressDetail(res.data.addressDetail);
        });
    } else {
      setReceiverName(ordererName);
      setReceiverPhone(ordererPhone);
      setReceiverAddress(ordererAddress);
      setReceiverZipcode(ordererZipcode || "");
      setReceiverAddressDetail(ordererAddressDetail || "");
    }
  }

  function handleSearchOrdererAddress() {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setOrdererAddress(data.address); // 도로명 주소
        setOrdererZipcode(data.zonecode); // 우편번호 필요하면 이것도
      },
    }).open();
  }

  function handleSearchReceiverAddress() {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setReceiverAddress(data.address); // 도로명 주소
        setReceiverZipcode(data.zonecode); // 우편번호 필요하면 이것도
      },
    }).open();
  }

  if (loadingMember) {
    return <span className="loading loading-spinner"></span>;
  }

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full mx-auto px-3 sm:px-4 max-w-6xl">
          {/* md 이상에서는 현재 레이아웃 그대로 */}
          <div className="w-full">
            <div
              className={`rounded-card ${items?.length ? "pb-28 md:pb-0" : ""}`}
            >
              {/* 결제하기 */}
              <h2 className="text-center text-3xl font-bold mb-6">
                購入手続きへ
              </h2>

              {/* 주문 상품 + 주문 요약 카드 */}
              <div className="order-box rounded">
                {/*주문 상품 점ㅇ보*/}
                <h4 className="mb-1 font-semibold text-lg">ご注文商品情報</h4>

                {/* 상품 리스트 */}
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="order-product mb-1 flex gap-4 p-3 border border-gray-100 rounded"
                  >
                    <img
                      onClick={() =>
                        window.open(
                          `/product/view?id=${item.productId}`,
                          "_blank",
                        )
                      }
                      src={item.imagePath}
                      alt="상품"
                      className="rounded w-24 h-24 sm:w-32 sm:h-32 object-cover cursor-pointer"
                    />
                    <div className="order-product-info flex-1 min-w-0">
                      <div className="font-semibold break-words">
                        {item.productName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(item.optionName ?? item.option)
                          ? `${item.optionName ?? item.option} / ${item.quantity} 点`
                          : `${item.quantity} 点`}
                      </div>
                      <div className="mt-1 font-bold">
                        {(item.price * item.quantity).toLocaleString()} 円
                      </div>
                    </div>
                  </div>
                ))}

                {/* 주문 요약 카드 md 이상에서만 */}
                <div className="hidden md:block mt-3">
                  <div className="rounded p-4 bg-gray-50 border border-gray-200">
                    <h5 className="block text-lg text-center font-semibold mb-3">
                      {/*주문 요약*/}
                      ご注文内容
                    </h5>
                    <div className="flex justify-between">
                      {/*상품 가격*/}
                      <span>商品金額</span>
                      <span>{totalItemPrice.toLocaleString()} 円</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      {/*배송비*/}
                      <span>配送料</span>
                      <div>
                        {shippingFee === 0 && totalItemPrice > 0 && (
                          <span className="text-green-600 text-sm ml-2">
                            {/*(무료배송)*/}
                            （送料無料）
                          </span>
                        )}
                        <span className="ml-1">
                          {" "}
                          {shippingFee.toLocaleString()} 円
                        </span>
                      </div>
                    </div>
                    <hr className="border-t border-gray-300 my-2" />
                    <div className="flex justify-between font-bold">
                      {/*총 주문금액*/}
                      <span>合計</span>
                      <span>
                        {(totalItemPrice + shippingFee).toLocaleString()}
                        円（税込）
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 주문자 정보 */}
              <div className="order-box rounded">
                {/*주문자 정보*/}
                <h4 className="mb-1 font-semibold text-lg">ご注文者情報</h4>

                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={ordererName}
                    onChange={(e) => setOrdererName(e.target.value)}
                    placeholder="お名前" // 이름
                    className="input input-bordered w-full"
                  />
                  <input
                    type="text"
                    value={ordererPhone}
                    onChange={(e) => setOrdererPhone(e.target.value)}
                    placeholder="お電話番号" // 전화번호
                    className="input input-bordered w-full"
                  />
                </div>

                {!isMember && (
                  <>
                    <input
                      type="email"
                      placeholder="メール" // 이메일
                      className="input input-bordered w-full mt-2"
                      value={ordererEmail ?? ""}
                      onChange={(e) => setOrdererEmail(e.target.value)}
                    />
                    <p className="text-sm text-gray-400 text-muted mt-1 ml-1">
                      {/*example@domain.com 형식의 이메일을 입력하세요.*/}
                      メールアドレスは example@domain.com
                      の形式で入力してください。
                    </p>
                  </>
                )}

                {isMember && (
                  <>
                    <div className="flex gap-2 mt-2">
                      <input
                        placeholder="郵便番号" // 우편번호
                        className="input input-bordered flex-1 min-w-0"
                        readOnly
                        value={ordererZipcode}
                        onChange={(e) => setOrdererZipcode(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleSearchOrdererAddress}
                        className="btn btn-outline shrink-0"
                      >
                        {/*주소 검색*/}
                        住所検索
                      </button>
                    </div>
                    <input
                      placeholder="ご住所" // 주소
                      className="input input-bordered w-full mt-2"
                      readOnly
                      value={ordererAddress}
                      onChange={(e) => setOrdererAddress(e.target.value)}
                    />
                    <input
                      placeholder="建物名・部屋番号" // 상세주소
                      className="input input-bordered w-full mt-2"
                      value={ordererAddressDetail}
                      onChange={(e) => setOrdererAddressDetail(e.target.value)}
                    />
                  </>
                )}
              </div>

              {/* 배송 정보 */}
              <div className="order-box rounded">
                {/*배송 정보*/}
                <h4 className="mb-1 font-semibold text-lg">お届け先情報</h4>

                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={sameAsOrderer}
                    onChange={handleSameAsOrdererChange}
                  />
                  {/*주문자 정보와 동일*/}
                  ご注文者情報と同じ
                </label>

                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    placeholder="お受取人" // 수령인
                    className="input input-bordered w-full"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                  />
                  <input
                    placeholder="お電話番号" // 연락처
                    className="input input-bordered w-full"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    placeholder="郵便番号" // 운편번호
                    className="input input-bordered flex-1 min-w-0"
                    readOnly
                    value={receiverZipcode}
                    onChange={(e) => setReceiverZipcode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleSearchReceiverAddress}
                    className="btn btn-outline shrink-0"
                  >
                    {/*주소 검색*/}
                    住所検索
                  </button>
                </div>
                <input
                  placeholder="ご住所" // 주소
                  className="input input-bordered w-full mt-2"
                  readOnly
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                />
                <input
                  placeholder="建物名・部屋番号" // 상세주소
                  className="input input-bordered w-full mt-2"
                  value={receiverAddressDetail}
                  onChange={(e) => setReceiverAddressDetail(e.target.value)}
                />
              </div>

              {/* 배송 메모 */}
              <div className="order-box rounded">
                {/*배송 메모*/}
                <h4 className="mb-1 font-semibold">配送メモ</h4>
                <select
                  className="select select-bordered w-full"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                >
                  {/*배송메모를 선택해주세요.*/}
                  <option value="">配送メモを選択してください</option>
                  {/*문 앞에 두고 가주세요.*/}
                  <option value="玄関前に置いてください。">
                    玄関前に置いてください。
                  </option>
                  {/*부재 시 전화주세요.*/}
                  <option value="不在時はお電話ください。">
                    不在時はお電話ください。
                  </option>
                  {/*경비실에 맡겨주세요.*/}
                  <option value="管理人室にお預けください。">
                    管理人室にお預けください。
                  </option>
                  {/*직접 작성*/}
                  <option value="その他（自由記入">その他（自由記入）</option>
                </select>
                {memo === "その他（自由記入" && (
                  <input
                    type="text"
                    className="input input-bordered w-full mt-2"
                    placeholder="配送メモをご入力ください。" // 배송메모를 직접 입력하세요.
                    value={customMemo}
                    onChange={(e) => setCustomMemo(e.target.value)}
                  />
                )}
              </div>

              {/* 버튼 영역: md↓에서는 숨기고(하단 고정 바 사용), md↑에서는 기존처럼 노출 */}
              <div className="justify-end hidden md:flex md:gap-3 mt-4">
                {isProcessing ? (
                  <button className="confirm btn btn-lg">
                    <span className="loading loading-spinner"></span>
                  </button>
                ) : (
                  <button
                    className="confirm btn btn-lg btn-neutral"
                    onClick={() => {
                      validateForm() && handlePaymentConnection();
                    }}
                  >
                    {/*결제하기*/}
                    購入手続きへ
                  </button>
                )}
                <button
                  onClick={handleCancelButton}
                  className="cancel btn btn-lg btn-outline"
                >
                  {/*취소*/}
                  戻る
                </button>
              </div>
            </div>
          </div>

          {/* (모바일) 하단 고정 주문 요약 + 결제 버튼 */}
          {items?.length > 0 && (
            <div className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t bg-white p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-base">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between gap-4">
                      {/*상품금액*/}
                      <span>商品金額</span>
                      <span>{totalItemPrice.toLocaleString()} 円</span>
                    </div>
                    <div>
                      {/*배송료*/}
                      <span>配送料</span>
                      <span className="ml-1">
                        {" "}
                        {shippingFee.toLocaleString()} 円
                      </span>
                      {shippingFee === 0 && totalItemPrice > 0 && (
                        <span className="text-green-600 text-sm ml-2">
                          {/*(무료배송)*/}
                          （送料無料）
                        </span>
                      )}
                    </div>
                  </div>
                  {/*총 주문금액*/}
                  <div className="text-gray-600 text-sm mt-2">合計</div>
                  <div className="text-lg font-bold">
                    {(totalItemPrice + shippingFee).toLocaleString()} 円（税込）
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {isProcessing ? (
                    <button className="btn ">
                      <span className="loading loading-spinner"></span>
                    </button>
                  ) : (
                    <button
                      className="btn btn-neutral"
                      onClick={() => {
                        validateForm() && handlePaymentConnection();
                      }}
                    >
                      {/*결제하기*/}
                      購入手続きへ
                    </button>
                  )}
                  <button
                    onClick={handleCancelButton}
                    className="btn btn-outline"
                  >
                    {/*취소*/}
                    戻る
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Order;
