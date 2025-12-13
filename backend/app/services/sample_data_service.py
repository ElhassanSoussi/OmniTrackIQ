"""
Service for generating sample/demo data for new accounts.
"""
import uuid
import random
from datetime import date, timedelta
from typing import List
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.daily_metrics import DailyMetrics, Channel
from app.models.ad_account import AdAccount, AdAccountStatus


# Sample products for demo data
SAMPLE_PRODUCTS = [
    {"id": "PROD-001", "name": "Premium Wireless Earbuds", "sku": "PWE-BLK-001", "price": 79.99, "cost": 25.00},
    {"id": "PROD-002", "name": "Bluetooth Speaker Pro", "sku": "BSP-GRY-001", "price": 149.99, "cost": 45.00},
    {"id": "PROD-003", "name": "Smart Watch Series X", "sku": "SWX-SLV-001", "price": 299.99, "cost": 95.00},
    {"id": "PROD-004", "name": "Noise Canceling Headphones", "sku": "NCH-WHT-001", "price": 199.99, "cost": 55.00},
    {"id": "PROD-005", "name": "Portable Charger 20000mAh", "sku": "PC2-BLK-001", "price": 49.99, "cost": 12.00},
    {"id": "PROD-006", "name": "Wireless Charging Pad", "sku": "WCP-WHT-001", "price": 39.99, "cost": 8.00},
    {"id": "PROD-007", "name": "USB-C Hub 7-in-1", "sku": "UCH-SLV-001", "price": 59.99, "cost": 18.00},
    {"id": "PROD-008", "name": "Ergonomic Mouse", "sku": "ERM-BLK-001", "price": 69.99, "cost": 20.00},
    {"id": "PROD-009", "name": "Mechanical Keyboard", "sku": "MKB-RGB-001", "price": 129.99, "cost": 40.00},
    {"id": "PROD-010", "name": "Webcam 4K Pro", "sku": "WC4-BLK-001", "price": 179.99, "cost": 50.00},
]


SAMPLE_CAMPAIGNS = [
    {"platform": "facebook", "name": "FB - Prospecting - LAL"},
    {"platform": "facebook", "name": "FB - Retargeting - Website Visitors"},
    {"platform": "facebook", "name": "FB - Retargeting - Cart Abandoners"},
    {"platform": "google_ads", "name": "Google - Brand"},
    {"platform": "google_ads", "name": "Google - Shopping - PMAX"},
    {"platform": "google_ads", "name": "Google - Search - Non-Brand"},
    {"platform": "tiktok", "name": "TikTok - Spark Ads"},
    {"platform": "tiktok", "name": "TikTok - Prospecting - Broad"},
]

# Map platform strings to Channel enum
PLATFORM_TO_CHANNEL = {
    "facebook": Channel.FACEBOOK,
    "google_ads": Channel.GOOGLE_ADS,
    "tiktok": Channel.TIKTOK,
    "snapchat": Channel.SNAPCHAT,
    "pinterest": Channel.PINTEREST,
    "linkedin": Channel.LINKEDIN,
    "shopify": Channel.SHOPIFY,
    "email": Channel.EMAIL,
    "organic": Channel.ORGANIC,
    "direct": Channel.DIRECT,
}

UTM_SOURCES = ["facebook", "google", "tiktok", "email", "direct", "organic"]
UTM_CAMPAIGNS = ["prospecting", "retargeting", "brand", "shopping", "spark", "newsletter"]


def generate_sample_ad_spend(
    db: Session,
    account_id: str,
    days: int = 30,
) -> int:
    """Generate sample ad spend data for the last N days."""
    created_count = 0
    today = date.today()
    
    for campaign in SAMPLE_CAMPAIGNS:
        campaign_id = str(uuid.uuid4())[:8]
        
        # Generate daily data for this campaign
        for day_offset in range(days):
            spend_date = today - timedelta(days=day_offset)
            
            # Randomize metrics with some variance
            base_spend = random.uniform(50, 500)
            # Weekend adjustment
            if spend_date.weekday() >= 5:
                base_spend *= 0.7
            
            impressions = int(base_spend * random.uniform(80, 150))
            clicks = int(impressions * random.uniform(0.01, 0.04))  # 1-4% CTR
            conversions = int(clicks * random.uniform(0.02, 0.08))  # 2-8% CVR
            
            ad_spend = AdSpend(
                account_id=account_id,
                platform=campaign["platform"],
                external_campaign_id=f"DEMO-{campaign_id}",
                campaign_name=campaign["name"],
                date=spend_date,
                cost=round(base_spend, 2),
                impressions=impressions,
                clicks=clicks,
                conversions=conversions,
            )
            db.add(ad_spend)
            created_count += 1
    
    db.commit()
    return created_count


