package com.example.backend.product.controller;

import com.example.backend.member.dto.MemberDto;
import com.example.backend.member.entity.Member;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.product.dto.*;
import com.example.backend.product.entity.*;
import com.example.backend.product.repository.GuestOrderRepository;
import com.example.backend.product.repository.ProductOptionRepository;
import com.example.backend.product.repository.ProductRepository;
import com.example.backend.product.repository.ProductThumbnailRepository;
import com.example.backend.product.service.ProductService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.format.DateTimeFormatter;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/product")
public class ProductController {

    private final ProductService productService;
    private final GuestOrderRepository guestOrderRepository;
    private final ProductRepository productRepository;
    private final ProductThumbnailRepository productThumbnailRepository;
    private final ProductOptionRepository productOptionRepository;
    private final MemberRepository memberRepository;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    public class OrderTokenGenerator {
        private static final SecureRandom random = new SecureRandom();

        public static String generateToken() {
            // 오늘 날짜(yyyyMMdd)
            String datePart = LocalDate.now().format(DATE_FORMAT);

            // 랜던 16자리 숫자
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 12; i++) {
                sb.append(random.nextInt(10));
            }
            return datePart + "-" + sb.toString();
        }
    }

    // 비회원 주문
    @PostMapping("/order/guest")
    public ResponseEntity<?> createGuestOrder(@RequestBody List<GuestOrderRequestDto> dtoList) {
        if (dtoList.isEmpty()) {
            // 주문 항목이 없습니다.
            return ResponseEntity.badRequest().body("注文項目がありません。");
        }

        // GuestOrder 생성
        GuestOrder order = new GuestOrder();
        GuestOrderRequestDto first = dtoList.get(0);

        order.setGuestName(first.getGuestName());
        order.setGuestPhone(first.getGuestPhone());
        order.setReceiverName(first.getReceiverName());
        order.setReceiverPhone(first.getReceiverPhone());
        order.setReceiverAddress(first.getShippingAddress());
        order.setReceiverAddressDetail(first.getAddressDetail());
        order.setReceiverZipcode(first.getZipcode());
        order.setMemo(first.getMemo());

        String token = OrderTokenGenerator.generateToken();
        order.setGuestOrderToken(token);

        int itemsSubtotal = 0;
        List<GuestOrderItem> itemList = new ArrayList<>();

        for (GuestOrderRequestDto dto : dtoList) {
            Product product = productRepository.findById(dto.getProductId())
                    // 상품이 존재하지 않습니다.
                    .orElseThrow(() -> new RuntimeException("商品が存在しません。"));

            Integer qty = dto.getQuantity();
            if (product.getQuantity() < qty) {
                // 재고가 부족합니다.
                throw new RuntimeException("在庫が不足しています。");
            }

            Integer unitPrice = product.getPrice();

            Integer lineTotal = unitPrice * qty;
            itemsSubtotal += lineTotal;

            // 재고 차감
            product.setQuantity(product.getQuantity() - qty);
            productRepository.save(product);

            // GuestOrderItem 생성
            GuestOrderItem item = new GuestOrderItem();
            item.setGuestOrder(order);
            item.setProduct(product);
            item.setProductName(product.getProductName());
            item.setQuantity(qty);
            item.setPrice(unitPrice);
            item.setTotalPrice(lineTotal);

            if (dto.getOptionId() != null) {
                ProductOption option = productOptionRepository.findById(dto.getOptionId()).orElse(null);
                item.setOption(option);
                item.setOptionName(option != null ? option.getOptionName() : null);
            }

            itemList.add(item);
        }

        Integer shippingFee = (itemsSubtotal >= 100000) ? 0 : 3000;

        order.setItemsSubtotal(itemsSubtotal);
        order.setShippingFee(shippingFee);
        order.setTotalPrice(itemsSubtotal + shippingFee);

        order.setItems(itemList);
        guestOrderRepository.save(order); // 로 item도 같이 저장됨

//        session.setAttribute("guestOrderToken", token);

        return ResponseEntity.ok(Map.of(
                "guestOrderToken", order.getGuestOrderToken()
        ));
    }


    @GetMapping("/member/info")
    public ResponseEntity<?> getMemberInfo(@RequestHeader("Authorization") String auth) {
        MemberDto dto = productService.getmemberinfo(auth);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/order")
    public ResponseEntity<?> createOrder(@RequestBody List<OrderRequest> reqList,
                                         @RequestHeader("Authorization") String auth) {

        String orderToken = productService.order(reqList, auth);
        return ResponseEntity.ok(Map.of("orderToken", orderToken));
    }

    @PostMapping(value = "/edit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void editProduct(
            @RequestParam Integer id,
            @RequestParam String productName,
            @RequestParam Integer price,
            @RequestParam String category,
            @RequestParam String info,
            @RequestParam Integer quantity,
            @RequestParam(required = false) List<String> deletedImages,
            @RequestParam(required = false) List<MultipartFile> newImages,
            @RequestParam(required = false) List<String> deletedThumbnails,
            @RequestParam(required = false) List<MultipartFile> newThumbnails,
            @RequestParam(required = false) String optionsJson // ★ JSON 문자열로 받기
    ) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        List<ProductOptionDto> options = null;
        if (optionsJson != null && !optionsJson.isEmpty()) {
            options = mapper.readValue(optionsJson, new TypeReference<List<ProductOptionDto>>() {
            });
        }

        ProductEditDto dto = new ProductEditDto();
        dto.setProductName(productName);
        dto.setPrice(price);
        dto.setCategory(category);
        dto.setInfo(info);
        dto.setQuantity(quantity);
        dto.setDeletedImages(deletedImages);
        dto.setNewImages(newImages);
        dto.setDeletedThumbnails(deletedThumbnails);
        dto.setNewThumbnails(newThumbnails);
        dto.setOptions(options);

        productService.edit(id, dto);
    }


    @DeleteMapping("/delete")
    public void delete(@RequestParam Integer id) {
        productService.delete(id);
    }

    @GetMapping("/view")
    public ProductDto view(@RequestParam(defaultValue = "") Integer id) {

        return productService.view(id);
    }

    @GetMapping("/list")
    public ResponseEntity<?> list(@RequestParam(defaultValue = "1") Integer page,
                                  @RequestParam(required = false) String keyword,
                                  @RequestParam(required = false) String sort,
                                  @RequestParam(required = false) String category) {
        return ResponseEntity.ok(productService.list(page, keyword, sort, category));
    }

    // 상품 등록
    @PostMapping(value = "/regist", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> regist(@RequestParam String productName,
                                    @RequestParam Integer price,
                                    @RequestParam Integer quantity,
                                    @RequestParam String category,
                                    @RequestParam String info,
                                    @RequestParam String options,
                                    @RequestParam String detailText,
                                    @RequestParam("thumbnails") List<MultipartFile> thumbnails,
                                    @RequestParam(value = "detailImages", required = false) List<MultipartFile> detailImages) {
        ObjectMapper objectMapper = new ObjectMapper();
        List<ProductOptionDto> optionList;
        try {
            optionList = objectMapper.readValue(options, new TypeReference<List<ProductOptionDto>>() {
            });
        } catch (Exception e) {
            // 오류가 발생하였습니다.
            return ResponseEntity.badRequest().body("エラーが発生しました。");
        }
        ProductRegistDto form = new ProductRegistDto();
        form.setProductName(productName);
        form.setPrice(price);
        form.setQuantity(quantity);
        form.setCategory(category);
        form.setInfo(info);
        form.setOptions(optionList);
        form.setThumbnails(thumbnails);
        form.setDetailImages(detailImages);
        form.setDetailText(detailText);

        productService.add(form);

        return ResponseEntity.ok().build();
    }


    // 우측배너 주간판매량 10개이상 제품 중에서 랜덤으로 4개
    @GetMapping("/hot-random")
    public ResponseEntity<List<ProductMainSlideDto>> getRandomHotProducts() {
//        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        PageRequest pageable = PageRequest.of(0, 5);
        List<ProductMainSlideDto> result = productRepository.findHotProductsRandomLimit(pageable);
        return ResponseEntity.ok(result);
    }

    // 좌측배너 썸네일이미지 주간판매량 10개이상아이템 중 랜덤 1개
    @GetMapping("/main-thumbnail-random")
    public ResponseEntity<ThumbnailDto> getRandomMainThumbnail() {
        List<ProductThumbnail> mainThumbnails = productThumbnailRepository.findByIsMainTrue();

        if (mainThumbnails.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ProductThumbnail randomThumbnail = mainThumbnails.get(new SecureRandom().nextInt(mainThumbnails.size()));
        Product linkedProduct = randomThumbnail.getProduct(); //연관된 상품 꺼냄

        if (linkedProduct == null || linkedProduct.getId() == null) {
            return ResponseEntity.badRequest().build();
        }

        ThumbnailDto dto = new ThumbnailDto();
        dto.setStoredPath(randomThumbnail.getStoredPath());
        dto.setIsMain(true);
        dto.setProductId(linkedProduct.getId()); // productId 세팅

        return ResponseEntity.ok(dto);
    }


    // 누적판매량 제일 많은 아이템 3개
    @GetMapping("/best")
    public ResponseEntity<List<ProductBestDto>> getTopProducts(@RequestParam(required = false) String category,
                                                               @RequestParam(required = false, defaultValue = "3") Integer limit) {
        List<ProductBestDto> topProducts = productService.getTopSellingProducts(category, limit);
        return ResponseEntity.ok(topProducts);
    }

    // 단일 상품 조회
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Integer id) {
        ProductDto product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }

    // 최근 본 상품 추가
    @PostMapping("/{productId}")
    public ResponseEntity<Void> addRecentView(Authentication authentication,
                                              @PathVariable Integer productId) {
        // JWT subject에서 memberId 꺼내기
        String memberIdStr = authentication.getName();
        Integer memberId = Integer.parseInt(memberIdStr);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("会員なし")); // 회원없음
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("商品なし")); // 상품없음

        productService.addRecentView(member, product);
        return ResponseEntity.ok().build();
    }

    // 최근 본 상품 조회
    @GetMapping
    public ResponseEntity<List<ProductDto>> getRecentProducts(Authentication authentication) {
        String memberIdStr = authentication.getName();
        Integer memberId = Integer.parseInt(memberIdStr);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("会員なし")); // 회원없음

        List<ProductDto> recentProducts = productService.getRecentProducts(member);
        return ResponseEntity.ok(recentProducts);
    }

}
