import { useLocation, useNavigate } from "react-router";
import React, { useEffect } from "react";

export function ProductOrderComplete() {
  useEffect(() => {
    import("./css/ProductOrder.css");
  }, []);
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderToken, items, orderer, receiver, memo } = state;
  const totalItemPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingFee = totalItemPrice >= 100000 ? 0 : 3000;

  // state 유실 가드
  if (!state) {
    return (
      <div className="page-wrapper">
        <div className="center-top-container">
          <div className="w-full max-w-[800px]">
            <div className="rounded-card p-6 text-center">
              {/*잘못된 접근입니다. 홈으로 이동합니다.*/}
              不正なアクセスです。ホームへ移動します。
              <div className="mt-4">
                <button
                  className="order-button btn w-40 confirm"
                  onClick={() => navigate("/Home")}
                >
                  ホームへ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full max-w-[800px] mx-auto px-3 sm:px-4">
          <div className="rounded-card">
            {/*주문 완료*/}
            <h2 className="text-center text-3xl font-bold mb-6">ご注文完了</h2>
            <p className="text-lg mb-4">
              {/*주문 번호*/}
              <strong>ご注文番号 : {orderToken}</strong>
            </p>

            {/* 주문자 정보 */}
            <div className="order-box rounded">
              <h4 className="font-semibold mb-2">ご注文者情報</h4>
              <div className="flex">
                <div className="space-y-2 mt-1">
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <div className="w-35 shrink-0 text-gray-600 mb-1 font-semibold">
                      {/*이름*/}
                      お名前
                    </div>
                    <div className="flex-1">{orderer.name}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <div className="w-35 shrink-0 text-gray-600 mb-1 font-semibold">
                      {/*연락처*/}
                      お電話番号
                    </div>
                    <div className="flex-1">{orderer.phone}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 배송 정보 */}
            <div className="order-box rounded">
              {/*배송정보*/}
              <h4 className="font-semibold mb-2">お届け先情報</h4>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <div className="w-35 shrink-0 text-gray-600 mb-1 font-semibold">
                    {/*받는사람*/}
                    お受取人
                  </div>
                  <div className="flex-1">{receiver.name}</div>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <div className="w-35 shrink-0 text-gray-600 mb-1 font-semibold">
                    {/*연락처*/}
                    お電話番号
                  </div>
                  <div className="flex-1">{receiver.phone}</div>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <div className="w-35 shrink-0 text-gray-600 mb-1 font-semibold">
                    {/*우편번호*/}
                    郵便番号
                  </div>
                  <div className="flex-1">{receiver.zipcode}</div>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <div className="w-35 shrink-0 text-gray-600 mb-1 font-semibold">
                    {/*주소*/}
                    ご住所
                  </div>
                  <div className="flex-1">{receiver.address}</div>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <div className="w-35 shrink-0 text-gray-600 mb-1 font-semibold">
                    {/*상세주소*/}
                    建物名・部屋番号
                  </div>
                  <div className="flex-1">{receiver.addressDetail}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <div className="w-35 shrink-0 text-gray-600 mb-1 font-semibold">
                    {/*배송 메모*/}
                    配送メモ
                  </div>
                  <div className="flex-1">{memo || " "}</div>
                </div>
              </div>
            </div>

            {/* 주문 상품 정보 */}
            <div className="order-box rounded">
              <h4 className="font-semibold mb-3">ご注文商品情報</h4>
              {items.map((item, idx) => (
                <div key={idx} className="order-product mb-3">
                  <img
                    src={item.imagePath}
                    alt="상품"
                    className="rounded"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="order-product-info">
                    <div className="font-bold">{item.productName}</div>
                    <div className="text-sm text-gray-700">
                      {(item.optionName ?? item.option)
                        ? `${item.optionName ?? item.option} / ${item.quantity} 点`
                        : `${item.quantity} 点`}
                    </div>
                    <div className="text-sm">
                      {(item.price * item.quantity).toLocaleString()} 円
                    </div>
                  </div>
                </div>
              ))}
              <hr className="border-t border-gray-300 my-4" />
              <div className="text-end mt-2 text-lg">
                <div className="flex justify-between">
                  {/*상품 금액*/}
                  <span>商品金額</span>
                  <span>{totalItemPrice.toLocaleString()} 円</span>
                </div>
                <div className="flex justify-between">
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
                <div className="pt-3 flex justify-between font-bold">
                  {/*총 주문 금액*/}
                  <span>合計</span>
                  <span>
                    {(totalItemPrice + shippingFee).toLocaleString()}円（税込）
                  </span>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="order-buttons">
              <button
                type="button"
                onClick={() => navigate("/Home")}
                className="order-button btn w-40 confirm"
              >
                ホームへ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
