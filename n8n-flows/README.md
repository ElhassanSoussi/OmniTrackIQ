# n8n Workflow Files

This directory contains exported n8n workflow JSON files for OmniTrackIQ ETL pipelines.

## Available Workflows

### 1. Facebook Ads Sync (`facebook-ads-sync.json`)
Syncs campaign-level ad spend data from Facebook Ads to the `ad_spend` table.

**Schedule:** Hourly  
**Data synced:**
- Campaign ID & name
- Spend, impressions, clicks
- Conversions (purchases)

**Required credentials:**
- Facebook Ads API (with `ads_read` permission)
- PostgreSQL connection to OmniTrackIQ DB

**Environment variables:**
- `FACEBOOK_AD_ACCOUNT_ID` - Your Facebook Ad Account ID
- `OMNITRACKIQ_ACCOUNT_ID` - Your OmniTrackIQ account UUID

### 2. Shopify Orders Sync (`shopify-orders-sync.json`)
Syncs orders from Shopify to the `orders` table and updates `daily_metrics`.

**Schedule:** Hourly  
**Data synced:**
- Order ID, number, date
- Revenue, subtotal, discounts
- Customer email
- UTM attribution (source, campaign)
- Fulfillment status

**Required credentials:**
- Shopify API (with `read_orders` scope)
- PostgreSQL connection to OmniTrackIQ DB

**Environment variables:**
- `OMNITRACKIQ_ACCOUNT_ID` - Your OmniTrackIQ account UUID

## Setup Instructions

### 1. Import Workflows
1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Select the JSON file for the workflow you want to import
4. Click **Import**

### 2. Configure Credentials
1. Go to **Credentials** in n8n
2. Create the required credentials:
   - **Facebook Ads**: Add your Facebook App ID, Secret, and Access Token
   - **Shopify**: Add your store URL and API credentials
   - **PostgreSQL**: Add your OmniTrackIQ database connection string

### 3. Set Environment Variables
In n8n settings, add the required environment variables:
```
FACEBOOK_AD_ACCOUNT_ID=act_123456789
OMNITRACKIQ_ACCOUNT_ID=your-uuid-here
```

### 4. Activate Workflows
1. Open each workflow
2. Review the nodes and connections
3. Click **Active** toggle to enable the workflow

## Database Schema Requirements

The workflows expect these tables to exist:

### `ad_spend`
```sql
CREATE TABLE ad_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  platform VARCHAR(50) NOT NULL,
  campaign_id VARCHAR(255) NOT NULL,
  campaign_name VARCHAR(500),
  date DATE NOT NULL,
  spend DECIMAL(12, 2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(account_id, platform, campaign_id, date)
);
```

### `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  shopify_order_id VARCHAR(255) NOT NULL,
  order_number VARCHAR(100),
  order_date DATE NOT NULL,
  revenue DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50),
  fulfillment_status VARCHAR(50),
  customer_email VARCHAR(255),
  items_count INTEGER DEFAULT 0,
  source VARCHAR(100),
  platform VARCHAR(50),
  campaign VARCHAR(255),
  discount_codes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(account_id, shopify_order_id)
);
```

## Troubleshooting

### Common Issues

1. **"Facebook API rate limit"**
   - Reduce the sync frequency to every 2-4 hours
   - Use date ranges instead of fetching all data

2. **"Shopify 401 Unauthorized"**
   - Regenerate your Shopify API credentials
   - Ensure the app has `read_orders` scope

3. **"PostgreSQL connection refused"**
   - Check your database URL and credentials
   - Ensure the n8n IP is whitelisted in your database firewall

### Logs
Check n8n execution logs for detailed error messages:
1. Go to **Executions** in n8n
2. Click on a failed execution
3. Review the error details for each node

## Adding New Integrations

To add a new data source (e.g., Google Ads, TikTok):
1. Copy an existing workflow as a template
2. Replace the data source node with the new platform's node
3. Update the transform code to match the new data structure
4. Update the SQL query to match your schema
5. Test with a small data set before enabling hourly sync
