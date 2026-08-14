const SearchBar = ({query, onQueryChange}) => {
    return(
        <div className='search-bar'>
        <svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'>
          <circle cx='11' cy='11' r='8' />
          <line x1='21' y1='21' x2='16.65' y2='16.65' />
        </svg>
        <input
          className='search-barinput'
          type='text'
          placeholder='Search Code Snippets...'
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}></input>
        {/*replace with actual query and add onchange*/}
      </div>
    )
}
export default SearchBar;