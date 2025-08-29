import { Col, Row, Spinner, ToggleButton } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { AuthenticationContext } from "../common/AuthenticationContextProvider.jsx";

export function QnaView() {
  const { user, isAdmin } = useContext(AuthenticationContext);
  const [searchParams, setSearchParams] = useSearchParams("");
  const [question, setQuestion] = useState(null);
  const [modalShow, setModalShow] = useState();
  // searchParams 사용으로 인해 id 굳이 필요할지 의문
  // 1: { value: "주문/결제" },
  // 2: { value: "배송관련" },
  // 3: { value: "취소/환불" },
  // 4: { value: "반품/교환" },
  // 5: { value: "증빙서류발급" },
  // 6: { value: "로그인/회원정보" },
  // 7: { value: "서비스/기타" },
  const categoryList = {
    1: { value: "注文／決済" },
    2: { value: "配送関連" },
    3: { value: "キャンセル／返金" },
    4: { value: "返品／交換" },
    5: { value: "領収書・請求書発行" },
    6: { value: "ログイン／会員情報" },
    7: { value: "サービス／その他" },
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
      .finally(() => {
        // console.log("always");
      });
  }, []);

  function handleDeleteButtonClick() {
    axios
      // .delete(`/api/qna/?${searchParams}`)
      .delete(`/api/qna/${question.id}`)
      .then((res) => {
        const message = res.data.message;
        if (message) {
          toast(message.text, { type: message.type });
        }
      })
      .catch((err) => {
        // 게시물이 삭제되지 않았습니다.
        toast("投稿が削除されませんでした。", { type: "warning" });
      })
      .finally(() => {
        // console.log("항상");
      });
    return null;
  }

  if (!question) {
    return <Spinner />;
  }

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6} className="mt-5">
        <div className="container">
          <h2 className="mb-4 text-center font-bold text-2xl">
            {/*문의 내역 상세*/}
            お問い合わせ詳細
          </h2>
          <div className="row">
            <div>
              <div className="form-control w-full mb-3">
                <label className="label">
                  {/*상담유형*/}
                  <span className="font-semibold label-text">
                    お問い合わせ種別
                  </span>
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
                  <span className="font-semibold label-text">
                    {/*문의하실 상품*/}
                    お問い合わせ対象商品
                  </span>
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
                    className="input font-semibold input-bordered w-full mb-2"
                    value={question.product}
                    placeholder="商品名" // 상품명
                    disabled
                  />
                  {/* 가격 (오른쪽 정렬, 굵은 빨간색) */}
                  <h5 className="text-right font-bold text-red-600">
                    {question.price.toLocaleString()} 원
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
                  <span className="font-semibold label-text">件名</span>
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
                  <span className="font-semibold label-text">
                    お問い合わせ内容
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={6}
                  value={question.content}
                  readOnly
                />
              </div>
            </div>
            {question.answer !== null ? (
              <div>
                <div className="form-control w-full mb-3">
                  <label className="label">
                    {/*답변 내용*/}
                    <span className="label-text">回答内容</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={6}
                    value={question.answer}
                    readOnly
                  />
                </div>
              </div>
            ) : (
              <>
                <h6 className="text-center">
                  {/*빠른 시일 내에 답변드리도록 하겠습니다*/}
                  できるだけ早くご回答いたします。
                </h6>
                <div className="text-end">
                  {user !== null && isAdmin && (
                    <a
                      href={`/qna/addAns?${searchParams}`}
                      className="btn btn-primary ml-2"
                      // btn btn-primary: DaisyUI의 프라이머리 버튼 스타일
                      // ml-2: Bootstrap의 ms-2(왼쪽 마진) 대신 Tailwind의 ml-2 사용
                    >
                      {/*답변하기*/}
                      回答する
                    </a>
                  )}
                </div>
              </>
            )}
            <br />
            {/*<div className="mb-3">
              {user !== null && question.loginId === user && (
                <Button className="ms-2 btn-danger" onClick={setModalShow}>
                  삭제
                </Button>
              )}
            </div>*/}
          </div>
        </div>
      </Col>
      {modalShow && (
        <div className="modal modal-open">
          <div className="modal-box">
            {/*게시물 삭제 확인*/}
            <h3 className="font-bold text-lg mb-3">投稿削除の確認</h3>
            {/*이 문의 내역을 삭제하시겠습니까?*/}
            <p className="mb-6">このお問い合わせ内容を削除しますか？</p>
            <div className="modal-action">
              <button
                className="btn btn-outline btn-neutral"
                onClick={() => setModalShow(false)}
              >
                {/*취소*/}
                戻る
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteButtonClick}
              >
                {/*삭제*/}
                削除
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
