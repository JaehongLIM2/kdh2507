package com.example.backend.member.service;

import com.example.backend.member.dto.*;
import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.MemberRole;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.member.repository.MemberRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final MemberRoleRepository memberRoleRepository;

    // 이메일 중복확인
    public boolean existByEmail(String email) {
        return memberRepository.existsByEmail(email);
    }

    // 아이디 중복확인
    public boolean existByLoginId(String loginId) {
        return memberRepository.existsByLoginId(loginId);
    }

    // 회원 등록
    public void signup(MemberForm memberForm) {

        if (memberForm.getLoginId() != null &&
                memberForm.getLoginId().toLowerCase().contains("admin")) {
            // 아이디에 'admin'을 포함할 수 없습니다.
            throw new IllegalArgumentException("ログインIDに「admin」を含めることはできません。");
        }

        Member member = new Member();
        member.setLoginId(memberForm.getLoginId());
        member.setPassword(passwordEncoder.encode(memberForm.getPassword()));
        member.setName(memberForm.getName());
        member.setBirthday(memberForm.getBirthday());
        member.setPhone(memberForm.getPhone());
        member.setEmail(memberForm.getEmail());
        member.setAddress(memberForm.getAddress());
        member.setZipcode(memberForm.getZipCode());
        member.setAddressDetail(memberForm.getAddressDetail());
        member.setPrivacyAgreed(memberForm.getPrivacyAgreed());
        memberRepository.save(member);
    }

    // 회원 리스트 불러오기
    public Map<String, Object> list(Integer pageNumber) {

        Page<MemberListDto> memberListDtoPage
                = memberRepository.findAllBy(PageRequest.of(pageNumber - 1, 10));

        Integer totalPages = memberListDtoPage.getTotalPages();
        Integer rightPageNumber = ((pageNumber - 1) / 10 + 1) * 10;
        Integer leftPageNumber = rightPageNumber - 9;
        rightPageNumber = Math.min(rightPageNumber, totalPages);
        leftPageNumber = Math.max(leftPageNumber, 1);

        var pageInfo = Map.of(
                "totalPages", totalPages,
                "rightPageNumber", rightPageNumber,
                "leftPageNumber", leftPageNumber,
                "currentPageNumber", pageNumber
        );

        return Map.of("pageInfo", pageInfo,
                "memberList", memberListDtoPage.getContent());

    }

    // 회원 상세 정보 불러오기
    public MemberDto get(Integer id) {
        Member member = memberRepository.findById(id)
                // 존재하지 않는 회원입니다.
                .orElseThrow(() -> new RuntimeException("存在しない会員です。"));

        MemberDto memberDto = new MemberDto();
        memberDto.setId(member.getId());
        memberDto.setLoginId(member.getLoginId());
        memberDto.setName(member.getName());
        memberDto.setBirthday(member.getBirthday());
        memberDto.setPhone(member.getPhone());
        memberDto.setEmail(member.getEmail());
        memberDto.setZipCode(member.getZipcode());
        memberDto.setAddress(member.getAddress());
        memberDto.setAddressDetail(member.getAddressDetail());

        return memberDto;
    }

    public boolean delete(MemberDeleteForm memberDeleteForm) {
        Member db = memberRepository.findById(memberDeleteForm.getId())
                // 존재하지 않는 회원입니다.
                .orElseThrow(() -> new RuntimeException("存在しない会員です。"));

        String oldPassword = memberDeleteForm.getOldPassword(); // 기존 password

        // 비밀번호 불일치 시
        if (oldPassword == null || !passwordEncoder.matches(oldPassword, db.getPassword())) {
            return false;
        }

        memberRoleRepository.deleteByMember(db);

        memberRepository.delete(db);
        return true;
    }

    public void update(Integer id, MemberUpdateForm memberUpdateForm) {

        // 1. 회원 조회
        Member member = memberRepository.findById(id)
                // 존재하지 않는 회원입니다.
                .orElseThrow(() -> new RuntimeException("存在しない会員です。"));

        String oldPassword = memberUpdateForm.getOldPassword(); // 기존 password
        String newPassword = memberUpdateForm.getNewPassword(); // 새 password


        // 2. 기존 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(oldPassword, member.getPassword())) {
            // 비밀번호가 일치하지 않습니다.
            throw new RuntimeException("パスワードが一致しません。");
        }

        // 3. 수정
        member.setName(memberUpdateForm.getName());
        member.setBirthday(memberUpdateForm.getBirthday());
        member.setPhone(memberUpdateForm.getPhone());
        member.setEmail(memberUpdateForm.getEmail());
        member.setZipcode(memberUpdateForm.getZipCode());
        member.setAddress(memberUpdateForm.getAddress());
        member.setAddressDetail(memberUpdateForm.getAddressDetail());

        // 새 비밀번호가 입력된 경우에만 변경
        if (newPassword != null && !newPassword.isBlank()) {
            if (passwordEncoder.matches(newPassword, member.getPassword())) {
                // 새 비밀번호는 현재 비밀번호와 달라야합니다.
                throw new RuntimeException("新しいパスワードは現在のパスワードと異なる必要があります。");
            }

            member.setPassword(passwordEncoder.encode(newPassword));
        }

        // 5. 저장
        memberRepository.save(member);
    }


    public void changePassword(Integer memberId, ChangePasswordForm data) {
        Member member = memberRepository.findById(memberId)
                // 존재하지 않는 회원입니다.
                .orElseThrow(() -> new RuntimeException("存在しない会員です。"));

        String oldPassword = data.getOldPassword(); // 현재 password
        String newPassword = data.getNewPassword(); // 새 password

        // oldPassword 가 있을때만 검증
        if (oldPassword != null && !oldPassword.isBlank()) {
            // 1. 기존 비밀번호 확인
            if (!passwordEncoder.matches(oldPassword, member.getPassword())) {
                // 비밀번호가 일치하지 않습니다.
                throw new RuntimeException("パスワードが一致しません。");
            }
        }

        // 2. 새 비밀번호 입력 확인
        if (newPassword == null || newPassword.isBlank()) {
            // 새 비밀번호를 입력해주세요.
            throw new RuntimeException("新しいパスワードを入力してください。");
        }

        // 3. 기존과 동일한 비밀번호 사용 방지
        if (passwordEncoder.matches(newPassword, member.getPassword())) {
            // 새 비밀번호는 현재 비밀번호와 달라야합니다.
            throw new RuntimeException("新しいパスワードは現在のパスワードと異なる必要があります。");
        }
        // 4. 암호화 후 저장
        member.setPassword(passwordEncoder.encode(newPassword));
        memberRepository.save(member);
    }

    // 로그인 토큰 생성
    public String getToken(MemberLoginForm loginForm) {
        // 아이디가 맞는지
        Member db = memberRepository.findByLoginId(loginForm.getLoginId())
                // 아이디 또는 비밀번호가 일치하지 않습니다.
                .orElseThrow(() -> new RuntimeException("ログインIDまたはパスワードが一致しません。"));

        // 비밀번호가 맞지 않았을때
        if (!passwordEncoder.matches(loginForm.getPassword(), db.getPassword())) {
            // 아이디 또는 비밀번호가 일치하지 않습니다.
            throw new RuntimeException("ログインIDまたはパスワードが一致しません。");
        }

        List<MemberRole> memberRoleList = memberRoleRepository.findByMember(db);
        // stream 사용
        List<String> roles = memberRoleList.stream()
                .map(memberRole -> memberRole.getId().getRoleName())
                .collect(Collectors.toList());


        // 토큰 생성
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(String.valueOf(db.getId()))       // primaryKey 인 id
                .claim("loginId", db.getLoginId())         // 필요한 claim(loginId)
                .claim("roles", roles)
                .issuer("self")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60 * 60 * 24)) // 1일 유효
                .build();


        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }


    public String findId(String email) {

        Optional<Member> member = memberRepository.findByEmail(email);
        if (member.isPresent()) {
            String loginId = member.get().getLoginId();
            return maskedLoginId(loginId);
        }
        // 해당 이메일로 가입된 아이디가 없습니다.
        throw new NoSuchElementException("該当のメールアドレスで登録されたログインIDはありません。");
    }

    private String maskedLoginId(String loginId) {
        int length = loginId.length();
        int visible = Math.min(3, length); // 앞 최대 3글자만 표시
        String visiblePart = loginId.substring(0, visible);
        String maskedPart = "*".repeat(length - visible);
        return visiblePart + maskedPart;
    }

    public boolean existByLoginIdAndEmail(String loginId, String email) {
        return memberRepository.existsByLoginIdAndEmail(loginId, email);
    }

    // 로그인 아이디로 id 값 찾기
    public Integer getMemberIdByLoginId(String loginId) {
        return memberRepository.findByLoginId(loginId).get().getId();
    }
}

