const bottleImages = Array.from({ length: 12 }, (_, index) => `/products/bottle-${index + 1}.png`);

const fallbackProducts = [
  { id: 1, title: 'Pharaoh', price: 180, rating: 4.9, stock: 72, description: 'Warm amber, oud, smoke and royal spices.' },
  { id: 2, title: 'Chernobyl', price: 90, rating: 4.4, stock: 48, description: 'Dark mineral accord with leather and black pepper.' },
  { id: 3, title: 'Blue Sapphire', price: 150, rating: 4.6, stock: 51, description: 'Fresh aquatic citrus with clean musk.' },
  { id: 4, title: 'Velvet Night', price: 120, rating: 4.7, stock: 35, description: 'Rose, vanilla and smooth sandalwood.' },
  { id: 5, title: 'Golden Oud', price: 210, rating: 4.9, stock: 29, description: 'Luxury oud perfume with saffron and resin.' },
  { id: 6, title: 'Royal Cedar', price: 165, rating: 4.8, stock: 61, description: 'Dry cedarwood, incense and pepper wrapped in smooth amber.' },
  { id: 7, title: 'Desert Leather', price: 145, rating: 4.5, stock: 56, description: 'Leather, cardamom and dark woods with a smoky trail.' },
  { id: 8, title: 'Jasmine Veil', price: 132, rating: 4.6, stock: 44, description: 'Soft jasmine petals with vanilla cream and clean musk.' },
  { id: 9, title: 'Midnight Musk', price: 172, rating: 4.8, stock: 53, description: 'Black musk, suede and warm spice for a bold masculine finish.' },
  { id: 10, title: 'Rose Haze', price: 138, rating: 4.3, stock: 38, description: 'Damask rose, powdery iris and creamy sandalwood.' }
];

const localCatalog = [
  { id: 101, title: 'Obsidian Wood', price: 196, rating: 4.8, stock: 46, description: 'Smoked oud, cedarwood and dark resin for a deep masculine trail.', gender: 'men' },
  { id: 102, title: 'Atlas Leather', price: 184, rating: 4.7, stock: 39, description: 'Dry leather with saffron, pepper and warm amber.', gender: 'men' },
  { id: 103, title: 'Urban Vetiver', price: 158, rating: 4.5, stock: 58, description: 'Green vetiver, mineral notes and crisp citrus for everyday wear.', gender: 'men' },
  { id: 104, title: 'Night Barrel', price: 205, rating: 4.9, stock: 34, description: 'Rum accord, roasted wood and vanilla smoke with a luxe finish.', gender: 'men' },
  { id: 105, title: 'Steel Bloom', price: 149, rating: 4.4, stock: 42, description: 'Clean musk and icy florals balanced with metallic woods.', gender: 'men' },
  { id: 106, title: 'Black Harbor', price: 176, rating: 4.6, stock: 37, description: 'Sea salt, black musk and driftwood with a cool evening tone.', gender: 'men' },
  { id: 107, title: 'Amber District', price: 168, rating: 4.7, stock: 63, description: 'Amber spice, patchouli and suede built for the night.', gender: 'men' },
  { id: 108, title: 'Nomad Smoke', price: 189, rating: 4.8, stock: 31, description: 'Incense smoke, charred woods and cardamom in a bold signature blend.', gender: 'men' },
  { id: 109, title: 'Velour Rose', price: 141, rating: 4.4, stock: 55, description: 'Soft rose petals, powder musk and creamy woods.', gender: 'women' },
  { id: 110, title: 'Pearl Blossom', price: 147, rating: 4.5, stock: 47, description: 'White blossom, vanilla cream and airy fruit notes.', gender: 'women' },
  { id: 111, title: 'Luna Silk', price: 162, rating: 4.7, stock: 33, description: 'Iris silk, clean musk and luminous citrus.', gender: 'women' },
  { id: 112, title: 'Crimson Veil', price: 174, rating: 4.8, stock: 29, description: 'Red berries, velvet rose and sandalwood for a rich finish.', gender: 'women' }
];

function classifyGender(product, index) {
  const text = `${product.title} ${product.description || ''}`.toLowerCase();
  const womenHints = ['rose', 'floral', 'vanilla', 'velvet', 'jasmine', 'bloom', 'pink', 'iris', 'petal'];
  const menHints = ['oud', 'wood', 'leather', 'amber', 'spice', 'smoke', 'black', 'cedar', 'musk', 'suede'];

  if (womenHints.some((keyword) => text.includes(keyword))) return 'women';
  if (menHints.some((keyword) => text.includes(keyword))) return 'men';
  return index % 2 === 0 ? 'men' : 'women';
}

function bestSellerScore(product, index) {
  return (Number(product.rating) || 0) * 100 + (Number(product.stock) || 0) + (Number(product.price) || 0) / 10 - index * 0.01;
}

function normalizeProduct(product, index) {
  const normalized = {
    id: Number(product.id),
    title: product.title,
    price: Number(product.price) || 0,
    description: product.description || '',
    thumbnail: product.thumbnail || bottleImages[index % bottleImages.length],
    rating: Number(product.rating) || 0,
    stock: Number(product.stock) || 0
  };

  return {
    ...normalized,
    gender: product.gender || classifyGender(normalized, index),
    bestSellerScore: bestSellerScore(normalized, index)
  };
}

export const seedProducts = [...fallbackProducts, ...localCatalog]
  .map((product, index) => normalizeProduct(product, index))
  .filter((product, index, array) => array.findIndex((candidate) => candidate.id === product.id) === index);
