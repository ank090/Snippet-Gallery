from typing import List
from fastapi import FastAPI
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from .models import Snippet
from .DbModels import snippet_schema, user_schema
from .database import SessionLocal, engine
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from .models import UserCreate, UserOut, Token
from .auth import hash_password, create_access_token, verify_password, decode_access_token
from fastapi.exceptions import ResponseValidationError

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://snippet-gallery.vercel.app"],#, "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

snippet_schema.Base.metadata.create_all(engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Home Page
@app.get("/")
async def read_root():
    return {"Hello": "World"}

# Gets Current user and used as dependency for all routes
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    paload = decode_access_token(token=token)
    if paload is None:
        raise HTTPException(status_code=401, detail="Invalid or Expired token")
    user_id = paload.get('sub')
    user = db.query(user_schema.UserSchema).filter(user_schema.UserSchema.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User nor found")
    return user

#SignUp
@app.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(user_schema.UserSchema).filter(user_schema.UserSchema.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")
    new_user = user_schema.UserSchema(
        email = user.email,
        hashed_password = hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email}

#Login
@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(user_schema.UserSchema).filter(user_schema.UserSchema.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User Does not Exist"
        )
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Password"
        )
    access_token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": 'brearer'
    }

# Add Snippets
@app.post("/snippets")
async def add_snippets(
    request: List[Snippet],
    db: Session = Depends(get_db),
):
    for snippet in request:
        db_snippet = snippet_schema.SnippetSchema(
            title=snippet.title,
            code=snippet.code,
            language=snippet.language,
            tags=snippet.tags,
            description=snippet.description,
            isFavorite=snippet.isFavorite,
        )
        db.add(db_snippet)
    db.commit()
    return {"message": "Snippets added successfully."}

# Get all Snippets
@app.get("/snippets")
async def get_all_snippets(db: Session = Depends(get_db)):
    try:
        snippets = db.query(snippet_schema.SnippetSchema).all()
        return snippets
    except ResponseValidationError as ex:
        HTTPException(status_code=400, detail=ex.body)

# Get Snippets based on an id
@app.get("/snippets")
async def get_snippet(snippet_id: int, db: Session = Depends(get_db)):
    if snippet_id <= 0:
        return {"error": "Invalid snippet ID. It must be a positive integer."}
    if snippet_id:
        snippet = db.query(snippet_schema.SnippetSchema).filter(snippet_schema.SnippetSchema.id == snippet_id).first()
        return snippet

# Delete Snippets based on an id
@app.delete("/snippets/delete/{snippet_id}")
async def delete_snippet(snippet_id: int, db: Session = Depends(get_db)):
    if snippet_id <= 0:
        return {"error": "Invalid snippet ID. It must be a positive integer."}
    snippet = db.query(snippet_schema.SnippetSchema).filter(snippet_schema.SnippetSchema.id == snippet_id).first()
    if snippet:
        db.delete(snippet)
        db.commit()
        return {"message": f"Snippet with ID {snippet_id} deleted successfully."}
    else:
        return {"error": f"Snippet with ID {snippet_id} not found."}

# Update Snippets based on an id
@app.put("/snippets/update/{snippet_id}")
async def update_snippet(snippet_id: int, updated_snippet: Snippet, db: Session = Depends(get_db)):
    if snippet_id <= 0:
        return {"error": "Invalid snippet ID. It must be a positive integer."}
    snippet = db.query(snippet_schema.SnippetSchema).filter(snippet_schema.SnippetSchema.id == snippet_id).first()
    if snippet:
        snippet.title = updated_snippet.title
        snippet.code = updated_snippet.code
        snippet.language = updated_snippet.language
        snippet.tags = updated_snippet.tags
        snippet.description = updated_snippet.description
        snippet.isFavorite = updated_snippet.isFavorite
        db.commit()
        return {"message": f"Snippet with ID {snippet_id} updated successfully."}
    else:
        return {"error": f"Snippet with ID {snippet_id} not found."}

# Patch Snippets based on an id
@app.patch("/snippets/favorite/{snippet_id}")
async def toggle_favorite(snippet_id: int, db: Session = Depends(get_db)):
    if snippet_id <= 0:
        return {"error": "Invalid snippet ID. It must be a positive integer."}
    snippet = db.query(snippet_schema.SnippetSchema).filter(snippet_schema.SnippetSchema.id == snippet_id).first()
    if snippet:
        snippet.isFavorite = not snippet.isFavorite
        db.commit()
        db.refresh(snippet)
        return {
    "id": snippet.id,
    "title": snippet.title,
    "code": snippet.code,
    "language": snippet.language,
    "tags": snippet.tags,
    "description": snippet.description,
    "isFavorite": snippet.isFavorite,
}
    else:
        return {"error": f"Snippet with ID {snippet_id} not found."}
