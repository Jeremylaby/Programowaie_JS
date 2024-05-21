import express, { Express, Request, Response } from "npm:express@^4";
import { MongoClient, Collection, Db } from "npm:mongodb@^4";
import bodyParser from "npm:body-parser@^1";

const DB_URI = "mongodb://localhost:27017/";
const DB_NAME = "Guests";

const client = new MongoClient(DB_URI);
await client.connect();
const db: Db = client.db(DB_NAME);
const guests: Collection<Guests> = db.collection("guests");

interface Guests {
  username: string;
  message: string;
  timestamp: Date;
}

interface RequestBody {
  username: string;
  message: string;
}

const app: Express = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", async (req: Request, res: Response): Promise<void> => {
  const entries: Guests[] = await guests.find().toArray();
  res.send(`
    <html>
      <body>
        <h1>Guestbook</h1>
        <form action="/" method="post">
          <label for="username">Name:</label>
          <input type="text" id="username" name="username">
          <label for="message">Message:</label>
          <input type="text" id="message" name="message">
          <button type="submit">Submit</button>
        </form>
        <h2>Guests</h2>
        <ul>
          ${entries
            .map(
              (entry) =>
                `<li>${entry.username}: ${
                  entry.message
                } (at ${entry.timestamp.toISOString()})</li>`
            )
            .join("")}
        </ul>
      </body>
    </html>`);
});

app.post("/", async (req: Request, res: Response): Promise<void> => {
  const { username, message } = req.body as RequestBody;
  if (username && message) {
    const entry: Guests = {
      username,
      message,
      timestamp: new Date(),
    };
    await guests.insertOne(entry);
  }
  res.redirect("/");
});

app.listen(8000, () => {
  console.log(`Server is running on http://localhost:8000`);
});
