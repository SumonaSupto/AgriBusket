import { createBrowserRouter } from "react-router-dom";
import Mainlayout from "../layouts/Mainlayout";
import Login from "../component/login/Login";
import Regestration from "../component/regestration/Regestration";
import Footer from "../component/homeElements/Footer";

const MainRoutes = createBrowserRouter([
{
    path:"/",
    element:<Mainlayout></Mainlayout>,
    children:[
      
    ]},
    
      {
        path:"/regestration",
        element:<Regestration/>
      },
      {
        path:"/login",
        element:<Login/>
      }



])

export default MainRoutes