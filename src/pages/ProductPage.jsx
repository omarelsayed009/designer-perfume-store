import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../context/AppStore.jsx';
import { BrowseCard, FavoriteButton } from '../components/ui.jsx';

export function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {
    addToCart,
    formatDualPrice,
    getProductById,
    getRecommendations,
    isFavorite,
    toggleFavorite
  } = useAppStore();

  const product = getProductById(productId);
  const recommendations = getRecommendations(product).map((item) => ({
    ...item,
    displayPrice: formatDualPrice(item.price)
  }));

  if (!product) {
    return (
      <main className="details-layout">
        <section className="checkout-panel">
          <h1>Product Not Found</h1>
          <p className="checkout-subtitle">This perfume is no longer available in the current catalog.</p>
          <div className="actions detail-actions">
            <Link className="primary" to="/">Back To Home</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="details-layout">
        <section className="detail-image">
          <div className="product-figure product-figure--detail">
            <img className="product-glow-image" draggable="false" src={product.thumbnail} alt="" aria-hidden="true" />
            <img className="product-art" draggable="false" src={product.thumbnail} alt={product.title} />
          </div>
        </section>
        <section className="detail-text">
          <div className="detail-title-row">
            <h1>{product.title}</h1>
            <FavoriteButton
              active={isFavorite(product.id)}
              className="favorite-btn--detail"
              onClick={async () => {
                const result = await toggleFavorite(product.id);
                if (result.requiresLogin) navigate('/login');
              }}
            />
          </div>
          <div className="detail-badges">
            <span className="meta-pill">{product.gender}</span>
            <span className="meta-pill">Rate {product.rating.toFixed(1)}</span>
            <span className="meta-pill">Stock {product.stock}</span>
          </div>
          <p>{product.description}</p>
          <strong>{formatDualPrice(product.price)}</strong>
          <div className="actions detail-actions">
            <button className="primary" type="button" onClick={() => addToCart(product)}>ADD TO CART</button>
            <Link className="secondary" to={product.gender === 'men' ? '/men' : product.gender === 'women' ? '/women' : '/'}>Back To Collection</Link>
          </div>
        </section>
      </main>

      <section className="recommendations-shelf">
        <div className="browse-shell">
          <div className="browse-head">
            <div>
              <span className="section-kicker">DISCOVER NEXT</span>
              <h2>You May Also Like</h2>
            </div>
            <p className="browse-summary">More 3D perfume picks from the same vibe.</p>
          </div>
          <div className="browse-grid browse-grid--recommendations">
            {recommendations.map((item) => (
              <BrowseCard
                key={item.id}
                product={item}
                layout="recommendation"
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={async (id) => {
                  const result = await toggleFavorite(id);
                  if (result.requiresLogin) navigate('/login');
                }}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
