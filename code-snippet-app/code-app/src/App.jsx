import SearchBar from "./components/SearchBar";
import { Code2 } from "lucide-react";
import { useState, useEffect } from "react";
import TagFilter from "./components/TagFilter";
import SnippetCard from "./components/SnippetCard";
import SnippetForm from "./components/SnippetForm";
import { Sun, Moon } from "lucide-react";

const url = import.meta.env.VITE_BASE_URL;
const App = () => {

  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [snippets, setSnippets] = useState([]);
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleTheme = () => {
    setTheme((prev) => prev==='dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    const fetchSnippets = async () => {
      const res = await fetch(`${url}/snippets`);
      const data = await res.json();
      data.forEach(snippet => {
        snippet.tags = snippet.tags.split(',').map(tag => tag.trim());
      });
      setAllTags([...new Set(data.flatMap(snippet => snippet.tags))]);
      setSnippets(data);
    }
    fetchSnippets();
  }, []);

  const handleClose = () => {
    setShowForm(false);
  }
  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t != tag) : [...prev, tag]
    )

  }

  const filteredSnippets = snippets.filter((snippet) => {
    const matchesQuery = snippet.title.toLowerCase().includes(query.toLowerCase()) || snippet.description.toLowerCase().includes(query.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => snippet.tags.includes(tag));
    return matchesQuery && matchesTags;
  });


  const handleToggleFavourite = async (id) => {
    const snippet = snippets.find((s) => s.id === id)
    const resp = await fetch(`${url}/snippets/favorite/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "isFavorite": snippet.isFavorite })
      }
    )
    if (!resp.ok) { throw new Error('Failed to update Favorite') };
    const updatedSnippet = await resp.json();
    updatedSnippet.tags = updatedSnippet.tags.split(',').map(tag => tag.trim())
    setSnippets((prev) => prev.map((s) => s.id === id ? updatedSnippet : s))
  };

  const handleAdd = async (title, language, code, tags, description, favorite) => {
    const newSnippet = {
      "title": title,
      "language": language,
      "tags": tags,
      "description": description,
      "code": code,
      "isFavorite": favorite
    };
    const resp = await fetch(`${url}/snippets`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([newSnippet])
      }
    )
    if (!resp.ok) { throw new Error("Unable to add snippet") }
    setSnippets((prev) => [...prev, newSnippet])
  }
  const handleDelete = async (id) => {
    const resp = await fetch(`${url}/snippets/delete/${id}`,
      {
        method: "Delete"
      }
    )
    if (!resp.ok) { throw new Error("Unable to delete snippet") }
    setSnippets((prev) => prev.filter((s) => s.id != id))
  }


  return (
    <>
      {/* mainapp */}
      <div className='app'>
        <div className='app-container'>
          <div className="app-header">
            {/* search bar */}
            <Code2 className="app-icon" />
            <h1>Snippet Gallery</h1>
            <button className="theme-toggle" onClick={handleTheme}>{theme === 'dark' ? <Sun/> : <Moon/>}</button>
          </div>
          <div className="toolbar">
            <SearchBar query={query} onQueryChange={setQuery} />
            <button className="new-button" onClick={() => setShowForm(true)}> + Create</button>
          </div>
          <TagFilter allTags={allTags} selectedTags={selectedTags} onToggle={handleToggleTag} />
          {filteredSnippets.length === 0 ? <p className="snippet-list-empty">No snippets...</p> : filteredSnippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} onToggleFavourite={handleToggleFavourite} onDelete={handleDelete} />
          ))}
        </div>

        {showForm && <SnippetForm onSubmit={handleAdd} onClose={handleClose} />}
      </div>
    </>
  );
};

export default App;
