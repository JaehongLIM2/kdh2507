package com.example.backend.qna.controller;

import com.example.backend.qna.dto.AnswerAddForm;
import com.example.backend.qna.dto.QuestionAddForm;
import com.example.backend.qna.dto.QuestionDto;
import com.example.backend.qna.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/qna")
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("add")
    @PreAuthorize("isAuthenticated()")
    public Map<String, ?> addQuestion(@RequestParam int id, Authentication authentication) {

        // 로그인 여부 확인
        questionService.hasPermission(authentication);

        return questionService.addquestion(id, authentication);
    }

    @GetMapping("list")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getAllBoards(
            @RequestParam(value = "q", defaultValue = "") String keyword,
            @RequestParam(value = "p", defaultValue = "1") Integer pageNumber,
            Authentication authentication) {

        // 로그인 여부 확인
        questionService.hasPermission(authentication);


        return questionService.list(keyword, pageNumber, authentication);
    }

    @GetMapping("view")
    @PreAuthorize("isAuthenticated()")
    public QuestionDto view(@RequestParam int id, Authentication authentication) {

        // 로그인 여부 확인
        questionService.hasPermission(authentication);


        return questionService.viewQuestion(id, authentication);
    }

    @DeleteMapping("{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> delete(@PathVariable int id, Authentication authentication) {

        // 로그인 여부 확인
        questionService.hasPermission(authentication);

        questionService.deleteById(id);
        return ResponseEntity.ok().body(Map.of("message",
                Map.of("type", "success", "text", id + "문의 내역 삭제가 완료되었습니다.")));
    }

    @PostMapping("add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> add(@RequestBody QuestionAddForm dto,
                                 Authentication authentication) {
        // 유효성 검사
        boolean result = questionService.validateForAdd(dto);

        if (result) {
            questionService.add(dto, authentication);

            return ResponseEntity.ok().body(Map.of(
                    "message", Map.of(
                            "type", "success",
                            "text", "お問い合わせが完了しました。"))); // 문의가 등록되었습니다.
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", Map.of(
                            "type", "error",
                            "text", "入力内容が正しくありません。"))); // 입력한 내용이 유효하지 않습니다.
        }
    }

    @PostMapping("addAns")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addAns(@RequestBody AnswerAddForm dto,
                                    Authentication authentication) {

        // 로그인 여부 검사
        questionService.hasPermission(authentication);

        // 유효성 검사
        boolean result = questionService.validateForAddAns(dto);

        if (result) {
            questionService.addAns(dto, authentication);

            return ResponseEntity.ok().body(Map.of(
                    "message", Map.of(
                            "type", "success",
                            "text", "回答が完了しました。"))); // 답변이 등록되었습니다.
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", Map.of(
                            "type", "error",
                            "text", "入力内容が正しくありません。"))); // 입력한 내용이 유효하지 않습니다.
        }
    }
}
