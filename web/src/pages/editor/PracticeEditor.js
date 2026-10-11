import Editor from "@monaco-editor/react"
import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BASE_URL, MANAGER_URL } from "../../config/constants";
import "../../assets/styles/pages/editor.scss";

export const PracticeEditor = () => {
  const [problem, setProblem] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState("");
  const [testing, setTesting] = useState(false);
  const [jobId, setJobId] = useState("");

  const { problemTitle, language } = useParams();

  const navigate = useNavigate()


  const fetchProblem = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/problems/${problemTitle}/${language}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setProblem(response.data.problem);
      setUserCode(response.data.problem.userStarterCode);
      setOutput(response.data.output);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLanguageChange = async (e) => {
    navigate(`/practice/${problemTitle}/${e.target.value}`)
    await fetchProblem()
    window.location.reload()
  }

  const checkStatus = (jobId) => {
    const maxAttempts = 10;
    let numAttempts = 0;
    let pollStatus = setInterval(() => {
      numAttempts++;
      try {
        console.log("Polling for job status");
        axios.get(`${MANAGER_URL}/job-status/${jobId}`).then((res) => {
          console.log(res.data);
          switch (res.data.status) {
            case "failed": {
              setErrors(res.data.output);
              setTesting(false);
              clearInterval(pollStatus);
              break;
            }
            case "completed": {
              setOutput(res.data.output);
              setTesting(false);
              clearInterval(pollStatus);
              break;
            }
            default: {
              if (numAttempts >= maxAttempts) {
                setErrors("Error: Compilation timed out. Timelimit exceeded");
                setTesting(false);
                clearInterval(pollStatus);
                return;
              }

              // status is pending so c ontinue to next interval
              return;
            }
          }
        });
      } catch (err) {
        console.error(err);

      }
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrors("");
      setOutput("");
      setTesting(true);
      const response = await axios.post(
        `${MANAGER_URL}/compile`,
        {
          code: userCode,
          problem: problem,
        },
        {
          withCredentials: true,
        }
      );
      setJobId(response.data.jobId);
      checkStatus(response.data.jobId);
    } catch (err) {
      console.log(err);
      console.error("error occured sending request to compile -> ", err);
    }
  };

  const handleChange = (e) => {
    setUserCode(e);
  };

  useEffect(() => {
    //Load starter code on render

    fetchProblem();
  }, []);

  return (problem &&
    <>
      <div className="editor-container">
        <div className="editor-container__left">
          <h3 className="editor-container__title">{problem.title}</h3>
          <div className="editor-container__description">
            {
              problem.descriptions.map((desc) => (
                <p>{desc}</p>
              ))
            }
          </div>
        </div>
        <div className="editor-container__right">
          <select className="editor-container__select" defaultValue={language} onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          <Editor
            language={language}
            theme="vs-dark"
            value={userCode}
            onChange={handleChange}
          />
          <div className="editor-container__button-cont">
            <Link to="/home">
              <button className="button button--danger">Quit</button>
            </Link>
            <button className="button button--secondary" onClick={handleSubmit}>
              Test
            </button>
            <button className="button button--primary" onClick={handleSubmit}>
              Submit
            </button>
          </div>
          <label className="output-cont__label">Console</label>
          <div className="output-cont">
            {output ? (
              <p>
                <span className="output-cont__success">~ success: </span>
                {output}
              </p>
            ) : errors ? (
              <p>
                <span className="output-cont__failure">~ failed: </span>
                {errors}
              </p>
            ) : testing ? (
              <p className="output-cont__testing">~ testing...</p>
            ) : (
              <p>~</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
