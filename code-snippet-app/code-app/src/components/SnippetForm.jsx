import { useState } from "react"
import { X } from 'lucide-react'

const SnippetForm = ({ onSubmit, onClose }) => {
    const [title, setTitle] = useState('');
    const [language, setLanguage] = useState('');
    const [description, setDescription] = useState('');
    const [code, setCode] = useState('');
    const [tags, setTags] = useState('');

    return (
        <div className="modal-overlay">
            <form className="snippet-form" onSubmit={() => onSubmit(title, language, code, tags, description, false)}>

                <div className="snippet-form-head">
                    <h2>New Snippet</h2>
                    <button><X /></button>
                </div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"></input>
                <select>
                    <option value='Python'>Python</option>
                    <option value='C#'>C#</option>
                    <option value='Java'>Java</option>
                    <option value='JavaScript'>JavaScript</option>
                    <option value='Shell'>Shell</option>
                    <option value='Golang'>Golang</option>
                    <option value='C++'>C++</option>
                    <option value='C'>C</option>
                </select>
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description"></input>
                <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your code here..."></textarea>
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma, sperated"></input>
                <button className='submit-button' type="submit">Create</button>
            </form >
        </div>
    )





}
export default SnippetForm;