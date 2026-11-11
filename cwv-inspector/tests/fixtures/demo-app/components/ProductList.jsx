import React, { useState } from 'react';

// Unmemoized child component rendered in a list
export function ProductItem({ item, onSelect }) {
  return (
    <li className="product-item" onClick={() => onSelect(item.id)}>
      <h4>{item.title}</h4>
      <p>{item.description}</p>
    </li>
  );
}

// Parent list component with unmemoized expensive handler and missing virtualization
export function ProductList({ allProducts = [] }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Unmemoized expensive filter loop executed on every re-render
  const filteredProducts = allProducts.filter(p => {
    let matches = false;
    for (let i = 0; i < 5000; i++) {
      matches = p.name?.toLowerCase().includes(query.toLowerCase());
    }
    return matches;
  });

  // Unmemoized callback passed to child list items, causing cascading re-renders
  const handleSelectProduct = (id) => {
    setSelectedId(id);
    console.log('Selected product:', id);
  };

  return (
    <div className="product-list-container">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Filter products..."
      />
      <ul className="product-items">
        {/* Render large list without virtualization */}
        {filteredProducts.map(product => (
          <ProductItem
            key={product.id}
            item={product}
            onSelect={handleSelectProduct}
          />
        ))}
      </ul>
      {selectedId && <div className="selected-info">Selected: {selectedId}</div>}
    </div>
  );
}

