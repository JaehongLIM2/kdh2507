package com.example.backend.faq.controller;

import com.example.backend.faq.dto.faqAddForm;
import com.example.backend.faq.service.FaqService;
import com.example.backend.qna.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/faq")
public class FaqController {

    private final QuestionService questionService;
    private final FaqService faqService;

    @GetMapping("list")
    public Map<String, Object> getAllFaqs(
            @RequestParam(value = "q", defaultValue = "") String keyword,
            @RequestParam(value = "c", required = false) Integer category,
            @RequestParam(value = "p", defaultValue = "1") Integer pageNumber) {

        if (category != null && category == 0) {
            category = null;
        }


        return faqService.list(keyword, category, pageNumber);
    }

    @PostMapping("add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addFaq(@RequestBody faqAddForm dto, Authentication authentication) {

        // 로그인 여부 검사
        faqService.hasPermission(authentication);

        // 유효성 검사
        boolean result = faqService.validateForAdd(dto);

        if (result) {
            faqService.add(dto, authentication);

            return ResponseEntity.ok().body(Map.of(
                    "message", Map.of(
                            "type", "success",
                            "text", "FAQの登録が完了しました"))); // FAQ가 등록되었습니다.
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", Map.of(
                            "type", "error",
                            "text", "入力内容が正しくありません。"))); // 입력한 내용이 유효하지않습니다.
        }
    }
}
