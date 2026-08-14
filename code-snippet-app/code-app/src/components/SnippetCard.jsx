import { Star, Trash, Copy, Check } from "lucide-react";
import CodeBlock from "./CodeBlock";
import { useState } from "react";

const SnippetCard = ({ snippet, onCopy, onDelete, onToggleFavourite }) => {

    const [justCopied, setJustCopied] = useState(false);
    const handleCopy = () => {
        onCopy(snippet.code);
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 1500);
    };


  return (
    <div className='snippet-card'>
      <div className='snippet-card-head'>
        <div>
        <h3>{snippet.title}</h3>
        <p>{snippet.description}</p>
        </div>
        <div className='snippet-card-actions'>
          <button
            className={`icon-button favorite ${snippet.isFavorite ? "active" : ""}`}onClick={() => onToggleFavourite(snippet.id)}>
            <Star />
          </button>
          <button className='icon-button delete' onClick={() => onDelete(snippet.id)}>
            <Trash />
          </button>
        </div>
      </div>
      <CodeBlock code={snippet.code} />
      <div className="snippet-card-footer">
        <div className="tag-chip-row">
            {snippet.tags.map((tag) => (
                <span className="tag-chip" key={tag}>{tag}</span>
            ))}
        </div>
        <button className="copy-button" onClick={handleCopy}>{justCopied ? <><Check/>Copied</> : <><Copy/>Copy</>}</button>
      </div>
    </div>
  );
};
export default SnippetCard;
