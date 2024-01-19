import { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { api } from "./api";
import { IoMdVideocam } from "react-icons/io";
import Swal from "sweetalert2";
import peer from "./service/peer";

import { ToastContainer, toast } from "react-toastify";

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
        if (msg?.user == true) {
          setIsOnline((prev) => true);
        } else {
          setIsOnline((prev) => false);
        }
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
        if (msg?.user == true) {
          setIsOnline((prev) => true);
        } else {
          setIsOnline((prev) => false);
        }
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

    socket.current.emit("send-msg", {
      from: id,
      to: currentChat.id,
      message,
      createdAt: new Date(),
    });

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
      socket?.current?.on("msg-recieve", ({ message, createdAt }) => {
        setArrivalMessage({ message: message, createdAt });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { id, username } = JSON.parse(sessionStorage.getItem("chat-app-user"));

  //video call -------------------------------------------------

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  //------------------------------------------------------------------

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  const handleCallUser = useCallback(
    async (remoteSocketId) => {
      console.log(isOnline, remoteSocketId);
      if (isOnline) {
        setOpacity("visible");

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
        localVideoRef.current.srcObject = stream;

        const offer = await peer.getOffer();
        socket.current.emit("user:call", {
          to: remoteSocketId,
          offer,
          name: username,
        });
      } else {
        toast.error("Unable to call !! User is not online !!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          theme: "colored",
        });
      }
    },
    [socket.current, isOnline]
  );

  const handleIncommingCall = useCallback(
    async ({ from, offer, name }) => {
      Swal.fire({
        title: `${name} is Calling ......`,
        showDenyButton: true,
        confirmButtonText: "Recieve call..",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setRemoteSocketId(from);
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
          localVideoRef.current.srcObject = stream;
          setMyStream(stream);
          setOpacity("visible")
          const ans = await peer.getAnswer(offer);
          
          remoteVideoRef.current.srcObject=offer;

          socket.current.emit("call:accepted", { to: from, ans });
        } else if (result.isDenied) {
          // Swal.fire("Changes are not saved", "", "info");
          socket.current.emit("call:rejected", {
            to: currentChat.id,
            msg: "Rejected",
            name: username,
          });
        }
      });
    },
    [socket.current]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      setOpacity("visible")
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const handleCallRejected =useCallback
    (async() => {

     
    await  socket.current.on("call:rejected",async ({ from, msg, name }) => {
        // console.log(`${name} Rejected Your Call !! `)
        // alert(`${name} Rejected Your Call !! `)
       toast.error(`${name} Rejected Your Call !! `, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          theme: "colored",
        });

       
      });
      setOpacity("none");
      const stream = localVideoRef.current.srcObject;
      const tracks = stream.getTracks();
if(tracks.length>0){
      tracks.forEach(async (track) => {
        await track.stop();
      });}
  
      localVideoRef.current.srcObject = null;
    },
    [socket.current]);

  useEffect(() => {
    socket.current.on("incomming:call", handleIncommingCall);
    socket.current.on("call:accepted", handleCallAccepted);
    socket.current.on("call:rejected", handleCallRejected);
    socket.current.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.current.on("peer:nego:final", handleNegoNeedFinal);
    return () => {
      socket.current.off("incomming:call", handleIncommingCall);
      socket.current.off("call:accepted", handleCallAccepted);
      socket.current.on("call:rejected", handleCallRejected);
      socket.current.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.current.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket.current,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  const cutVideoCall = async () => {
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
    setMyStream(false);

    const stream = localVideoRef.current.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(async (track) => {
      await track.stop();
    });
    console.log(tracks);

    localVideoRef.current.srcObject = null;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setCallEnded(true);
    peerConnection.current.destroy();
  };

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
              onClick={() => {
                handleCallUser(currentChat.id);
              }}
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
      <VideoCallModal opacity={opacity} >
        <button
          onClick={() => {
            setOpacity("none");
            cutVideoCall();
          }}
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
      <div style={{display:"flex"}}>
      <div>
          <h2>Your Video</h2>
          {<video ref={localVideoRef} autoPlay playsInline muted />}
        </div>
        <div>
          <h2>Remote Video</h2>
          {<video playsInline ref={remoteVideoRef} autoPlay />}
        </div></div>
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
    display: block;
  }
`;

// const startVideoCall = useCallback( async (anotherUserID) => {
//   try {
//   let stream= await navigator?.mediaDevices?.getUserMedia({
//       video: true,
//       audio: true,
//       });

//   localVideoRef.current.srcObject = stream;

//   const offer = await peer.getOffer();

//   socket.current.emit("user:call",
//   { to: anotherUserID, offer,name:username });
//   setStream(stream)

//     // console.log("Send offer:", localVideoRef.current.srcObject);
//   } catch (error) {
//     console.log("Error accessing user media:==>", error);
//   }
// },[socket.current])
