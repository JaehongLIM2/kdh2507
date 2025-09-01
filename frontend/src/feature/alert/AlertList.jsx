import { Col, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router";
import { toast, Toaster } from "sonner";
import { useAlertWebSocket } from "./alertContext.jsx";

export function AlertList() {
  const [alertList, setAlertList] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams("1");
  const { setAlertCount } = useAlertWebSocket();

  useEffect(() => {
    axios
      .get(`/api/alert/list?${searchParams}`)
      .then((res) => {
        setAlertList(res.data.alertList);
        setAlertCount(0);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          // 로그인 후 이용해주세요.
          toast("ログイン後にご利用ください。");
          window.location.href = "/login";
        }
      });
  }, [searchParams]);

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const now = new Date();

    // 시간 차이 계산
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // 상대적 시간
    // if (diffMinutes < 1) return "방금 전";
    // if (diffMinutes < 60) return `${diffMinutes}분 전`;
    // if (diffHours < 24) return `${diffHours}시간 전`;
    // if (diffDays < 7) return `${diffDays}일 전`;
    if (diffMinutes < 1) return "たった今";
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    // 일주일 이상이면 실제 날짜 표시
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  if (!alertList) {
    return <span className="loading loading-spinner"></span>;
  }

  return (
    <div>
      <Row>
        <Col>
          <div
            className={
              "container page-wrapper p-4 sm:p-6 md:p-8 max-[480px]:p-0"
            }
          >
            <div
              className={
                "w-full max-w-[600px] mx-auto sm:px-4 max-[500px]:px-4 p-0"
              }
            >
              <div className={"rounded-card"}>
                {/*알림*/}
                <h2>通知</h2>

                {alertList.length > 0 ? (
                  <div>
                    <ul className="list bg-base-100 rounded-box shadow-md">
                      {alertList.map((alert, i) => (
                        <li className="list-row block w-full" key={i}>
                          <Link
                            className="block relative w-full"
                            to={alert.link}
                          >
                            <div className="flex justify-between items-start m-1 w-full overflow-hidden">
                              <div className="flex-1 min-w-0 pr-4">
                                <div className="truncate">{alert.title}</div>
                                <div className="text-xs uppercase font-semibold opacity-60 truncate">
                                  {alert.content}
                                </div>
                              </div>
                              <div className="flex flex-col items-end text-right flex-shrink-0">
                                <div className="text-xs truncate md:max-w-none">
                                  {alert.requester}
                                </div>
                                <span className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                  {formatDate(alert.createdAt)}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  // 알림이 없습니다.
                  <p>通知はありません。</p>
                )}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
