import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTES } from "./constants/routes";
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/Auth";
import Landing from "./pages/Landing/Landing";
import AuthProvider from "./context/AuthContext/AuthProvider";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LANDING} element={<Landing />}></Route>
          <Route path={ROUTES.AUTH} element={<Auth />}></Route>
          <Route path={ROUTES.HOME} element={<Home />}></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
