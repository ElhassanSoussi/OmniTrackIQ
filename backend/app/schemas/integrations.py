from pydantic import BaseModel


class IntegrationItem(BaseModel):
    platform: str
    status: str
    last_synced_at: str | None = None
