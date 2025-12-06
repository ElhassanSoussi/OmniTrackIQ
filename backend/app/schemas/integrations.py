from typing import Optional

from pydantic import BaseModel


class IntegrationItem(BaseModel):
    platform: str
    status: str
    last_synced_at: Optional[str] = None
