import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ROUTES } from "./constants/routes"
import { Home } from "./pages/Home/Home"

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={ROUTES.HOME} element={<Home />}></Route>
            </Routes>
        </BrowserRouter>
    )
}


