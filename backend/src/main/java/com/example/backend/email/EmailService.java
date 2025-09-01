package com.example.backend.email;

import com.example.backend.util.RedisUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class EmailService {
    @Value("${spring.mail.username}")
    private String senderEmail;

    private final JavaMailSender mailSender;
    private final RedisUtil redisUtil;

    public EmailAuthResponseDto sendEmail(String toEmail) {
        // 이미 인증번호가 Redis 에 있다면 재전송 제한
        if (redisUtil.existData(toEmail)) {
            long remainTime = redisUtil.getExpire(toEmail); // 남은 유효 시간 (초 단위)
            return new EmailAuthResponseDto(false,
                    // 이미 인증번호가 전송되었습니다. ~초후 다시 시도하세요
                    "すでに認証コードが送信されています。" + remainTime + "秒後に再度お試しください。", remainTime);
        }

        try {
            MimeMessage emailForm = createEmailForm(toEmail);
            mailSender.send(emailForm);
            long remainTime = redisUtil.getExpire(toEmail); // 남은 유효 시간 (초 단위)
            return new EmailAuthResponseDto(true, "認証コードがメールで送信されました。", remainTime); // 인증번호가 메일로 전송되었습니다.
        } catch (MessagingException | MailSendException e) {
            return new EmailAuthResponseDto(false, "メール送信中にエラーが発生しました。もう一度お試しください。", 0); // 메일 전송 중 오류가 발생하였습니다. 다시 시도해주세요.
        }
    }

    private MimeMessage createEmailForm(String email) throws MessagingException {

        String authCode = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));

        MimeMessage message = mailSender.createMimeMessage();
        message.setFrom(senderEmail);
        message.setRecipients(MimeMessage.RecipientType.TO, email);
        message.setSubject("コーデハンの認証コードです。"); // 코데헌 인증코드입니다.
        message.setText(setContext(authCode), "utf-8", "html");

        redisUtil.setDataExpire(email, authCode, 3 * 60L); // 3분

        return message;
    }

    private String setContext(String authCode) {
        String body = "";
        body += "<h3>" + "コーデハンの認証コードです。" + "</h3>"; // 코데헌 인증코드입니다.
        body += "<h4>" + "認証コードを入力してください。" + "</h4>"; // 인증코드를 입력하세요.
        body += "<h2>" + "[ " + authCode + " ]" + "</h2>";
        return body;
    }

    public EmailAuthResponseDto validateAuthCode(String email, String authCode) {
        String findAuthCode = redisUtil.getData(email);
        if (findAuthCode == null) {
            // 인증번호가 만료되었습니다. 다시 시도해주세요.
            return new EmailAuthResponseDto(false, "認証コードの有効期限が切れました。再度お試しください。", 0);
        }

        if (findAuthCode.equals(authCode)) {
            redisUtil.deleteData(email);
            // 인증에 성공했습니다.
            return new EmailAuthResponseDto(true, "認証に成功しました。", 0);

        } else {
            // 인증번호가 일치하지 않습니다.
            return new EmailAuthResponseDto(false, "認証コードが一致しません", 0);
        }
    }
}