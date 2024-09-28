"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BiSend } from "react-icons/bi"; // Icon for the send button
import { AiOutlineUser, AiOutlineRobot } from "react-icons/ai"; // User and Assistant icons

// Interface for the API response
interface Answer {
  text: string;
  rules?: string[];
}

// Interface for messages in the chat
interface Message {
  sender: "user" | "assistant";
  text: string;
  rules?: string[];
}

const Chat: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Mutation for sending the question and receiving the response
  const mutation = useMutation<Answer, Error, string>({
    mutationFn: async (question: string) => {
      const response = await axios.post("/api/ask", { question });
      console.log("Réponse de l'API :", response.data);
      return response.data as Answer;
    },
  });

  // Handle sending the question
  const handleSend = () => {
    if (!question.trim()) return;

    // Add user's message to the messages
    setMessages([...messages, { sender: "user", text: question }]);

    // Send the question to the API
    mutation.mutate(question, {
      onSuccess: (data) => {
        console.log("Données reçues :", data);
        if (data) {
          // Add assistant's response to the messages
          setMessages((prev) => [...prev, { sender: "assistant", ...data }]);
        } else {
          // Handle empty response
          setMessages((prev) => [
            ...prev,
            { sender: "assistant", text: "Aucune réponse reçue." },
          ]);
        }
      },
      onError: (error) => {
        console.error("Erreur de mutation :", error);
        // Handle errors by adding an error message
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", text: "Une erreur est survenue." },
        ]);
      },
    });

    // Reset the input field after sending
    setQuestion("");
  };

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-4xl font-extrabold text-center text-indigo-400">
          Magic: The Gathering Assistant
        </h1>

        {/* Chat Box */}
        <div className="bg-gray-700 rounded-lg shadow-inner p-4 max-h-[500px] overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-4 ${
                msg.sender === "user"
                  ? "flex-row-reverse text-right"
                  : "text-left"
              }`}
            >
              {msg.sender === "user" ? (
                <AiOutlineUser className="text-3xl text-indigo-500" />
              ) : (
                <AiOutlineRobot className="text-3xl text-sky-500" />
              )}
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.sender === "user" ? "bg-indigo-600" : "bg-sky-600"
                }`}
              >
                <p className="text-white">{msg.text}</p>
                {msg.rules && (
                  <div className="mt-2 text-sm text-gray-200">
                    <h4 className="font-semibold">Règles utilisées :</h4>
                    <ul className="list-disc list-inside pl-4">
                      {msg.rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Box */}
        <div className="flex items-center space-x-4">
          <input
            type="text"
            className="flex-1 p-4 rounded-lg bg-gray-600 text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Posez votre question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()} // Send message on Enter key
          />
          <button
            onClick={handleSend}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg flex items-center justify-center"
          >
            <BiSend className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
