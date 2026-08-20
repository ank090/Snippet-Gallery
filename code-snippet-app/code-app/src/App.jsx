import SearchBar from "./components/SearchBar";
import { Code2, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import TagFilter from "./components/TagFilter";
import SnippetCard from "./components/SnippetCard";
import SnippetForm from "./components/SnippetForm";
import Auth from "./components/Auth";
import { customFetch } from "./api"; // IMPORT THE WRAPPER

const url = import.meta.env.VITE_BASE_URL;

const App = () => {
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [snippets, setSnippets] = useState([]);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoggedIn, setisLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isLoading, setisLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleTheme = () => {
    setTheme((prev) => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setisLoggedIn(false);
    setSnippets([]);
  };

  // Fetch Snippets using customFetch
  useEffect(() => {
    const fetchSnippets = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await customFetch('/snippets', {}, handleLogout);
        const data = await res.json();
        
        data.forEach(snippet => {
          snippet.tags = snippet.tags.split(',').map(tag => tag.trim());
        });
        setAllTags([...new Set(data.flatMap(snippet => snippet.tags))]);
        setSnippets(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchSnippets();
  }, [isLoggedIn]);

  const handleClose = () => setShowForm(false);

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Auth (Signup / Login - direct fetch used here as authorization header isn't required yet)
  const handleAuth = async (email, password) => {
    try {
      setisLoading(true);
      setError('');
      if (isSignUp) {
        const resp = await fetch(`${url}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.detail || "Signup failed");
        alert("Account Created Successfully");
        setIsSignUp(false);
      } else {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const resp = await fetch(`${url}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.detail || "Invalid Credentials");
        localStorage.setItem('token', data.access_token);
        setisLoggedIn(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setisLoading(false);
    }
  };

  const filteredSnippets = snippets.filter((snippet) => {
    const matchesQuery = snippet.title.toLowerCase().includes(query.toLowerCase()) || snippet.description.toLowerCase().includes(query.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => snippet.tags.includes(tag));
    return matchesQuery && matchesTags;
  });

  // Favorite toggle using customFetch
  const handleToggleFavourite = async (id) => {
    const snippet = snippets.find((s) => s.id === id);
    const resp = await customFetch(
      `/snippets/favorite/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "isFavorite": snippet.isFavorite })
      },
      handleLogout
    );
    if (!resp.ok) { throw new Error('Failed to update Favorite'); }
    const updatedSnippet = await resp.json();
    updatedSnippet.tags = updatedSnippet.tags.split(',').map(tag => tag.trim());
    setSnippets((prev) => prev.map((s) => s.id === id ? updatedSnippet : s));
  };

  // Create Snippet using customFetch
  const handleAdd = async (title, language, code, tags, description, favorite) => {
    const newSnippet = {
      title, language, tags, description, code, isFavorite: favorite
    };
    const resp = await customFetch(
      '/snippets',
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([newSnippet])
      },
      handleLogout
    );
    if (!resp.ok) { throw new Error("Unable to add snippet"); }
    
    const savedSnippets = await resp.json();
    const createdSnippet = savedSnippets[0];
    createdSnippet.tags = createdSnippet.tags.split(',').map(tag => tag.trim());
    setSnippets((prev) => [...prev, createdSnippet]);
  };

  // Delete Snippet using customFetch
  const handleDelete = async (id) => {
    const resp = await customFetch(
      `/snippets/delete/${id}`,
      { method: "DELETE" },
      handleLogout
    );
    if (!resp.ok) { throw new Error("Unable to delete snippet"); }
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  };

  if (!isLoggedIn) {
    return (
      <Auth 
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        handleAuth={handleAuth}
        isLoading={isLoading}
        error={error} 
      />
    );
  }

  return (
    <div className='app'>
      <div className='app-container'>
        <div className="app-header">
          <Code2 className="app-icon" />
          <h1>Snippet Gallery</h1>
          <div className="header-actions">
            <button className="theme-toggle" onClick={handleTheme}>
              {theme === 'dark' ? <Sun /> : <Moon />}
            </button>
            <button className="logout-button" onClick={handleLogout} style={{ cursor: 'pointer', padding: '6px 12px' }}>
              Logout
            </button>
          </div>
        </div>
        <div className="toolbar">
          <SearchBar query={query} onQueryChange={setQuery} />
          <button className="new-button" onClick={() => setShowForm(true)}> + Create</button>
        </div>
        <TagFilter allTags={allTags} selectedTags={selectedTags} onToggle={handleToggleTag} />
        {filteredSnippets.length === 0 ? (
          <p className="snippet-list-empty">No snippets...</p>
        ) : (
          filteredSnippets.map((snippet) => (
            <SnippetCard 
              key={snippet.id} 
              snippet={snippet} 
              onToggleFavourite={handleToggleFavourite} 
              onDelete={handleDelete} 
            />
          ))
        )}
      </div>

      {showForm && <SnippetForm onSubmit={handleAdd} onClose={handleClose} />}
    </div>
  );
};

export default App;