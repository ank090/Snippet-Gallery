from ..database import Base
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String

if TYPE_CHECKING:
    from .snippet_schema import SnippetSchema

class UserSchema(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255),unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))

    snippets: Mapped[list["SnippetSchema"]] = relationship(back_populates="owner")