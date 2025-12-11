import { useNavigate } from "react-router";
import { useEffect, useRef } from "react";

function CartAdded({ show, onHide }) {
  const navigate = useNavigate();
  const dialogRef = useRef();

  useEffect(() => {
    if (show) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [show]);

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box p-0">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-lg font-semibold mb-2">
            選択した商品をカートに追加しました。
          </p>
        </div>
        <div className="flex border-t border-gray-200">
          <button
            onClick={onHide}
            className="flex-1 py-3 text-sm font-bold border-r border-gray-200"
          >
            買い物を続ける
          </button>
          <button
            onClick={() => navigate("/product/cart")}
            className="flex-1 py-3 text-sm font-bold"
          >
            カートを見る
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onHide}>閉じる</button>
      </form>
    </dialog>
  );
}

export default CartAdded;
