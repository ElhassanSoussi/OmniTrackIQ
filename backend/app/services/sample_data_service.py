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
    """Generate sample order data for the last N days."""
    created_count = 0
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
            
            # Random amount between $30 and $250
            amount = round(random.uniform(30, 250), 2)
            
            # Random UTM attribution
            utm_source = random.choice(UTM_SOURCES) if random.random() > 0.2 else None
            utm_campaign = random.choice(UTM_CAMPAIGNS) if utm_source else None
            
            order = Order(
                account_id=account_id,
                external_order_id=f"DEMO-{uuid.uuid4().hex[:8].upper()}",
                date_time=order_datetime,
                total_amount=amount,
                currency="USD",
                utm_source=utm_source,
                utm_campaign=utm_campaign,
                source_platform="demo",
            )
            db.add(order)
            created_count += 1
    
    db.commit()
    return created_count


def delete_sample_data(db: Session, account_id: str) -> dict:
    """Delete all sample/demo data for an account."""
    # Delete demo ad spend
    ad_spend_deleted = db.query(AdSpend).filter(
        AdSpend.account_id == account_id,
        AdSpend.external_campaign_id.like("DEMO-%"),
    ).delete(synchronize_session=False)
    
    # Delete demo orders
    orders_deleted = db.query(Order).filter(
        Order.account_id == account_id,
        Order.source_platform == "demo",
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {
        "ad_spend_deleted": ad_spend_deleted,
        "orders_deleted": orders_deleted,
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
    
    return {
        "has_sample_data": ad_spend_count > 0 or orders_count > 0,
        "ad_spend_records": ad_spend_count,
        "order_records": orders_count,
    }
