import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { toast } from "sonner";

export function GuestOrder() {
  const [orderToken, setOrderToken] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  function handleSearchOrderButtonClick(e) {
    e.preventDefault();

    axios
      .post("/api/order/guest-order/lookup", {
        guestOrderToken: orderToken,
        guestName: name,
        guestPhone: phone,
      })
      .then(() => {
        // 인증 성공 -> 상세 페이지로 이동
        navigate("/order/guest-order/detail");
      })
      .catch((err) => {
        toast(err.response?.data || "照会に失敗しました。", { type: "error" });
      });
  }

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full max-w-[400px] mx-auto px-4 sm:px-3">
          <div className="rounded-card">
            <div className="w-full justify-content-center">
              <Link
                to="/home"
                className="navbar-logo !flex justify-center items-center
                 w-full !mb-8 md:!mb-8"
              >
                <img
                  src="/logo/kdh.png"
                  style={{ width: "80px" }}
                  className="mr-2"
                />
                {/*코데헌*/}
                <span className="text-4xl font-bold">コーデハン</span>
              </Link>
              <h3 className="text-center text-xl font-bold mb-6">
                {/*비회원 주문 조회*/}
                ゲスト注文照会
              </h3>
              <form onSubmit={handleSearchOrderButtonClick} className="mb-4">
                <div className="form-control mb-2">
                  <label
                    htmlFor="orderToken"
                    className="block text-sm font-semibold mb-2"
                  >
                    {/*주문번호*/}
                    ご注文番号
                  </label>
                  <input
                    id="orderToken"
                    type="text"
                    onChange={(e) => setOrderToken(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control mb-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold mb-2"
                  >
                    {/*주문자명*/}
                    ご注文者名
                  </label>
                  <input
                    id="name"
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control mb-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold mb-2"
                  >
                    {/*전화번호*/}
                    お電話番号
                  </label>
                  <input
                    id="phone"
                    type="text"
                    onChange={(e) => setPhone(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="text-end mt-3">
                  <button
                    type="submit"
                    className="btn btn-neutral w-full font-bold"
                  >
                    {/*주문조회*/}
                    ご注文の確認
                  </button>
                </div>
              </form>
              <div className="text-right mt-2 text-sm">
                <Link to="/login" className="link link-hover text-gray-700">
                  {/*돌아가기*/}
                  戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
