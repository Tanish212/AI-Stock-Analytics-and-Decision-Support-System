import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from models import User, Watchlist
from schemas import RegisterRequest, LoginRequest, WatchlistAddRequest
from security import (
    hash_password,
    verify_password,
    create_access_token
)
from datetime import datetime
from fastapi.security import HTTPAuthorizationCredentials
from security import decode_access_token, bearer_scheme
from fastapi.middleware.cors import CORSMiddleware
from news_service import get_latest_news

from ml.src.gru_predictor import (
    get_all_stocks_metadata,
    predict_next_close,
    get_stock_analysis,
    get_stock_comparison
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Stock Analytics API",
    description="Backend API for the AI Stock Analytics & Decision Support System",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Stock Analytics API is running"
    }


@app.get("/api/stocks")
def get_stocks():
    """Returns list of all 103 supported stocks metadata."""
    return get_all_stocks_metadata()


@app.get("/api/stocks/compare")
def get_comparison(stock1: str, stock2: str):
    """
    Endpoint comparing two stocks using actual trained GRU models,
    performance metrics from gru_all_103_results.csv, and relative historical performance.
    """
    if not stock1 or not stock2:
        raise HTTPException(
            status_code=400,
            detail="Both stock1 and stock2 parameters are required."
        )
    try:
        return get_stock_comparison(stock1, stock2)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Comparison calculation error: {str(e)}"
        )


@app.get("/api/stocks/{stock}/prediction")
def get_prediction(stock: str):
    """Returns GRU prediction for requested stock."""
    try:
        result = predict_next_close(stock)
        return {
            "success": True,
            "data": result
        }
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )


@app.get("/api/stocks/{stock}/analysis")
def get_analysis(stock: str):
    """Unified endpoint returning stock metadata, prediction, model performance metrics, and chart data."""
    try:
        return get_stock_analysis(stock)
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis calculation error: {str(e)}"
        )


@app.post("/api/auth/register")
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
    username=user_data.username,
    email=user_data.email,
    password_hash=hash_password(user_data.password),
    created_at=datetime.utcnow()
)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }

@app.post("/api/auth/login")
def login(
    user_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        user_id=user.id,
        email=user.email
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }

@app.get("/api/auth/me")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    payload = decode_access_token(credentials)

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email
    }

@app.get("/api/news")
def get_news(
    page_no: int = 1,
    size: int = 20
):
    try:
        news = get_latest_news(
            page_no=page_no,
            size=size
        )

        return news

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch market news: {str(e)}"
        )


@app.get("/api/watchlist")
def get_user_watchlist(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    """Returns list of watchlisted stocks for authenticated user."""
    payload = decode_access_token(credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    items = db.query(Watchlist).filter(Watchlist.user_id == int(user_id)).all()
    return {
        "success": True,
        "watchlist": [
            {
                "id": item.id,
                "symbol": item.symbol,
                "created_at": str(item.created_at) if item.created_at else None
            }
            for item in items
        ]
    }


@app.post("/api/watchlist")
def add_to_watchlist(
    data: WatchlistAddRequest,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    """Adds stock symbol to user's watchlist."""
    payload = decode_access_token(credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    symbol = data.symbol.upper().replace(".NS", "")
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == int(user_id),
        Watchlist.symbol == symbol
    ).first()

    if not existing:
        item = Watchlist(
            user_id=int(user_id),
            symbol=symbol,
            created_at=datetime.utcnow()
        )
        db.add(item)
        db.commit()
        db.refresh(item)

    return {
        "success": True,
        "message": f"{symbol} added to watchlist",
        "symbol": symbol
    }


@app.delete("/api/watchlist/{symbol}")
def remove_from_watchlist(
    symbol: str,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    """Removes stock symbol from user's watchlist."""
    payload = decode_access_token(credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    symbol = symbol.upper().replace(".NS", "")
    db.query(Watchlist).filter(
        Watchlist.user_id == int(user_id),
        Watchlist.symbol == symbol
    ).delete(synchronize_session=False)
    db.commit()

    return {
        "success": True,
        "message": f"{symbol} removed from watchlist",
        "symbol": symbol
    }