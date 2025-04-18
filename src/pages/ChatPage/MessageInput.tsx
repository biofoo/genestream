import { ArrowUp } from "lucide-react";
import { useRef } from "react";

export interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
}

export const MessageInput = ({
  input,
  setInput,
  sendMessage,
}: MessageInputProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px"; // matches min-height
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${Math.min(
      target.scrollHeight,
      window.innerHeight * 0.2
    )}px`;
    setInput(target.value);
  };

  return (
    <div className="p-0">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="relative flex flex-col border border-input rounded-t-xl bg-background p-1.5"
      >
        <div className="relative">
          {" "}
          {/* Wrapper for textarea and send button */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            placeholder="Message GeneStream"
            className="w-full resize-none overflow-y-auto bg-transparent px-3 py-2 focus:outline-none min-h-[64px] max-h-[20vh] pr-12"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          {input.trim().length > 0 && (
            <button
              type="submit"
              className="absolute top-1.5 right-1.5 flex items-center justify-center h-9 w-9 rounded-lg bg-[#e97720] text-white hover:bg-[#e97720]/90 transition-colors"
            >
              <ArrowUp className="h-5 w-5 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Bottom bar with model selector and hint */}
        <div className="flex justify-between items-center px-3 pt-3 pb-1">
          {/* Model selector */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <select className="bg-transparent text-xs focus:outline-none cursor-pointer">
              <option value="llama3.2">Rubi 1.1</option>
              <option value="mixtral">Llama3.2</option>
            </select>
          </div>

          {/* New line hint */}
          <span className="text-[10px] text-muted-foreground/50">
            Use shift + return for new line
          </span>
        </div>
      </form>
    </div>
  );
};
