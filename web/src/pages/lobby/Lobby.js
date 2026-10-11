import { Navbar } from "../../components/Navbar"
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/constants";
import { socket } from "../../config/socket";
import { ChallengeEditor } from "../challenge/ChallengeEditor";
import "./lobby.scss"


export const Lobby = () => {
  const { lobbyName } = useParams();
  const [userData, setUserData] = useState(null)
  const [lobbyData, setLobbyData] = useState(null)
  const [ready, setReady] = useState(false)
  const [matchStart, setMatchStart] = useState(false)
  const [gameCompleteModalIsOpen, setGameCompleteModalIsOpen] = useState(false)
  const [roundNumber, setRoundNumber] = useState(0)
  const [currentProblem, setCurrentProblem] = useState(null)
  const [userCode, setUserCode] = useState("")
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [winner, setWinner] = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)

  const handleUserReady = () => {
    socket.emit('user_ready', { username: userData.username, lobby: lobbyName })
  }

  const handleUserReadyNextRound = () => {
    socket.emit('user_ready_next_match', { username: userData.username, lobby: lobbyName })
  }

  const handleUserUnready = () => {
    socket.emit('user_unready', { username: userData.username, lobby: lobbyName })
  }


  const handleStart = () => {
    socket.emit('start_match', { username: userData.username, lobby: lobbyName })
  }

  const closeModal = () => {
    setModalIsOpen(false)
  }


  useEffect(() => {

    const handleUserJoined = (data) => {
      setLobbyData(data)
    }
    const handleSuccessfulEnter = (data) => {
      console.log('success enter', data)
      setLobbyData(data)
    }
    const handleLobbyUpdate = (data) => {
      console.log('lobby update', data)
      setLobbyData(data)
    }

    socket.on('user_joined', handleUserJoined)
    socket.on('successful_enter', handleSuccessfulEnter)
    socket.on('user_ready', handleLobbyUpdate)
    socket.on('successful_ready', (data) => {
      setReady(data.isReady)
    })

    socket.on('begin_match', (data) => {
      setCurrentProblem(data.currentProblem)
      setUserCode(data.currentProblem.userStarterCode)
      setRoundNumber(data.roundNumber)
      setLobbyData(data.lobbyObj)
      setMatchStart(true)
    })

    socket.on('round_completed', (data) => {
      setModalIsOpen(true)
    })

    socket.on('game_completed', (data) => {
      setModalIsOpen(false)
      setWinner(data.winner)
      setLeaderboard(data.leaderboard)
      setTimeout(() => {
        setGameCompleteModalIsOpen(true)
      }, 3000)
    })

    socket.on('next_round', (data) => {
      setLobbyData(data.lobbyObj)
      setUserCode(data.currentProblem.userStarterCode)
      setCurrentProblem(data.currentProblem)
      setRoundNumber(data.lobbyObj.currentRound)

      closeModal()
    })

    // Prevents memory leaks when component unmounts
    return () => {
      socket.off('user_joined')
      socket.off('successful_enter')
      socket.off('user_ready')
      socket.off('successful_ready')
      socket.off('begin_match')
      socket.off('round_completed')
      socket.off('game_completed')
      socket.off('new_round')
    }
  }, [socket])

  useEffect(() => {
    const fetchUser = async () => {

      try {
        const response = await axios.get(`${BASE_URL}/auth/verify`, { withCredentials: true })
        setUserData(response.data.userData)
        socket.emit('join_lobby', { username: response.data.userData.username, lobby: lobbyName })
      } catch (err) {
        console.log(err)
      }
    }
    fetchUser()
  }, [lobbyName])

  if (matchStart) {
    return (
      <>
        <ChallengeEditor socket={socket} user={userData} lobbyData={lobbyData} currentProblem={currentProblem} modalIsOpen={modalIsOpen} closeModal={closeModal} gameCompleteModalIsOpen={gameCompleteModalIsOpen} handleUserReady={handleUserReadyNextRound} winner={winner} leaderboard={leaderboard} />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="lobby-container">
        <div className="lobby-container__heading-cont">

          {lobbyData &&
            <h1>{lobbyData.host.username}'s lobby</h1>
          }
        </div>
        <div className="lobby-container__row">
          <div className="left-cont">
            <h3>Problems</h3>
            {lobbyData && lobbyData.problems.map((problem) => (
              <div className="left-cont__problem-card">
                <>
                  <p className="left-cont__problem-card__item">{problem.title}</p>
                </>
              </div>
            ))}

          </div>
          <div className="right-cont">
            <div className="">
              <h3>Users</h3>
            </div>
            <div className="">
              {
                lobbyData?.users && lobbyData.users.map((user) => (
                  <a key={user.username}>
                    <div className="user-card">
                      <p className="user-card__item">{user.username}</p>
                      {user.isReady ?

                        <p className="user-card__item--ready">Ready</p>
                        :
                        <p className="user-card__item">Waiting..</p>
                      }
                    </div>
                  </a>
                ))}
            </div>
          </div>
        </div>
        <div className="lobby-container__button-cont" >
          <button onClick={handleStart} className="button button--secondary">Start Game</button>
          {
            ready ?
              <button onClick={handleUserUnready} className="button button--primary">Unready</button> :
              <button onClick={handleUserReady} className="button button--primary">Ready</button>
          }
        </div>
      </div>
    </>
  );
};
