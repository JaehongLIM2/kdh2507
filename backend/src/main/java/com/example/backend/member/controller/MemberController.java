package com.example.backend.member.controller;

import com.example.backend.member.dto.*;
import com.example.backend.member.entity.Member;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.member.service.MemberService;
import com.example.backend.util.RedisUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {

    private final MemberService memberService;
    private final RedisUtil redisUtil;
    private final MemberRepository memberRepository;

    // 회원 등록
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid MemberForm memberForm,
                                    BindingResult bindingResult,
                                    Authentication authentication) {

        // 로그인 된 상태에서 회원가입 방어
        if (authentication != null &&
                authentication.isAuthenticated() &&
                !(authentication instanceof AnonymousAuthenticationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of("message", Map.of("type", "error", "text", "이미 로그인되어 있습니다.")));
        }

        // 오류 메세지 보여주기
        // 입력값의 오류가 있을때(정규식과 일치하지않을때)
        if (bindingResult.hasErrors()) {
            String message = bindingResult.getAllErrors().get(0).getDefaultMessage();
            return ResponseEntity.status(400).body(
                    Map.of("message",
                            Map.of("type", "error",
                                    "text", message)));
        }

        // 아이디 중복 검사
        if (memberService.existByLoginId(memberForm.getLoginId())) {
            return ResponseEntity.status(400).body(
                    Map.of("message", Map.of(
                            "type", "error",
                            "text", "すでに使用されているログインIDです。" // 이미 사용중인 아이디입니다.
                    ))
            );
        }

        // 이메일 중복 검사
        if (memberService.existByEmail(memberForm.getEmail())) {
            return ResponseEntity.status(400).body(
                    Map.of("message", Map.of(
                            "type", "error",
                            "text", "すでに使用されているメールアドレスです。" // 이미 사용중인 이메일입니다.
                    ))
            );
        }

        // 개인 정보 수집 및 이용 동의
        if (Boolean.FALSE.equals(memberForm.getPrivacyAgreed())) {
            throw new IllegalArgumentException("個人情報の収集および利用への同意が必要です。"); // 개인정보 수집 및 이용 동의가 필요합니다.
        }

        // 유효성 검사를 통과했을 때 실행
        memberService.signup(memberForm);
        return ResponseEntity.ok().body(
                Map.of("message",
                        Map.of("type", "success",
                                "text", "会員登録が完了しました。"))); // 회원가입 되었습니다.

    }

    // 아이디 중복 확인
    @GetMapping("/check-id")
    public ResponseEntity<?> checkLoginId(@RequestParam String loginId) {

        boolean exists = memberService.existByLoginId(loginId);

        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // 이메일 중복 확인
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {

        boolean exists = memberService.existByEmail(email);

        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // 회원 리스트 조회
    @GetMapping("/list")
    @PreAuthorize("hasAuthority('admin')")
    public Map<String, Object> memberList(@RequestParam(value = "page", defaultValue = "1") Integer pageNumber) {
        return memberService.list(pageNumber);
    }

    // 회원 정보 조회
    @GetMapping(params = "id")
    @PreAuthorize("isAuthenticated() or hasAuthority('admin')")
    public ResponseEntity<?> getMember(@RequestParam Integer id, Authentication authentication) {
        if (authentication.getName().equals(id.toString()) ||
                authentication.getAuthorities().contains(new SimpleGrantedAuthority("admin"))) {
            return ResponseEntity.ok().body(memberService.get(id));
        } else {
            return ResponseEntity.status(403).build();
        }
    }

    // 회원 탈퇴
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteMember(@RequestBody @Valid MemberDeleteForm memberDeleteForm,
                                          Authentication authentication) {
        // 로그인한 회원 본인만 탈퇴 가능
        if (!authentication.getName().equals(memberDeleteForm.getId().toString())) {
            return ResponseEntity.status(403).build();
        }
        boolean deleted = memberService.delete(memberDeleteForm);
        if (deleted) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 회원 정보 수정
    @PutMapping("{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateMember(@PathVariable Integer id,
                                          @RequestBody @Valid MemberUpdateForm memberUpdateForm,
                                          Authentication authentication,
                                          BindingResult bindingResult) {

        // 로그인한 회원 본인만 수정 가능
        if (!authentication.getName().equals(memberUpdateForm.getId().toString())) {
            return ResponseEntity.status(403).build();
        }

        // 입력값 일치하지않았을때
        if (bindingResult.hasErrors()) {
            String message = bindingResult.getAllErrors().get(0).getDefaultMessage();
            return ResponseEntity.status(400).body(
                    Map.of("message",
                            Map.of("type", "error",
                                    "text", message)));
        }

        try {
            memberService.update(id, memberUpdateForm);
        } catch (Exception e) {
            e.printStackTrace();
            String message = e.getMessage();
            return ResponseEntity.status(401).body(
                    Map.of("message",
                            Map.of("type", "error",
                                    "text", message)));
        }
        return ResponseEntity.ok().body(
                Map.of("message",
                        Map.of("type", "success",
                                "text", "会員情報が更新されました。"))); // 회원정보가 수정되었습니다.
    }

    // 비밀번호 수정
    @PutMapping("changePassword")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@RequestBody @Valid ChangePasswordForm data,
                                            Authentication authentication) {
        // 로그인한 본인 아이디
        Integer memberId = Integer.valueOf(authentication.getName()); // JWT sub에서 추출

        try {
            memberService.changePassword(memberId, data);
        } catch (RuntimeException e) {
            e.printStackTrace();
            String message = e.getMessage();
            return ResponseEntity.badRequest().body(
                    Map.of("message",
                            Map.of("type", "error",
                                    "text", message)));
        } catch (Exception e) {
            e.printStackTrace();
            String message = e.getMessage();
            // 403 : 권한 없음
            return ResponseEntity.status(500).body(
                    Map.of("message",
                            Map.of("type", "error",
                                    "text", message)));
        }
        return ResponseEntity.ok().body(
                Map.of("message",
                        Map.of("type", "success",
                                "text", "パスワードが変更されました。"))); // 암호가 수정되었습니다.
    }


    // 로그인
    @PostMapping("login")
    public ResponseEntity<?> login(@RequestBody MemberLoginForm loginForm) {


        try {
            String token = memberService.getToken(loginForm);
            return ResponseEntity.ok().body(
                    Map.of("token", token,
                            "message",
                            Map.of("type", "success",
                                    "text", "ログインしました。"))); // 로그인 되었습니다.
        } catch (Exception e) {
            e.printStackTrace();
            String message = e.getMessage();
            return ResponseEntity.status(401).body(
                    Map.of("message",
                            Map.of("type", "error",
                                    "text", message)));
        }
    }

    // 아이디 찾기
    @GetMapping("find-id")
    public ResponseEntity<?> findLoginId(@RequestParam String email) {
        try {
            String maskedId = memberService.findId(email);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "loginId", maskedId
            ));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // 아이디와 이메일이 같은 계정의 것인지
    @GetMapping("check-id-email")
    public ResponseEntity<?> checkIdEmailMatch(@RequestParam String loginId,
                                               @RequestParam String email) {

        boolean matched = memberService.existByLoginIdAndEmail(loginId, email);

        if (matched) {
            return ResponseEntity.ok().body(Map.of("matched", true));
        } else {
            return ResponseEntity.ok().body(Map.of("matched", false));
        }
    }

    @PostMapping("/issue-reset-token")
    public ResponseEntity<?> issueResetToken(@RequestBody IdEmailDto dto) {
        if (!memberService.existByLoginIdAndEmail(dto.getLoginId(), dto.getEmail())) {
            return ResponseEntity.status(400).body("一致する情報がありません。"); // 일치하는 정보가 없습니다.
        }
        String token = UUID.randomUUID().toString();
        redisUtil.setDataExpire(token, dto.getLoginId(), 180); //3분 TTL

        return ResponseEntity.ok().body(Map.of("token", token));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordForm form) {
        String loginId = redisUtil.getData(form.getToken());
        if (loginId == null) {
            return ResponseEntity.status(400).body("期限切れまたは無効なトークンです。"); // 만료되었거나 유효하지 않은 토큰입니다.
        }
        // 로그인 아이디로 회원 조회 -> memberId(Integer 추출)
        Integer memberId = memberService.getMemberIdByLoginId(loginId);

        ChangePasswordForm passwordForm = new ChangePasswordForm();
        passwordForm.setNewPassword(form.getNewPassword());

        memberService.changePassword(memberId, passwordForm);
        redisUtil.deleteData(form.getToken());

        return ResponseEntity.ok().body(Map.of("success", true));
    }
}

