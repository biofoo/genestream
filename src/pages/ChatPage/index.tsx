// src/pages/ChatPage
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { MessageInput } from "./MessageInput";

const API_URL = import.meta.env.VITE_API_URL;

interface Message {
  text: string;
  sender: "user" | "bot";
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isDesignTrayOpen, setIsDesignTrayOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [, setIsLoading] = useState(false);

  const [] = useState<string[]>([
    "AAV6 for solid tumors",
    "New mAb producing cell line",
    "Hobby project 3",
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  const sendMessage = async () => {
    if (input.trim()) {
      setShowDisclaimer(false); // Hide when user sends message
      setIsLoading(true); // Start loading
      const userMessage: Message = { text: input, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      let message: Message = { text: "", sender: "bot" };
      // Add the empty bot message immediately
      setMessages((prev) => [...prev, message]);

      try {
        const response = await fetch(`${API_URL}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model: "llama3.2", prompt: input }),
        });

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Split by newlines in case multiple JSON objects arrived together
          const lines = chunk.split("\n").filter((line) => line.trim());

          // Process each JSON response
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.response) {
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].text += json.response;
                  return newMessages;
                });
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
        setShowDisclaimer(true); // Show after bot response
      } catch (error) {
        console.error("Error:", error);
        setShowDisclaimer(true); // Show even if there's an error
        // Optionally handle error in UI
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, I encountered an error. Please try again.",
            sender: "bot",
          },
        ]);
      } finally {
        setIsLoading(false); // Stop loading
      }
    }
  };

  const toggleDesignTray = () => {
    setIsDesignTrayOpen(!isDesignTrayOpen);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 0);

    return () => clearTimeout(timer);
  }, [messages, showDisclaimer]);

  return (
    <Layout>
      <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
        {/* Left Sidebar */}
        {/* Hidden temporarily. Replace 'hidden' with 'flex' */}
        <div className="w-64 bg-muted border-r border-border flex-shrink-0 hidden flex-col">
          {/* Navigation links */}
          <nav className="flex-grow overflow-y-auto p-4 space-y-4">
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 rounded-md hover:bg-muted dark:bg-muted/10 text-foreground flex items-center">
                <svg
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Getting Started
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md hover:bg-muted dark:bg-muted/10 text-foreground flex items-center">
                <svg
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                Chat
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted dark:bg-muted/10 text-foreground flex items-center ${
                  isDesignTrayOpen ? "bg-accent" : ""
                }`}
                onClick={toggleDesignTray}
              >
                <svg
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
                Design Tray
              </button>
            </div>
            <hr className="my-4 border-border" />
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 rounded-md hover:bg-muted dark:bg-muted/10 text-foreground flex items-center">
                <svg
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Documents & Reports
              </button>
            </div>
          </nav>
        </div>

        {/* Chat Interface */}
        <div className="flex-grow flex flex-col">
          <div className="flex-grow overflow-y-auto px-16 space-y-4">
            <div className="pt-4" />
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-[#e97720]/10 dark:bg-[#e97720]/25 text-foreground self-end"
                    : "text-foreground"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {showDisclaimer && (
              <div className="flex justify-end">
                <small className="block text-center text-muted-foreground/50 text-[10px]">
                  GeneStream can make mistakes. Please double-check responses.
                </small>
              </div>
            )}
            <div ref={messagesEndRef} className="h-0" />
          </div>
          <div className="px-12">
            <MessageInput
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
            />
          </div>
        </div>

        {/* Design Tray */}
        <div
          className={`w-96 bg-background shadow-lg transition-all duration-300 ease-in-out flex flex-col ${
            isDesignTrayOpen ? "translate-x-0" : "translate-x-full"
          } fixed top-0 right-0 bottom-0`}
        >
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-xl font-semibold">Design Tray</h2>
            <button
              onClick={toggleDesignTray}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto">
            {/* Placeholder for artifact */}
            <div className="bg-muted h-full flex items-center justify-center">
              <p className="text-muted-foreground">Artifact Placeholder</p>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex justify-between items-center">
              <button className="px-4 py-2 bg-muted dark:bg-muted/10 text-foreground rounded hover:bg-accent transition-colors">
                Version Control
              </button>
              <div className="flex space-x-2">
                <button
                  className="p-2 bg-muted dark:bg-muted/10 text-foreground rounded hover:bg-accent transition-colors"
                  title="Copy"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
                <button
                  className="p-2 bg-muted dark:bg-muted/10 text-foreground rounded hover:bg-accent transition-colors"
                  title="Download"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button className="px-4 py-2 bg-[#e97720] text-white rounded hover:bg-[#e97720]/90 transition-colors">
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatInterface;
