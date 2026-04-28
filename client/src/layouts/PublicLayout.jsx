import { Outlet } from "react-router-dom";
import { Footer } from "../components/Footer.jsx";
import { Navbar } from "../components/Navbar.jsx";

export function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
