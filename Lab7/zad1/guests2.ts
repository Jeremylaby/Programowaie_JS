import {
  Database,
  Collection,
  MongoClient,
} from "https://deno.land/x/mongo@v0.33.0/mod.ts";
import {
  Application,
  Router,
  Context,
} from "https://deno.land/x/oak@v16.0.0/mod.ts";
import {
  dejsEngine,
  oakAdapter,
  viewEngine,
} from "https://deno.land/x/view_engine@v10.6.0/mod.ts";
import logger from "https://deno.land/x/oak_logger@1.0.0/mod.ts";
import bodyParser from "npm:body-parser@^1";

const app = new Application();
const router = new Router();
const DB_NAME = "Guests";

const client = new MongoClient();
await client.connect("mongodb://127.0.0.1:27017");
const db: Database = client.database(DB_NAME);
const guests: Collection<Guests> = db.collection("guests");

interface Guests {
  username: string;
  message: string;
  timestamp: Date;
}

app.use(logger.logger);
app.use(logger.responseTime);

app.use(viewEngine(oakAdapter, dejsEngine, { viewRoot: "./views" }));
app.use(router.routes());
app.use(router.allowedMethods());
router.get("/", async (ctx: Context) => {
  const entries: Guests[] = await guests.find().toArray();
  await ctx.render("guests.ejs", {
    data: { title: "Guestbook", entries: entries },
  });
});

router.post("/", async (ctx: Context) => {
  const body = await ctx.request.body.formData();
  console.log(body);
  const username = body.get("username");
  const message = body.get("message");
  if (username && message) {
    const entry: Guests = {
      username,
      message,
      timestamp: new Date(),
    };
    console.log("Inserting entry:", entry);
    await guests.insertOne(entry);
  }
  ctx.response.redirect("/");
});
console.log("Server is running on http://localhost:8000");
await app.listen({ port: 8000 });
