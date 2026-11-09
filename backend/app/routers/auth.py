from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_current_user
from app.models.user import User, Customer, Worker
from app.models.payment import Notification
from app.schemas.auth import (
    CustomerRegisterRequest,
    LoginRequest,
    TokenResponse,
    UserProfileResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_customer(payload: CustomerRegisterRequest, db: Session = Depends(get_db)):
    # Check if user with this email already exists
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )
    
    # Create User account with role 'customer'
    new_user = User(
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
        role="customer",
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    # Create Customer Profile
    customer_profile = Customer(
        user_id=new_user.id,
        full_name=payload.full_name,
        phone=payload.phone,
        address=payload.address,
        city=payload.city,
        pincode=payload.pincode,
    )
    db.add(customer_profile)
    
    # Create welcome notification
    welcome_notif = Notification(
        user_id=new_user.id,
        title="Welcome to Solar Field Desk!",
        message=f"Hello {payload.full_name}, your account is active. You can now request solar installation or maintenance.",
    )
    db.add(welcome_notif)
    db.commit()

    token = create_access_token({"sub": str(new_user.id), "role": "customer"})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role="customer",
        user_id=new_user.id,
        name=payload.full_name,
        email=new_user.email,
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact support.",
        )

    # Determine user display name
    name = user.email.split("@")[0].title()
    if user.role == "customer" and user.customer_profile:
        name = user.customer_profile.full_name
    elif user.role == "worker" and user.worker_profile:
        name = user.worker_profile.full_name
    elif user.role == "admin":
        name = "Administrator"

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        name=name,
        email=user.email,
    )

@router.get("/me", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    name = current_user.email
    phone, address, city, pincode = None, None, None, None
    worker_code, skills, is_available = None, None, None

    if current_user.role == "customer" and current_user.customer_profile:
        c = current_user.customer_profile
        name = c.full_name
        phone = c.phone
        address = c.address
        city = c.city
        pincode = c.pincode
    elif current_user.role == "worker" and current_user.worker_profile:
        w = current_user.worker_profile
        name = w.full_name
        phone = w.phone
        worker_code = w.worker_code
        skills = w.skills
        is_available = w.is_available
    elif current_user.role == "admin":
        name = "System Admin"

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        name=name,
        phone=phone,
        address=address,
        city=city,
        pincode=pincode,
        worker_code=worker_code,
        skills=skills,
        is_available=is_available,
    )

@router.get("/notifications")
def get_user_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "link": n.link,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifs
    ]

