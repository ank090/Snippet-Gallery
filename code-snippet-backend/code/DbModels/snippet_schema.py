from ..database import Base
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String
if TYPE_CHECKING:
    from .user_schema import UserSchema

class SnippetSchema(Base):
    __tablename__ = "snippets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255),index=True)
    code: Mapped[str] = mapped_column(String(255))
    language: Mapped[str] = mapped_column(String(255))
    tags: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(255))
    isFavorite: Mapped[bool] = mapped_column(default=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
        
    owner: Mapped["UserSchema"] = relationship(back_populates="snippets")