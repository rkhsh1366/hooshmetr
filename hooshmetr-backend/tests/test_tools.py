# tests/test_tools.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.tool import Tool
from app.models.category import Category

# ایجاد پایگاه داده آزمایشی در حافظه
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ایجاد جداول در پایگاه داده آزمایشی
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def sample_category(db):
    category = Category(name="تست")
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@pytest.fixture
def sample_tool(db, sample_category):
    tool = Tool(
        name="ابزار تست",
        description="توضیحات تست",
        website="https://example.com",
        license_type="free",
        supports_farsi=True
    )
    tool.categories = [sample_category]
    db.add(tool)
    db.commit()
    db.refresh(tool)
    return tool

def test_read_tools(sample_tool):
    response = client.get("/api/tools/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    assert data["items"][0]["name"] == "ابزار تست"

def test_read_tool(sample_tool):
    response = client.get(f"/api/tools/{sample_tool.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ابزار تست"
    assert data["supports_farsi"] == True

def test_search_tools(sample_tool):
    response = client.get("/api/tools/?search=تست")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    assert "تست" in data["items"][0]["name"]

def test_filter_by_category(sample_tool, sample_category):
    response = client.get(f"/api/tools/?category_ids={sample_category.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    assert data["items"][0]["name"] == "ابزار تست"