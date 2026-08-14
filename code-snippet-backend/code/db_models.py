from .database import Base
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

class SnippetSchema(Base):
    __tablename__ = "snippets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(index=True)
    code: Mapped[str] = mapped_column()
    language: Mapped[str] = mapped_column()
    tags: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()
    isFavorite: Mapped[bool] = mapped_column(default=False)