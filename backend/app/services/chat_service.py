"""
Chat service for the "Ask Your Data" chatbot feature.

Handles:
- Metrics-related questions (revenue, ROAS, spend, etc.)
- Support FAQs
- Feature help and guidance
"""
import re
import uuid
from datetime import date, timedelta
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session

from app.services.metrics_service import get_summary


# FAQ knowledge base
FAQS: Dict[str, Dict[str, str]] = {
    # Billing & Plans
    "pricing": {
        "q": "What are your pricing plans?",
        "a": "We offer three plans:\n\n• **Starter ($49/mo)**: For growing Shopify brands. Includes 2 seats, 4 integrations, and 30-day data retention.\n\n• **Pro ($149/mo)**: For scaling brands & performance marketers. Includes 10 seats, unlimited integrations, cohort analysis, and AI chatbot.\n\n• **Advanced ($399/mo)**: For agencies & multi-brand operators. Includes unlimited seats, white-label options, and priority support.\n\nAll plans include a 14-day free trial."
    },
    "free_trial": {
        "q": "Do you offer a free trial?",
        "a": "Yes! All plans include a **14-day free trial** with full access to features. No credit card required to start."
    },
    "cancel": {
        "q": "How do I cancel my subscription?",
        "a": "You can cancel anytime from **Settings > Billing**. Your access continues until the end of your billing period. We don't offer refunds for partial months, but you won't be charged again after cancellation."
    },
    
    # Integrations
    "integrations": {
        "q": "What platforms do you integrate with?",
        "a": "We integrate with:\n\n• **E-commerce**: Shopify\n• **Ad Platforms**: Facebook/Meta Ads, Google Ads, TikTok Ads\n• **Analytics**: Google Analytics 4 (GA4)\n\nMore integrations coming soon including Pinterest, Snapchat, and Amazon Ads."
    },
    "connect_shopify": {
        "q": "How do I connect Shopify?",
        "a": "Go to **Integrations** in the sidebar, find Shopify, and click **Connect**. You'll be redirected to authorize OmniTrackIQ in your Shopify admin. Once authorized, we'll start syncing your orders automatically."
    },
    "connect_facebook": {
        "q": "How do I connect Facebook Ads?",
        "a": "Go to **Integrations** > **Facebook Ads** > **Connect**. You'll log in to Facebook and grant us read access to your ad accounts. Select which ad accounts to sync, and we'll import your campaign data."
    },
    
    # Features
    "roas": {
        "q": "What is ROAS?",
        "a": "**ROAS (Return on Ad Spend)** measures how much revenue you earn for every dollar spent on ads.\n\n**Formula**: Revenue ÷ Ad Spend\n\n**Example**: If you spent $1,000 on ads and made $4,000 in revenue, your ROAS is 4.0x (or 400%).\n\nA ROAS above 1.0 means you're making more than you spend. Most e-commerce brands target 3-5x ROAS."
    },
    "attribution": {
        "q": "What attribution models do you support?",
        "a": "We support **5 attribution models**:\n\n• **First Touch**: Credit goes to the first ad the customer saw\n• **Last Touch**: Credit goes to the last ad before purchase\n• **Linear**: Credit split equally across all touchpoints\n• **Time Decay**: More credit to recent touchpoints\n• **Position Based**: 40% first, 40% last, 20% middle\n\nYou can compare models in the Attribution section."
    },
    "cohort": {
        "q": "What is cohort analysis?",
        "a": "**Cohort analysis** groups customers by when they first purchased, then tracks their behavior over time.\n\nThis helps you understand:\n• How often customers return\n• Customer lifetime value (LTV)\n• Which acquisition channels bring loyal customers\n\nAvailable on Pro and Advanced plans."
    },
    
    # Support
    "support": {
        "q": "How do I contact support?",
        "a": "You can reach us at:\n\n• **Email**: support@omnitrackiq.com\n• **In-app chat**: Click the chat icon in the bottom right\n• **Help Center**: docs.omnitrackiq.com\n\nPro and Advanced customers get priority support with faster response times."
    },
    "data_sync": {
        "q": "How often does data sync?",
        "a": "Data syncs automatically:\n\n• **Orders**: Every 15 minutes\n• **Ad spend**: Every hour\n• **Full sync**: Daily at midnight UTC\n\nYou can trigger a manual sync from Integrations > [Platform] > Sync Now."
    },
}

# Keyword mappings for FAQ matching
FAQ_KEYWORDS: Dict[str, List[str]] = {
    "pricing": ["price", "pricing", "cost", "how much", "plans", "subscription", "tier"],
    "free_trial": ["free trial", "trial", "try", "test", "demo"],
    "cancel": ["cancel", "cancellation", "stop subscription", "end subscription", "unsubscribe"],
    "integrations": ["integrations", "connect", "platforms", "sync", "link"],
    "connect_shopify": ["shopify", "connect shopify", "link shopify"],
    "connect_facebook": ["facebook", "meta ads", "fb ads", "connect facebook"],
    "roas": ["roas", "return on ad spend", "ad return"],
    "attribution": ["attribution", "attribution model", "first touch", "last touch", "credit"],
    "cohort": ["cohort", "retention", "ltv", "lifetime value", "repeat customers"],
    "support": ["support", "help", "contact", "email", "reach"],
    "data_sync": ["sync", "data sync", "update", "refresh", "how often"],
}

