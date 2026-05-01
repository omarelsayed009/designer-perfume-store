function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function serializeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: toDateInput(user.birthDate),
    gender: user.gender || '',
    phone: user.phone || '',
    name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  };
}

export function serializeProduct(product) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    description: product.description,
    thumbnail: product.thumbnail,
    rating: product.rating,
    stock: product.stock,
    gender: product.gender,
    bestSellerScore: product.bestSellerScore
  };
}

export function serializeFavorite(favorite) {
  return serializeProduct(favorite.product);
}

export function serializeOrder(order) {
  return {
    id: order.id,
    reference: order.reference,
    createdAt: order.createdAt,
    total: order.total,
    status: order.status,
    payment: {
      method: order.paymentMethod,
      label: order.paymentLabel,
      detail: order.paymentDetail || ''
    },
    customer: {
      fullName: order.customerName,
      email: order.email,
      phone: order.phone,
      whatsapp: order.whatsapp,
      city: order.city,
      address: order.address,
      notes: order.notes || ''
    },
    items: order.items.map((item) => ({
      id: item.productId,
      title: item.titleSnapshot,
      description: item.descriptionSnapshot,
      thumbnail: item.thumbnailSnapshot,
      gender: item.genderSnapshot,
      rating: item.ratingSnapshot,
      stock: item.stockSnapshot,
      price: item.price,
      qty: item.qty
    }))
  };
}
