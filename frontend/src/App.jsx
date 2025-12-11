import { BrowserRouter, Route, Routes } from "react-router";
import { ProductRegist } from "./feature/Product/ProductRegist.jsx";
import { ProductList } from "./feature/Product/ProductList.jsx";
import { ProductDetail } from "./feature/Product/ProductDetail/ProductDetail.jsx";
import { ProductEdit } from "./feature/Product/ProductEdit.jsx";
import { MemberList } from "./feature/Member/MemberList.jsx";
import { MemberSignup } from "./feature/Member/MemberSignup.jsx";
import { MemberDetail } from "./feature/Member/MemberDetail.jsx";
import { MemberEdit } from "./feature/Member/MemberEdit.jsx";
import { MemberLogin } from "./feature/Member/MemberLogin.jsx";
import { AuthenticationContextProvider } from "./feature/common/AuthenticationContextProvider.jsx";
import ProductOrder from "./feature/Product/ProductOrder.jsx";
import ProductCart from "./feature/Product/ProductCart.jsx";
import { Chat } from "./feature/Chat/Chat.jsx";
import { QnaAdd } from "./feature/Qna/QnaAdd.jsx";
import { QnaList } from "./feature/Qna/QnaList.jsx";
import { QnaView } from "./feature/Qna/QnaView.jsx";
import { AnsAdd } from "./feature/Qna/AnsAdd.jsx";
import { FaQList } from "./feature/FaQ/FaQList.jsx";
import { CheckoutPage } from "./feature/tossPayments/Checkout.jsx";
import { FailPage } from "./feature/tossPayments/Fail.jsx";
import { SuccessPage } from "./feature/tossPayments/Success.jsx";
import { FindLoginId } from "./feature/Member/FindLoginId.jsx";
import { FindPassword } from "./feature/Member/FindPassword.jsx";
import { ResetPassword } from "./feature/Member/ResetPassword.jsx";
import { MemberLogout } from "./feature/Member/MemberLogout.jsx";
import { ProductOrderComplete } from "./feature/Product/ProductOrderComplete.jsx";
import { CartProvider } from "./feature/Product/CartContext.jsx";
import Main from "./feature/common/Main.jsx";
import ImageSlide from "./feature/common/CoverImageSlide/ImageSlide.jsx";
import Home from "./feature/common/Home/Home.jsx";
import { AlertProvider } from "./feature/common/AlertContext.jsx";
import { OrderList } from "./feature/Order/OrderList.jsx";
import { OrderDetail } from "./feature/Order/OrderDetail.jsx";
import { GuestOrder } from "./feature/Order/GuestOrder.jsx";
import { GuestOrderDetail } from "./feature/Order/GuestOrderDetail.jsx";
import { AlertList } from "./feature/alert/AlertList.jsx";
import { Toaster } from "sonner";

function App() {
  // const username = prompt("닉네임을 입력해 주세요");
  return (
    <AlertProvider>
      <AuthenticationContextProvider>
        <BrowserRouter>
          {/*결제 관련 페이지는 다른 정보가 넘어가지 않도록 별고 관리*/}

          <Toaster theme="light" richColors position="top-center" />
          <CartProvider>
            <Routes>
              <Route path="/pay/Checkout" element={<CheckoutPage />} />
              <Route path="/pay/success" element={<SuccessPage />} />
              <Route path="/pay/fail" element={<FailPage />} />
              <Route path="/" element={<Main />}>
                <Route index element={<ImageSlide />} />
                <Route path="Home" element={<Home />} />
                <Route path="product/regist" element={<ProductRegist />} />
                <Route path="product/list" element={<ProductList />} />
                <Route path="product/view" element={<ProductDetail />} />
                <Route path="product/edit" element={<ProductEdit />} />
                <Route path="product/order" element={<ProductOrder />} />
                <Route path="product/cart" element={<ProductCart />} />
                <Route
                  path="product/order/complete"
                  element={<ProductOrderComplete />}
                />
                <Route path="/order/list" element={<OrderList />} />
                <Route
                  path="/order/detail/:orderToken"
                  element={<OrderDetail />}
                />
                <Route path="/order/guest-order" element={<GuestOrder />} />
                <Route
                  path="/order/guest-order/detail"
                  element={<GuestOrderDetail />}
                />
                <Route path="/member/edit" element={<MemberEdit />} />
                <Route path="/member/edit" element={<MemberEdit />} />
                <Route path="/member/list" element={<MemberList />} />
                <Route path="/member" element={<MemberDetail />} />
                <Route path="/signup" element={<MemberSignup />} />
                <Route path="/login" element={<MemberLogin />} />
                <Route path="/logout" element={<MemberLogout />} />
                <Route path="/find/id" element={<FindLoginId />} />
                <Route path="/find/password" element={<FindPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/qna/addAns" element={<AnsAdd />} />
                <Route path="/qna/add/:id" element={<QnaAdd />} />
                <Route path="/qna/list" element={<QnaList />} />
                <Route path="/qna/view" element={<QnaView />} />
                <Route path="/faq/list" element={<FaQList />} />
                <Route path="chat/chatting" element={<Chat />} />
                <Route path="alert/list" element={<AlertList />} />
              </Route>
            </Routes>
          </CartProvider>
        </BrowserRouter>
      </AuthenticationContextProvider>
    </AlertProvider>
  );
}

export default App;