# Metric question patterns
METRIC_PATTERNS = [
    (r"(what|how much|show me|tell me).*(revenue|sales|income)", "revenue"),
    (r"(what|how much|show me|tell me).*(spend|spending|ad spend|cost)", "spend"),
    (r"(what|how much|show me|tell me).*(roas|return on ad)", "roas"),
    (r"(what|how much|show me|tell me).*(orders|purchases|transactions)", "orders"),
    (r"(what|how much|show me|tell me).*(aov|average order)", "aov"),
    (r"(what|how much|show me|tell me).*(cpa|cost per acquisition|cost per order)", "cpa"),
    (r"(how|what).*(performing|performance|doing)", "summary"),
    (r"(give me|show me).*(summary|overview|dashboard)", "summary"),
    (r"(today|yesterday|this week|last week|this month)", "summary"),
]


def find_faq_match(message: str) -> Optional[Dict[str, str]]:
    """Find a matching FAQ based on keywords in the message."""
    message_lower = message.lower()
    
    best_match = None
    best_score = 0
    
    for faq_key, keywords in FAQ_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in message_lower)
        if score > best_score:
            best_score = score
            best_match = faq_key
    
    if best_match and best_score > 0:
        return FAQS.get(best_match)
    
    return None


def detect_metric_query(message: str) -> Optional[str]:
    """Detect if the message is asking about metrics."""
    message_lower = message.lower()
    
    for pattern, metric_type in METRIC_PATTERNS:
        if re.search(pattern, message_lower):
            return metric_type
    
    return None


def parse_date_range(message: str) -> Tuple[date, date]:
    """Parse date range from message, default to last 7 days."""
    message_lower = message.lower()
    today = date.today()
    
    if "today" in message_lower:
        return today, today
    elif "yesterday" in message_lower:
        yesterday = today - timedelta(days=1)
        return yesterday, yesterday
    elif "this week" in message_lower:
        start = today - timedelta(days=today.weekday())
        return start, today
    elif "last week" in message_lower:
        end = today - timedelta(days=today.weekday() + 1)
        start = end - timedelta(days=6)
        return start, end
    elif "this month" in message_lower:
        start = today.replace(day=1)
        return start, today
    elif "last month" in message_lower:
        first_of_month = today.replace(day=1)
        end = first_of_month - timedelta(days=1)
        start = end.replace(day=1)
        return start, end
    elif "last 30 days" in message_lower:
        return today - timedelta(days=30), today
    else:
        # Default to last 7 days
        return today - timedelta(days=7), today


def format_currency(value: float) -> str:
    """Format a number as currency."""
    if value >= 1_000_000:
        return f"${value/1_000_000:.2f}M"
    elif value >= 1_000:
        return f"${value/1_000:.1f}K"
    else:
        return f"${value:.2f}"


def format_number(value: float) -> str:
    """Format a number with commas."""
    if value >= 1_000_000:
        return f"{value/1_000_000:.2f}M"
    elif value >= 1_000:
        return f"{value/1_000:.1f}K"
    else:
        return f"{value:,.0f}"


