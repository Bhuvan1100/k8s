import { BrowserRouter, Routes, Route } from "react-router-dom";
import SellerInfo from './components/SellerInfo/SellerInfo';
import AddItem from './components/AddItems/AddItems';
import SignIn from './components/SignIn/SignIn';
import SignUp from './components/SignUp/SignUp';
import MyProducts from './components/Products/SellerPreviousAddedProducts';
import VerifyEmail from './components/SignUp/Emailverification';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
  
          {/* PROTECTED */}
         <Route element={<ProtectedRoute />}>
          <Route path="/" element={<SellerInfo />} />
          <Route path="/add-items" element={<AddItem />} />
          <Route path="/added-products" element={<MyProducts />} />
        </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
