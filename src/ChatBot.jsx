import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import animationData from "../src/assets/Animination.json";
import Lottie from "react-lottie";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Container,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Button,
} from "@mui/material";
import CryptoJS from "crypto-js";
const SECRET_PASS = import.meta.env.VITE_ENCRYPTION_SECRET || "";

const ChatBot = () => {
  const { id } = useParams();
  // Accessing the data attribute from the script tag
  const scriptTag = document.querySelector("script[data-agent-id]");
  const chatbotId = scriptTag ? scriptTag.dataset.agentId : null;
  // const chatbotId =
  //   "U2FsdGVkX1897FCcb1bhTMnBRYWBtPp7B0ou2oL/n2gfqVKd60ZUPaXUbYjtSNIv";

  console.log(scriptTag?.dataset);
  // const encryptId = (id) => {
  //   console.log(id, "data");
  //   const cipherId = CryptoJS.AES.encrypt(
  //     JSON.stringify(id),
  //     SECRET_PASS
  //   ).toString();
  //   console.log(cipherId, "cipherText");
  //   const encodedValue = encodeURIComponent(cipherId);
  //   console.log("enco/ded value: ", encodedValue);
  //   return cipherId;
  // };
  // const randomId =
  //   "U2FsdGVkX183kb3kNnqEoUGV/o6QUpmQxtO3U8TKicPPDV85GBIN+kZFRBNG9+2C";

  // const idToBeEncrypted = encryptId(chatbotId);
  // console.log(idToBeEncrypted, "idToBeEncrypted");

  const decryptId = (id) => {
    console.log(id);
    const bytes = CryptoJS.AES.decrypt(id, SECRET_PASS);
    const decryptedId = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedId;
  };
  // const idToBeDecrypted = decryptId(idToBeEncrypted);
  // console.log("idToBeDecrypted: ", idToBeDecrypted);
  //   const chatbotId = "65aa5f9825b33649172cbfaf";
  // const appId="11111"
  const [loading, setLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotName, setChatbotName] = useState("");
  const [styles, setStyles] = useState({
    bgColor: "",
    chatBubbleColor: "",
    fontColor: "",
    fontSize: "",
    fontStyle: "",
    headerGradientOne: "",
    headerGradientTwo: "",
    icon: "",
    sendButtonColor: "",
    tagline: "",
    typingSpeed: "",
    userChatBubbleColor: "lightblue",
  });
  const [botIsTyping, setBotIsTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      content: "Hello, I am ChatBot! How can I help you today?",
      sender: "bot",
    },
  ]);

  const [userInput, setUserInput] = useState("");
  const [user_id, setUserId] = useState("");
  const [role, setRole] = useState("");
  const [rotate, setRotate] = useState(false);
  const [chatUniqueId, setChatUniqueId] = useState(null);

  const [errorFetchingStyles, setErrorFetchingStyles] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const messagesContainerRef = useRef(null);
  useEffect(() => {
    const newUUID = Math.random().toString(36).substring(2, 15);
    setChatUniqueId(() => newUUID);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://app.spoky.co/nest_backend/chatbots/get-single-chatbot/${decryptId(
            chatbotId
          )}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error fetching styles");
        }

        const { chatbotStyles, chatbotDetails } = data?.data || {};
        const initialMessage = chatbotDetails?.initialMessage;
        console.log(chatbotDetails, "chatbotDetails");
        const name = chatbotDetails?.name;
        setChatbotName(name);
        const chatbotRole = chatbotDetails?.role;
        const { userId } = data?.data;
        setUserId(userId);
        setRole(chatbotRole);
        setMessages([{ content: initialMessage, sender: "bot" }]);

        setStyles({
          bgColor: chatbotStyles?.bgColor,
          chatBubbleColor: chatbotStyles?.chatBubbleColor,
          fontColor: chatbotStyles?.fontColor,
          fontSize: chatbotStyles?.fontSize,
          fontStyle: chatbotStyles?.fontStyle,
          headerGradientOne: chatbotStyles?.headerGradientOne,
          headerGradientTwo: chatbotStyles?.headerGradientTwo,
          icon: chatbotStyles?.icon,
          sendButtonColor: chatbotStyles?.sendButtonColor,
          tagline: chatbotStyles?.tagline,
          typingSpeed: chatbotStyles?.typingSpeed,
          userChatBubbleColor: "lightblue",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching styles:", error);
        setErrorFetchingStyles(true);

        if (
          error &&
          error.message === "The requested URL was not found on this server"
        ) {
          setNotFoundError(true);
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessageToAPI = async (userMessage) => {
    console.log("true");
    setBotIsTyping(true);

    // console.log("API try-------------====");
    const formData = new FormData();
    formData.append("query", userMessage);
    formData.append("chatbot_id", decryptId(chatbotId));
    formData.append("verticals", role);
    formData.append("user_id", user_id);
    formData.append("user_chatid", chatUniqueId);

    // console.log("API try-------------====");
    try {
      const response = await fetch("https://app.spoky.co/ai_backend/chat", {
        method: "POST",
        headers: {
          authorization: import.meta.env.VITE_CHAT_API_AUTHORIZATION_TOKEN,
        },
        body: formData,
        redirect: "follow",
      });

      const result = await response.json();
      console.log(result);

      setTimeout(() => {
        console.log("try");
      }, 5000);
      setBotIsTyping(false);

      return result;
    } catch (error) {
      console.log("catch");
      console.error("Error sending message to API:", error);
      setTimeout(() => {}, 5000);
      setBotIsTyping(false);
      throw error;
    }
  };

  const addMessage = (content, sender = "user") => {
    setMessages((prevMessages) => [...prevMessages, { content, sender }]);
  };
  console.log(messages);

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = async () => {
    // console.log("send message", userInput);
    if (userInput.trim() !== "") {
      setUserInput("");

      if (waitingForResponse) {
        // Display an error message to the user.
        setErrorMessage(
          "Please wait for the previous response before asking a new question."
        );

        // Clear the error message after 5 seconds.
        setTimeout(() => {
          setErrorMessage("");
        }, 5000);

        return;
      }

      const userMessage = userInput;

      addMessage(userMessage, "user");
      setWaitingForResponse(true); // Set the flag to indicate that the bot is waiting for a response.

      try {
        // console.log("try-----------------");
        const apiResponse = await sendMessageToAPI(userMessage);
        const botResponse =
          apiResponse.Message || "Sorry, something went wrong.";
        const Message = apiResponse?.Message;

        setMessages((prevMessages) => [
          ...prevMessages,
          { content: Message, sender: "bot" },
        ]);
      } catch (error) {
        // Handle errors
      } finally {
        setWaitingForResponse(false); // Reset the flag after receiving the bot response.
      }
    }
  };

  //   console.log(messages, "setMessages");
  const handleClick = () => {
    console.log("rotate");
    setRotate(true);
    setTimeout(() => {
      setRotate(false);
    }, 500); // Reset rotation after 500ms (same duration as transition in CSS)
  };
  const handleGenerateUUID = async () => {
    const newUUID = Math.random().toString(36).substring(2, 15);
    console.log(newUUID);
    setChatUniqueId(() => newUUID);
    setMessages((prevMessages) => {
      // Keep the first message and clear the rest
      const firstMessage = prevMessages.length > 0 ? [prevMessages[0]] : [];
      return firstMessage;
    });
  };
  console.log(chatUniqueId);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const handleShowChatbot = () => {
    console.log("clicked");
    setShowChatbot(() => !showChatbot);
  };
  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px" /* Adjust the distance from the bottom as needed */,
        right: "10px",
        zIndex: 9999,
        // backgroundColor:"red"
      }}
    >
      <Button
        onClick={() => setShowChatbot(false)}
        sx={{
          display: showChatbot ? "flex" : "none",
          marginBottom: "10px",
          capitalize: "none",
          width: "50px",
          height: "50px",
          backgroundColor: "#FF8C7D",
          borderRadius: "50%",
          justifyContent: "center",
          alignItems: "center",
          "&:focus": {
            outline: "none",
          },
          "&:hover": {
            backgroundColor: "#FF8C7D",
          },
        }}
      >
        <div
          className="show-chatbot-icon"
          style={{
            width: "100%",
            height: "100%",
            padding: 0,
            backgroundColor: "transparent",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: "5rem", color: "#62D2E9" }} />
        </div>{" "}
      </Button>
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            fontFamily: "fantasy",
            fontSize: "2rem",
          }}
        >
          <p>
            {errorFetchingStyles ? (
              <>
                <img
                  src="https://app.stammer.ai/static/common/img/illustrations/errors/404.5e247682dc69.svg"
                  alt="Error"
                  style={{
                    height: "60%",
                    width: "70%",
                  }}
                />
                <br />
                {notFoundError
                  ? "Error fetching styles"
                  : "The requested URL was not found on this server"}
              </>
            ) : (
              "Loading..."
            )}
          </p>
        </div>
      ) : (
        showChatbot && (
          <div
            className="chatbot-container"
            style={{
              backgroundColor: styles.bgColor,
              fontSize: styles.fontSize,
              fontFamily: styles.fontStyle,
              color: styles.fontColor,
              width: "500px",
              height: "500px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              overflow: "hidden",

              // marginTop: "2rem",
            }}
          >
            {/* <h5>Chatbot Id : {chatbotId}</h5> */}
            <div
              style={{
                background: `linear-gradient(to right, ${styles.headerGradientOne}, ${styles.headerGradientTwo})`,
                padding: "10px",
                textAlign: "center",
                height: "50px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {styles.icon && (
                <img
                  src={styles.icon}
                  alt="Chatbot Icon"
                  style={{
                    width: "40px",
                    height: "40px",
                    marginRight: "10px",
                    borderRadius: "50%",
                  }}
                />
              )}

              <div
                style={{
                  fontSize: "24px",
                  padding: "5px 0",
                  color: "white",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {chatbotName}
              </div>
              <div
                className="reset-button"
                style={{ backgroundColor: "transparent" }}
              >
                <Button
                  disableElevation
                  disableTouchRipple
                  onClick={handleClick}
                  sx={{
                    color: "#FFFFFF",
                    ml: 3,
                    cursor: "pointer",
                    transition: "transform 0.5s ease",
                    "&.rotate": {
                      transform: "rotate(180deg)",
                    },
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                    "&:focus": {
                      backgroundColor: "transparent",
                      border: 0,
                      outline: 0,
                    },
                  }}
                  className={rotate ? "rotate" : ""}
                >
                  <RestartAltIcon onClick={() => handleGenerateUUID()} />
                </Button>
              </div>
            </div>

            <div
              style={{
                height: "300px",
                overflowY: "auto",
                padding: "15px",
                borderBottom: `1px solid ${styles.userChatBubbleColor}`,
                backgroundColor: `${styles.bgColor}`,
                borderRadius: "24px",
                width: "98%",
                position: "relative",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "thin",
                scrollbarColor: "red transparent",
              }}
              ref={messagesContainerRef}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection:
                      message.sender === "user" ? "row-reverse" : "row",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  {message.sender === "bot" && styles.icon && (
                    <img
                      src={styles.icon}
                      alt="Bot Icon"
                      style={{
                        width: "50px",
                        height: "50px",
                        marginRight: "10px",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                  <div
                    style={{
                      background:
                        message.sender === "user"
                          ? styles.userChatBubbleColor
                          : styles.chatBubbleColor,
                      color: styles.fontColor,
                      padding: "10px",
                      borderRadius: "8px",
                      maxWidth: "70%",
                      textAlign: "left",
                    }}
                  >
                    {message.sender === "bot" ? (
                      <>
                        {index === messages.length - 1 && botIsTyping ? (
                          <div
                            style={{ textAlign: "center", marginTop: "10px" }}
                          >
                            <Typography>Loading...</Typography>
                          </div>
                        ) : (
                          message.content
                        )}
                      </>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
              {botIsTyping && (
                <div
                  className="icon-with-loading-text"
                  style={{ display: "flex" }}
                >
                  <img
                    src={styles.icon}
                    alt="Bot Icon"
                    style={{
                      width: "50px",
                      height: "50px",
                      marginRight: "10px",
                      borderRadius: "50%",
                    }}
                  />
                  <div
                    style={{
                      background: styles.chatBubbleColor,
                      color: "#333",
                      padding: "10px",
                      borderRadius: "8px",
                      maxWidth: "20%",
                      textAlign: "left",
                    }}
                  >
                    <Lottie options={defaultOptions} width={50} />
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Ask me Anything..."
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ddd",
                  outline: "none",
                  backgroundColor: "white",
                  color: "black",
                  marginRight: "10px",
                }}
                value={userInput}
                onChange={handleUserInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <button
                style={{
                  color: styles.sendButtonColor,
                  padding: "8px 15px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  background: `linear-gradient(to right, ${styles.headerGradientOne}, ${styles.headerGradientTwo})`,
                }}
                onClick={handleSendMessage}
              >
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  style={{ marginRight: "5px" }}
                />
              </button>
            </div>
            <div>
              {errorMessage && (
                <div
                  style={{ color: "red", marginTop: "10px", fontSize: "1rem" }}
                >
                  {errorMessage}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                borderTop: `1px solid ${styles.userChatBubbleColor}`,
                padding: "10px",
                height: "auto",
                width: "100%",
              }}
            >
              <div style={{ fontSize: "18px" }}>{styles.tagline}</div>
            </div>

            <div
              style={{
                background: `linear-gradient(to right, ${styles.headerGradientOne}, ${styles.headerGradientTwo})`,
                padding: "10px",
                textAlign: "center",
                borderTop: `1px solid ${styles.userChatBubbleColor}`,
                height: "50px",
                width: "100%",
                marginTop: "2.7rem",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  background: `linear-gradient(to right, ${styles.headerGradientOne}, 
                             ${styles.headerGradientTwo})`,
                }}
              ></div>
            </div>
          </div>
        )
      )}
      {!showChatbot && (
        <Button
          onClick={handleShowChatbot}
          sx={{
            marginTop: "10px",
            width: "60px",
            height: "60px",
            padding: 0,
            borderRadius: "50%",
            backgroundColor: "white",
            "&:focus": { outline: "none" },
          }}
        >
          <div
            className="show-chatbot-icon"
            style={{
              width: "100%",
              height: "100%",
              padding: 0,
              backgroundColor: "white",
            }}
          >
            <img src={styles.icon} width="100%" height="100%" />
          </div>
        </Button>
      )}
    </div>
  );
};

export default ChatBot;
