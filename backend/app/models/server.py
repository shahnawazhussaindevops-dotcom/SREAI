import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime
from app.database import Base

class Server(Base):
    __tablename__ = "servers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    ip_address = Column(String(255), nullable=False)
    connection_type = Column(String(50), nullable=False)  # 'ssh' or 'prometheus'
    port = Column(Integer, nullable=False, default=22)
    
    # Credentials for SSH
    username = Column(String(255), nullable=True)
    password = Column(String(255), nullable=True)
    private_key = Column(String, nullable=True)
    
    status = Column(String(50), default="unknown")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
