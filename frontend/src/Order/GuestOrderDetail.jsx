import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";

export function GuestOrderDetail() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  useEffect(() => {
    axios
      .get("/api/order/guest-order/detail")
      .then((res) => {
        console.log(res.data);
        setOrder(res.data);
      })
      .catch((err) => {
        console.log(err.message);
        alert("조회 권한이 없습니다.");
        navigate("/home");
      });
  }, []);

  if (!order) {
    return (
      <div>
        <div>
          <span className="loading loading-spinner loading-sm mr-2" />
        </div>
        주문 정보를 불러오는 중 . . .{" "}
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full max-w-[600px] mx-auto px-4">
          <div className="rounded-card">
            <div className="mb-8">
              <h2 className="mb-6 text-center text-2xl font-bold">주문 상세</h2>
              <br />
              <div className="border border-gray-100 rounded px-3 py-2 mb-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-3 flex-nowrap">
                    <div className="w-20 sm:w-40 shrink-0 font-medium">
                      주문일자
                    </div>
                    <div className="flex-1 min-w-0 break-words">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-nowrap">
                    <div className="w-20 sm:w-40 shrink-0 font-medium">
                      주문번호
                    </div>
                    <div className="flex-1 min-w-0 text-sm break-words">
                      {order.guestOrderToken}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-gray-100 rounded px-3 py-2 mb-2">
                <h4 className="font-semibold mb-2">주문 정보</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 flex-nowrap">
                    <div className="w-20 sm:w-40 shrink-0 font-medium">
                      이름
                    </div>
                    <div className="flex-1 min-w-0 break-words">
                      {order.guestName}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-nowrap">
                    <div className="w-20 sm:w-40 shrink-0 font-medium">
                      연락처
                    </div>
                    <div className="flex-1 min-w-0 break-words">
                      {order.guestPhone}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 rounded px-3 py-2 mb-2">
                <h4 className="font-semibold mb-2">배송지 정보</h4>
                <div className="space-y-2">
                  {/* 받는 사람 */}
                  <div className="flex items-start gap-3 flex-nowrap">
                    <div className="w-20 sm:w-40 shrink-0 font-medium">
                      받는 사람
                    </div>
                    <div className="flex-1 min-w-0 break-words">
                      {order.receiverName}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-nowrap">
                    <div className="w-20 sm:w-40 shrink-0 font-medium">
                      연락처
                    </div>
                    <div className="flex-1 min-w-0 break-words">
                      {order.receiverPhone}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-nowrap">
                    <div className="w-20 sm:w-40 shrink-0 font-medium">
                      우편번호
                    </div>
                    <div className="flex-1 min-w-0 break-words">
                      {order.receiverZipcode}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-nowrap">
                    <div className="w-20 sm:w-40 shrink-0 font-medium">
                      주소
                    </div>
                    <div className="flex-1 min-w-0 break-words whitespace-pre-line">
                      {order.receiverAddress}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-nowrap">
                    <div className="w-20 sm:w-40 shrink-0 font-medium">
                      상세주소
                    </div>
                    <div className="flex-1 min-w-0 break-words">
                      {order.receiverAddressDetail}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-nowrap">
                    <div className="w-20 sm:w-40 shrink-0 font-medium">
                      배송메세지
                    </div>
                    <div className="flex-1 min-w-0 break-words whitespace-pre-line">
                      {order.memo || "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 rounded px-3 py-2 mb-2">
                <h4 className="font-semibold mb-2">주문 상품</h4>

                <div className="divide-y divide-gray-300">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="py-3">
                      <div className="flex gap-3 items-start max-[500px]:flex-col">
                        <img
                          src={item.thumbnailUrl || "/default.png"}
                          alt={item.productName}
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0 w-full space-y-1">
                          <div className="flex items-start gap-2 flex-nowrap">
                            <div className="w-22 sm:w-28 shrink-0 font-medium">
                              상품명
                            </div>
                            <div className="flex-1 min-w-0 break-words">
                              {item.productName}
                            </div>
                          </div>
                          <div className="flex items-start gap-2 flex-nowrap">
                            <div className="w-22 sm:w-28 shrink-0 font-medium">
                              옵션
                            </div>
                            <div className="flex-1 min-w-0 break-words">
                              {item.productOption || "-"}
                            </div>
                          </div>
                          <div className="flex items-start gap-2 flex-nowrap">
                            <div className="w-22 sm:w-28 shrink-0 font-medium">
                              수량
                            </div>
                            <div className="flex-1 min-w-0">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex items-start gap-2 flex-nowrap">
                            <div className="w-22 sm:w-28 shrink-0 font-medium">
                              가격
                            </div>
                            <div className="flex-1 min-w-0">
                              {item.price.toLocaleString()}원
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-white px-3 py-1">
                <div className="text-right py-2">
                  <div>상품금액 : {order.itemSubtotal.toLocaleString()}원</div>
                  <div>배송비 : {order.shippingFee.toLocaleString()}원</div>
                  <div className="mt-2">
                    총 결제금액 : {order.totalPrice.toLocaleString()}원
                  </div>
                </div>
              </div>
              <div className="text-end">
                <button
                  className="btn btn-outline btn-neutral"
                  onClick={() => {
                    navigate("/home");
                  }}
                >
                  홈으로
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
