import asyncio
from datetime import datetime
from app.schedular.schedular import run_scheduler


async def scheduler_loop(compiled_graph):
    print("[LOOP] 🚀 Scheduler loop started", flush=True)

    try:
        while True:
            print(f"[LOOP] ⏱ Triggering scheduler at {datetime.utcnow()}", flush=True)

            # Run blocking scheduler in background thread
            await asyncio.to_thread(run_scheduler, compiled_graph)

            print("[LOOP] 😴 Sleeping for 60 seconds...\n", flush=True)

            await asyncio.sleep(120)

    except asyncio.CancelledError:
        print("[LOOP] 🛑 Scheduler stopped gracefully.", flush=True)