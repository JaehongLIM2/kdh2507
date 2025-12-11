import { useEffect, useRef } from "react";

function BuyButton({ show, onHide, onOnlyBuy, onMoveToCart }) {
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
            カートに入っている商品も一緒に購入しますか？
          </p>
        </div>
        <div className="flex border-t border-gray-200">
          <button
            onClick={onOnlyBuy}
            className="flex-1 py-3 text-sm font-bold border-r border-gray-200"
          >
            このまま続ける
          </button>
          <button
            onClick={onMoveToCart}
            className="flex-1 py-3 text-sm font-bold"
          >
            カートへ進む
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onHide}>閉じる</button>
      </form>
    </dialog>
  );
}

export default BuyButton;
