import { ButtonGroup, Col, Row, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router";
import { FaRegComments, FaRegImages } from "react-icons/fa";
import { toast } from "sonner";

export function QnaList() {
  useEffect(() => {
    import("./qnaList.css");
  }, []);
  const [questionList, setQuestionList] = useState(null);
  const [pageInfo, setPageInfo] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams("1");
  const navigate = useNavigate();
  const STATUS_TEXT = {
    // open: "대기중",
    // answered: "답변완료",
    // closed: "종료",
    open: "対応待ち",
    answered: "回答完了",
    closed: "終了",
  };

  const radios = [
    // { name: "문의내역", value: "2", fnc: handleQnaListButtonClick },
    // { name: "자주 묻는 질문", value: "3", fnc: handleFaQListButtonClick },
    { name: "お問い合わせ履歴", value: "2", fnc: handleQnaListButtonClick },
    { name: "よくあるご質問", value: "3", fnc: handleFaQListButtonClick },
  ];

  useEffect(() => {
    axios
      .get(`/api/qna/list?${searchParams}`)
      .then((res) => {
        setQuestionList(res.data.questionList);
        setPageInfo(res.data.pageInfo);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          // 로그인 후 이용해주세요.
          toast.warning("ログイン後にご利用ください。");
          window.location.href = "/login";
        } else {
          // console.log("잘 안될 때 코드");
        }
      })
      .finally(() => {
        // console.log("항상 실행 코드");
      });
  }, [searchParams]);

  function handleTableRowClick(id) {
    // 게시물 보기로 이동
    navigate(`/qna/view?id=${id}`);
  }

  const pageNumbers = [];
  if (pageInfo) {
    for (let i = pageInfo.leftPageNumber; i <= pageInfo.rightPageNumber; i++) {
      pageNumbers.push(i);
    }
  }

  function handlePageNumberClick(pageNumber) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("p", pageNumber);
    setSearchParams(nextSearchParams);
  }

  // useState 안전장치
  if (!questionList) {
    return <span className="loading loading-spinner"></span>;
  }

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
    <>
      <Row className="justify-content-center">
        <Col md={8} lg={9} className="mt-5">
          <div className="container">
            {/*문의 내역*/}
            <h2 className="text-2xl font-bold my-4">お問い合わせ内容</h2>
            <div>
              <ButtonGroup>
                {radios.map((radio, idx) => (
                  <input
                    key={idx}
                    className="btn btn-outline"
                    type="radio"
                    name="바로가기"
                    aria-label={radio.name}
                    value={radio.value}
                    checked={idx === 0}
                    onClick={radio.fnc}
                    onChange={(e) => e.target.value}
                  />
                ))}
              </ButtonGroup>
            </div>
            <br />
            {questionList.length > 0 ? (
              <Table striped={true} hover={true}>
                <thead>
                  <tr>
                    <th className="num">#</th>
                    {/*답변 여부*/}
                    <th className="ansCheck">回答状況</th>
                    {/*제목*/}
                    <th className="title">件名</th>
                    {/*작성자*/}
                    <th className="d-none d-md-table-cell writer">投稿者</th>
                    {/*작성일시*/}
                    <th className="d-none d-lg-table-cell wdate">作成日時</th>
                    {/*수정일시*/}
                    <th className="d-none d-lg-table-cell edate">更新日時</th>
                  </tr>
                </thead>
                <tbody>
                  {questionList.map((question) => (
                    <tr
                      key={question.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleTableRowClick(question.id)}
                    >
                      <td>{question.id}</td>
                      <td>{STATUS_TEXT[question.status] || ""}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <span>{question.title}</span>
                        </div>
                      </td>
                      <td className="d-none d-md-table-cell">
                        {question.name}
                      </td>
                      <td className="d-none d-lg-table-cell">
                        {question.timesAgo}
                      </td>
                      <td className="d-none d-lg-table-cell">
                        {question.timesAgo2}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>
                {/*작성된 글이 없습니다. <br />새 글을 작성해 보세요.*/}
                投稿はありません。 <br />
                新しい投稿を作成してください。
              </p>
            )}
          </div>
        </Col>
      </Row>
      <Row className="my-3">
        <Col>
          <ul className="join flex justify-center">
            {/* 첫 페이지로 이동 */}
            <li>
              <button
                className="join-item btn btn-sm"
                disabled={pageInfo.currentPageNumber === 1}
                onClick={() => handlePageNumberClick(1)}
                aria-label="First Page"
              >
                &laquo;
              </button>
            </li>
            {/* 10페이지 이전 이동 */}
            <li>
              <button
                className="join-item btn btn-sm"
                disabled={pageInfo.leftPageNumber <= 1}
                onClick={() =>
                  handlePageNumberClick(pageInfo.leftPageNumber - 10)
                }
                aria-label="Previous 10 Pages"
              >
                &#8249;
              </button>
            </li>
            {/* 페이지 번호들 */}
            {pageNumbers.map((pageNumber) => (
              <li key={pageNumber}>
                <button
                  className={`join-item btn btn-sm ${
                    pageInfo.currentPageNumber === pageNumber
                      ? "btn-active btn-primary"
                      : ""
                  }`}
                  onClick={() => handlePageNumberClick(pageNumber)}
                  aria-current={
                    pageInfo.currentPageNumber === pageNumber
                      ? "page"
                      : undefined
                  }
                >
                  {pageNumber}
                </button>
              </li>
            ))}
            {/* 10페이지 이후 이동 */}
            <li>
              <button
                className="join-item btn btn-sm"
                disabled={pageInfo.rightPageNumber >= pageInfo.totalPages}
                onClick={() =>
                  handlePageNumberClick(pageInfo.rightPageNumber + 1)
                }
                aria-label="Next 10 Pages"
              >
                &#8250;
              </button>
            </li>
            {/* 마지막 페이지로 이동 */}
            <li>
              <button
                className="join-item btn btn-sm"
                disabled={pageInfo.currentPageNumber === pageInfo.totalPages}
                onClick={() => handlePageNumberClick(pageInfo.totalPages)}
                aria-label="Last Page"
              >
                &raquo;
              </button>
            </li>
          </ul>
        </Col>
      </Row>
    </>
  );
}
