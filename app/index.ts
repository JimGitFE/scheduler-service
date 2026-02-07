import express from "express"
import schedule from "node-schedule"

const app = express()

app.get("/", (req, res) => {res.send("Service running.")})

app.get("/job/:ts", (req, res) => {
    console.log(req.params.ts)
    const date = new Date(Number(req.params.ts))
    const [ss, mm, hh] = [date.getSeconds(), date.getMinutes(), date.getHours()]

    schedule.scheduleJob(`${ss} ${mm} * * * *`, ()=> {console.log("Fired")})
    res.send("Job Added.")
})

app.listen(3010)