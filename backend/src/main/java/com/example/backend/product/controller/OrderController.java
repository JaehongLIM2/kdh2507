package com.example.backend.product.controller;

import com.example.backend.member.repository.MemberRepository;
import com.example.backend.product.dto.order.GuestLookupRequest;
import com.example.backend.product.dto.order.GuestOrderDetailDto;
import com.example.backend.product.dto.order.OrderDetailDto;
import com.example.backend.product.dto.order.OrderDto;
import com.example.backend.product.entity.GuestOrder;
import com.example.backend.product.repository.GuestOrderRepository;
import com.example.backend.product.service.OrderService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/order/")
public class OrderController {


    private final OrderService orderService;
    private final JwtDecoder jwtDecoder;
    private final MemberRepository memberRepository;
    private final GuestOrderRepository guestOrderRepository;

    // 주문 목록 조회
    @GetMapping("/list")
    public Page<OrderDto> getOrderList(Authentication authentication,
                                       @PageableDefault(
                                               size = 5,
                                               sort = "orderDate",
                                               direction = Sort.Direction.DESC) Pageable pageable) {
        Integer memberId = Integer.parseInt(authentication.getName());
        return orderService.getOrdersByUsersLoginId(memberId, pageable);
    }

    // 주문 상세 조회
    @GetMapping("/detail/{orderToken}")
    public ResponseEntity<OrderDetailDto> getOrderDetail(@PathVariable String orderToken,
                                                         Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Integer memberId = Integer.parseInt(jwt.getSubject());

        authentication.getAuthorities()
                .forEach(a -> System.out.println("  AUTH=" + a.getAuthority()));

        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(s -> s == null ? "" : s.trim().toLowerCase())
                .anyMatch(a -> a.equals("role_admin") || a.equals("admin") || a.equals("scope_admin"));

        return ResponseEntity.ok(orderService.getOrderDetail(orderToken, memberId, isAdmin));
    }

    // 비회원 주문 조회
    @PostMapping("/guest-order/lookup")
    public ResponseEntity<?> verifyGuestOrder(@RequestBody GuestLookupRequest request,
                                              HttpSession session) {
        try {
            orderService.verifyGuestOrder(request, session);
            return ResponseEntity.ok("認証成功"); // 인증 성공
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @GetMapping("/guest-order/detail")
    public ResponseEntity<GuestOrderDetailDto> getGuestOrderDetail(HttpSession session) {
        try {
            GuestOrderDetailDto dto = orderService.getGuestOrderDetail(session);

            return ResponseEntity.ok(dto);

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

}
