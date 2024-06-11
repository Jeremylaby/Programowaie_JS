/**
 * @author Stanisław Polak <polak@agh.edu.pl>
 */

import express, { request, response } from "express";
import morgan from "morgan";
import { MongoClient } from "mongodb";


const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);
let students;
async function run() {
  try {
    await client.connect();
    const db = client.db("AGH");
    const collection = db.collection("students");
    students = await collection.find({}).toArray();
    console.log(students)

  } finally {
    await client.close();
  }
}
run().catch(console.dir);

/* *************************** */
/* Configuring the application */
/* *************************** */
const app = express();

app.locals.pretty = app.get("env") === "development"; // The resulting HTML code will be indented in the development environment

/* ************************************************ */

app.use(morgan("dev"));
app.use(express.static("static")); // Serves static files from 'static' directory
app.use(express.urlencoded({ extended: true }));
app.set("views", "./views");
app.set("view engine", "pug");


/* ******** */
/* "Routes" */
/* ******** */

/* ------------- */
/* Route 'GET /' */
/* ------------- */
app.get("/", (request, response) => {
  response.render("index",{students: students}); // Render the 'index' view
});

/* ************************************************ */
app.get("/submit", (request, response) => {
  response.set("Content-Type", "text/plain");
  response.send(`Hello ${request.query.name}`);
});

app.get("/students/:faculty",(request,response)=>{
  const faculty = request.params.faculty;
  const newStudents = students.filter((student) => student.faculty === faculty);
  response.render("index", { students: newStudents });
});

app.post("/", (request, response) => {
  response.set("Content-Type", "text/plain");
  response.send(`Hello ${request.body.name}`);
});
app.listen(8000, () => {
  console.log("The server was started on port 8000");
  console.log('To stop the server, press "CTRL + C"');
});
