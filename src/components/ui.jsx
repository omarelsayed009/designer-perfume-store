import { Link } from 'react-router-dom';

export function ProductFigure({ product, variant = 'carousel' }) {
  const image = product.thumbnail || '';
  const title = product.title || 'Product';

  return (
    <div className={`product-figure product-figure--${variant}`}>
      <img className="product-glow-image" draggable="false" src={image} alt="" aria-hidden="true" />
      <img className="product-art" draggable="false" src={image} alt={title} />
    </div>
  );
}

export function FavoriteButton({ active, onClick, className = '' }) {
  const classes = ['favorite-btn', className].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      type="button"
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={active}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4 5.05 5.05 0 0 1 12 7.09 5.05 5.05 0 0 1 17.5 4 4.5 4.5 0 0 1 22 8.5c0 3.78-3.4 6.86-8.55 11.54Z" />
      </svg>
    </button>
  );
}

export function MetaPills({ product }) {
  return (
    <div className="meta-pills">
      <span className="meta-pill">{product.gender || 'designer'}</span>
      <span className="meta-pill">Stock {Number(product.stock) || 0}</span>
      <span className="meta-pill">Rate {(Number(product.rating) || 0).toFixed(1)}</span>
    </div>
  );
}

export function BrowseCard({
  product,
  layout = 'browse',
  isFavorite,
  onToggleFavorite,
  onAddToCart
}) {
  const actionsClass = layout === 'recommendation' ? 'browse-actions browse-actions--compact' : 'browse-actions';

  return (
    <article className={`browse-card browse-card--${layout}`}>
      <Link className="browse-media" to={`/product/${product.id}`} aria-label={`Open ${product.title}`}>
        <ProductFigure product={product} variant="browse" />
      </Link>
      <div className="browse-card-head">
        <div>
          <h3>{product.title}</h3>
          <p className="browse-price">{product.displayPrice}</p>
        </div>
        <FavoriteButton active={isFavorite} onClick={() => onToggleFavorite(product.id)} />
      </div>
      <p className="browse-description">{product.description}</p>
      <MetaPills product={product} />
      <div className={actionsClass}>
        <Link className="secondary" to={`/product/${product.id}`}>View</Link>
        <button className="primary" type="button" onClick={() => onAddToCart(product)}>Add To Cart</button>
      </div>
    </article>
  );
}

export function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12.2a4.1 4.1 0 1 1 4.1-4.1 4.1 4.1 0 0 1-4.1 4.1Zm0 2c-4 0-7.2 2.1-7.2 4.8V22h14.4v-3c0-2.7-3.2-4.8-7.2-4.8Z" />
    </svg>
  );
}
