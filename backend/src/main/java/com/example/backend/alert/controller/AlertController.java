package com.example.backend.alert.controller;

import com.example.backend.alert.dto.AlertAddForm;
import com.example.backend.alert.service.AlertService;
import com.example.backend.qna.dto.QuestionAddForm;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/alert")
public class AlertController {

    private final AlertService alertService;


    @GetMapping("list")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getAllAlerts(
            @RequestParam(value = "q", defaultValue = "") String keyword,
            @RequestParam(value = "p", defaultValue = "1") Integer pageNumber,
            Authentication authentication) {

        // 로그인 여부 확인
        alertService.hasPermission(authentication);


        return alertService.list(keyword, pageNumber, authentication);
    }

    @PostMapping("add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> add(@RequestBody AlertAddForm dto,
                                 Authentication authentication) {
        // 유효성 검사
        boolean result = alertService.validateForAdd(dto);

        if (result) {
            alertService.add(dto, authentication);

            return ResponseEntity.ok().body(Map.of(
                    "message", Map.of(
                            "type", "success",
                            "text", "お問い合わせが完了しました。"))); // 문의가 등록되었습니다.
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", Map.of(
                            "type", "error",
                            "text", "入力内容が正しくありません。"))); // 입력한 내용이 유효하지않습니다.
        }
    }

    @PostMapping("addOrder")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> addOrder(@RequestBody AlertAddForm dto,
                                        Authentication authentication) {
        // 유효성 검사
        boolean result = alertService.validateForAdd(dto);

        if (result) {
            alertService.addOrder(dto, authentication);

            String adminId = alertService.findAdmin();

            return Map.of("adminId", adminId);
        } else {
            return Map.of(
                    "type", "error",
                    "text", "入力内容が正しくありません。"); // 입력한 내용이 유효하지않습니다.
        }
    }
}