def generate_sample_orders(
    db: Session,
    account_id: str,
    days: int = 30,
    orders_per_day: int = 15,
) -> int:
    """Generate sample order data with line items for the last N days."""
    orders_created = 0
    items_created = 0
    today = date.today()
    
    for day_offset in range(days):
        order_date = today - timedelta(days=day_offset)
        
        # Slightly fewer orders on weekends
        daily_orders = orders_per_day
        if order_date.weekday() >= 5:
            daily_orders = int(orders_per_day * 0.7)
        
        for i in range(daily_orders):
            # Randomize order time within the day
            hour = random.randint(8, 22)
            minute = random.randint(0, 59)
            order_datetime = f"{order_date}T{hour:02d}:{minute:02d}:00"
            
            # Random UTM attribution
            utm_source = random.choice(UTM_SOURCES) if random.random() > 0.2 else None
            utm_campaign = random.choice(UTM_CAMPAIGNS) if utm_source else None
            
            # Create order with placeholder amount (will update after items)
            order_id = str(uuid.uuid4())
            order = Order(
                id=order_id,
                account_id=account_id,
                external_order_id=f"DEMO-{uuid.uuid4().hex[:8].upper()}",
                date_time=order_datetime,
                total_amount=0,  # Will be calculated from items
                currency="USD",
                utm_source=utm_source,
                utm_campaign=utm_campaign,
                source_platform="demo",
            )
            db.add(order)
            orders_created += 1
            
            # Generate 1-4 line items per order
            num_items = random.randint(1, 4)
            order_total = 0
            
            for _ in range(num_items):
                product = random.choice(SAMPLE_PRODUCTS)
                quantity = random.randint(1, 3)
                unit_price = product["price"]
                total_price = round(unit_price * quantity, 2)
                order_total += total_price
                
                order_item = OrderItem(
                    order_id=order_id,
                    account_id=account_id,
                    product_id=product["id"],
                    product_name=product["name"],
                    sku=product["sku"],
                    quantity=quantity,
                    unit_price=unit_price,
                    total_price=total_price,
                    cost_per_unit=product["cost"],
                )
                db.add(order_item)
                items_created += 1
            
            # Update order total
            order.total_amount = round(order_total, 2)
    
    db.commit()
    return orders_created


