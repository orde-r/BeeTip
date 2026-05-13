import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTES } from "./constants/routes";
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/Auth";
import Landing from "./pages/Landing/Landing";
import Orders from "./pages/Orders/Orders";
import AuthProvider from "./context/AuthContext/AuthProvider";
import Chat from "./pages/Chat/Chat";
import Profile from "./pages/Profile/Profile";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LANDING} element={<Landing />}></Route>
          <Route path={ROUTES.AUTH} element={<Auth />}></Route>
          <Route path={ROUTES.HOME} element={<Home />}></Route>
          <Route path={ROUTES.ORDERS} element={<Orders />}></Route>
          <Route path={ROUTES.CHAT} element={<Chat />}></Route>
          <Route path={ROUTES.PROFILE} element={<Profile />}></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
