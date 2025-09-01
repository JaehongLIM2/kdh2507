package com.example.backend.chat.controller;

import com.example.backend.chat.dto.AlertMsgForm;
import com.example.backend.chat.dto.ChatForm;
import com.example.backend.chat.service.ChatService;
import com.example.backend.qna.dto.QuestionAddForm;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate template;
    private final ChatService chatservice;

/*
    public ChatController(SimpMessagingTemplate template) {
        this.template = template;
        System.out.println(template);
    }*/

    @PostMapping("/api/chat/list")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getAllChats(@RequestBody Map<String, String> params,
                                           Authentication authentication) {
        String roomId = params.get("roomId");
        String userid = params.get("userid");
        Integer pageNumber = Integer.valueOf(params.get("pageNum"));

        System.out.println("roomId = " + roomId);
        System.out.println("userid = " + userid);
        System.out.println("authentication = " + authentication);

        return chatservice.list(roomId, userid, pageNumber, authentication);
    }


    @MessageMapping("/chat/private")
    @SendToUser("/queue/messages")
    public ChatForm sendPrivateMessage(ChatForm msg, Principal principal) {
        msg.setType(ChatForm.MessageType.CHAT);
        template.convertAndSendToUser(
                msg.getTo(),                // 받는 사용자 ID
                "/queue/messages",          // 구독 경로
                msg                         // 메시지 payload
        );
        return msg;
    }

    @MessageMapping("/chat/alert")
//    @SendToUser("/queue/alert")
    public AlertMsgForm sendAlertMessage(AlertMsgForm msg, Principal principal) {
        template.convertAndSendToUser(
                msg.getTo(),                // 받는 사용자 ID
                "/queue/alert",             // 구독 경로
                msg                         // 메시지 payload
        );
        return msg;
    }

    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/chat/{roomId}")
    public ChatForm sendTopicMessage(@DestinationVariable String roomId, ChatForm msg, Principal principal) {
        if (chatservice.chatRoomCheck(roomId)) {

            msg.setType(ChatForm.MessageType.CHAT);
            chatservice.add(roomId, msg);
            System.out.println("msg: " + msg);
        /*template.convertAndSendToUser(
                msg.getTo(),                // 받는 사용자 ID
                "/topic/chat/" + roomId,          // 구독 경로
                msg                         // 메시지 payload
        );*/
//        template.convertAndSend("/topic/chat/" + roomId, msg);
            return msg;
        }
        return null;
    }


   /* @MessageMapping("/chat/send")
    @SendTo("/topic/public")
    public void ChatMessage broadcast(ChatMessage msg) {
        // 받은 메시지를 그대로 /topic/public 구독자 모두에게 전송
        return msg;
    }*/

    @MessageMapping("/chat/enter")
    public void enter(ChatForm message) {
        message.setMessage(message.getFrom() + "さんが入室しました。"); // 님이 입장했습니다.
        message.setType(ChatForm.MessageType.ENTER);
        template.convertAndSend("/topic/chat/" + message.getRoomId(), message);
    }

    @MessageMapping("/chat/leave")
    public void leave(ChatForm message) {
        message.setMessage(message.getFrom() + "さんが退室しました。"); // 님이 퇴장했습니다.
        message.setType(ChatForm.MessageType.LEAVE);
        template.convertAndSend("/topic/chat/" + message.getRoomId(), message);
    }

    @MessageMapping("/chat/end")
    public void end(ChatForm message) {
        message.setMessage(message.getFrom() + "さんが会話を終了しました。"); // 님이 대화를 종료하였습니다.
        message.setType(ChatForm.MessageType.END);
        template.convertAndSend("/topic/chat/" + message.getRoomId(), message);
        chatservice.chatRoomclose(message.getRoomId());
    }
}
