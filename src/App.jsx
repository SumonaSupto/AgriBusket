
import { RouterProvider } from 'react-router-dom'
import './App.css'
import MainRoutes from './routes/MainRoutes'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  

  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={MainRoutes}></RouterProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
