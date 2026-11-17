import { productService } from '../services/productService';

/** Adds the items of a past order back to the cart (only products still available). */
export const reorderItems = async (order, addItem) => {
  let added = 0;
  const skipped = [];
  for (const item of order.items) {
    try {
      const product = await productService.getById(item.productId);
      const inStock = product.type !== 'ready-made' || (product.stock ?? 0) > 0;
      if (product.status !== 'published' || !product.available || !inStock) throw new Error();
      // Keep only options that still exist on the product
      const options = Object.fromEntries(
        Object.entries(item.options || {}).filter(([name, value]) => product.options?.some((o) => o.name === name && o.values.some((v) => v.label === value)))
      );
      addItem(product, { options, personalisation: item.personalisation || {}, quantity: item.quantity });
      added += 1;
    } catch {
      skipped.push(item.name);
    }
  }
  return { added, skipped };
};
