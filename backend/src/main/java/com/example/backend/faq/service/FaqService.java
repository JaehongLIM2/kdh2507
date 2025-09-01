package com.example.backend.faq.service;

import com.example.backend.faq.dto.FaqListDto;
import com.example.backend.faq.dto.faqAddForm;
import com.example.backend.faq.entity.Faq;
import com.example.backend.faq.respository.FaqRepository;
import com.example.backend.member.entity.Member;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.qna.dto.QuestionAddForm;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class FaqService {
    private final FaqRepository faqRepository;
    private final MemberRepository memberRepository;

    public void hasPermission(Authentication authentication) {
        System.out.println("로그인 여부 확인");
        // 로그인 여부 확인해주는 메서드
        if (authentication == null) {
            throw new RuntimeException("権限がありません。"); // 권한이 없습니다.
        }
    }

    public Map<String, Object> list(String keyword, Integer category, Integer pageNumber) {
        Page<FaqListDto> faqListDtoPage
                = faqRepository.findAllBy(keyword, category, PageRequest.of(pageNumber - 1, 5));

        int totalPages = faqListDtoPage.getTotalPages(); // 마지막 페이지
        int rightPageNumber = ((pageNumber - 1) / 10 + 1) * 10;
        int leftPageNumber = rightPageNumber - 9;
        rightPageNumber = Math.min(rightPageNumber, totalPages);
        leftPageNumber = Math.max(leftPageNumber, 1);

        System.out.println("faqList" + faqListDtoPage.getContent());

        var pageInfo = Map.of("totalPages", totalPages,
                "rightPageNumber", rightPageNumber,
                "leftPageNumber", leftPageNumber,
                "currentPageNumber", pageNumber);

        return Map.of("pageInfo", pageInfo,
                "faqList", faqListDtoPage.getContent());
    }

    public boolean validateForAdd(faqAddForm dto) {
        if (dto.getQuestion() == null || dto.getQuestion().trim().isBlank()) {
            return false;
        }

        if (dto.getAnswer() == null || dto.getAnswer().isBlank()) {
            return false;
        }

        return true;
    }

    public void add(faqAddForm dto, Authentication authentication) {

        Faq faq = new Faq();
        faq.setQuestion(dto.getQuestion());
        faq.setAnswer(dto.getAnswer());
        faq.setCategory(dto.getCategory());

        Member user = memberRepository.findById(Integer.valueOf(authentication.getName())).get();
        faq.setUser(user);

        faqRepository.save(faq);
    }
}
