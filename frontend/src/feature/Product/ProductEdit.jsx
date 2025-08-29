import { useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export function ProductEdit() {
  useEffect(() => {
    import("./css/ProductEdit.css");
    import("./css/ProductRegist.css");
  }, []);
  // 썸네일이미지
  const [thumbnailPaths, setThumbnailPaths] = useState([]);
  const [deletedThumbnails, setDeletedThumbnails] = useState([]);
  const [newThumbnails, setNewThumbnails] = useState([]);
  // 새 썸네일 미리보기
  const [previewThumbnails, setPreviewThumbnails] = useState([]);

  // 본문이미지
  const [detailImagePaths, setDetailImagePaths] = useState([]);

  const [options, setOptions] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [deletedImagePaths, setDeletedImagePaths] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [form, setForm] = useState({
    productName: "",
    price: "",
    category: "",
    info: "",
    quantity: "",
  });

  useEffect(() => {
    axios.get(`/api/product/view?id=${id}`).then((res) => {
      const data = res.data;
      setOptions(data.options || []);
      setForm({
        productName: data.productName,
        price: data.price,
        category: data.category,
        info: data.info,
        quantity: data.quantity,
      });
      // 썸네일 이미지 목록
      setThumbnailPaths(data.thumbnailPaths || []);
      // 본문 이미지 목록
      setDetailImagePaths(data.detailImagePaths || []);
    });
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSave() {
    if (!form.productName.trim()) {
      // 상품명을 입력해주세요.
      toast.warning("商品名を入力してください。");
      return;
    }
    if (!form.price || isNaN(form.price)) {
      // 가격을 입력해주세요.
      toast.warning("価格を入力してください。");
      return;
    }
    if (!form.quantity || isNaN(form.quantity)) {
      // 수량을 입력해주세요.
      toast.warning("数量を入力してください");
      return;
    }
    if (!form.category.trim()) {
      // 카테고리를 입력해주세요.
      toast.warning("カテゴリーを入力してください。");
      return;
    }
    if (!form.info.trim()) {
      // 상세설명을 입력해주세요.
      toast.warning("詳細説明を入力してください。");
      return;
    }
    const totalThumbnailCount =
      (thumbnailPaths?.length || 0) + (newThumbnails?.length || 0);
    if (totalThumbnailCount === 0) {
      // 썸네일 이미지를 한 장 이상 추가해주세요.
      toast.warning("サムネイル画像を1枚以上追加してください。");
      return;
    }
    // if (detailImagePaths.length === 0) {
    //   alert("본문이미지를 한 장 이상 등록해주세요.");
    //   return;
    // }

    const formData = new FormData();
    formData.append("productName", form.productName);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("info", form.info);
    formData.append("quantity", form.quantity);
    formData.append("id", id);
    formData.append("optionsJson", JSON.stringify(options));

    // 썸네일 삭제 목록
    deletedThumbnails.forEach((path) => {
      formData.append("deletedThumbnails", path);
    });

    // 썸네일 새 이미지
    newThumbnails.forEach((file) => {
      formData.append("newThumbnails", file);
    });

    // 본문 삭제 목록
    deletedImagePaths.forEach((path) => {
      formData.append("deletedImages", path);
    });

    // 본문 새 이미지
    newImages.forEach((file) => {
      formData.append("newImages", file);
    });
    axios
      .post(`/api/product/edit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        // 수정 완료
        toast.success("修正完了");
        navigate(`/product/view?id=${id}`);
      });
  }

  function handleRemoveNewThumbnail(index) {
    setPreviewThumbnails((prev) => prev.filter((_, i) => i !== index));
    setNewThumbnails((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="page-wrapper">
      <div className="center-top-container">
        <div className="w-full max-w-[800px]">
          <div className="rounded-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="px-2"
            >
              <div className="product-edit-field">
                <h2 className="text-center text-3xl font-bold mb-6">
                  {/*상품 정보수정*/}
                  商品情報の編集
                </h2>
              </div>

              <div className="product-edit-field">
                {/*상품명*/}
                <label className="product-edit-label">商品名</label>
                <input
                  className="product-edit-input"
                  type="text"
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                />
              </div>

              <div className="product-edit-field">
                {/*가격*/}
                <label className="product-edit-label">価格</label>
                <input
                  className="product-edit-input"
                  type="text"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div className="product-edit-field">
                {/*수량*/}
                <label className="product-edit-label">数量</label>
                <input
                  className="product-edit-input"
                  type="text"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="product-edit-field">
                {/*카테고리*/}
                <label className="product-edit-label">カテゴリー</label>
                <input
                  className="product-edit-input"
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                />
              </div>

              <div className="product-edit-field">
                {/*상품 설명*/}
                <label className="product-edit-label">商品説明</label>
                <textarea
                  rows={5}
                  className="product-edit-textarea"
                  name="info"
                  value={form.info}
                  onChange={handleChange}
                />
              </div>
              <div className="product-regist-options">
                {/*옵션 목록*/}
                <label className="product-regist-label">オプション一覧</label>
                {options.map((opt, index) => (
                  <div className="product-regist-option-row" key={index}>
                    <input
                      type="text"
                      placeholder="オプション名" // 옵션명
                      className="product-regist-input"
                      value={opt.optionName}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].optionName = e.target.value;
                        setOptions(newOptions);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="価格" // 가격
                      className="product-regist-input"
                      value={opt.price}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].price = e.target.value;
                        setOptions(newOptions);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...options];
                        newOptions.splice(index, 1);
                        setOptions(newOptions);
                      }}
                      className="product-regist-option-remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="product-regist-file-label"
                  onClick={() =>
                    setOptions([...options, { optionName: "", price: "" }])
                  }
                >
                  {/*옵션 추가*/}
                  オプションを追加
                </button>
              </div>
              {/* 썸네일 이미지 변경 + 업로드 묶음 */}
              <div className="product-edit-field">
                {/*썸네일 이미지 변경*/}
                <label className="product-edit-label">
                  サムネイル画像の変更
                </label>

                {/* 기존 썸네일 / 새 미리보기 */}
                <div className="product-edit-image-box">
                  {thumbnailPaths.map((path, idx) => (
                    <div key={idx} className="product-edit-image-wrapper">
                      <img
                        src={path.storedPath}
                        alt={`썸네일 ${idx + 1}`}
                        className="product-edit-image"
                      />
                      <button
                        type="button"
                        className="product-edit-button-delete"
                        onClick={() => {
                          setDeletedThumbnails((prev) => [
                            ...prev,
                            path.storedPath,
                          ]);
                          setThumbnailPaths((prev) =>
                            prev.filter((_, i) => i !== idx),
                          );
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {previewThumbnails.map((url, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="product-edit-image-wrapper"
                    >
                      <img
                        src={url}
                        alt={`썸네일 미리보기 ${idx + 1}`}
                        className="product-edit-image"
                      />
                      <button
                        type="button"
                        className="product-edit-button-delete"
                        onClick={() => handleRemoveNewThumbnail(idx)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* 썸네일 추가 업로드 */}
                <div className="product-edit-file-upload">
                  <label
                    htmlFor="thumbnailInput"
                    className="product-edit-file-label"
                  >
                    {/*이미지 추가*/}
                    画像を追加
                  </label>
                  <input
                    id="thumbnailInput"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setNewThumbnails((prev) => [...prev, ...files]);
                      const previews = files.map((file) =>
                        URL.createObjectURL(file),
                      );
                      setPreviewThumbnails((prev) => [...prev, ...previews]);
                    }}
                    className="product-edit-file-input"
                  />
                </div>
              </div>

              {/* 본문 이미지 변경 */}
              <div className="product-edit-field">
                <label className="product-edit-label">本文画像の変更</label>
                <div className="product-edit-image-box">
                  {detailImagePaths.map((path, idx) => (
                    <div key={idx} className="product-edit-image-wrapper">
                      <img
                        src={path}
                        alt={`본문 이미지 ${idx + 1}`}
                        className="product-edit-image"
                      />
                      <button
                        type="button"
                        className="product-edit-button-delete"
                        onClick={() => {
                          setDeletedImagePaths((prev) => [...prev, path]);
                          setDetailImagePaths((prev) =>
                            prev.filter((_, i) => i !== idx),
                          );
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {/* 미리보기 */}
                  {previewImages.length > 0 && (
                    <div className="product-edit-preview-box">
                      {previewImages.map((url, idx) => (
                        <div key={idx} className="product-edit-image-wrapper">
                          <img
                            src={url}
                            className="product-edit-preview"
                            alt={`미리보기 ${idx + 1}`}
                          />
                          <button
                            type="button"
                            className="product-edit-button-delete"
                            onClick={() => {
                              setPreviewImages((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                              setNewImages((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 본문 이미지 새로 추가 */}
                <div className="product-edit-file-upload">
                  <label
                    htmlFor="bodyImageInput"
                    className="product-edit-file-label"
                  >
                    {/*이미지 추가*/}
                    画像を追加
                  </label>

                  <input
                    id="bodyImageInput"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setNewImages((prev) => [...prev, ...files]);
                      const previews = files.map((file) =>
                        URL.createObjectURL(file),
                      );
                      setPreviewImages((prev) => [...prev, ...previews]);
                    }}
                    className="product-edit-file-input"
                  />
                </div>
              </div>

              <div className="product-edit-submit-btns">
                <button type="submit" className="product-edit-btn confirm">
                  {/*저장*/}
                  保存
                </button>
                <button
                  type="button"
                  className="product-edit-btn cancel"
                  onClick={() => navigate(-1)}
                >
                  {/*취소*/}
                  戻る
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
