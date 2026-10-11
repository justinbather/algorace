import { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Link } from 'react-router-dom';
import axios from 'axios'
import { MANAGER_URL } from '../../config/constants';
import Modal from 'react-modal'
import '../../assets/styles/components/modal.scss'


export const ChallengeEditor = ({ socket, user, lobbyData, currentProblem, modalIsOpen, closeModal, handleUserReady, gameCompleteModalIsOpen, winner, leaderboard }) => {
  const [userCode, setUserCode] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState("");
  const [testing, setTesting] = useState(false);
  const [jobId, setJobId] = useState("");


  const checkStatus = (jobId) => {
    const maxAttempts = 10;
    let numAttempts = 0;

    let pollStatus = setInterval(() => {
      numAttempts++;
      try {
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
              socket.emit('user_completed', { username: user.username, lobby: lobbyData.name })
              break;
            }
            default: {
              if (numAttempts >= maxAttempts) {
                setErrors("Error: Compilation timed out. Timelimit exceeded");
                setTesting(false);
                clearInterval(pollStatus);
                return;
              }
              // status is pending so continue to next interval
              return;
            }
          }
        });
      } catch (err) {
        console.error(err);
      }
    }, 1500);
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
          problem: currentProblem,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setJobId(response.data.jobId);
      checkStatus(response.data.jobId);
    } catch (err) {
      console.error("error occured sending request to compile -> ", err);
    }
  };

  const handleChange = (e) => {
    setUserCode(e);
  };

  useEffect(() => {

    setUserCode(currentProblem.userStarterCode)
  }, [currentProblem])


  return (
    <>
      <Modal isOpen={modalIsOpen} className='modal'>
        <div className='modal-wrapper'>
          <div className='modal-wrapper__overlay'>
            <h1 className='modal-wrapper__header'>Round Complete!</h1>
            <h3 className='modal-wrapper__header'>{}</h3>
            <div className='modal-wrapper__bottom'>
              <p className='modal-wrapper__para'>Next round will begin once all players press Ready</p>
              <button onClick={handleUserReady} className='modal-wrapper__button'>Ready</button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={gameCompleteModalIsOpen} className='modal'>
        <div className='modal-wrapper'>
          <div className='modal-wrapper__overlay'>
            <h1 className='modal-wrapper__header'>Game Over!</h1>
            {winner &&
              <h1 className='modal-wrapper__header'>{winner.username} won with {winner.score} points</h1>
            }
            <div className='modal-wrapper__bottom'>
              {leaderboard &&
                leaderboard.map((entry) => (

                  <p className='modal-wrapper__para'>{entry.username} won {entry.problem}</p>
                ))

              }
              <Link to='/home'>
                <button className='modal-wrapper__button'>Back Home</button>
              </Link>
            </div>
          </div>
        </div>
      </Modal>

      <div className="editor-container">
        <div className="editor-container__left">
          <h3 className="editor-container__title">{currentProblem.title}</h3>
          <div className="editor-container__description">
            {currentProblem.descriptions.map((desc) => (

              <p>{desc}</p>
            ))}
          </div>
        </div>
        <div className="editor-container__right">
          <Editor
            language="javascript"
            theme="vs-dark"
            value={userCode}
            onChange={handleChange}
            options={{
              minimap: {
                enabled: false,
              },
            }}
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

}
