import os
from datetime import datetime

import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.account import Account, AccountPlan
from app.models.subscription import Subscription
from app.routers.deps import get_current_account_user, get_db
from app.schemas.billing import CheckoutRequest, CheckoutResponse, PortalResponse, BillingInfoResponse, PlansResponse
from app.services import billing_service

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

router = APIRouter()


# Plan limits mapping
PLAN_USER_LIMITS = {
    "free": 1,
    "starter": 3,
    "pro": 10,
    "agency": -1,  # Unlimited
}


@router.get("/plans", response_model=PlansResponse)
def get_plans():
    """Get all available pricing plans."""
    plans = billing_service.get_all_plans()
    return PlansResponse(plans=plans)


@router.get("/me", response_model=BillingInfoResponse)
def billing_me(db: Session = Depends(get_db), current_user=Depends(get_current_account_user)):
    """Get current billing/subscription status."""
    sub = db.query(Subscription).filter(Subscription.account_id == current_user.account_id).first()
    account = db.query(Account).filter(Account.id == current_user.account_id).first()
    
    if not sub:
        return BillingInfoResponse(
            plan=account.plan.value if account else "free",
            plan_name="Free",
            status="none",
            renewal=None,
            features=["1 team member", "2 integrations", "30-day data retention"],
            can_upgrade=True,
            can_cancel=False,
        )
    
    plan_info = billing_service.get_plan_info(sub.plan) or {}
    
    return BillingInfoResponse(
        plan=sub.plan,
        plan_name=plan_info.get("name", sub.plan.capitalize()),
        status=sub.status,
        renewal=sub.current_period_end.isoformat() if sub.current_period_end else None,
        features=plan_info.get("features", []),
        can_upgrade=sub.plan != "agency",
        can_cancel=sub.status in ["active", "trialing"],
    )


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(
    body: CheckoutRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_account_user),
):
    origin = request.headers.get("origin") or settings.FRONTEND_URL
    success_url = f"{origin}/billing?status=success"
    cancel_url = f"{origin}/billing?status=cancelled"

    try:
        session = billing_service.create_checkout_session(
            account_id=current_user.account_id,
            plan=body.plan,
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=current_user.email,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except stripe.error.StripeError:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Billing provider error")

    return CheckoutResponse(url=session.url)


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata") or {}
        account_id = metadata.get("account_id")
        plan = metadata.get("plan")
        subscription_id = session.get("subscription")
        customer_id = session.get("customer")

        if not all([account_id, plan, subscription_id, customer_id]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing subscription metadata")

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
        
        # Update account plan and limits
        account = db.query(Account).filter(Account.id == account_id).first()
        if account:
            account.plan = AccountPlan(plan) if plan in [p.value for p in AccountPlan] else AccountPlan.FREE
            account.max_users = PLAN_USER_LIMITS.get(plan, 1)
            account.stripe_customer_id = customer_id
            account.stripe_subscription_id = subscription_id
        
        db.commit()

    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")
        status = subscription.get("status")
        current_period_end = subscription.get("current_period_end")
        
        sub = db.query(Subscription).filter(Subscription.stripe_customer_id == customer_id).first()
        if sub:
            sub.status = status
            if current_period_end:
                sub.current_period_end = datetime.fromtimestamp(current_period_end)
            db.commit()

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")
        
        sub = db.query(Subscription).filter(Subscription.stripe_customer_id == customer_id).first()
        if sub:
            sub.status = "canceled"
            # Reset account to free plan
            account = db.query(Account).filter(Account.id == sub.account_id).first()
            if account:
                account.plan = AccountPlan.FREE
                account.max_users = 1
            db.commit()

    return {"received": True}


@router.post("/portal", response_model=PortalResponse)
def create_portal_session(
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_account_user),
):
    """Create a Stripe Customer Portal session for managing subscription."""
    sub = db.query(Subscription).filter(Subscription.account_id == current_user.account_id).first()
    
    if not sub or not sub.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription found. Please subscribe to a plan first."
        )
    
    origin = request.headers.get("origin") or settings.FRONTEND_URL
    return_url = f"{origin}/billing"
    
    try:
        session = billing_service.create_portal_session(
            customer_id=sub.stripe_customer_id,
            return_url=return_url,
        )
        return PortalResponse(url=session.url)
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to create billing portal session"
        )


@router.post("/cancel")
def cancel_subscription(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_account_user),
):
    """Cancel the current subscription at the end of the billing period."""
    success = billing_service.cancel_subscription(db, current_user.account_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to cancel subscription. No active subscription found."
        )
    
    return {"message": "Subscription will be canceled at the end of the billing period"}


@router.post("/reactivate")
def reactivate_subscription(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_account_user),
):
    """Reactivate a subscription that was set to cancel."""
    success = billing_service.reactivate_subscription(db, current_user.account_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to reactivate subscription"
        )
    
    return {"message": "Subscription reactivated successfully"}
