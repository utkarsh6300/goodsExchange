import { Select, MenuItem, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ProductFilter = ({
  filterCategory,
  handleFilterCategoryChange,
  sortOption,
  handleSortOptionChange,
  searchTerm,
  handleSearchChange,
  categories,
  showSearch = true,
}) => {
  return (
    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Select value={filterCategory} onChange={handleFilterCategoryChange}>
        <MenuItem value="">All Categories</MenuItem>
        {categories.map(category => (
          <MenuItem key={category} value={category}>{category}</MenuItem>
        ))}
      </Select>
      <Select value={sortOption} onChange={handleSortOptionChange}>
        <MenuItem value="time">Sort by Time</MenuItem>
        <MenuItem value="price">Sort by Price</MenuItem>
      </Select>
      {showSearch && (
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search products"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}
    </div>
  );
};

export default ProductFilter;
