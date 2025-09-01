import { useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { AuthenticationContext } from "../common/AuthenticationContextProvider.jsx";
import { Col, Row } from "react-bootstrap";
import { useSearchParams } from "react-router";
import axios from "axios";
import { toast } from "sonner";

const WS_URL = "http://localhost:8080/ws-chat";
const WS_PATH = "/ws-chat";
const SEND_DEST = "/app/chat/private";
const SEND_DEST_GROUP = "/topic/chat/";
const SUBSCRIBE_DEST = "/user/queue/messages";

export function Chat() {
  const { user, isAdmin } = useContext(AuthenticationContext);
  const [target, setTarget] = useState(""); //수신자 id
  const [text, setText] = useState(""); // 보낼 텍스트
  const [msgs, setMsgs] = useState([]); // 주고 받은 메시지들
  const [lastMsgs, setLastMsgs] = useState([]); // 주고 받은 메시지들
  const [roomUsers, setRoomUsers] = useState([]); // 현재 방의 접속자들1
  const clientRef = useRef(null); // STOMP 인스턴스 담아 둘 상자
  const effectRan = useRef(false);
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("rid") || "2222";
  const [modalshow, setModalshow] = useState(false);
  // const roomId = uuidv4();
  // const roomId = "2222";

  useEffect(() => {
    // 두번 실행 막기
    if (user?.name && !effectRan.current) {
      effectRan.current = true;
      axios
        .post("/api/chat/list", {
          roomId,
          userid: user.loginId,
          pageNum: 1,
        })
        .then((res) => {
          setLastMsgs(res.data.chatList);
        })
        .catch((err) => {
          if (err.response && err.response.status === 401) {
            toast.error("로그인 후 이용해주세요.");
            window.location.href = "/login";
          } else if (
            err.response &&
            err.response.data &&
            err.response.data.message
          ) {
          } else {
            toast.error("접근 권한이 없습니다.");
            window.location.href = "/Home";
            // toast.error("접근 권한이 없습니다");
          }
        });
    }
    if (user?.name) {
      const client = new Client({
        // webSocketFactory: () => new SockJS(WS_PATH), // SockJS 연결
        webSocketFactory: () => {
          const token = localStorage.getItem("token");
          const url = token
            ? `${WS_PATH}?Authorization=Bearer%20${token}`
            : WS_PATH;
          return new SockJS(url);
        },
        debug: (str) => {},
        reconnectDelay: 5000, // 끊기면 5초후 재연결
        connectHeaders: {
          username: user.name,
        },
      });
      client.onConnect = (frame) => {
        // 연결 성공 시
        client.subscribe(SUBSCRIBE_DEST, (message) => {
          // 서버의 json 메시지를 파싱해서 msgs 배열에 추가
          setMsgs((prev) => [...prev, JSON.parse(message.body)]);
        });

        client.subscribe(`/topic/chat/${roomId}`, (message) => {
          const data = JSON.parse(message.body);
          // console.log("📨 방 메시지 받음:", data);
          if (data.type === "CHAT") {
            setMsgs((prev) => [...prev, JSON.parse(message.body)]);
          } else if (data.type === "ENTER") {
            /*if (data.currentUsers) {
                                                                                                                                                                                                              setRoomUsers(data.currentUsers);
                                                                                                                                                                                                            }
                                                                                                                                                                                                            // 입장 메시지도 채팅창에 표시
                                                                                                                                                                                                            setMsgs((prev) => [
                                                                                                                                                                                                              ...prev,
                                                                                                                                                                                                              {
                                                                                                                                                                                                                from: "SYSTEM",
                                                                                                                                                                                                                message: data.message,
                                                                                                                                                                                                                timestamp: data.timestamp,
                                                                                                                                                                                                                type: "SYSTEM",
                                                                                                                                                                                                              },
                                                                                                                                                                                                    ]);*/
          } else if (/*data.type === "LEAVE" || */ data.type === "END") {
            if (data.currentUsers) {
              setRoomUsers(data.currentUsers);
            }
            // 퇴장 메시지도 채팅창에 표시
            setMsgs((prev) => [
              ...prev,
              {
                from: "SYSTEM",
                message: data.message,
                timestamp: data.timestamp,
                type: "SYSTEM",
              },
            ]);
          }
        });

        // 들어왔을 때 메시지 보내기
        /*client.publish({
                                                                                                                                          destination: "/app/chat/enter", // 서버의 MessageMapping 경로
                                                                                                                                          body: JSON.stringify({
                                                                                                                                            from: user.name, // 내 이름
                                                                                                                                            roomId: roomId, // 방 id (props, params 등에서 받아와야 함)
                                                                                                                                            type: "ENTER", // 필요하다면 type도 함께
                                                                                                                                            // 필요하면 다른 필드도 추가
                                                                                                                                          }),
                                                                                                                                        });*/
      };

      client.onDisconnect = () => {
        // console.log("서버 연결이 끊어졌습니다");
      };

      // 연결 활성화(connect 시도)
      client.activate();
      // 훅 박에서도 쓰기 위해 ref에 저장
      clientRef.current = client;

      // 언마운트 될 때
      return () => {
        if (client && client.connected) {
          client.publish({
            destination: "/app/chat/end", // 서버 MessageMapping 경로
            body: JSON.stringify({
              from: user.name,
              roomId: roomId,
              type: "END", // 서버 DTO와 맞추기!
            }),
          });
        }
        client.deactivate(); //연결 해제
      };
    }
  }, [user]);

  function handleChattingEndClick() {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: "/app/chat/end", // 서버 MessageMapping 경로
        body: JSON.stringify({
          from: user.name,
          roomId: roomId,
          type: "END", // 서버 DTO와 맞추기!
        }),
      });
    }
    clientRef.current.deactivate(); //연결 해제
    location.href = "/Home";
  }

  const sendGroupMessage = () => {
    if (!text.trim()) return;
    const chatMsg = {
      from: user.name,
      userid: user.id,
      message: text,
      type: "CHAT",
    };
    clientRef.current.publish({
      destination: "/app/chat/" + roomId,
      // destination: SEND_DEST_GROUP + roomId,
      body: JSON.stringify(chatMsg),
    });
    setText(""); // 입력창 초기화
  };

  useEffect(() => {}, []);

  if (!user) {
    return <span className="loading loading-spinner"></span>;
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <Row className="justify-content-center">
        <Col md={8} lg={9} className="mt-5">
          <div className="container">
            {/*<h2>1:1 상담 ({user.name})</h2>*/}

            {/*채팅 로그*/}
            <div className="border rounded-t-lg chat chat-head border-b p-2.5 border-gray-300">
              {/*1:1 상담 서비스*/}
              <h2>個別チャットサポート</h2>
            </div>
            <div className="border border-gray-300  h-150 overflow-y-auto">
              <div className="chat chat-main p-2.5 ">
                {/*더미 div*/}
                {/*삭제 x */}
                <div className="chat chat-start"></div>
                <div className="chat chat-end"></div>
                {lastMsgs.toReversed().map((m, i) => (
                  <div
                    key={i}
                    className={`chat chat-${user.name == m.user ? "end" : "start"}`}
                  >
                    <div className="chat-header">{m.user}</div>
                    <div className="chat-bubble">{m.message}</div>
                  </div>
                ))}
                {msgs.map((m, i) =>
                  m.type == "CHAT" ? (
                    <div
                      key={i}
                      className={`chat chat-${user.name == m.from ? "end" : "start"}`}
                    >
                      <div className="chat-header">{m.from}</div>
                      <div className="chat-bubble">{m.message}</div>
                    </div>
                  ) : (
                    <div key={i} className="flex w-full flex-col">
                      <div className="divider before:bg-gray-300 after:bg-gray-300 text-gray-400 text-xs">
                        {m.message}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="chat chat-footer border rounded-b-lg p-2 border-gray-300 bg-white mb-2.5 flex items-center gap-2.5">
              <input
                placeholder="メッセージを入力" // 메세지 입력
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendGroupMessage()}
                className="flex-1 text-[1rem] focus:outline-none mx-2"
              />
              <button
                className="btn btn-primary ml-auto"
                onClick={sendGroupMessage}
              >
                {/*전송*/}
                送信
              </button>
            </div>

            {clientRef.current && (
              <button
                className={"btn btn-error"}
                onClick={() => setModalshow(true)}
              >
                {/*대화 종료*/}
                チャットを終了
              </button>
            )}
          </div>
        </Col>
        {modalshow && (
          <div className="modal modal-open">
            <div className="modal-box">
              {/*대화종료*/}
              <h3 className="font-bold text-lg mb-3">チャットを終了</h3>
              {/*대화를 종료하시겠습니까?*/}
              <p className="mb-6">チャットを終了しますか？</p>
              <div className="modal-action">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleChattingEndClick();
                    setModalshow(false);
                  }}
                >
                  {/*대화 종료*/}
                  終了
                </button>
                <button
                  className="btn btn-outline btn-neutral"
                  onClick={() => setModalshow(false)}
                >
                  {/*취소*/}
                  戻る
                </button>
              </div>
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setModalshow(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <label
              className="modal-backdrop"
              onClick={() => setModalshow(false)}
            ></label>
          </div>
        )}
      </Row>
    </div>
  );
}
