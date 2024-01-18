
import  { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { api } from "./api";
import { IoMdVideocam } from "react-icons/io";

import Peer from 'simple-peer';

import { ToastContainer } from "react-toastify";



export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [opacity, setOpacity] = useState("none");

 

  useEffect(() => {
    const { id, token } = JSON.parse(sessionStorage.getItem("chat-app-user"));

    socket.current.emit("isUserConnected", {
      ownID: id,
      anotherID: currentChat.id,
    });

    if (socket.current) {
      socket?.current?.on("getUserOnline", (msg) => {
        setIsOnline(msg?.user);
        // console.log("msg getUserOnline", msg);
      });
    } else {
      setIsOnline(false);
    }
  }, [currentChat]);

  setInterval(() => {
    const { id, token } = JSON.parse(sessionStorage.getItem("chat-app-user"));

    socket.current.emit("isUserConnected", {
      ownID: id,
      anotherID: currentChat.id,
    });

    if (socket.current) {
      socket?.current?.on("getUserOnline", (msg) => {
        setIsOnline(msg?.user);
        // console.log("msg getUserOnline", msg);
      });
    }
  }, [20000]);

  useEffect(() => {
    const { id, token } = JSON.parse(sessionStorage.getItem("chat-app-user"));
    // console.log(token)
    axios
      .post(
        api + `/api/messages/getmsg`,
        {
          from: id,
          to: currentChat.id,
        },
        { headers: { Authorization: token } }
      )
      .then((res) => {
        // console.log(res);
        setMessages(res?.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = () => {
      if (currentChat) {
        JSON.parse(sessionStorage.getItem("chat-app-user")).id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const handleSendMsg = async (message) => {
    const { id, token } = JSON.parse(sessionStorage.getItem("chat-app-user"));

    socket.current.emit("send-msg", { from: id, to: currentChat.id, message,createdAt:new Date() });

    await axios.post(
      api + `/api/messages/addmsg`,
      {
        from: id,
        to: currentChat.id,
        message: message,
      },
      { headers: { Authorization: token } }
    );

    const msgs = [...messages];

    msgs.push({
      senderId: id,
      recieverId: currentChat.id,
      message: message,
      createdAt: new Date(),
    });
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket?.current) {
      socket?.current?.on("msg-recieve", ({message,createdAt}) => {
        setArrivalMessage({ message: message ,createdAt});
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { id } = JSON.parse(sessionStorage.getItem("chat-app-user"));

  //video call -------------------------------------------------


  const [ me, setMe ] = useState("")
	const [ stream, setStream ] = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("")


//------------------------------------------------------------------


  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);


  const startVideoCall = async (anotherUserID) => {
    try {
    let stream= await navigator?.mediaDevices?.getUserMedia({
        video: true,
        audio: true,
        });
    setStream(stream)
    localVideoRef.current.srcObject = stream;

   
    const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})

		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: anotherUserID,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			
				localVideoRef.current.srcObject = stream
			
		})
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer

      // console.log("Send offer:", localVideoRef.current.srcObject);
    } catch (error) {
      console.log("Error accessing user media:==>", error);
    }
  };


  const cutVideoCall =async () => {
    
    // Close the peer connection and detach tracks
  if (peerConnection.current) {
    const tracks = peerConnection.current.getSenders();

    tracks.forEach((sender) => {
      const track = sender.track;
      if (track) {
        track.stop();
      }
    });

    peerConnection.current.close();
  }
      setStream(false)

      const stream = localVideoRef.current.srcObject;
      const tracks = stream.getTracks();

      tracks.forEach(async(track) => {
       
       await track.stop();
      });
      console.log(tracks)


      localVideoRef.current.srcObject = null;
    

    // Reset the remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setCallEnded(true)
		connectionRef.current.destroy()


  };



  const callUser = (id) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			
				userVideo.current.srcObject = stream
			
		})
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}
   
	const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}

	




  return (
    <>
      <Container>
        <div className="chat-header">
          <div className="user-details">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentChat?.avatarImage}`}
                alt=""
              />
            </div>
            <div className="username">
              <h3>{currentChat?.username}</h3>
              <p style={{ color: "orange", fontSize: "9px" }}>
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1%" }}>
            <button
              onClick={() => {setOpacity("visible");startVideoCall(currentChat.id);}}
              style={{
                backgroundColor: "yellow",
                border: "none",
                borderRadius: "5px",
              }}
            >
              <IoMdVideocam style={{ height: "30px", width: "40px" }} />
            </button>
            <Logout socket={socket} />
          </div>
        </div>

        <div className="chat-messages">
          {messages?.length > 0 &&
            messages?.map((message) => {
              const utcDate = new Date(message?.createdAt);
              const options = {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true,
              };
              // Format the date in IST format
              const istDate = utcDate?.toLocaleString("en-IN", options);

              return (
                <div ref={scrollRef} key={uuidv4()}>
                  <div
                    className={`message ${
                      message?.senderId === id ? "sended" : "recieved"
                    }`}
                  >
                    <div className="content ">
                      <p
                        style={{
                          fontSize: "9px",
                          color: "red",
                          marginBottom: "1%",
                        }}
                      >
                        {istDate}
                      </p>
                      <p>{message.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <ChatInput handleSendMsg={handleSendMsg} />
        <ToastContainer />
      </Container>
      <VideoCallModal opacity={opacity}>
        <button
          onClick={() => {setOpacity("none");cutVideoCall()}}
          style={{
            border: "none",
            backgroundColor: "red",
            color: "white",
            fontSize: "15px",
            padding: "5px 15px",
            borderRadius: "5px",
            position: "right",
          }}
        >
          Close X
        </button>
        <div>
          <h2>Your Video</h2>
         {<video ref={localVideoRef} autoPlay playsInline muted />}
        </div>
        <div>
          <h2>Remote Video</h2>
          {
					<video playsInline ref={remoteVideoRef} autoPlay />
					}
        </div>
      </VideoCallModal>
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    border-top: 0.5px solid gray;
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;

const VideoCallModal = styled.div`
  backdrop-filter: blur(2px);
  border: 5px solid ffffff39;
  top: 0;
  right: 0;
  position: relative;
  height: 100vh;
  width: 100vw;
  background-color: transparent;
  display: ${({ opacity }) => opacity};
  transition: all 0.3s ease-in-out;
  z-index: 1000;
  padding: 2%;
  @media screen and (min-width: 320px) and (max-width: 640px) {
    display:block;
  }
`;
