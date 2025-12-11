import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper/modules";
import { useNavigate } from "react-router";
import { gsap } from "gsap";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/mousewheel";
import "./ImageSlide.css";

function ImageSlide() {
  // useEffect(() => {
  //   import("swiper/css");
  //   import("swiper/css/pagination");
  //   import("swiper/css/mousewheel");
  //   import("./ImageSlide.css");
  // }, []);
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const swiperRef = useRef(null);

  // slideImage Animation

  const animateActiveSlide = (swiper) => {
    if (!swiper) return;
    const active = swiper.slides[swiper.activeIndex];
    if (!active) return;

    const overlay = active.querySelector(".overlay");
    const title = active.querySelector(".overlay h1");
    const price = active.querySelector(".overlay p");
    if (!overlay || !title || !price) return;

    gsap.killTweensOf([overlay, title, price]);

    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    tl.fromTo(
      overlay,
      { opacity: 0.8 },
      { opacity: 1, duration: 2, ease: "power2.out" },
      0,
    );

    tl.fromTo(
      title,
      { opacity: 0, y: 160, scale: 1, filter: "blur(6px)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 2 },
      0,
    );

    tl.fromTo(
      price,
      { opacity: 0, y: 80, filter: "blur(4px)" },
      {
        opacity: 1,
        y: 0,
        letterSpacing: "0em",
        filter: "blur(0px)",
        duration: 2,
        force3D: true,
      },
      0.1,
    );
  };

  useEffect(() => {
    if (swiperRef.current && slides.length > 0) {
      requestAnimationFrame(() => animateActiveSlide(swiperRef.current));
    }
  }, [slides]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    axios
      .get("/api/product/hot-random")
      .then((res) => {
        setSlides(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <Swiper
      direction="vertical"
      slidesPerView={1}
      spaceBetween={0}
      mousewheel={true}
      modules={[Mousewheel, Pagination]}
      loop={slides.length > 4}
      pagination={{ clickable: true }}
      onSwiper={(swiper) => (swiperRef.current = swiper)}
      onSlideChange={(swiper) => animateActiveSlide(swiper)}
      className="mainSwiper"
    >
      {slides.map((product) => (
        <SwiperSlide key={product.id}>
          <div
            className="slide"
            onClick={() => navigate(`/product/view?id=${product.id}`)}
            style={{ backgroundImage: `url(${product.thumbnailUrl})` }}
          >
            <div className="overlay">
              <h1>{product.productName}</h1>
              <p>{product.price.toLocaleString()}円</p>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default ImageSlide;
