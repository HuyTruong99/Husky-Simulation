from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    rosbridge_url: str = "ws://127.0.0.1:9090"
    recordings_path: Path = Path("/data/recordings")
    cors_origins: str = "http://localhost:3000"
    upload_secret: str = "changeme123"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.recordings_path.mkdir(parents=True, exist_ok=True)
    return settings
