from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User, Organization, UserRole
from app.middleware.auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    org_name: Optional[str] = "My Organization"


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    org_id: str
    org_name: str
    avatar_url: Optional[str] = None


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create organization
    import uuid
    org = Organization(
        id=str(uuid.uuid4()),
        name=req.org_name,
        slug=req.org_name.lower().replace(" ", "-"),
    )
    db.add(org)

    # Create user
    user = User(
        id=str(uuid.uuid4()),
        org_id=org.id,
        email=req.email,
        password_hash=hash_password(req.password),
        name=req.name,
        role=UserRole.ADMIN,
    )
    db.add(user)
    await db.commit()

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role.value, "org_id": org.id, "org_name": org.name},
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()

    # Get org name
    org_result = await db.execute(select(Organization).where(Organization.id == user.org_id))
    org = org_result.scalar_one()

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role.value, "org_id": org.id, "org_name": org.name},
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    org_result = await db.execute(select(Organization).where(Organization.id == current_user.org_id))
    org = org_result.scalar_one()

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role.value,
        org_id=current_user.org_id,
        org_name=org.name,
        avatar_url=current_user.avatar_url,
    )
