import { MongoClient } from "mongodb";
import express from "express";
import morgan from "morgan";
import basicAuth from "express-basic-auth";
const app = express();
app.locals.pretty = app.get("env") === "development";
app.use(morgan("dev"));
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);
async function getColection() {
  try {
    await client.connect();
    const db = client.db("CarShop");
    const collection = db.collection("Clients");
    const elements = await collection.find({}).toArray();
    return elements;
  } finally {
    await client.close();
  }
}
app.get("/", async (request, response) => {
  const clients = await getColection();
  let html;
  clients.forEach((client) => {
    html += `<option value="${client._id}">${client.username}</option>`;
  });
  response.send(`
      <!DOCTYPE html>
        <html lang="pl">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
            rel="stylesheet"
            integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
            crossorigin="anonymous"
            />
            <!-- Icons -->
            <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
            />
            <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
            />
            <script src="https://unpkg.com/react@latest/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@latest/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

            <title>Tytuł strony / Page tile</title>
        </head>
        <body>
            <nav class="navbar navbar-expand-lg" style="background-color: #ffa901">
            <div class="container-fluid">
                <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarScroll"
                aria-controls="navbarScroll"
                aria-expanded="false"
                aria-label="Toggle navigation"
                >
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarScroll">
                <ul
                    class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll"
                    style="--bs-scroll-height: 100px"
                >
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#"
                        ><i class="bi bi-car-front"></i
                    ></a>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item dropdown">
                    <a
                        class="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        pojazdy
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#">Samochody</a></li>
                        <li><a class="dropdown-item" href="#">Przyczepy</a></li>
                    </ul>
                    </li>
                </ul>
                <form class="d-flex" role="search">
                    <input
                    class="form-control me-2"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    />
                    <button
                    onclick="doCommand()"
                    class="btn btn-outline-success"
                    type="submit"
                    >
                    Search
                    </button>
                </form>
                </div>
            </div>
            </nav>
            <div class="container text-center" id="root">
            <form action="/submit" method="POST">
            <div class="container text-center">
                <div class="row">
                <div class="col">
                <label for="buy">Vehicles to buy:</label>
                    <select id"buy" name="soldVehicle" class="form-select form-select-lg mb-3 mt-3" aria-label="Large select example ">
                       
                    </select>
                </div>
                <div class="col">
                <label for="rent">Vehicles to rent:</label>
                    <select id="rent" name="rentedVehicle" class="form-select form-select-lg mb-3 mt-3" aria-label="Large select example ">
             
                    </select>
                </div>
                </div>
            
            <input type="radio" id="option1" name="options" value="rent">
            <label for="option1">Rent</label>
            <input type="radio" id="option2" name="options" value="buy" checked>
            <label for="option2">Buy</label><br>
            <label for="users">Użytkownicy: </label>
                    <select name="users" id="users" class="form-select form-select-lg mb-3 mt-3" aria-label="Large select example ">
                        ${html}
                    </select>
            <button type="submit">Send</button>
            </form>
            </div>
            </div>

            <div class="conteiner text-start text-light bg-success">
            <i class="bi bi-c-circle"></i>SzablonyCyberAGH
            </div>

            <!-- Umieść tutaj treść elementu 'body' z zadania 1 -->
            <!-- Put here the contents of the 'body' element from exercise 1 -->
            <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
            crossorigin="anonymous"
            ></script>
        </body>
        </html>
`);
});
app.listen(8000, () => {
  console.log("The server was started on port 8000");
  console.log('To stop the server, press "CTRL + C"');
});
