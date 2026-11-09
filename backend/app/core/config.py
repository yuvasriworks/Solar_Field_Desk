import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Solar Panel Installation and Maintenance Field Desk"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Secret Key for JWT
    SECRET_KEY: str = "solar-panel-field-desk-super-secret-key-2026-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database URL: Primary MySQL, fallback SQLite
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: str = "3306"
    MYSQL_DB: str = "solar_field_desk"
    
    # Custom override DB URL if provided
    DATABASE_URL: str = ""
    
    # Company Payment QR info
    COMPANY_UPI_ID: str = "solarfielddesk@upi"
    COMPANY_RECEIVER_NAME: str = "Solar Service Desk Ltd"
    
    # Upload folder
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
