import express from "express"
import schedule from "node-schedule"

const app = express()

app.use(express.json())

app.get("/", (req, res) => {res.send("Service running.")})

interface ScheduleBody {
    execute_ts: String
    interval_ms?: Number
    end_ts?: String
    endpoint_url: URL
    fetch_request: RequestInit
}

app.post("/schedule", async ({body: {execute_ts, ...ctx}}: {body: ScheduleBody}, res) => {

    const request = async (ctx: Omit<ScheduleBody, "execute_ts">) => {
        await fetch(ctx.endpoint_url, ctx.fetch_request)
        
        // Reschedule
    
        if (ctx.interval_ms) {
            const next_execution_ts = Number(execute_ts) + Number(ctx.interval_ms) * Math.ceil((Date.now() - Number(execute_ts)) / Number(ctx.interval_ms))
            if (!ctx.end_ts || next_execution_ts < Number(ctx.end_ts)) {
                await scheduleJob(String(next_execution_ts), request, ctx as Omit<ScheduleBody, "execute_ts">)
            }
        }
    }
    
    // Add Req Job

    await scheduleJob(execute_ts, request, ctx as Omit<ScheduleBody, "execute_ts">)
    
    // Respond
    
    res.send("Job Added.")
})

const scheduleJob = async <D extends object>(execute_ts: String, callback: (ctx: D) => Promise<void>, ctx: D) => {
    schedule.scheduleJob(new Date(Number(execute_ts)), async () => {
        await callback(ctx)
    })
}

app.listen(3010)

/*
curl -X POST http://localhost:3010/schedule \
-H "Content-Type: application/json" \
-d '{
    "execute_ts": "1770431352262",
    "interval_ms": 10000,
    "endpoint_url": "https://google.com",
    "fetch_request": {
      "method": "GET"
    }
}'
*/