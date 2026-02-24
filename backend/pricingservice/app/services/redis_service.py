import redis
from app.core.config import settings


class RedisService:
    def __init__(self):
        try:
            self.client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=0,
                decode_responses=True
            )

           
            self.client.ping()

            print("✅ Redis connected successfully")

        except redis.ConnectionError as e:
            print("❌ Redis connection failed:", str(e))
            raise


    def get_active_variants(self, limit: int = 50):
        """
        Fetch top active variants from ZSET
        """
        return self.client.zrevrange(
            "variant_activity_score",
            0,
            limit - 1,
            withscores=True
        )

