from typing import List
from fastapi import FastAPI
from fastapi import Depends
from .models import Snippet
from . import db_models
from .database import SessionLocal, engine
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://snippet-gallery-git-main-ank090s-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_models.Base.metadata.create_all(engine)
@app.get("/")
async def read_root():
    return {"Hello": "World"}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/snippets")
async def add_snippets(
    request: List[Snippet],
    db: Session = Depends(get_db),
):
    for snippet in request:
        db_snippet = db_models.SnippetSchema(
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

@app.get("/snippets")
async def get_all_snippets(db: Session = Depends(get_db)):
    snippets = db.query(db_models.SnippetSchema).all()
    return snippets

@app.get("/snippets")
async def get_snippet(snippet_id: int, db: Session = Depends(get_db)):
    if snippet_id <= 0:
        return {"error": "Invalid snippet ID. It must be a positive integer."}
    if snippet_id:
        snippet = db.query(db_models.SnippetSchema).filter(db_models.SnippetSchema.id == snippet_id).first()
        return snippet

@app.delete("/snippets/delete/{snippet_id}")
async def delete_snippet(snippet_id: int, db: Session = Depends(get_db)):
    if snippet_id <= 0:
        return {"error": "Invalid snippet ID. It must be a positive integer."}
    snippet = db.query(db_models.SnippetSchema).filter(db_models.SnippetSchema.id == snippet_id).first()
    if snippet:
        db.delete(snippet)
        db.commit()
        return {"message": f"Snippet with ID {snippet_id} deleted successfully."}
    else:
        return {"error": f"Snippet with ID {snippet_id} not found."}

@app.put("/snippets/update/{snippet_id}")
async def update_snippet(snippet_id: int, updated_snippet: Snippet, db: Session = Depends(get_db)):
    if snippet_id <= 0:
        return {"error": "Invalid snippet ID. It must be a positive integer."}
    snippet = db.query(db_models.SnippetSchema).filter(db_models.SnippetSchema.id == snippet_id).first()
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

@app.patch("/snippets/favorite/{snippet_id}")
async def toggle_favorite(snippet_id: int, db: Session = Depends(get_db)):
    if snippet_id <= 0:
        return {"error": "Invalid snippet ID. It must be a positive integer."}
    snippet = db.query(db_models.SnippetSchema).filter(db_models.SnippetSchema.id == snippet_id).first()
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