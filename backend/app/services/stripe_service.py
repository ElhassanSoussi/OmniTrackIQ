import stripe

from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

PLANS = {
    "starter": "price_starter_placeholder",
    "pro": "price_pro_placeholder",
    "agency": "price_agency_placeholder",
}


def create_checkout_session(account_id: str, plan: str, success_url: str, cancel_url: str):
    price_id = PLANS.get(plan)
    if not price_id:
        raise ValueError("Unsupported plan")

    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"account_id": account_id, "plan": plan},
    )
    return session