def generate_metrics_response(
    db: Session,
    account_id: int,
    metric_type: str,
    from_date: date,
    to_date: date,
) -> Dict[str, Any]:
    """Generate a response about metrics."""
    
    # Get actual metrics from database
    try:
        summary = get_summary(db, account_id, from_date, to_date)
    except Exception:
        return {
            "message": "I couldn't fetch your metrics right now. Please try again or check the dashboard directly.",
            "response_type": "general",
            "metrics": None,
            "suggestions": ["Show me my dashboard", "What integrations do you support?"],
        }
    
    date_range_text = f"from {from_date.strftime('%b %d')} to {to_date.strftime('%b %d, %Y')}"
    
    metrics_list = []
    
    if metric_type == "revenue":
        revenue = summary.total_revenue
        message = f"📊 Your total revenue {date_range_text} is **{format_currency(revenue)}**."
        metrics_list.append({
            "name": "Total Revenue",
            "value": format_currency(revenue),
            "change": f"{summary.revenue_change:+.1f}%" if hasattr(summary, 'revenue_change') else None,
            "change_direction": "up" if getattr(summary, 'revenue_change', 0) > 0 else "down",
        })
        
    elif metric_type == "spend":
        spend = summary.total_spend
        message = f"💰 Your total ad spend {date_range_text} is **{format_currency(spend)}**."
        metrics_list.append({
            "name": "Total Ad Spend",
            "value": format_currency(spend),
            "change": f"{summary.spend_change:+.1f}%" if hasattr(summary, 'spend_change') else None,
            "change_direction": "up" if getattr(summary, 'spend_change', 0) > 0 else "down",
        })
        
    elif metric_type == "roas":
        roas = summary.roas
        message = f"📈 Your ROAS {date_range_text} is **{roas:.2f}x**."
        if roas >= 3:
            message += " Great performance! 🎉"
        elif roas >= 2:
            message += " Solid results."
        elif roas >= 1:
            message += " You're breaking even - there's room for improvement."
        else:
            message += " ⚠️ You're spending more than you're making. Consider optimizing your campaigns."
        metrics_list.append({
            "name": "ROAS",
            "value": f"{roas:.2f}x",
            "change": f"{summary.roas_change:+.1f}%" if hasattr(summary, 'roas_change') else None,
            "change_direction": "up" if getattr(summary, 'roas_change', 0) > 0 else "down",
        })
        
    elif metric_type == "orders":
        orders = summary.total_orders
        message = f"🛒 You had **{format_number(orders)} orders** {date_range_text}."
        metrics_list.append({
            "name": "Total Orders",
            "value": format_number(orders),
            "change": f"{summary.orders_change:+.1f}%" if hasattr(summary, 'orders_change') else None,
            "change_direction": "up" if getattr(summary, 'orders_change', 0) > 0 else "down",
        })
        
    elif metric_type == "aov":
        aov = summary.total_revenue / summary.total_orders if summary.total_orders > 0 else 0
        message = f"🛍️ Your average order value {date_range_text} is **{format_currency(aov)}**."
        metrics_list.append({
            "name": "Average Order Value",
            "value": format_currency(aov),
        })
        
    elif metric_type == "cpa":
        cpa = summary.total_spend / summary.total_orders if summary.total_orders > 0 else 0
        message = f"💵 Your cost per acquisition {date_range_text} is **{format_currency(cpa)}**."
        metrics_list.append({
            "name": "Cost Per Acquisition",
            "value": format_currency(cpa),
        })
        
    else:  # summary
        message = f"📊 **Performance Summary** {date_range_text}:\n\n"
        message += f"• **Revenue**: {format_currency(summary.total_revenue)}\n"
        message += f"• **Ad Spend**: {format_currency(summary.total_spend)}\n"
        message += f"• **ROAS**: {summary.roas:.2f}x\n"
        message += f"• **Orders**: {format_number(summary.total_orders)}"
        
        metrics_list = [
            {"name": "Revenue", "value": format_currency(summary.total_revenue)},
            {"name": "Ad Spend", "value": format_currency(summary.total_spend)},
            {"name": "ROAS", "value": f"{summary.roas:.2f}x"},
            {"name": "Orders", "value": format_number(summary.total_orders)},
        ]
    
    return {
        "message": message,
        "response_type": "metrics",
        "metrics": metrics_list,
        "suggestions": [
            "What's my ROAS this month?",
            "Show me revenue by channel",
            "How is my Facebook Ads performing?",
        ],
    }


def process_chat_message(
    db: Session,
    account_id: int,
    message: str,
    conversation_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Process a chat message and generate a response.
    
    Returns a dictionary with:
    - message: The response text
    - conversation_id: ID for follow-up context
    - response_type: metrics, faq, help, or general
    - metrics: Optional list of metric values
    - suggestions: Optional list of follow-up questions
    """
    
    # Generate conversation ID if not provided
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
    
    # Check for greetings
    greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
    if message.lower().strip() in greetings:
        return {
            "message": "Hello! 👋 I'm your analytics assistant. I can help you with:\n\n• **Metrics questions**: \"What's my revenue this week?\"\n• **Platform help**: \"How do I connect Shopify?\"\n• **Feature explanations**: \"What is ROAS?\"\n\nWhat would you like to know?",
            "conversation_id": conversation_id,
            "response_type": "help",
            "metrics": None,
            "suggestions": [
                "What's my ROAS today?",
                "How do I connect Facebook Ads?",
                "What attribution models do you support?",
            ],
        }
    
    # Check for metrics questions
    metric_type = detect_metric_query(message)
    if metric_type:
        from_date, to_date = parse_date_range(message)
        result = generate_metrics_response(db, account_id, metric_type, from_date, to_date)
        result["conversation_id"] = conversation_id
        return result
    
    # Check for FAQ matches
    faq_match = find_faq_match(message)
    if faq_match:
        return {
            "message": faq_match["a"],
            "conversation_id": conversation_id,
            "response_type": "faq",
            "metrics": None,
            "suggestions": [
                "What's my revenue this week?",
                "How do I connect Shopify?",
                "What is cohort analysis?",
            ],
        }
    
    # Default response
    return {
        "message": "I'm not sure I understand that question. I can help you with:\n\n• **Metrics**: \"What's my revenue?\" or \"Show me my ROAS\"\n• **Integrations**: \"How do I connect Shopify?\"\n• **Features**: \"What is attribution?\" or \"What is cohort analysis?\"\n• **Billing**: \"What are your pricing plans?\"\n\nTry asking one of these questions!",
        "conversation_id": conversation_id,
        "response_type": "help",
        "metrics": None,
        "suggestions": [
            "Show me a performance summary",
            "What's my ROAS this week?",
            "How do I connect Facebook Ads?",
        ],
    }
