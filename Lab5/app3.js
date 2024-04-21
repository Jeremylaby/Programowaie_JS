/**
 * @author Stanisław Polak <polak@agh.edu.pl>
 */

import express from "express";
import morgan from "morgan";

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
 
let students = [
  {
    fname: "Jan",
    lname: "Kowalski",
  },
  {
    fname: "Anna",
    lname: "Nowak",
  },
];
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


app.post("/", (request, response) => {
  response.set("Content-Type", "text/plain");
  response.send(`Hello ${request.body.name}`);
});
app.listen(8000, () => {
  console.log("The server was started on port 8000");
  console.log('To stop the server, press "CTRL + C"');
});
