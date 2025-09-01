import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ReviewStats({ productId, refreshTrigger }) {
  useEffect(() => {
    import("../../css/ReviewStats.css"); // 그래프용 스타일 분리
  }, []);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/product/comment/stat?productId=${productId}`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, [productId, refreshTrigger]);

  if (!stats) return null;

  const { avg: average, total, starCount } = stats;

  const getRatio = (count) => {
    if (total === 0) return "0%";
    return `${(count / total) * 100}%`;
  };

  return (
    <div className="review-stats">
      <div className="average">
        <div className="score">
          {typeof average === "number" ? average.toFixed(1) : "0.0"}
        </div>
        <div className="stars">
          ★ {typeof average === "number" ? average.toFixed(1) : "0.0"} / 5.0
        </div>
        {/*~개의 구매평*/}
        <div>({total ?? 0} 件のレビュー)</div>
      </div>

      <div className="bars">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="bar-line">
            {/*~점*/}
            <div className="label">{star} 点</div>
            <div className="bar">
              <div
                className="fill"
                style={{ width: getRatio(starCount[star] || 0) }}
              />
            </div>
            <div className="count">{starCount[star] || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