def delete_sample_data(db: Session, account_id: str) -> dict:
    """Delete all sample/demo data for an account."""
    # Delete demo ad spend
    ad_spend_deleted = db.query(AdSpend).filter(
        AdSpend.account_id == account_id,
        AdSpend.external_campaign_id.like("DEMO-%"),
    ).delete(synchronize_session=False)
    
    # Delete demo order items first (FK constraint)
    # Get demo order IDs first
    demo_order_ids = [o.id for o in db.query(Order.id).filter(
        Order.account_id == account_id,
        Order.source_platform == "demo",
    ).all()]
    
    order_items_deleted = 0
    if demo_order_ids:
        order_items_deleted = db.query(OrderItem).filter(
            OrderItem.order_id.in_(demo_order_ids),
        ).delete(synchronize_session=False)
    
    # Delete demo orders
    orders_deleted = db.query(Order).filter(
        Order.account_id == account_id,
        Order.source_platform == "demo",
    ).delete(synchronize_session=False)
    
    # Delete demo daily metrics
    daily_metrics_deleted = db.query(DailyMetrics).filter(
        DailyMetrics.account_id == account_id,
        DailyMetrics.campaign_id.like("DEMO-%"),
    ).delete(synchronize_session=False)
    
    # Delete demo ad accounts
    ad_accounts_deleted = db.query(AdAccount).filter(
        AdAccount.account_id == account_id,
        AdAccount.external_id.like("DEMO-%"),
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {
        "ad_spend_deleted": ad_spend_deleted,
        "orders_deleted": orders_deleted,
        "daily_metrics_deleted": daily_metrics_deleted,
        "ad_accounts_deleted": ad_accounts_deleted,
    }


def has_sample_data(db: Session, account_id: str) -> bool:
    """Check if account already has sample data."""
    return db.query(AdSpend).filter(
        AdSpend.account_id == account_id,
        AdSpend.external_campaign_id.like("DEMO-%"),
    ).first() is not None


def get_sample_data_stats(db: Session, account_id: str) -> dict:
    """Get stats about sample data in the account."""
    ad_spend_count = db.query(AdSpend).filter(
        AdSpend.account_id == account_id,
        AdSpend.external_campaign_id.like("DEMO-%"),
    ).count()
    
    orders_count = db.query(Order).filter(
        Order.account_id == account_id,
        Order.source_platform == "demo",
    ).count()
    
    daily_metrics_count = db.query(DailyMetrics).filter(
        DailyMetrics.account_id == account_id,
        DailyMetrics.campaign_id.like("DEMO-%"),
    ).count()
    
    ad_accounts_count = db.query(AdAccount).filter(
        AdAccount.account_id == account_id,
        AdAccount.external_id.like("DEMO-%"),
    ).count()
    
    return {
        "has_sample_data": ad_spend_count > 0 or orders_count > 0,
        "ad_spend_records": ad_spend_count,
        "order_records": orders_count,
        "daily_metrics_records": daily_metrics_count,
        "ad_accounts_records": ad_accounts_count,
    }


def generate_sample_ad_accounts(
    db: Session,
    account_id: str,
) -> int:
    """Generate sample ad accounts for demo purposes."""
    created_count = 0
    
    sample_ad_accounts = [
        {"platform": "facebook", "name": "Demo FB Ad Account", "external_id": "DEMO-FB-001", "currency": "USD"},
        {"platform": "google_ads", "name": "Demo Google Ads Account", "external_id": "DEMO-GA-001", "currency": "USD"},
        {"platform": "tiktok", "name": "Demo TikTok Account", "external_id": "DEMO-TT-001", "currency": "USD"},
    ]
    
    for acc in sample_ad_accounts:
        ad_account = AdAccount(
            account_id=account_id,
            integration_id=None,  # No real integration for demo
            platform=acc["platform"],
            external_id=acc["external_id"],
            external_name=acc["name"],
            name=acc["name"],
            status=AdAccountStatus.ACTIVE,
            currency=acc["currency"],
        )
        db.add(ad_account)
        created_count += 1
    
    db.commit()
    return created_count


def generate_sample_daily_metrics(
    db: Session,
    account_id: str,
    days: int = 30,
) -> int:
    """
    Generate sample DailyMetrics data for demo purposes.
    Creates metrics at both channel-level and campaign-level granularity.
    """
    created_count = 0
    today = date.today()
    
    # Generate channel-level metrics
    channels = [Channel.FACEBOOK, Channel.GOOGLE_ADS, Channel.TIKTOK]
    
    for channel in channels:
        for day_offset in range(days):
            metric_date = today - timedelta(days=day_offset)
            
            # Randomize metrics with some variance
            base_spend = random.uniform(200, 800)
            # Weekend adjustment
            if metric_date.weekday() >= 5:
                base_spend *= 0.7
            
            impressions = int(base_spend * random.uniform(80, 150))
            clicks = int(impressions * random.uniform(0.01, 0.04))
            conversions = int(clicks * random.uniform(0.02, 0.08))
            orders = int(conversions * random.uniform(0.5, 0.9))
            revenue = orders * random.uniform(50, 150)
            spend = base_spend
            
            roas = revenue / spend if spend > 0 else 0
            profit = revenue - spend
            
            daily_metric = DailyMetrics(
                account_id=account_id,
                date=metric_date,
                channel=channel,
                ad_account_id=None,
                campaign_id=None,
                campaign_name=None,
                total_revenue=round(revenue, 2),
                total_orders=orders,
                total_ad_spend=round(spend, 2),
                total_impressions=impressions,
                total_clicks=clicks,
                total_conversions=conversions,
                roas=round(roas, 2),
                profit=round(profit, 2),
            )
            db.add(daily_metric)
            created_count += 1
    
    # Generate campaign-level metrics
    for campaign in SAMPLE_CAMPAIGNS:
        campaign_id = f"DEMO-{uuid.uuid4().hex[:8].upper()}"
        channel = PLATFORM_TO_CHANNEL.get(campaign["platform"], Channel.OTHER)
        
        for day_offset in range(days):
            metric_date = today - timedelta(days=day_offset)
            
            # Randomize metrics
            base_spend = random.uniform(30, 150)
            if metric_date.weekday() >= 5:
                base_spend *= 0.7
            
            impressions = int(base_spend * random.uniform(60, 120))
            clicks = int(impressions * random.uniform(0.01, 0.05))
            conversions = int(clicks * random.uniform(0.02, 0.10))
            orders = int(conversions * random.uniform(0.4, 0.8))
            revenue = orders * random.uniform(40, 120)
            spend = base_spend
            
            roas = revenue / spend if spend > 0 else 0
            profit = revenue - spend
            
            daily_metric = DailyMetrics(
                account_id=account_id,
                date=metric_date,
                channel=channel,
                ad_account_id=None,
                campaign_id=campaign_id,
                campaign_name=campaign["name"],
                total_revenue=round(revenue, 2),
                total_orders=orders,
                total_ad_spend=round(spend, 2),
                total_impressions=impressions,
                total_clicks=clicks,
                total_conversions=conversions,
                roas=round(roas, 2),
                profit=round(profit, 2),
            )
            db.add(daily_metric)
            created_count += 1
    
    db.commit()
    return created_count
