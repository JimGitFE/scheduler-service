import express from "express"
import schedule from "node-schedule"

const app = express()
app.use(express.json())
app.get("/", (_, res) => res.send("Service running."))

interface ScheduleBody {
   execute_ts: number
   interval_ms?: number
   end_ts?: number
   endpoint_url: URL
   fetch_request: RequestInit
}

app.post("/schedule", async ({ body: { execute_ts, interval_ms = 0, end_ts = 0, ...ctx } }: { body: ScheduleBody }, res) => {
   if (typeof execute_ts !== "number" || !ctx.endpoint_url || !ctx.fetch_request) return ((res.statusCode = 400), res.send("Bad Body"))

   /** Next Execution timestamp relative to `Date.now()` until `end_ts` */
   const nextTs = () => (Math.max(execute_ts + interval_ms * Math.max(Math.ceil((Date.now() - execute_ts) / interval_ms), 0) - end_ts, 0) || NaN) + end_ts // prettier-ignore

   /** Job Schedule callback, invokes HTTP request & Reschedule on `interval_ms` & `end_ts` */
   const request = async () => {
      await fetch(ctx.endpoint_url, ctx.fetch_request).catch((e) => console.log("E: ", e, "\n")) // HTTP Request
      if (nextTs()) await scheduleJob(nextTs(), request) // Reschedule
   }

   res.send(`Job Schedule ${scheduleJob(nextTs(), request) ? "Added" : "Failed"}`)
})

const scheduleJob = <D extends object>(execute_ts: string | number, callback: (ctx: D) => Promise<void>, ctx?: D) => {
   return schedule.scheduleJob(new Date(Number(execute_ts)), async () => await callback(ctx as D))
}

app.listen(80)

/*
curl -X POST http://localhost:80/schedule \
-H "Content-Type: application/json" \
-d '{
    "execute_at": 1770512373921,
    "interval_ms": 4000,
    "endpoint_url": "http://127.0.0.1:8000/api/system/wakeup",
    "fetch_request": {
        "method": "POST",
        "body": "{\"name\": \"Finance News\", \"target_tool\": \"get_news\", \"target_args\": {\"topic\": \"egyptology\"}, \"chat_id\": \"12345\"}"
    }
}'
*/
