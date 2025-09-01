import React from "react";
import { useNavigate } from "react-router";

function LeftVisual({ data }) {
  const navigate = useNavigate();

  if (!data || !data.storedPath) {
    return (
      <div className="main-visual-box placeholder">
        <div className="image-placeholder" />
      </div>
    );
  }

  return (
    <div className="main-visual-box">
      <img
        src={data.storedPath}
        onClick={() => navigate(`/product/view?id=${data.productId}`)}
        alt="HOT 상품"
        className="main-visual-img"
        style={{ opacity: 1 }}
      />
      <div className="main-visual-text">
        {/*<h2>이번 주 HOT PICK🍓</h2>*/}
        {/*<p>by. KDH 쇼핑몰</p>*/}
        <h2>今週のHOT PICK🍓</h2>
        <p>by. KDH ショッピングモール</p>
      </div>
    </div>
  );
}

export default LeftVisual;
