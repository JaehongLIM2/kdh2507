import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";

export function OrderDetail() {
  const { orderToken } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/order/detail/${orderToken}`)
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        console.error(
          "❌ 주문 상세 불러오기 실패",
          err.response?.status,
          err.response?.data,
        );
      })
      .finally(() => {});
  }, [orderToken]);

  // useEffect(() => {
  //   console.log("✅ 주문 상세 DTO:", orderDetail);
  //   console.log("📦 상품 목록:", orderDetail.orderItems);
  // }, [orderDetail]);

  if (!order) {
    return (
      <div className="text-center pt-10 text-gray-500">
        주문 정보를 불러오는 중...
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
              <div className="flex">
                <div className="font-semibold w-40">
                  <div>주문일자</div>
                  <div>주문번호</div>
                </div>
                <div className="w-full">
                  <div>{new Date(order.orderDate).toLocaleDateString()}</div>
                  <div>{order.orderToken}</div>
                </div>
              </div>
              <hr className="border-t border-gray-300 my-3" />
              <div className="flex">
                <div className="font-semibold w-40">
                  <div>이름</div>
                  <div>연락처</div>
                  <div>우편번호</div>
                  <div>주소</div>
                  <div>상세주소</div>
                  <div>배송메세지</div>
                </div>
                <div className="w-full">
                  <div>{order.memberName}</div>
                  <div>{order.phone}</div>
                  <div>{order.zipcode}</div>
                  <div>{order.shippingAddress}</div>
                  <div>{order.addressDetail}</div>
                  <div>{order.memo}</div>
                </div>
              </div>
              <hr className="border-t border-gray-300 my-3" />
              <div>
                <div className="mb-2">
                  주문 상품 {order.orderItems.length}개
                </div>
                <div>
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="mb-2">
                        <img
                          src={item.thumbnailUrl || "/default.png"}
                          alt={item.productName}
                          className="w-32 h-32 rounded"
                        />
                      </div>
                      <ul className="content-center">
                        <li>상품명: {item.productName}</li>
                        <li>옵션: {item.productOption}</li>
                        <li>수량: {item.quantity}</li>
                        <li>가격: {item.price.toLocaleString()}원</li>
                      </ul>
                      <br />
                    </div>
                  ))}
                </div>
              </div>
              <hr className="border-t border-gray-300 my-3" />
              <div>
                <div>결제정보</div>
                <div>결제수단</div>
                <div>총 금액 : {order.totalPrice}</div>
              </div>
              <div className="text-end">
                <button
                  className="btn btn-outline btn-neutral"
                  onClick={() => {
                    navigate("/product/order/list");
                  }}
                >
                  목록으로
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
