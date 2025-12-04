import { userDataContext } from "../context/userContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { CgMenuRight } from "react-icons/cg";

import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/ai.gif";
import aiImg from "../assets/user.gif";
function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const [ham, setHam] = useState(false);
  const synth = window.speechSynthesis;
  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };
  const startRecognition = () => {
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (error) {
      if (!error.message.includes("start")) {
        console.error("Recognition error:", error);
      }
    }
  };
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang === "hi-IN");
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }
    isSpeakingRef.current = true;
    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      startRecognition();
    };
    synth.speak(utterance);
  };
  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    if (type === "google-search") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    }
    if (type === "calculator-open") {
      window.open("https://www.google.com/search?q=calculator", "_blank");
    }

    if (type === "instagram-open") {
      window.open("https://www.instagram.com/", "_blank");
    }

    if (type === "facebook-open") {
      window.open("https://www.facebook.com/", "_blank");
    }
    if (type === "weather-show") {
      window.open("https://www.google.com/search?q=weather", "_blank");
    }

    if (type === "youtube-search" || type === "youtube_play") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    }
  };
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    const isRecognizingRef = { current: false };
    recognitionRef.current = recognition;

    const safeRecognition = () => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Recognition requested to start");
        } catch (err) {
          if (err.name !== "InvalidStateError") {
            console.error("Start error:", err);
          }
        }
      }
    };

    recognition.onstart = () => {
      console.log("Recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      isRecognizingRef.current = false;
      setListening(false);
    };

    if (!isSpeakingRef.current) {
      setTimeout(() => {
        safeRecognition();
      }, 1000); // delay avoids rapid loop
    }

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);

      if (event.error !== "aborted" && !isSpeakingRef.current) {
        setTimeout(() => {
          safeRecognition();
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("heard : " + transcript);
      if (transcript.toLowerCase().includes(userData.toLowerCase())) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);

        const data = await getGeminiResponse(transcript);
        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }
    };

    const fallback = setInterval(() => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        safeRecognition();
      }
    }, 10000);
    safeRecognition();

    return () => {
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      clearInterval(fallback);
    };
  }, []);
  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex justify-center items-center flex-col gap-[15px]">
      <CgMenuRight
        className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
        onClick={() => setHam(true)}
      />
      <div
        className={`
    absolute top-0 w-full h-full 
    bg-[#00000053] backdrop-blur-lg p-[20px] 
    flex flex-col gap-[20px] items-start 
    ${ham ? "translate-x-0" : "translate-x-full"}
    transition-transform
  `}
      >
        <RxCross1
          className="text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
          onClick={() => setHam(false)}
        />

        <button
          className="min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px]"
          onClick={handleLogOut}
        >
          Log Out
        </button>

        <button
          className="min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px] px-[20px] py-[10px]"
          onClick={() => navigate("/customize")}
        >
          Customize your Assistant
        </button>
        <div className="w-full h-[2px] bg-gray-400" />

        <h1 className="text-white font-semibold text-[19px]">History</h1>
        <div className="w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col">
          {userData.history?.map((his) => (
            <span className="text-gray-200 text-[18px] truncate">{his}</span>
          ))}
        </div>

        <div className="w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate">
          {userData.history?.map((his) => (
            <div
              key={his}
              className="text-gray-200 text-[18px] w-full h-[30px]"
            >
              {his}
            </div>
          ))}
        </div>
      </div>
      <button
        className="min-w-[150px] h-[60px] mt-[30px] text-black hidden lg:block font-semibold absolute top-[20px] right-[20px] bg-white rounded-full text-[19px]"
        onClick={handleLogOut}
      >
        Log Out
      </button>

      <button
        className="min-w-[150px] h-[60px] mt-[30px] text-black hidden lg:block font-semibold bg-white absolute top-[100px] right-[20px] rounded-full text-[19px] px-[20px] py-[10px]"
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>

      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg">
        <img
          src={userData?.assistantImage}
          alt=""
          className="h-full object-cover"
        />
      </div>
      <h1 className="text-white text-[18px] font-semibold">
        I'm {userData?.assistantName}
      </h1>
      {!aiText && <img src={userImg} alt="" className="w-[200px]" />}
      {aiText && <img src={aiImg} alt="" className="w-[200px]" />}

      <h1 className="text-white text-[18px] font-semibold text-wrap">
        {userText ? userText : aiText ? aiText : null}
      </h1>
    </div>
  );
}

export default Home;
