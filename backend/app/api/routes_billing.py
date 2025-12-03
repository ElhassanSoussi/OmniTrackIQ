import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.config import settings
from app.models.subscription import Subscription
from app.schemas.billing import CheckoutRequest, CheckoutResponse
from app.services import stripe_service

router = APIRouter()


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(
    body: CheckoutRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    origin = request.headers.get("origin") or "http://localhost:3000"
    success_url = f"{origin}/dashboard/billing?status=success"
    cancel_url = f"{origin}/dashboard/billing?status=cancelled"

    session = stripe_service.create_checkout_session(
        account_id=current_user.account_id,
        plan=body.plan,
        success_url=success_url,
        cancel_url=cancel_url,
    )
    return CheckoutResponse(url=session.url)


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        account_id = session["metadata"]["account_id"]
        plan = session["metadata"]["plan"]
        subscription_id = session["subscription"]
        customer_id = session["customer"]

        sub = db.query(Subscription).filter(Subscription.account_id == account_id).first()
        if not sub:
            sub = Subscription(
                account_id=account_id,
                stripe_customer_id=customer_id,
                stripe_subscription_id=subscription_id,
                plan=plan,
                status="active",
            )
            db.add(sub)
        else:
            sub.stripe_customer_id = customer_id
            sub.stripe_subscription_id = subscription_id
            sub.plan = plan
            sub.status = "active"
        db.commit()

    return {"received": True}


@router.get("/me")
def billing_me(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sub = db.query(Subscription).filter(Subscription.account_id == current_user.account_id).first()
    if not sub:
        return {"plan": None, "status": "none"}
    return {
        "plan": sub.plan,
        "status": sub.status,
        "renewal": sub.current_period_end.isoformat() if sub.current_period_end else None,
    }
