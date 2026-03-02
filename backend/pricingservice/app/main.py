from fastapi import FastAPI
from contextlib import asynccontextmanager
from langgraph.checkpoint.postgres import PostgresSaver
from app.schedular.runner import scheduler_loop
import asyncio

from app.routes.pricing_approval import (
    approve_proposal,
    reject_proposal,
    fetch_proposals
)

from app.evaluation.pricing_graph import graph


DATABASE_URL = "postgresql://postgres:postgres@postgres:5432/pricing_db"



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

@app.get("/")
def health_check():
    return {"status": "Pricing Service Running"}


app.post("/proposals/{proposal_id}/approve")(approve_proposal)
app.post("/proposals/{proposal_id}/reject")(reject_proposal)
app.get("/proposals")(fetch_proposals)
