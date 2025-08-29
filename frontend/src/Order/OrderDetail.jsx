import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

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
        // 조회 중 오류가 발생했습니다.
        toast("読み込み中にエラーが発生しました。", { type: "error" });
        navigate("/home");
      })
      .finally(() => {});
  }, [orderToken]);

  if (!order) {
    return (
      <div className="text-center pt-10 text-gray-500">
        {/*주문 정보를 불러오는 중...*/}
        ご注文情報を読み込み中 …{" "}
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full max-w-[700px] mx-auto px-3 sm:px-4">
          <div className="rounded-card p-4 sm:p-6">
            <div className="mb-8">
              {/*주문 상세*/}
              <h2 className="mb-6 text-center text-2xl font-bold">
                ご注文詳細
              </h2>
              <div className="divide-y divide-gray-200 [&>*]:py-2">
                <div className="sm:border sm:border-gray-100 sm:rounded sm:p-3 mb-2">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 flex-nowrap">
                      <div className="w-20 sm:w-40 shrink-0 font-medium">
                        {/*주문일자*/}
                        ご注文日
                      </div>
                      <div className="flex-1 min-w-0 break-words">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-nowrap">
                      <div className="w-20 sm:w-40 shrink-0 font-medium">
                        {/*주문번호*/}
                        ご注文番号
                      </div>
                      <div className="flex-1 min-w-0 text-sm break-words">
                        {order.orderToken}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sm:border sm:border-gray-100 sm:rounded sm:p-3 mb-2">
                  {/*주문자 정보*/}
                  <h4 className="font-semibold mb-2">ご注文者情報</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 flex-nowrap">
                      <div className="w-20 sm:w-40 shrink-0 font-medium">
                        {/*이름*/}
                        お名前
                      </div>
                      <div className="flex-1 min-w-0 break-words">
                        {order.ordererName}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-nowrap">
                      <div className="w-20 sm:w-40 shrink-0 font-medium">
                        {/*연락처*/}
                        お電話番号
                      </div>
                      <div className="flex-1 min-w-0 break-words">
                        {order.ordererPhone}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sm:border sm:border-gray-100 sm:rounded sm:p-3 mb-2">
                  {/*배송지 정보*/}
                  <h4 className="font-semibold mb-2">お届け先情報</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 flex-nowrap">
                      <div className="w-20 sm:w-40 shrink-0 font-medium">
                        {/*받는 사람*/}
                        お受取人
                      </div>
                      <div className="flex-1 min-w-0 break-words">
                        {order.receiverName}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-nowrap">
                      <div className="w-20 sm:w-40 shrink-0 font-medium">
                        {/*연락처*/}
                        お電話番号
                      </div>
                      <div className="flex-1 min-w-0 break-words">
                        {order.receiverPhone}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-nowrap">
                      <div className="w-20 sm:w-40 shrink-0 font-medium">
                        {/*우편번호*/}
                        郵便番号
                      </div>
                      <div className="flex-1 min-w-0 break-words">
                        {order.receiverZipcode}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-nowrap">
                      <div className="w-20 sm:w-40 shrink-0 font-medium">
                        {/*주소*/}
                        ご住所
                      </div>
                      <div className="flex-1 min-w-0 break-words whitespace-pre-line">
                        {order.receiverAddress}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-nowrap">
                      <div className="w-20 sm:w-40 shrink-0 font-medium">
                        {/*상세주소*/}
                        建物名・部屋番号
                      </div>
                      <div className="flex-1 min-w-0 break-words">
                        {order.receiverAddressDetail}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-nowrap">
                      <div className="w-20 sm:w-40 shrink-0 font-medium">
                        {/*배송메세지*/}
                        配送メモ
                      </div>
                      <div className="flex-1 min-w-0 break-words whitespace-pre-line">
                        {order.memo || "-"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sm:border sm:border-gray-100 sm:rounded sm:p-3 mb-2">
                  {/*주문 상품*/}
                  <h4 className="font-semibold mb-2">ご注文商品情報</h4>

                  <div className="divide-y divide-gray-300 divide-opacity-60">
                    {" "}
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
                                {/*상품명*/}
                                商品名
                              </div>
                              <div className="flex-1 min-w-0 break-words">
                                {item.productName}
                              </div>
                            </div>
                            <div className="flex items-start gap-2 flex-nowrap">
                              <div className="w-22 sm:w-28 shrink-0 font-medium">
                                {/*옵션*/}
                                オプション
                              </div>
                              <div className="flex-1 min-w-0 break-words">
                                {item.productOption || "-"}
                              </div>
                            </div>
                            <div className="flex items-start gap-2 flex-nowrap">
                              <div className="w-22 sm:w-28 shrink-0 font-medium">
                                {/*수량*/}
                                数量
                              </div>
                              <div className="flex-1 min-w-0">
                                {item.quantity}
                              </div>
                            </div>
                            <div className="flex items-start gap-2 flex-nowrap">
                              <div className="w-22 sm:w-28 shrink-0 font-medium">
                                {/*가격*/}
                                価格
                              </div>
                              <div className="flex-1 min-w-0">
                                {item.price.toLocaleString()} 円
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-white px-3 py-1">
                <div className="text-right py-2">
                  {/*상품금액*/}
                  <div>
                    商品金額 : {order.itemsSubtotal.toLocaleString()} 円
                  </div>
                  {/*배송비*/}
                  <div>配送料 : {order.shippingFee.toLocaleString()} 円</div>
                  {/*총 결제금액*/}
                  <div className="mt-2">
                    合計 : {order.totalPrice.toLocaleString()} 円（税込）
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
                  {/*홈으로*/}
                  ホームへ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
