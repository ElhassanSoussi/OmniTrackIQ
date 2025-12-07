"""
Service layer for billing and subscription management.
Wraps Stripe operations and handles subscription state.
"""

from datetime import datetime
from typing import Optional

import stripe
from sqlalchemy.orm import Session

from app.config import settings
from app.models.subscription import Subscription

stripe.api_key = settings.STRIPE_SECRET_KEY

# Plan configuration - map internal names to Stripe price IDs
# Update these with your actual Stripe price IDs
PLANS = {
    "starter": {
        "price_id": settings.STRIPE_STARTER_PRICE_ID if hasattr(settings, 'STRIPE_STARTER_PRICE_ID') else "price_starter_placeholder",
        "name": "Starter",
        "price": 49,
        "features": ["5 integrations", "30-day data retention", "Email support"],
    },
    "pro": {
        "price_id": settings.STRIPE_PRO_PRICE_ID if hasattr(settings, 'STRIPE_PRO_PRICE_ID') else "price_pro_placeholder",
        "name": "Pro",
        "price": 149,
        "features": ["Unlimited integrations", "1-year data retention", "Priority support", "Custom reports"],
    },
    "agency": {
        "price_id": settings.STRIPE_AGENCY_PRICE_ID if hasattr(settings, 'STRIPE_AGENCY_PRICE_ID') else "price_agency_placeholder",
        "name": "Agency",
        "price": 399,
        "features": ["Multi-account", "White-label reports", "Dedicated support", "API access"],
    },
}


def get_plan_info(plan: str) -> Optional[dict]:
    """Get plan details by name."""
    return PLANS.get(plan)


def get_all_plans() -> list[dict]:
    """Get all available plans."""
    return [{"id": k, **v} for k, v in PLANS.items()]


def create_checkout_session(
    account_id: str,
    plan: str,
    success_url: str,
    cancel_url: str,
    customer_email: Optional[str] = None,
) -> stripe.checkout.Session:
    """
    Create a Stripe Checkout session for subscription.
    """
    plan_info = PLANS.get(plan)
    if not plan_info:
        raise ValueError(f"Unknown plan: {plan}")

    session_params = {
        "mode": "subscription",
        "line_items": [{"price": plan_info["price_id"], "quantity": 1}],
        "success_url": success_url,
        "cancel_url": cancel_url,
        "metadata": {"account_id": account_id, "plan": plan},
    }

    if customer_email:
        session_params["customer_email"] = customer_email

    session = stripe.checkout.Session.create(**session_params)
    return session


def create_portal_session(
    customer_id: str,
    return_url: str,
) -> stripe.billing_portal.Session:
    """
    Create a Stripe Customer Portal session for managing subscription.
    """
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
    )
    return session


def get_subscription(
    db: Session,
    account_id: str,
) -> Optional[Subscription]:
    """Get subscription record for an account."""
    return db.query(Subscription).filter(Subscription.account_id == account_id).first()


def get_subscription_status(
    db: Session,
    account_id: str,
) -> dict:
    """
    Get current subscription status for an account.
    Returns plan name, status, and renewal date.
    """
    sub = get_subscription(db, account_id)
    
    if not sub:
        return {
            "plan": None,
            "status": "none",
            "renewal": None,
            "features": [],
        }

    plan_info = PLANS.get(sub.plan, {})
    
    return {
        "plan": sub.plan,
        "plan_name": plan_info.get("name", sub.plan),
        "status": sub.status,
        "renewal": sub.current_period_end.isoformat() if sub.current_period_end else None,
        "features": plan_info.get("features", []),
    }


def update_subscription_from_webhook(
    db: Session,
    account_id: str,
    stripe_customer_id: str,
    stripe_subscription_id: str,
    plan: str,
    status: str,
    current_period_end: Optional[datetime] = None,
) -> Subscription:
    """
    Update or create subscription record from Stripe webhook data.
    """
    sub = db.query(Subscription).filter(Subscription.account_id == account_id).first()

    if not sub:
        sub = Subscription(account_id=account_id)
        db.add(sub)

    sub.stripe_customer_id = stripe_customer_id
    sub.stripe_subscription_id = stripe_subscription_id
    sub.plan = plan
    sub.status = status
    sub.current_period_end = current_period_end
    sub.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(sub)

    return sub


def cancel_subscription(
    db: Session,
    account_id: str,
    at_period_end: bool = True,
) -> bool:
    """
    Cancel a subscription. By default cancels at end of billing period.
    """
    sub = get_subscription(db, account_id)
    
    if not sub or not sub.stripe_subscription_id:
        return False

    try:
        if at_period_end:
            stripe.Subscription.modify(
                sub.stripe_subscription_id,
                cancel_at_period_end=True,
            )
            sub.status = "canceling"
        else:
            stripe.Subscription.delete(sub.stripe_subscription_id)
            sub.status = "canceled"

        db.commit()
        return True

    except stripe.error.StripeError:
        return False


def reactivate_subscription(
    db: Session,
    account_id: str,
) -> bool:
    """
    Reactivate a subscription that was set to cancel at period end.
    """
    sub = get_subscription(db, account_id)
    
    if not sub or not sub.stripe_subscription_id:
        return False

    try:
        stripe.Subscription.modify(
            sub.stripe_subscription_id,
            cancel_at_period_end=False,
        )
        sub.status = "active"
        db.commit()
        return True

    except stripe.error.StripeError:
        return False


def check_feature_access(
    db: Session,
    account_id: str,
    feature: str,
) -> bool:
    """
    Check if an account has access to a specific feature based on their plan.
    """
    sub = get_subscription(db, account_id)
    
    if not sub or sub.status not in ["active", "trialing"]:
        return False

    plan_info = PLANS.get(sub.plan, {})
    features = plan_info.get("features", [])
    
    # Simple feature check - in production you'd have a more sophisticated system
    return feature in features or "Unlimited" in str(features)
