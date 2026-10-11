import logo from "../assets/images/Logo.svg";
import "../assets/styles/pages/navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/constants";

export const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `${BASE_URL}/auth/logout`,

        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="navbar">
      <div className="navbar__image-cont">
        <Link to="/home">
          <img src={logo}></img>
        </Link>
      </div>
      <div className="navbar__inner-content">
        <p className="navbar__link">Home</p>
        <p className="navbar__link">Contribute</p>
        <p className="navbar__link">Profile</p>
      </div>
      <a className="navbar__spacer" onClick={handleLogout}>
        <p className="navbar__link">Log out</p>
      </a>
    </div>
  );
};
