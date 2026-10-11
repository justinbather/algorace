import { useEffect, useState } from "react";
import { Navbar } from "../../components/Navbar";
import { Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/constants";

export const Practice = () => {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problems, setProblems] = useState([]);

  const fetchProblems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/problems`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log(response.data);
      setProblems(response.data.problems);
    } catch (err) {
      console.error("Error fetching list of problems", err);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);
  return (
    <>
      <Navbar />
      <div className="lobby-setup lobby-setup--problems">
        <div className="lobby-setup__title-cont">
          <h2>Pick your problems</h2>
          {/* <p>Setup your lobby below</p> */}
        </div>
        <div className="lobby-setup__problem-container">
          {problems.map((problem) => (
            <Link to={`/practice/${problem.title}/javascript`}>
              <div className="problem-card">
                <p className="problem-card__item">{problem.title}</p>
                <p className="problem-card__item">Hashtable</p>
                <p className="problem-card__item">Easy</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
