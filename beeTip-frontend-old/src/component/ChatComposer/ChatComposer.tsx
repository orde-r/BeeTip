import "./ChatComposer.css";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function ChatComposer({ value, onChange, onSubmit }: ChatComposerProps) {
  return (
    <form className="chat-compose" onSubmit={onSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a message"
      />
      <button type="submit" className="primary-btn chat-send-btn">
        <span className="material-symbols-outlined">send</span>
      </button>
    </form>
  );
}
