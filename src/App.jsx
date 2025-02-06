import React, { useState } from 'react';
import './App.css';
import ProductCatalog from './ProductCatalog';

const CATALOG_URL = 'https://la-belle-cosmeticos.com'; // Substitua com o URL do seu site

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="container">
      <nav className="topnav">
        <div className="logo-container">
          <h1 className="logo">La Belle</h1>
          <div className="logo-underline"></div>
        </div>
        <div style={{ color: '#777', fontSize: '0.8em', textAlign: 'center' }}>
          Rosana Posca de Souza
        </div>
      </nav>

      <ProductCatalog selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
    </div>
  );
}

export default App;
