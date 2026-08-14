const TagFilter = ({ allTags, selectedTags, onToggle }) => {
  // setup On toggle
  return (
    <div className='tag-filter'>
      {allTags.map((tag) => {
        const isActive = selectedTags.includes(tag);
        return (
          <button className={`tag-button ${isActive ? 'active': ''}`} key={tag} onClick={() => onToggle(tag)}>
            {tag}
          </button>
        );
      })}
    </div>
  );
};
export default TagFilter;
