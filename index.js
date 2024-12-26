import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3001;

const db = new pg.Client({
    user: "postgres",
    database: "world",
    password: "Olalekan",
    host: "localhost",
    port: 5433
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted() {
    let states = [];
    const result = await db.query("SELECT state_code FROM visited_states");
    result.rows.forEach((state) => {
        states.push(state.state_code)
    });
    return states
}
checkVisisted();


app.get("/", async (req, res) => {
    const states = await checkVisisted();
    res.render("index.ejs", {
        states : states,
        total: states.length
    });
});

app.post("/add", async (req, res) => {
    const input = req.body["state"]

    try {
        const result = await db.query("SELECT * FROM states WHERE LOWER(state_name) LIKE '%' || $1 || '%'", [input.toLowerCase()])
        const data = result.rows[0]
        const stateCode = data.state_code;

        try {
            await db.query("INSERT INTO visited_states (state_code) VALUES ($1)", [stateCode])
        } catch (error) {
            const states = await checkVisisted();
            res.render("index.ejs", {
            states : states,
            total: states.length,
            error: "State already exists"
        })}
    } catch(err) {
            const states = await checkVisisted();
            res.render("index.ejs", {
            states : states,
            total: states.length,
            error: "State does not exist"
        })
    }
})

app.listen(port, () => {
    console.log(`app listen on port http://localhost:${port}`)
});