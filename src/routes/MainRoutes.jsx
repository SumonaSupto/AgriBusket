import { createBrowserRouter } from "react-router-dom";
import Mainlayout from "../layouts/Mainlayout";
import Login from "../component/login/Login";
import Regestration from "../component/regestration/Regestration";

const MainRoutes = createBrowserRouter([
{
    path:"/",
    element:<Mainlayout></Mainlayout>,
    children:[
        {
            path:"/login",
            element:<Login></Login>
        },
        {
            path:"/regestration",
            element:<Regestration></Regestration>
        }
    ]
}


])

export default MainRoutes