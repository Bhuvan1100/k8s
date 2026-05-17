from fastapi import FastAPI
from contextlib import asynccontextmanager
from langgraph.checkpoint.postgres import PostgresSaver
from app.schedular.runner import scheduler_loop
import asyncio
import os

from app.routes.pricing_approval import (
    approve_proposal,
    reject_proposal,
    fetch_proposals
)

from app.evaluation.pricing_graph import graph


DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "pricing_db")

DATABASE_URL = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)



@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🔥 LIFESPAN STARTED", flush=True)
    with PostgresSaver.from_conn_string(DATABASE_URL) as saver:
        saver.setup()

        compiled_graph = graph.compile(checkpointer=saver)
        app.state.graph = compiled_graph

        task = asyncio.create_task(scheduler_loop(compiled_graph))

        yield

        task.cancel()




app = FastAPI(
    title="Pricing Service",
    lifespan=lifespan
)


@app.get("/")
def health_check():
    return {"status": "Pricing Service Running"}




app.post("/proposals/{proposal_id}/approve")(approve_proposal)
app.post("/proposals/{proposal_id}/reject")(reject_proposal)
app.get("/proposals")(fetch_proposals)
