from pydantic import BaseModel

class Snippet(BaseModel):
    title: str
    language: str
    code: str
    tags: str
    description: str
    isFavorite: bool

class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str