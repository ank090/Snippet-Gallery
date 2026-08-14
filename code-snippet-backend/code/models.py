

from pydantic import BaseModel

class Snippet(BaseModel):
    title: str
    language: str
    code: str
    tags: str
    description: str
    isFavorite: bool