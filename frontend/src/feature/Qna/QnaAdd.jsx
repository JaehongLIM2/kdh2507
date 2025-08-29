import {
  Button,
  ButtonGroup,
  Col,
  FormControl,
  FormGroup,
  FormLabel,
  Image,
  Row,
  ToggleButton,
} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate, useParams } from "react-router";

import { AuthenticationContext } from "../common/AuthenticationContextProvider.jsx";

export function QnaAdd() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { user } = useContext(AuthenticationContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [radioValue, setRadioValue] = useState("1");
  const categoryRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const [productId, setProductId] = useState(0);
  const [productPrice, setProductPrice] = useState(null);
  const [productName, setProductName] = useState(null);
  const [image, setImage] = useState();
  const radios = [
    // { name: "상품목록", value: "1", fnc: handleQnaAddButtonClick },
    // { name: "문의내역", value: "2", fnc: handleQnaListButtonClick },
    // { name: "자주 묻는 질문", value: "3", fnc: handleFaQListButtonClick },
    { name: "商品一覧", value: "1", fnc: handleQnaAddButtonClick },
    { name: "お問い合わせ履歴", value: "2", fnc: handleQnaListButtonClick },
    { name: "よくあるご質問", value: "3", fnc: handleFaQListButtonClick },
  ];
  let params = useParams();
  const navigate = useNavigate();
  const categoryList = {
    1: { value: "注文／決済" },
    2: { value: "配送関連" },
    3: { value: "キャンセル／返金" },
    4: { value: "返品／交換" },
    5: { value: "領収書・請求書発行" },
    6: { value: "ログイン／会員情報" },
    7: { value: "サービス／その他" },
    // 1: { value: "주문/결제" },
    // 2: { value: "배송관련" },
    // 3: { value: "취소/환불" },
    // 4: { value: "반품/교환" },
    // 5: { value: "증빙서류발급" },
    // 6: { value: "로그인/회원정보" },
    // 7: { value: "서비스/기타" },
  };

  useEffect(() => {}, [category]);

  useEffect(() => {
    axios
      .get(`/api/qna/add?id=${params.id}`)
      .then((res) => {
        setProductId(res.data.id);
        setImage(res.data.image);
        setProductPrice(res.data.price);
        setProductName(res.data.productName);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          // 로그인 후 이용해주세요.
          toast.warning("ログイン後にご利用ください。");
          window.location.href = "/login";
        } else {
          // console.log("잘 안될 때 코드");
        }
      });
  }, []);

  function handleSaveButtonClick() {
    const scrollToCategoryWithOffset = (ref) => {
      const categoryElement = ref;

      if (categoryElement) {
        // 요소의 위치 정보 가져오기
        const rect = categoryElement.getBoundingClientRect();
        const targetPosition = window.scrollY + rect.top - 100;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    };
    if (category.trim() === "" || category === "0") {
      // 상담유형을 선택해주세요.
      toast.error("お問い合わせ種別を選択してください");
      scrollToCategoryWithOffset(categoryRef.current);
    } else if (title.trim() === "") {
      // 제목을 입력해주세요.
      toast.error("件名を入力してください。");
      scrollToCategoryWithOffset(titleRef.current);
    } else if (content.trim() === "") {
      // 문의 내용을 입력해주세요.
      toast.error("お問い合わせ内容を入力してください。");
      scrollToCategoryWithOffset(contentRef.current);
    } else {
      setIsProcessing(true);
      axios
        .post("/api/qna/add", {
          title,
          content,
          category,
          username: user,
          productId,
        })
        .then((res) => {
          const message = res.data.message;
          if (message) {
            toast(message.text, { type: message.type });
          }
          // navigate(-1);
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
  }

  /*if (!user) {
    return <Spinner />;
  }*/

  function handleQnaAddButtonClick() {
    navigate("/product/list");
  }

  function handleQnaListButtonClick() {
    navigate("/qna/list");
  }

  function handleFaQListButtonClick() {
    navigate("/faq/list");
  }

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={9} className="mt-5">
        <div className="container">
          <h2 className="mb-4 lg:text-2xl md:text-xl font-bold">
            {/*1:1 상담 문의*/}
            1対1お問い合わせ
          </h2>
          {/* <div>
            <Button disabled={true}>상담문의</Button>
            <Button>상담내역</Button>

            <ButtonGroup>
              {radios.map((radio, idx) => (
                <input
                  key={idx}
                  className="btn btn-outline"
                  type="radio"
                  name="바로가기"
                  aria-label={radio.name}
                  value={radio.value}
                  defaultChecked={idx === 0}
                  onClick={radio.fnc}
                />
              ))}
            </ButtonGroup>
          </div>*/}
          <br />
          <div className="row">
            <div ref={categoryRef}>
              {/*<div>*/}
              <fieldset className="fieldset category1">
                {/*상담 유형*/}
                <legend className="fieldset-legend">お問い合わせ種別</legend>
                <select
                  defaultValue=""
                  className="select"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {/*<option hidden>유형을 선택하세요</option>*/}
                  {/*<option value="1">기능 관련</option>*/}
                  {/*<option value="2">크기·무게 관련</option>*/}
                  {/*<option value="3">배송 관련</option>*/}
                  {/*<option value="4">설정 관련</option>*/}
                  {/*<option value="5">반품·교환 관련</option>*/}
                  {/*<option value="6">기타 문의</option>*/}
                  <option hidden>種別を選択してください。</option>
                  <option value="1">機能に関するお問い合わせ</option>
                  <option value="2">サイズ・重量に関するお問い合わせ</option>
                  <option value="3">配送に関するお問い合わせ</option>
                  <option value="4">設定に関するお問い合わせ</option>
                  <option value="5">返品・交換に関するお問い合わせ</option>
                  <option value="6">その他のお問い合わせ</option>
                </select>
              </fieldset>
              <br />
            </div>
            <br />
            <div>
              <FormGroup>
                {/*문의하실 상품*/}
                <FormLabel>お問い合わせ対象商品</FormLabel>
                <div>
                  {/*상품 이미지*/}
                  <Image
                    src={image}
                    fluid
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                  <br />
                  <br />
                  {/*상품명*/}
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder={productName}
                    disabled
                  />
                  <h5 className="text-right font-bold text-red-600">
                    {/* toLocaleString() : 세자리수마다 쉼표로 보기 쉽게 표현*/}
                    {productPrice && productPrice.toLocaleString()}원
                  </h5>
                </div>
              </FormGroup>
            </div>
            <br />
            <br />
            <div ref={titleRef}>
              {/*<FormGroup>
                <FormLabel>제목</FormLabel>
                <FormControl
                  value={title}
                  placeholder="제목을 입력해 주세요"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormGroup>*/}
              <div className="form-control w-full mb-4">
                <label className="label">
                  {/*제목*/}
                  <span className="label-text">件名</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={title}
                  placeholder="件名を入力してください。" // 제목을 입력해주세요.
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
            <div></div>
            <div ref={contentRef}>
              <div className="form-control w-full mb-3">
                {/* form-control: DaisyUI 폼 래퍼, mb-3: 아래 여백 */}
                <label className="label">
                  {/*문의 내용*/}
                  <span className="label-text">お問い合わせ内容</span>
                  {/* label-text: DaisyUI 스타일 라벨 */}
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  // textarea, textarea-bordered: DaisyUI 스타일 적용
                  // w-full: 가로 100% (부모 기준)
                />
              </div>
            </div>
            <br />

            <div className="mb-3">
              <Button
                onClick={handleSaveButtonClick}
                // disabled={isProcessing || !validate}
                disabled={isProcessing}
              >
                {/*등록*/}
                送信
              </Button>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}
