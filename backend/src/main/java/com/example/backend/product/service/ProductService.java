package com.example.backend.product.service;

import com.example.backend.member.dto.MemberDto;
import com.example.backend.member.entity.Member;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.product.controller.ProductController;
import com.example.backend.product.dto.*;
import com.example.backend.product.entity.*;
import com.example.backend.product.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductOptionRepository productOptionRepository;
    private final S3Uploader s3Uploader;
    private final JwtDecoder jwtDecoder;
    private final MemberRepository memberRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final GuestOrderRepository guestOrderRepository;
    private final GuestOrderItemRepository guestOrderItemRepository;
    private final ProductCommentRepository productCommentRepository;
    private final ProductThumbnailRepository productThumbnailRepository;
    private final CartRepository cartRepository;
    private final RecentViewRepository recentViewRepository;

    // url에서 key만 따오는 메소드
    private String extractS3Key(String url) {
        // 예: https://bucket.s3.region.amazonaws.com/123/abc.jpg -> 123/abc.jpg
        return url.substring(url.indexOf(".com/") + 5);
    }

    public void add(ProductRegistDto dto) {
        // 상품 저장
        Product product = new Product();
        product.setProductName(dto.getProductName());
        product.setPrice(dto.getPrice());
        product.setCategory(dto.getCategory());
        product.setInfo(dto.getInfo());
        product.setQuantity(dto.getQuantity());
        product.setDetailText(dto.getDetailText());
        productRepository.save(product);

        //옵션 저장
        if (dto.getOptions() != null && !dto.getOptions().isEmpty()) {
            List<ProductOption> optionList = new ArrayList<>();
            for (ProductOptionDto opt : dto.getOptions()) {
                ProductOption option = new ProductOption();
                option.setOptionName(opt.getOptionName());
                option.setPrice(opt.getPrice());
                option.setProduct(product);
                optionList.add(option);
            }
            productOptionRepository.saveAll(optionList);
        }
        // 썸네일 저장
        List<ProductThumbnail> thumbnailList = new ArrayList<>();
        if (dto.getThumbnails() != null) {
            for (int i = 0; i < dto.getThumbnails().size(); i++) {
                MultipartFile file = dto.getThumbnails().get(i);
                if (!file.isEmpty()) {
                    try {
                        String s3Url = s3Uploader.upload(file, String.valueOf(product.getId()));
                        ProductThumbnail thumb = new ProductThumbnail();
                        thumb.setOriginalFileName(file.getOriginalFilename());
                        thumb.setStoredPath(s3Url);
                        thumb.setProduct(product);
                        thumb.setIsMain(i == 0); // 첫 번째 이미지를 대표로 설정
                        thumbnailList.add(thumb);
                    } catch (IOException e) {
                        throw new RuntimeException("썸네일 업로드 실패: " + e.getMessage(), e);
                    }
                }
            }
            productThumbnailRepository.saveAll(thumbnailList);
        }
        // 본문 이미지 저장
        List<ProductImage> imageList = new ArrayList<>();
        if (dto.getDetailImages() != null) {
            for (MultipartFile file : dto.getDetailImages()) {
                if (!file.isEmpty()) {
                    try {
                        String s3Url = s3Uploader.upload(file, String.valueOf(product.getId()));
                        ProductImage image = new ProductImage();
                        image.setOriginalFileName(file.getOriginalFilename());
                        image.setStoredPath(s3Url);
                        image.setProduct(product);
                        imageList.add(image);
                    } catch (IOException e) {
                        throw new RuntimeException("본문 이미지 업로드 실패: " + e.getMessage(), e);
                    }
                }
            }
            productImageRepository.saveAll(imageList);
        }
    }


    public Map<String, Object> list(Integer pageNumber, String keyword, String sort, String category) {
        Page<Product> page;
        Pageable pageable;

        // 기본 페이지네이션
        Sort sortOption;
        switch (sort) {
            case "price_asc":
                sortOption = Sort.by(Sort.Direction.ASC, "price");
                break;
            case "price_desc":
                sortOption = Sort.by(Sort.Direction.DESC, "price");
                break;
            default:
                sortOption = Sort.by(Sort.Direction.DESC, "id"); // 최신순
        }
        pageable = PageRequest.of(pageNumber - 1, 15, sortOption);

        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        boolean hasCategory = category != null && !category.trim().isEmpty();

        if ("popular".equals(sort)) {
            if (hasCategory) {
                if (hasKeyword) {
                    page = productRepository.findByCategoryAndKeywordOrderByPopularity(category, keyword, pageable);
                } else {
                    page = productRepository.findByCategoryOrderByPopularity(category, pageable);
                }
            } else {
                if (hasKeyword) {
                    page = productRepository.findByKeywordOrderByPopularity(keyword, pageable);
                } else {
                    page = productRepository.findAllOrderByPopularity(pageable);
                }
            }
        } else {
            if (hasCategory) {
                if (hasKeyword) {
                    page = productRepository.findByCategoryAndKeyword(category, keyword, pageable);
                } else {
                    page = productRepository.findByCategory(category, pageable);
                }
            } else {
                if (hasKeyword) {
                    page = productRepository.findByKeyword(keyword, pageable);
                } else {
                    page = productRepository.findAll(pageable);
                }
            }
        }

        List<ProductDto> content = new ArrayList<>();
        for (Product product : page.getContent()) {
            ProductDto dto = new ProductDto();
            dto.setId(product.getId());
            dto.setProductName(product.getProductName());
            dto.setPrice(product.getPrice());
            dto.setQuantity(product.getQuantity());
            dto.setInsertedAt(product.getInsertedAt());
            dto.setHot(isHotProduct(product.getId()));

            if (!product.getThumbnails().isEmpty()) {
                ProductThumbnail t = product.getThumbnails().get(0);
                ThumbnailDto thumbDto = new ThumbnailDto();
                thumbDto.setStoredPath(t.getStoredPath());
                thumbDto.setIsMain(Boolean.TRUE.equals(t.getIsMain()));
                dto.setThumbnailPaths(List.of(thumbDto));
            }

            content.add(dto);
        }


        int totalPages = page.getTotalPages();
        int rightPageNumber = ((pageNumber - 1) / 5 + 1) * 5;
        int leftPageNumber = rightPageNumber - 4;
        rightPageNumber = Math.min(rightPageNumber, totalPages);
        leftPageNumber = Math.max(leftPageNumber, 1);

        var pageInfo = Map.of(
                "totalPages", totalPages,
                "currentPageNumber", pageNumber,
                "leftPageNumber", leftPageNumber,
                "rightPageNumber", rightPageNumber
        );

        return Map.of(
                "pageInfo", pageInfo,
                "productList", content
        );
    }


    public ProductDto view(Integer id) {
        Product product = productRepository.findById(id).get();
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setProductName(product.getProductName());
        dto.setPrice(product.getPrice());
        dto.setCategory(product.getCategory());
        dto.setInfo(product.getInfo());
        dto.setQuantity(product.getQuantity());
        dto.setDetailText(product.getDetailText());
        dto.setHot(isHotProduct(product.getId()));
        dto.setInsertedAt(product.getInsertedAt());

        // 썸네일 목록
        List<ThumbnailDto> thumbnailPaths = new ArrayList<>();
        for (ProductThumbnail t : product.getThumbnails()) {
            ThumbnailDto thumbDto = new ThumbnailDto();
            thumbDto.setStoredPath(t.getStoredPath());
            thumbDto.setIsMain(Boolean.TRUE.equals(t.getIsMain()));
            thumbnailPaths.add(thumbDto);
        }
        dto.setThumbnailPaths(thumbnailPaths);

// 본문 이미지 목록
        List<String> detailImagePaths = new ArrayList<>();
        for (ProductImage img : product.getImages()) {
            detailImagePaths.add(img.getStoredPath());
        }
        dto.setDetailImagePaths(detailImagePaths);

// 옵션 목록
        List<ProductOptionDto> options = new ArrayList<>();
        for (ProductOption opt : product.getOptions()) {
            ProductOptionDto optionDto = new ProductOptionDto();
            optionDto.setId(opt.getId());
            optionDto.setOptionName(opt.getOptionName());
            optionDto.setPrice(opt.getPrice());
            options.add(optionDto);
        }
        dto.setOptions(options);

        return dto;
    }


    public void delete(Integer id) {
        Product product = productRepository.findById(id).orElseThrow();
        //guest_order_item 먼저 삭제
        guestOrderItemRepository.deleteByProduct(product);

        // 장바구니 관련 데이터 삭제
        List<Cart> carts = cartRepository.findByProduct(product);
        for (Cart cart : carts) {
            cartRepository.delete(cart);
        }
        // . 관련 guest_order_item 먼저 삭제 (옵션 참조 때문에)
        for (ProductOption option : product.getOptions()) {
            guestOrderItemRepository.deleteByOption(option);
        }

        // . 상품 옵션 삭제
        for (ProductOption option : product.getOptions()) {
            productOptionRepository.delete(option);
        }
        // 썸네일 이미지 삭제
        List<ProductThumbnail> thumbnails = product.getThumbnails();
        for (ProductThumbnail thumb : thumbnails) {
            s3Uploader.delete(extractS3Key(thumb.getStoredPath())); // S3에서 삭제
            productThumbnailRepository.delete(thumb); // DB에서 삭제
        }
        // 상품에 연결된 이미지 전체 삭제 (S3 + DB)
        List<ProductImage> images = product.getImages();
        for (ProductImage image : images) {
            s3Uploader.delete(extractS3Key(image.getStoredPath())); // S3 삭제
            productImageRepository.delete(image); // DB 삭제
        }

        // 상품 삭제
        productRepository.delete(product);
    }


    public void edit(Integer id, ProductEditDto dto) {
        Product product = productRepository.findById(id).get();
        product.setProductName(dto.getProductName());
        product.setPrice(dto.getPrice());
        product.setCategory(dto.getCategory());
        product.setInfo(dto.getInfo());
        product.setQuantity(dto.getQuantity());

        // 본문이미지 삭제
        if (dto.getDeletedImages() != null) {
            for (String path : dto.getDeletedImages()) {
                s3Uploader.delete(extractS3Key(path));
                productImageRepository.deleteByStoredPath(path);
            }
        }
        // 본문이미지 저장
        if (dto.getNewImages() != null) {
            List<ProductImage> imageList = new ArrayList<>();

            for (MultipartFile file : dto.getNewImages()) {
                String s3Url = null;
                try {
                    s3Url = s3Uploader.upload(file, String.valueOf(product.getId()));
                    ProductImage image = new ProductImage();
                    image.setOriginalFileName(file.getOriginalFilename());
                    image.setStoredPath(s3Url);
                    image.setProduct(product);
                    imageList.add(image);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
            productImageRepository.saveAll(imageList);

        }
        // 기존 썸네일 삭제
        if (dto.getDeletedThumbnails() != null) {
            for (String path : dto.getDeletedThumbnails()) {
                s3Uploader.delete(extractS3Key(path));
                productThumbnailRepository.deleteByStoredPath(path);
            }
        }

        // 새 썸네일 저장
        if (dto.getNewThumbnails() != null) {
            List<ProductThumbnail> thumbnailList = new ArrayList<>();
            for (MultipartFile file : dto.getNewThumbnails()) {
                try {
                    String s3Url = s3Uploader.upload(file, "thumbnails/" + product.getId());
                    ProductThumbnail thumbnail = new ProductThumbnail();
                    thumbnail.setOriginalFileName(file.getOriginalFilename());
                    thumbnail.setStoredPath(s3Url);
                    thumbnail.setProduct(product);
                    thumbnail.setIsMain(false);
                    thumbnailList.add(thumbnail);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
            productThumbnailRepository.saveAll(thumbnailList);
        }
    }

    public String order(List<OrderRequest> reqList, String auth) {
        String orderToken = ProductController.OrderTokenGenerator.generateToken();
        String token = auth.replace("Bearer ", "");
        Jwt decoded = jwtDecoder.decode(token);
        Integer memberId = Integer.parseInt(decoded.getSubject());
        Member member = memberRepository.findById(memberId).get();

        // 주문 1건만 생성
        Order order = new Order();
        order.setMember(member);
        order.setOrderToken(orderToken);
        order.setLoginId(member.getLoginId());

        // 주문자 필드 분리
        order.setOrdererName(member.getName());
        order.setOrdererPhone(member.getPhone());

        // 첫 요청 기준 공통 배송정보 설정
        OrderRequest first = reqList.get(0);
        // 수령인 필드 분리
        order.setMemo(first.getMemo());
        order.setReceiverName(first.getReceiverName());
        order.setReceiverPhone(first.getReceiverPhone());
        order.setReceiverZipcode(first.getReceiverZipcode());
        order.setReceiverAddress(first.getReceiverAddress());
        order.setReceiverAddressDetail(first.getReceiverAddressDetail());

        int setItemsSubtotal = 0;
        List<OrderItem> itemList = new ArrayList<>();

        for (OrderRequest req : reqList) {
            Product product = productRepository.findById(req.getProductId()).get();

            // 재고 차감
            product.setQuantity(product.getQuantity() - req.getQuantity());

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setProductName(product.getProductName());
            item.setQuantity(req.getQuantity());
            item.setPrice(req.getPrice());
            item.setTotalPrice(req.getQuantity() * req.getPrice());

            if (req.getOptionId() != null) {
                ProductOption option = productOptionRepository.findById(req.getOptionId()).get();
                item.setOption(option);
                item.setOptionName(option.getOptionName());
            }

            setItemsSubtotal += item.getTotalPrice();
            itemList.add(item);
        }


        // 금액 필드 분리
        int shippingFee = (setItemsSubtotal >= 100000) ? 0 : 3000;
        order.setItemsSubtotal(setItemsSubtotal);
        order.setShippingFee(shippingFee);
        order.setTotalPrice(setItemsSubtotal + shippingFee);
        order.setOrderItems(itemList);

        orderRepository.save(order); // orderItem도 함께 저장됨

        return orderToken;
    }


    public List<ProductBestDto> getTopSellingProducts(String category, Integer limit) {
        Pageable pageable = PageRequest.of(0, (limit == null || limit <= 0) ? 3 : limit);

        List<Product> topProducts =
                (category == null || category.isBlank() || "전체".equals(category))
                        ? productRepository.findTopSellingProducts(pageable)
                        : productRepository.findTopSellingProductsByCategory(category, pageable);

        List<ProductBestDto> result = new ArrayList<>();
        for (Product p : topProducts) {
            Double avg = productCommentRepository.getAverageRating(p.getId());
            Integer cnt = productCommentRepository.getReviewCount(p.getId());
            result.add(ProductBestDto.from(p, avg, cnt));
        }
        return result;
    }

    public MemberDto getmemberinfo(String auth) {
        String token = auth.replace("Bearer ", "");
        Jwt decoded = jwtDecoder.decode(token);
        Integer memberId = Integer.valueOf(decoded.getSubject());
        Member member = memberRepository.findById(memberId).get();

        MemberDto dto = new MemberDto();
        dto.setLoginId(member.getLoginId());
        dto.setName(member.getName());
        dto.setAddress(member.getAddress());
        dto.setPhone(member.getPhone());
        dto.setZipCode(member.getZipcode());
        dto.setAddressDetail(member.getAddressDetail());
        dto.setEmail(member.getEmail());

        return dto;

    }

    public boolean isHotProduct(Integer productId) {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        Integer memberSales = orderItemRepository.getWeeklySales(productId, oneWeekAgo);
        Integer guestSales = guestOrderRepository.getWeeklySales(productId, oneWeekAgo);

        int total = (memberSales != null ? memberSales : 0) + (guestSales != null ? guestSales : 0);
        return total >= 10;
    }

    public ProductDto getProductById(Integer id) {
        List<Product> products = productRepository.findAllById(List.of(id));
        for (Product p : products) {
            return ProductDto.fromEntity(p);
        }
        return null;
    }

    public void addRecentView(Member member, Product product) {
        // 이미 있으면 삭제 후 새로 삽입 -> 최신순 유지
        recentViewRepository.findByMemberAndProduct(member, product).ifPresent(recentViewRepository::delete);

        RecentView rv = new RecentView();
        rv.setMember(member);
        rv.setProduct(product);
        rv.setViewedAt(LocalDateTime.now());
        recentViewRepository.save(rv);
    }

    public List<ProductDto> getRecentProducts(Member member) {
        return recentViewRepository.findTop10ByMemberOrderByViewedAtDesc(member).stream().map(rv -> ProductDto.fromEntity(rv.getProduct())).toList();
    }
}
