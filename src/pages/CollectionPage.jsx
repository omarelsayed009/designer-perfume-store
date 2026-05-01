import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../context/AppStore.jsx';
import { Coverflow } from '../components/Coverflow.jsx';
import { BrowseCard, FavoriteButton } from '../components/ui.jsx';

const copyMap = {
  home: {
    label: 'HOME',
    title: 'DESIGNER',
    subtitle: 'BEST\nSELLERS',
    note: 'Home shows our best-selling fragrances.'
  },
  men: {
    label: 'MEN COLLECTION',
    title: 'DESIGNER',
    subtitle: 'MASCULINE\nFRAGRANCES',
    note: 'Discover richer wood, musk, and leather-led perfume signatures.'
  },
  women: {
    label: 'WOMEN COLLECTION',
    title: 'DESIGNER',
    subtitle: 'FEMININE\nFRAGRANCES',
    note: 'Soft florals, velvet musks, and luminous perfume blends.'
  }
};

function renderSubtitle(value) {
  return value.split('\n').map((line) => <span key={line}>{line}<br /></span>);
}

export function CollectionPage({ gender = 'home' }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search') || '';
  const navigate = useNavigate();
  const {
    addToCart,
    formatDualPrice,
    getProductsForView,
    isFavorite,
    toggleFavorite
  } = useAppStore();
  const [activeIndex, setActiveIndex] = useState(0);

  const { filtered, featured } = useMemo(() => getProductsForView(gender, query), [gender, getProductsForView, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [gender, query, featured.length]);

  const activeProduct = featured[activeIndex] || null;
  const pageCopy = copyMap[gender] || copyMap.home;

  const productsForBrowse = filtered.map((product) => ({
    ...product,
    displayPrice: formatDualPrice(product.price)
  }));

  return (
    <>
      <main className="stage">
        <section className="copy">
          <span>{pageCopy.label}</span>
          <h1>{pageCopy.title}</h1>
          <p>{renderSubtitle(pageCopy.subtitle)}</p>
          <small className="copy-note">{pageCopy.note}</small>
        </section>

        <Coverflow
          products={featured}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          onOpen={(product) => navigate(`/product/${product.id}`)}
        />

        <section className="product-info">
          <div className="product-title-row">
            <h2>{activeProduct ? activeProduct.title : 'No perfume found'}</h2>
            <FavoriteButton
              active={activeProduct ? isFavorite(activeProduct.id) : false}
              onClick={async () => {
                if (!activeProduct) return;
                const result = await toggleFavorite(activeProduct.id);
                if (result.requiresLogin) navigate('/login');
              }}
            />
          </div>
          <p>{activeProduct ? formatDualPrice(activeProduct.price) : 'Try another search'}</p>
          <div className="actions">
            <button className="primary" type="button" onClick={() => activeProduct && navigate(`/product/${activeProduct.id}`)}>VIEW PRODUCT</button>
            <button className="secondary" type="button" onClick={() => activeProduct && addToCart(activeProduct)}>ADD TO CART</button>
          </div>
        </section>

        <div className="progress">
          <span style={{ width: featured.length ? `${((activeIndex + 1) / featured.length) * 100}%` : '0%' }} />
        </div>
      </main>

      <section className="browse-shelf">
        <div className="browse-shell">
          <div className="browse-head">
            <div>
              <span className="section-kicker">CURATED FOR YOU</span>
              <h2>Explore More Perfumes</h2>
            </div>
            <p className="browse-summary">
              {filtered.length
                ? `${filtered.length} perfume${filtered.length === 1 ? '' : 's'} in ${pageCopy.label}${query ? ` for "${query}"` : ''}`
                : `No perfumes matched${query ? ` "${query}"` : ''}`}
            </p>
          </div>

          {filtered.length ? (
            <div className="browse-grid">
              {productsForBrowse.map((product) => (
                <BrowseCard
                  key={product.id}
                  product={product}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={async (productId) => {
                    const result = await toggleFavorite(productId);
                    if (result.requiresLogin) navigate('/login');
                  }}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="browse-empty">
              <h3>No perfume found</h3>
              <p>Try another perfume name or clear the search and browse the full collection again.</p>
              <button className="primary" type="button" onClick={() => navigate(gender === 'home' ? '/' : `/${gender}`)}>Clear Search</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
