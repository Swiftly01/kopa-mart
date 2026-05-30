
export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="text-xs font-medium text-rose-600">Out of stock</span>
    );
  if (stock <= 5)
    return (
      <span className="text-xs font-medium text-amber-600">{stock} left</span>
    );
  return (
    <span className="text-xs text-muted-foreground">{stock} in stock</span>
  );
}
