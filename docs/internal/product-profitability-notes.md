# Per-Product Profitability Implementation Notes

**Phase**: 3 (Feature Implementation)  
**Date**: December 12, 2025

## Overview

Per-product profitability is now a fully implemented feature available to Pro and Enterprise plan users. It calculates profitability at the individual product level.

## Data Model

### New Table: `order_items`

```sql
CREATE TABLE order_items (
  id VARCHAR PRIMARY KEY,
  order_id VARCHAR REFERENCES orders(id),
  account_id VARCHAR REFERENCES accounts(id),
  product_id VARCHAR NOT NULL,
  product_name VARCHAR NOT NULL,
  sku VARCHAR,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(18,4),
  total_price NUMERIC(18,4),
  cost_per_unit NUMERIC(18,4),  -- COGS, nullable
  created_at TIMESTAMPTZ
);
```

## Profitability Calculation

For each product, we calculate:

| Metric | Formula |
|--------|---------|
| Revenue | SUM(order_items.total_price) per product |
| Units Sold | SUM(order_items.quantity) per product |
| COGS | SUM(cost_per_unit * quantity) per product |
| Ad Spend | Total ad spend × (product revenue / total revenue) |
| Gross Profit | Revenue - COGS - Allocated Ad Spend |
| Margin % | (Gross Profit / Revenue) × 100 |

### Ad Spend Allocation

Ad spend is allocated **proportionally by revenue share**. This is a simplification since the current data model lacks product-level ad tracking.

**Example**: If Product A has $10,000 revenue out of $50,000 total, it gets 20% of the ad spend allocated.

**Limitation**: This doesn't reflect actual product-level ad targeting.

## API Endpoint

```
GET /products
Authorization: Bearer <token>
Params: from, to, limit, sort_by, sort_order
Required Plan: Pro or Enterprise
```

403 response for Starter users:

```json
{
  "error": "plan_required",
  "message": "Per-product profitability is available on Pro and Enterprise plans.",
  "current_plan": "starter",
  "upgrade_url": "/pricing"
}
```

## Demo Data

10 sample products are generated with sample data:

- Premium Wireless Earbuds ($79.99, cost $25)
- Bluetooth Speaker Pro ($149.99, cost $45)
- Smart Watch Series X ($299.99, cost $95)
- etc.

Each order generates 1-4 line items with random products.

## Known Limitations

1. **COGS Data**: Requires manual entry or Shopify sync (not yet implemented)
2. **Ad Spend Attribution**: Proportional by revenue, not product-level targeting
3. **Variant Tracking**: SKU field exists but not surfaced in UI
4. **Time Bucketing**: No daily/weekly breakdown, just totals in range

## Future Improvements

- [ ] Product variant breakdown
- [ ] COGS import from CSV or Shopify
- [ ] Product-level ad attribution via UTM params
- [ ] Trend charts per product
- [ ] Export to CSV
