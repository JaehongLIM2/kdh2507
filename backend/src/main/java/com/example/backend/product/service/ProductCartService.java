package com.example.backend.product.service;

import com.example.backend.member.entity.Member;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.product.dto.CartDeleteRequest;
import com.example.backend.product.dto.CartItemDto;
import com.example.backend.product.dto.CartResponseDto;
import com.example.backend.product.dto.CartUpdateRequest;
import com.example.backend.product.entity.Cart;
import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductOption;
import com.example.backend.product.repository.CartRepository;
import com.example.backend.product.repository.ProductOptionRepository;
import com.example.backend.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductCartService {
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;
    private final LoginUtill loginUtill;
    private final MemberRepository memberRepository;
    private final JwtDecoder jwtDecoder;


    public void add(CartItemDto dto) {
        Integer memberId = loginUtill.getLoginMemberId();
        Member member = memberRepository.findById(memberId).get();
        Product product = productRepository.findById(dto.getProductId()).get();
        ProductOption option = productOptionRepository.findByProductAndOptionName(product, dto.getOptionName());

        // 옵션 중복 체크 ( 동일회원 + 상품 + 옵션)
        List<Cart> existingList = cartRepository.findByMemberAndProductAndOption(member, product, option);

        if (!existingList.isEmpty()) {
            Cart merged = existingList.get(0);
            int totalQty = dto.getQuantity();

            for (int i = 1; i < existingList.size(); i++) {
                totalQty += existingList.get(i).getQuantity();
                cartRepository.delete(existingList.get(i));
            }
            merged.setQuantity(merged.getQuantity() + dto.getQuantity());
            cartRepository.save(merged);
        } else {
            Cart cart = new Cart();
            cart.setProduct(product);
            cart.setOption(option);
            cart.setQuantity(dto.getQuantity());
            cart.setMember(member);
            cartRepository.save(cart);
        }
    }

    public List<CartResponseDto> getCartList(Integer memberId) {
        List<Cart> carts = cartRepository.findByMemberId(memberId);
        List<CartResponseDto> result = new ArrayList<>();
        for (Cart cart : carts) {
            result.add(new CartResponseDto(cart));
        }
        return result;
    }


    public void deleteCartItem(List<CartDeleteRequest> deleteList) {
        for (CartDeleteRequest req : deleteList) {
            if (req.getCartId() != null) {
                cartRepository.deleteById(req.getCartId());
            }
        }

    }

    public void updateCartItem(Integer memberId, CartUpdateRequest req) {
        Cart cart = cartRepository.findById(req.getCartId()).get();
        Product product = cart.getProduct();
//        ProductOption option = productOptionRepository.findById(req.getOptionId()).get();

        // 재고 초과 검증
        if (req.getQuantity() > product.getQuantity()) {
            throw new IllegalArgumentException(product.getQuantity() + "個以上は購入できません。"); // 개 이상 구매하실 수 없습니다.
        }


        // 옵션 있는 상품처리
        if (req.getOptionId() != null) {
            ProductOption newOption = productOptionRepository.findById(req.getOptionId()).get();

            List<Cart> existingList = cartRepository.findByMemberAndProductAndOption(cart.getMember(), product, newOption);
            Cart duplicate = existingList.stream()
                    .filter(c -> !c.getId().equals(cart.getId()))
                    .findFirst()
                    .orElse(null);

            if (duplicate != null) {
                // 병합: 기존 항목에 수량 추가, 현재 항목 삭제
                duplicate.setQuantity(duplicate.getQuantity() + req.getQuantity());
                cartRepository.save(duplicate);
                cartRepository.delete(cart);
            } else {
                // 중복 항목 없음 → 그냥 수정
                cart.setOption(newOption);
                cart.setQuantity(req.getQuantity());
                cartRepository.save(cart);
            }
        } else {
            // 옵션 없는 상품
            cart.setQuantity(req.getQuantity());
            cartRepository.save(cart);
        }
    }

    public void deleteAllCart(String auth) {
        String token = auth.replace("Bearer ", "");
        Jwt jwt = jwtDecoder.decode(token);
        Integer memberId = Integer.parseInt(jwt.getSubject());
        cartRepository.deleteByMemberId(memberId);
    }
}
