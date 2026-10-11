import { useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/constants";
import { useNavigate } from "react-router-dom";

//Hook to check user has token for protected routes

export const useVerifyUser = () => {
  const navigate = useNavigate();
  const verifyUser = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/verify`, { withCredentials: true });

      console.log(response.status, response.data)
      if (response.status !== 200) {
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  };
  useEffect(() => {
    verifyUser();
  }, []);
};
