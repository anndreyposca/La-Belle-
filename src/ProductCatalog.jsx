import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './ProductCatalog.css';

const supabaseUrl = 'https://vprvhgfpsrdoucvcesdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcnZoZ2Zwc3Jkb3VjdmNlc2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTU2NzgsImV4cCI6MjA1NDI3MTY3OH0.50ZsgBvVACQCM6Hapjc_bPhBjRK_RK_x-ihE5bZhIGM';
const supabase = createClient(supabaseUrl, supabaseKey);

const CATALOG_URL = 'https://la-belle-cosmeticos.com'; // Substitua com o URL do seu site

function ProductCatalog({ selectedProduct, setSelectedProduct }) {
  const [products, setProducts] = useState([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editPreco, setEditPreco] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editImagem, setEditImagem] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*');

    if (error) {
      console.error('Erro ao carregar produtos:', error);
    } else {
      setProducts(data);
    }
  }

  async function adicionarProduto(nome, preco, descricao, imagem) {
    const nomeArquivo = `produtos/${Date.now()}_${imagem.name}`;
    const { data: imagemData, error: uploadError } = await supabase.storage
      .from('imagens')
      .upload(nomeArquivo, imagem);

    if (uploadError) {
      console.error('Erro ao fazer upload da imagem:', uploadError);
      alert('Erro ao enviar a imagem. Tente novamente.');
      return;
    }

    const { data: urlData } = supabase.storage
      .from('imagens')
      .getPublicUrl(imagemData.path);

    const { data: produtoData, error: dbError } = await supabase
      .from('produtos')
      .insert([{ nome, preco, descricao, imagem_url: urlData.publicUrl }]);

    if (dbError) {
      console.error('Erro ao salvar produto:', dbError);
      alert('Erro ao salvar o produto. Tente novamente.');
    } else {
      console.log('Produto adicionado com sucesso!');
      alert('Produto adicionado com sucesso!');
      carregarProdutos();
      closeModal();
    }
  }

  async function confirmDelete(productId) {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .match({ id: productId });

    if (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir o produto. Tente novamente.');
    } else {
      console.log('Produto excluído com sucesso!');
      alert('Produto excluído com sucesso!');
      carregarProdutos();
      setSelectedProduct(null); // Close the modal
    }
    setShowConfirmation(false);
  }

  const deleteProduct = (productId) => {
    setShowConfirmation(true);
  };

  const editProduct = (product) => {
    setEditNome(product.nome);
    setEditPreco(product.preco);
    setEditDescricao(product.descricao);
    setEditImagem(null); // Reset the image
    setIsEditModalOpen(true);
  };

  async function handleEditSubmit(productId) {
    // Check if productId is valid
    if (!productId) {
      console.error('Product ID is missing.');
      alert('Product ID is missing. Please try again.');
      return;
    }

    // Prepare the updates
    const updates = {
      nome: editNome,
      preco: editPreco,
      descricao: editDescricao,
    };

    // If a new image is selected, upload it and get the URL
    if (editImagem) {
      const nomeArquivo = `produtos/${Date.now()}_${editImagem.name}`;
      const { data: imagemData, error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(nomeArquivo, editImagem, { upsert: true });

      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        alert('Erro ao enviar a imagem. Tente novamente.');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('imagens')
        .getPublicUrl(imagemData.path);

      updates.imagem_url = urlData.publicUrl;
    }

    // Update the product in the database
    const { error } = await supabase
      .from('produtos')
      .update(updates)
      .match({ id: productId });

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar o produto. Tente novamente.');
    } else {
      console.log('Produto atualizado com sucesso!');
      alert('Produto atualizado com sucesso!');
      carregarProdutos();
      setIsEditModalOpen(false);
      setSelectedProduct({
        ...selectedProduct,
        nome: editNome,
        preco: editPreco,
        descricao: editDescricao,
        imagem_url: updates.imagem_url || selectedProduct.imagem_url,
      });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !preco || !imagem) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    await adicionarProduto(nome, parseFloat(preco), descricao, imagem);
    setNome('');
    setPreco('');
    setDescricao('');
    setImagem(null);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNome('');
    setPreco('');
    setDescricao('');
    setImagem(null);
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const truncateDescription = (description, maxLength) => {
    if (!description) return '';
    return description.length > maxLength ? description.substring(0, maxLength) + '...' : description;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const shareOnWhatsApp = () => {
    if (selectedProduct) {
      const nome = selectedProduct.nome;
      const preco = selectedProduct.preco;
      const descricao = selectedProduct.descricao;
      const imagemUrl = selectedProduct.imagem_url;

      const mensagem = `📸 Imagem: ${imagemUrl}\n\n🏷️ *Nome do produto:* ${nome}\n\n💰 *Preço:* R$ ${preco}\n\n📝 *Descrição:* ${descricao}`;
      const url = `https://api.whatsapp.com/send?phone=&text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    }
  };

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="product-catalog-container">
      <h1>Catálogo de Produtos</h1>
      <input
        type="text"
        placeholder="Pesquisar produto..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />
      <button onClick={openModal} className="add-product-button">Adicionar Produto</button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Adicionar Novo Produto</h2>
            <form id="formProduto" onSubmit={handleSubmit}>
              <label>
                Nome:
                <input
                  type="text"
                  id="nome"
                  placeholder="Nome do Produto"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </label>
              <label>
                Preço:
                <input
                  type="number"
                  id="preco"
                  placeholder="Preço"
                  required
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                />
              </label>
              <label>
                Descrição:
                <textarea
                  id="descricao"
                  placeholder="Descrição"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </label>
              <label>
                Imagem:
                <input
                  type="file"
                  id="imagem"
                  accept="image/*"
                  required
                  onChange={(e) => setImagem(e.target.files[0])}
                />
              </label>
              <button type="submit">Salvar Produto</button>
            </form>
          </div>
        </div>
      )}

      <h2>Produtos Cadastrados</h2>
      <div className="product-list">
        {filteredProducts.map((produto) => (
          <div className="product-card" key={produto.id} onClick={() => openProductDetails(produto)}>
            <img src={produto.imagem_url} alt={produto.nome} />
            <h3>{produto.nome}</h3>
            <p className="product-price">R$ {typeof produto.preco === 'number' ? produto.preco.toFixed(2) : parseFloat(produto.preco).toFixed(2)}</p>
            <p>{truncateDescription(produto.descricao, 50)}</p>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeProductDetails}>&times;</span>
            <img src={selectedProduct.imagem_url} alt={selectedProduct.nome} width="200" /><br />
            <h3 style={{ marginTop: '10px', fontWeight: 'bold' }}>{selectedProduct.nome}</h3>
            <p className="product-price">R$ {typeof selectedProduct.preco === 'number' ? selectedProduct.preco.toFixed(2) : parseFloat(selectedProduct.preco).toFixed(2)}</p>
            <p><strong>Descrição:</strong> {selectedProduct.descricao}</p>
            <div className="product-actions">
              <button className="icon-button delete-button" onClick={() => deleteProduct(selectedProduct.id)}>
                <i className="fas fa-trash-alt"></i>
              </button>
              <button className="icon-button edit-button" onClick={() => editProduct(selectedProduct)}>
                <i className="fas fa-edit"></i>
              </button>
              <button className="icon-button whatsapp-button" onClick={shareOnWhatsApp}>
                <i className="fab fa-whatsapp"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedProduct && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsEditModalOpen(false)}>&times;</span>
            <h2>Editar Produto</h2>
            <label>
              Nome:
              <input
                type="text"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
              />
            </label>
            <label>
              Preço:
              <input
                type="number"
                value={editPreco}
                onChange={(e) => setEditPreco(e.target.value)}
              />
            </label>
            <label>
              Descrição:
              <textarea
                value={editDescricao}
                onChange={(e) => setEditDescricao(e.target.value)}
              />
            </label>
            <label>
              Imagem:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditImagem(e.target.files[0])}
              />
            </label>
            <button onClick={() => handleEditSubmit(selectedProduct.id)}>Salvar Edição</button>
          </div>
        </div>
      )}

      {showConfirmation && selectedProduct && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowConfirmation(false)}>&times;</span>
            <h2>Confirmar Exclusão</h2>
            <p>Tem certeza que deseja excluir o produto "{selectedProduct.nome}"?</p>
            <button onClick={() => confirmDelete(selectedProduct.id)}>Confirmar</button>
            <button onClick={() => setShowConfirmation(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;
