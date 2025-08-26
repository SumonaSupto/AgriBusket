import { createBrowserRouter } from "react-router-dom";
import Mainlayout from "../layouts/Mainlayout";
import Layout from "../layouts/Layout";
import Login from "../component/login/Login";
import Registration from "../component/regestration/Regestration";
import ForgotPassword from "../component/auth/ForgotPassword";
import Footer from "../component/homeElements/Footer";
import Cardes from "../component/homeElements/Cardes";
import Contact from "../component/contact/Contact";
import Farms from "../component/farms/Farms";
import Cart from "../component/cart/Cart";
import Checkout from "../component/checkout/Checkout";
import Profile from "../component/profile/Profile";
import Orders from "../component/orders/Orders";
import PaymentSuccessSimple from "../component/payment/PaymentSuccessSimple";
import PaymentFail from "../component/payment/PaymentFail";
import PaymentCancel from "../component/payment/PaymentCancel";
import AdminLogin from "../component/admin/AdminLogin";
import AdminPanel from "../component/admin/AdminPanel";

const MainRoutes = createBrowserRouter([
{
    path:"/",
    element:<Mainlayout></Mainlayout>,
    children:[
      
    ]},
    {
      path:"/",
      element:<Layout></Layout>,
      children:[
        {
          path:"/cards",
          element:<Cardes/>
        },
        {
          path:"/contact",
          element:<Contact/>
        },
        {
          path:"/farms",
          element:<Farms/>
        },
        {
          path:"/cart",
          element:<Cart/>
        },
        {
          path:"/checkout",
          element:<Checkout/>
        },
        {
          path:"/payment/success/:orderId",
          element:<PaymentSuccessSimple/>
        },
        {
          path:"/payment/fail/:orderId",
          element:<PaymentFail/>
        },
        {
          path:"/payment/cancel/:orderId",
          element:<PaymentCancel/>
        },
        {
          path:"/profile",
          element:<Profile/>
        },
        {
          path:"/orders",
          element:<Orders/>
        },
      ]
    },
    // Routes without navigation bar
    {
      path:"/registration",
      element:<Registration/>
    },
    {
      path:"/login",
      element:<Login/>
    },
    {
      path:"/forgot-password",
      element:<ForgotPassword/>
    },
    {
      path:"/admin-login",
      element:<AdminLogin/>
    },
    {
      path:"/admin-panel",
      element:<AdminPanel/>
    },
])

export default MainRoutes