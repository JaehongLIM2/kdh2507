import {
  Accordion,
  Button,
  ButtonGroup,
  Col,
  FormControl,
  FormGroup,
  FormLabel,
  Modal,
  Pagination,
  Row,
  Spinner,
  Table,
  ToggleButton,
} from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { AuthenticationContext } from "../common/AuthenticationContextProvider.jsx";
import { useAlertWebSocket } from "../alert/alertContext.jsx";
import { v4 as uuidv4 } from "uuid";

export function FaQList() {
  useEffect(() => {
    import("./faqList.css");
  }, []);
  const { user, isAdmin } = useContext(AuthenticationContext);
  const { alertCount, sendChatAlert } = useAlertWebSocket();
  const navigate = useNavigate();
  const [pageInfo, setPageInfo] = useState(null);
  const [faqList, setFaQList] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [title, setTitle] = useState();
  const [content, setContent] = useState();
  const [category, setCategory] = useState("");
  const [searchCategory, setsearchCategory] = useState("");
  const [searchParams, setSearchParams] = useSearchParams("1");
  const [openId, setOpenId] = useState(null); // 열린 아이디(id)만 저장
  const uuid = uuidv4();
  const radios = [
    {
      name: "1:1 채팅 문의",
      value: "1",
      path: `/chat/chatting?rid=${uuid}`,
      fnc: () => {
        sendChatAlert(`/chat/chatting?rid=${uuid}`);
      },
    },
    { name: "문의내역", value: "2", path: "/qna/list" },
    { name: "자주 묻는 질문", value: "3", path: "/faq/list" },
  ];
  const catlist = [
    { name: "전체", value: 0 },
    { name: "주문/결제", value: 1 },
    { name: "배송관련", value: 2 },
    { name: "취소/환불", value: 3 },
    { name: "반품/교환", value: 4 },
    { name: "증빙서류발급", value: 5 },
    { name: "로그인/회원정보", value: 6 },
    { name: "서비스/기타", value: 7 },
  ];

  useEffect(() => {
    axios
      .get(`/api/faq/list?${searchParams}`)
      .then((res) => {
        setFaQList(res.data.faqList);
        setPageInfo(res.data.pageInfo);
        setsearchCategory(searchParams.get("c") || 0);
        const hash = window.location.hash.replace("#", "");
        if (hash) {
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el && el.type === "checkbox") {
              el.checked = true;
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 0);
        }
      })
      .catch((err) => {
        console.log(err.data);
      })
      .finally(() => {});
  }, [searchParams]);

  const pageNumbers = [];
  if (pageInfo) {
    for (let i = pageInfo.leftPageNumber; i <= pageInfo.rightPageNumber; i++) {
      pageNumbers.push(i);
    }
  }

  function handleCategoryButtonClick(value) {
    // window.location = `/faq/list?c=${value}`;
    const categorySearchParams = new URLSearchParams(searchParams);
    categorySearchParams.set("c", value);
    categorySearchParams.set("p", 1);
    setSearchParams(categorySearchParams);
  }

  // useState 안전장치
  if (!faqList) {
    return <span className="loading loading-spinner"></span>;
  }

  function handleSaveButtonClick() {
    axios
      .post("/api/faq/add", {
        question: title,
        answer: content,
        category: category,
      })
      .then((res) => {
        const message = res.data.message;
        if (message) {
          toast(message.text, { type: message.type });
        }
        window.location.reload();
      })
      .catch((err) => {
        console.log("err");
        const message = err.response.data.message;
        if (message) {
          toast(message.text, { type: message.type });
        }
      })
      .finally(() => {
        // console.log("always");
      });
  }

  return (
    <>
      <Row className="justify-content-center">
        <Col md={12} lg={9} className="mt-5">
          <div className="container">
            {/*<h2 className="mb-4">자주 묻는 질문</h2>*/}
            <section className="bg-white lg:py-12">
              <div className="lg:flex">
                <div className="mb-8 lg:w-1/2 w-full">
                  <h2 className="text-2xl font-bold my-4">
                    무엇을 도와드릴까요?
                  </h2>
                  <ul>
                    <li className="mb-2 py-1">
                      <a
                        href="/faq/list?c=2&#4"
                        className="flex items-center text-[#1B64DA] hover:underline sm:text-base text-[3.5vw]"
                      >
                        <span className="bg-blue-100 text-[#1B64DA] rounded-full w-5 h-5 flex items-center justify-center mr-2 sm:text-xs text-[2vw] font-bold">
                          Q
                        </span>
                        배송은 얼마나 걸리나요?
                      </a>
                    </li>
                    <li className="mb-2 py-1">
                      <a
                        href="/faq/list?c=3&#9"
                        className="flex items-center text-[#1B64DA] hover:underline sm:text-base text-[3.5vw]"
                      >
                        <span className="bg-blue-100 text-[#1B64DA] rounded-full w-5 h-5 flex items-center justify-center mr-2 sm:text-xs text-[2vw] font-bold">
                          Q
                        </span>
                        주문 취소는 어떻게 하나요?
                      </a>
                    </li>
                    <li className="mb-2 py-1">
                      <a
                        href="/faq/list?c=7&#7"
                        className="flex items-center text-[#1B64DA] hover:underline sm:text-base text-[3.5vw]"
                      >
                        <span className="bg-blue-100 text-[#1B64DA] rounded-full w-5 h-5 flex items-center justify-center mr-2 sm:text-xs text-[2vw] font-bold">
                          Q
                        </span>
                        제품의 자세한 정보를 알고 싶어요.
                      </a>
                    </li>
                    <li className="mb-2 py-1">
                      <a
                        href="/faq/list?c=4&#10"
                        className="flex items-center text-blue-600 hover:underline sm:text-base text-[3.5vw]"
                      >
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-2 sm:text-xs text-[2vw] font-bold">
                          Q
                        </span>
                        제품의 교환 또는 반품을 할 수 있나요?
                      </a>
                    </li>
                    <li className="mb-2 py-1">
                      <a
                        href="/faq/list?c=6&#8"
                        className="flex items-center text-blue-600 hover:underline sm:text-base text-[3.5vw]"
                      >
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-2 sm:text-xs text-[2vw] font-bold">
                          Q
                        </span>
                        비밀번호 변경은 어떻게 하나요?
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="lg:w-1/2 w-full lg:flex space-x-2 ml-auto">
                  {/*<button className="btn btn-default btn-outline shadow-md">
                    1:1 상담하기
                  </button>
                  <a href="/contacts/new" className="btn btn-outline">
                    이메일 문의하기
                  </a>
                  <button className="btn btn-outline">
                    이메일 주소 복사하기
                  </button>*/}
                  <div className="p-4 bg-gray-100 rounded-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-2.5">고객센터</h2>
                    <ol className="list-disc  list-outside pl-5 space-y-2 text-gray-700">
                      <li>평일: 전체 문의 상담</li>
                      <li>토요일, 공휴일: 오늘의집 직접배송 주문건 상담</li>
                      <li>일요일: 휴무</li>
                    </ol>
                    <ButtonGroup className="mt-10 flex-wrap flex justify-between">
                      {radios.map((radio, idx) => (
                        <Link
                          key={idx}
                          className={`btn w-full py-2  ${idx === 2 ? "btn-primary lg:w-full block mx-0" : "btn-outline px-[clamp(16px,calc(9vw-60px),90px)]"}
                           my-1
                          btn-block lg:w-auto lg:my-auto`}
                          {...(!user && {
                            onClick: (e) => {
                              e.preventDefault(); // 네비게이션 막기
                              toast("로그인 후 이용해 주세요");
                            },
                          })}
                          {...(user &&
                            idx === 0 &&
                            radio.fnc && {
                              onClick: radio.fnc,
                            })}
                          to={user && radio.path}

                          // onClick={radio.fnc}
                        >
                          {radio.name}
                        </Link>
                      ))}
                    </ButtonGroup>
                  </div>
                </div>
              </div>
            </section>

            <div>
              <nav className="pt-10 px-6 pb-0">
                {catlist.map((cat, idx) => (
                  <label htmlFor={cat.name} key={cat.name}>
                    <button
                      id={cat.name}
                      type="checkbox"
                      className={`btn btn-primary m-1 rounded-full
                      ${searchCategory == cat.value ? "" : "btn-outline"}`}
                      // onClick={() => setsearchCategory(cat.value)}
                      onClick={() => handleCategoryButtonClick(cat.value)}
                    >
                      {cat.name}
                    </button>
                  </label>
                ))}
              </nav>
            </div>
            <br />
            {faqList.length > 0 ? (
              <div>
                {faqList.map((faq, i) => (
                  <div
                    key={i}
                    className="collapse collapse-plus bg-base-100 border border-base-300"
                  >
                    <input
                      id={faq.id}
                      type="checkbox"
                      name="faqlist"
                      className="w-full"
                      checked={openId === faq.id}
                      onChange={() =>
                        setOpenId(openId === faq.id ? null : faq.id)
                      }
                    />
                    <div className="collapse-title font-semibold flex items-center">
                      <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold">
                        Q
                      </span>
                      <span> {faq.question}</span>
                    </div>
                    <pre className="collapse-content text-sm whitespace-pre-wrap break-words">
                      {faq.answer}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <p>faq를 정상적으로 불러오지 못했습니다</p>
            )}
            <br />
            <div>
              {/*관리자인지 여부 확인*/}
              {isAdmin && (
                // <Button className="btn-primary" onClick={setModalShow}>
                //   등록하기
                // </Button>
                <button
                  className="btn btn-accent"
                  // onClick={() =>
                  // document.getElementById("my_modal_1").showModal()
                  // }
                  onClick={setModalShow}
                >
                  등록하기
                </button>
              )}
            </div>
          </div>
        </Col>
        {modalShow && (
          <div id="my_modal_1" className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">FaQ 등록</h3>
              <br />
              <fieldset className="fieldset">
                <legend className="fieldset-legend">카테고리</legend>
                <select
                  className="select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option hidden disabled value="">
                    카테고리를 선택해주세요
                  </option>
                  {catlist.map((cat, idx) => (
                    <option key={idx} value={cat.value}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">faq 질문</legend>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="질문을 입력해주세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                ></input>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">faq 답변</legend>
                <textarea
                  className="textarea h-24 w-full"
                  placeholder="답변을 입력해주세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
              </fieldset>
              <div className="modal-action">
                <button
                  className="btn mx-1 btn-accent"
                  onClick={handleSaveButtonClick}
                >
                  등록
                </button>
                <form method="dialog">
                  <button
                    className="btn mx-1 btn-default"
                    onClick={() => setModalShow(false)}
                  >
                    취소
                  </button>
                </form>
                <button
                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                  onClick={() => setModalShow(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </Row>
    </>
  );
}
