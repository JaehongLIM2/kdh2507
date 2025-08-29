import { Col, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";

import { useNavigate, useSearchParams } from "react-router";
import { AuthenticationContext } from "../common/AuthenticationContextProvider.jsx";
import { toast } from "react-toastify";

export function AnsAdd() {
  const [question, setQuestion] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams("");
  const [modalShow, setModalShow] = useState();
  const [answer, setAnswer] = useState();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const categoryList = {
    1: { value: "注文／決済" },
    2: { value: "配送関連" },
    3: { value: "キャンセル／返金" },
    4: { value: "返品／交換" },
    5: { value: "領収書・請求書発行" },
    6: { value: "ログイン／会員情報" },
    7: { value: "サービス／その他" },
    // 1: { value: "기능 관련" },
    // 2: { value: "크기·무게 관련" },
    // 3: { value: "배송 관련" },
    // 4: { value: "설정 관련" },
    // 5: { value: "반품·교환 관련" },
    // 6: { value: "기타 문의" },
  };

  useEffect(() => {
    axios
      .get(`/api/qna/view?${searchParams}`)
      .then((res) => {
        setQuestion(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {});
  }, []);

  if (!question) {
    return <span className="loading loading-spinner"></span>;
  }

  function handleAnswerButtonClick() {
    setIsProcessing(true);
    axios
      .post(`/api/qna/addAns`, {
        questionId: question.id,
        seller: question.userid,
        answer: answer,
      })
      .then((res) => {
        const message = res.data.message;
        if (message) {
          toast(message.text, { type: message.type });
        }
        navigate("/qna/list");
      })
      .catch((err) => {
        const message = err.response.data.message;
        if (message) {
          // toast 띄우기
          toast(message.text, { type: message.type });
        }
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6} className="mt-5">
        <div className="container">
          {/*문의 내역 상세*/}
          <h2 className="mb-4">お問い合わせ詳細</h2>
          <div className="row">
            <div>
              <div className="form-control w-full mb-3">
                <label className="label">
                  {/*상담 유형*/}
                  <span className="label-text">お問い合わせ種別</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={categoryList[question.category].value}
                  disabled
                  aria-label="Default select example"
                />
              </div>
            </div>
            <br />
            <div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  {/*문의하실 상품*/}
                  <span className="label-text">お問い合わせ対象商品</span>
                </label>
                <div>
                  {/* 상품 이미지 */}
                  <img
                    src={question.imagePath}
                    alt="상품 이미지"
                    className="w-full h-auto object-contain rounded-xl shadow mb-3"
                  />
                  {/* 상품명(읽기 전용) */}
                  <input
                    type="text"
                    className="input input-bordered w-full mb-2"
                    value={question.product}
                    placeholder="商品名" // 상품명
                    disabled
                  />
                  {/* 가격 (오른쪽 정렬, 굵은 빨간색) */}
                  <h5 className="text-right font-bold text-red-600">
                    {question.price.toLocaleString()} 円
                    {/* toLocaleString(): 세 자리마다 콤마 표시 */}
                  </h5>
                </div>
              </div>
            </div>
            <br />
            <br />
            <div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  {/*제목*/}
                  <span className="label-text">件名</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={question.title}
                  disabled
                />
              </div>
            </div>
            <div>
              <br />
            </div>
            <div>
              <div className="form-control w-full mb-3">
                <label className="label">
                  {/*문의 내용*/}
                  <span className="label-text">お問い合わせ内容</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={6}
                  value={question.content}
                  readOnly
                />
              </div>
            </div>
            <div>
              <div className="form-control w-full mb-3">
                <label className="label">
                  {/*답변 내용*/}
                  <span className="label-text">回答内容</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={6}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>
            </div>
            <br />
            <div className="mb-3">
              <button
                type="button"
                className="btn btn-primary ml-2"
                onClick={setModalShow}
              >
                {/*답변 등록*/}
                回答を登録する
              </button>
            </div>
          </div>
        </div>
      </Col>
      {modalShow && (
        <div className="modal modal-open">
          <div className="modal-box">
            {/*답변 등록 확인*/}
            <h3 className="font-bold text-lg mb-3">回答登録の確認</h3>
            <p className="mb-6">
              {/*답변을 등록하면 수정할 수 없습니다.*/}
              回答を登録すると修正できません。
              <br />
              {/*등록하시겠습니까?*/}
              登録してもよろしいですか？
            </p>
            <div className="modal-action">
              <button
                className="btn btn-outline btn-neutral"
                onClick={() => setModalShow(false)}
              >
                {/*취소*/}
                戻る
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAnswerButtonClick}
              >
                {/*답변완료*/}
                回答完了
              </button>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setModalShow(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <label
            className="modal-backdrop"
            onClick={() => setModalShow(false)}
          ></label>
        </div>
      )}
    </Row>
  );
}
