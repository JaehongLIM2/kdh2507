import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router";

export function MemberList() {
  const [memberList, setMemberList] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    axios
      .get(`/api/member/list?${searchParams}`)
      .then((res) => {
        setMemberList(res.data.memberList);
        setPageInfo(res.data.pageInfo);
      })
      .catch(() => {})
      .finally(() => {});
  }, [searchParams]);

  const pageNumber = [];
  for (let i = pageInfo.leftPageNumber; i <= pageInfo.rightPageNumber; i++) {
    pageNumber.push(i);
  }

  function handlePageNumberClick(pageNumber) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("page", pageNumber);
    setSearchParams(nextSearchParams);
  }

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full max-w-[1200px] mx-auto px-4">
          <div className="rounded-card">
            <div className="w-full">
              {/*회원 목록*/}
              <h2 className="mb-6 text-center text-2xl font-bold">会員目録</h2>
              <table hover responsive className="table table-striped">
                <thead className="thead-light">
                  <tr>
                    {/*회원번호*/}
                    <th>会員番号</th>
                    {/*로그인 아이디*/}
                    <th>ログインID</th>
                    {/*이름*/}
                    <th>氏名</th>
                    {/*전화번호*/}
                    <th className="hidden md:table-cell">電話番号</th>
                    {/*이메일*/}
                    <th className="hidden md:table-cell">メール</th>
                  </tr>
                </thead>
                <tbody>
                  {memberList.map((member) => (
                    <tr
                      key={member.id}
                      onClick={() => navigate(`/member?id=${member.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{member.id}</td>
                      <td>{member.loginId}</td>
                      <td>{member.name}</td>
                      <td className="hidden md:table-cell">{member.phone}</td>
                      <td className="hidden md:table-cell">{member.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* 페이지 네이션 */}
          <div className="mt-4 flex justify-center">
            <div className="join">
              <button
                className="join-item btn"
                disabled={pageInfo.currentPageNumber === 1}
                onClick={() => handlePageNumberClick(1)}
              >
                «
              </button>

              <button
                className="join-item btn"
                disabled={pageInfo.leftPageNumber <= 1}
                onClick={() =>
                  handlePageNumberClick(pageInfo.leftPageNumber - 10)
                }
              >
                ‹
              </button>

              {pageNumber.map((num) => (
                <button
                  key={num}
                  onClick={() => handlePageNumberClick(num)}
                  className={`join-item btn ${
                    pageInfo.currentPageNumber === num
                      ? "btn-active btn-neutral"
                      : ""
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                className="join-item btn"
                disabled={pageInfo.rightPageNumber >= pageInfo.totalPages}
                onClick={() =>
                  handlePageNumberClick(pageInfo.rightPageNumber + 1)
                }
              >
                ›
              </button>

              <button
                className="join-item btn"
                disabled={pageInfo.currentPageNumber === pageInfo.totalPages}
                onClick={() => handlePageNumberClick(pageInfo.totalPages)}
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
