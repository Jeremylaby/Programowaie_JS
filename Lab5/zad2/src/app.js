import { MongoClient, ObjectId } from "mongodb";
import express, { request, response } from "express";
import morgan from "morgan";
import basicAuth from "express-basic-auth";
import multer from "multer";
import path from "path";

const app = express();
app.locals.pretty = app.get("env") === "development";
app.use(morgan("dev"));
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

const clientRouter = express.Router();
const adminRouter = express.Router();

async function getCollection(collectionName) {
  const uri = "mongodb://127.0.0.1:27017/";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("CarShop");
    let colect = db.collection(collectionName);
    let items = await colect.find({}).toArray();
    // console.log(items);
    return items;
  } finally {
    await client.close();
  }
}
async function sellCar(clientId, carId) {
  const uri = "mongodb://127.0.0.1:27017/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("CarShop");
    const clients = db.collection("Clients");
    const cars = db.collection("Products");
    const clientObjectId = new ObjectId(clientId);
    const carObjectId = new ObjectId(carId);

    const car = await cars.findOne({ _id: carObjectId });
    if (!car || car.quantity <= 0) {
      console.log("Samochód niedostępny lub brak na stanie.");
      return;
    }
    const updateCarResult = await cars.updateOne(
      { _id: carObjectId },
      { $inc: { quantity: -1 } }
    );

    if (updateCarResult.modifiedCount === 0) {
      console.log("Nie udało się zaktualizować ilości samochodów.");
      return;
    }

    // Dodaj samochód do listy zakupionych produktów klienta
    const updateClientResult = await clients.updateOne(
      { _id: clientObjectId },
      {
        $inc: { totalMoney: car.price },
        $push: { purchasedProducts: carObjectId },
      }
    );
  } finally {
    await client.close();
  }
}
async function borrowCar(clientId, carId) {
  const uri = "mongodb://127.0.0.1:27017/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("CarShop");
    const clients = db.collection("Clients");
    const cars = db.collection("BorrowItems");
    const clientObjectId = new ObjectId(clientId);
    const carObjectId = new ObjectId(carId);
    const updateCarResult = await cars.updateOne(
      { _id: carObjectId },
      { $inc: { borrowed: 1 } }
    );

    if (updateCarResult.modifiedCount === 0) {
      console.log("Nie udało się zaktualizować ilości samochodów.");
      return;
    }

    const updateClientResult = await clients.updateOne(
      { _id: clientObjectId },
      {
        $push: { borrowedProducts: carObjectId },
      }
    );
  } finally {
    await client.close();
  }
}
const auth = basicAuth({
  users: { admin: "password123" },
  challenge: true,
  realm: "Admin area",
});
function generateShopItems(items) {
  return items
    .map((item) => {
      if (item.quantity > 0) {
        return `<option value="${item._id}">${item.model} Price: ${item.price} Quantity: ${item.quantity}</option>`;
      }
      return "";
    })
    .join("");
}
function generateUsersItems(items) {
  return items
    .map((item) => `<option value="${item._id}">${item.username}</option>`)
    .join("");
}
function generateRentalItems(items) {
  return items
    .map((item) => {
      if (item.all - item.borrowed > 0) {
        return `<option value="${item._id}">${item.model} Available: ${
          item.all - item.borrowed
        } </option>`;
      }
      return "";
    })
    .join("");
}
clientRouter.get("/", (request, response) => {
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
            <h1>Main Page</h1>
            <div class="d-grid gap-2 d-md-block">
            <button class="btn btn-primary" onclick="window.location.href='/borrow'" type="button">Borrow</button>

            <button class="btn btn-primary" onclick="window.location.href='/buy'" type="button">Buy</button>

            <button class="btn btn-primary" onclick="window.location.href='/log_in'" type="button">Log in</button>
            </div>
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
clientRouter.post("/buy", async (request, response) => {
  const selectedVehicle = request.body.soldVehicle;
  const selectedUser = request.body.users;
  await sellCar(selectedUser, selectedVehicle);
  console.log(`Wybrany pojazd: ${selectedVehicle}`);
  console.log(`Wybrany użytkownik: ${selectedUser}`);
  response.redirect("/buy");
});
clientRouter.get("/buy", async (request, response) => {
  let productsRecords = await getCollection("Products");
  let clientRecords = await getCollection("Clients");
  let clients = generateUsersItems(clientRecords);
  let products = generateShopItems(productsRecords);
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
              <form action="/buy" method="POST">
              <label for="buy">Vehicles to buy:</label>
              <select id"buy" name="soldVehicle" class="form-select form-select-lg mb-3 mt-3" aria-label="Large select example ">
                ${products}
            </select>
                <label for="users">Użytkownicy: </label>
                    <select name="users" id="users" class="form-select form-select-lg mb-3 mt-3" aria-label="Large select example ">
                        ${clients}
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
clientRouter.post("/borrow", async (request, response) => {
  const selectedVehicle = request.body.soldVehicle;
  const selectedUser = request.body.users;
  await borrowCar(selectedUser, selectedVehicle);
  console.log(`Wybrany pojazd: ${selectedVehicle}`);
  console.log(`Wybrany użytkownik: ${selectedUser}`);
  response.redirect("/borrow");
});
clientRouter.get("/borrow", async (request, response) => {
  let productsRecords = await getCollection("BorrowItems");
  let clientRecords = await getCollection("Clients");
  let clients = generateUsersItems(clientRecords);
  let products = generateRentalItems(productsRecords);
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
              <form action="/borrow" method="POST">
              <label for="buy">Vehicles to buy:</label>
              <select id"buy" name="soldVehicle" class="form-select form-select-lg mb-3 mt-3" aria-label="Large select example ">
                ${products}
            </select>
                <label for="users">Użytkownicy: </label>
                    <select name="users" id="users" class="form-select form-select-lg mb-3 mt-3" aria-label="Large select example ">
                        ${clients}
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
async function getCar(carId) {
  const uri = "mongodb://127.0.0.1:27017/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("CarShop");
    const cars = db.collection("Products");
    const carObjectId = new ObjectId(carId);

    const car = await cars.findOne({ _id: carObjectId });
    return car;
  } finally {
    await client.close();
  }
}
async function generatePurchasedProducts(products) {
  let result = `
  <thead>
  <tr>
    <th scope="col"> Purchased Products </th>
    <th scope="col"> Photo </th>
    <th scope="col"> Price </th>
  </tr>
  </thead>`;
  if (products.length === 0) {
    return result;
  }
  result += `<tbody>`;
  for (let product of products) {
    let car = await getCar(product);
    result += `
    <tr>
      <td>${car.model}</td>
      <td><img  class="img-fluid" src=${car.src}></td>
      <td>${car.price}</td>
    </tr>`;
  }
  result += `</tbody>`;
  return result;
}
async function getCarB(carId) {
  const uri = "mongodb://127.0.0.1:27017/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("CarShop");
    const cars = db.collection("BorrowItems");
    const carObjectId = new ObjectId(carId);

    const car = await cars.findOne({ _id: carObjectId });
    return car;
  } finally {
    await client.close();
  }
}
async function generateBorrowedProducts(products) {
  let result = `
  <thead>
  <tr>
    <th scope="col"> Borrowed Products </th>
    <th colspan="2">Photo</th>
  </tr>
  </thead>`;
  if (products.length === 0) {
    return result;
  }
  result += `<tbody>`;
  for (let product of products) {
    let car = await getCarB(product);
    result += `
    <tr>
      <td>${car.model}</td>
      <td colspan="2"><img class="img-fluid" src=${car.src}></td>
    </tr>`;
  }
  result += `</tbody>`;
  return result;
}
async function generateClientsTables(clients) {
  let resultTable = ``;
  for (let client of clients) {
    let clientTable = `
    <table class="table table-striped table-bordered " >
      <thead>
        <tr>
          <th scope="col" colspan="3">${client.username}</th>
        </tr>
      </thead>`;
    let products = await generatePurchasedProducts(client.purchasedProducts);

    clientTable += products;
    clientTable += `
    <thead>
    <tr>
    <th colspan="2">Total price:</th>
    <th>${client.totalMoney}</th>
  </tr>
  </thead>`;
    let borrowedProducts = await generateBorrowedProducts(
      client.borrowedProducts
    );
    clientTable += borrowedProducts;
    clientTable += `</table>`;
    resultTable += clientTable;
  }
  return resultTable;
}

adminRouter.use(auth);
adminRouter.get("/clients", async (request, response) => {
  let clientsRecords = await getCollection("Clients");
  let clients = await generateClientsTables(clientsRecords);
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
        ${clients}
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
const storage = multer.diskStorage({
  destination: (request, file, cb) => {
    cb(null, "static/img");
  },
  filename: (request, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const model = request.body.model ? request.body.model : "default_model";
    cb(null, model + fileExt);
  },
});
const upload = multer({ storage: storage });

adminRouter.post(
  "/product/add",
  upload.single("image"),
  async (request, response) => {
    const { model, type, engine, transmission, price, quantity } = request.body;
    const image = request.file.path.replace(/\\/g, "/");

    const uri = "mongodb://127.0.0.1:27017/";
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("CarShop");
      const products = db.collection("Products");

      const doc =
        type == "car"
          ? {
              model: model,
              type: type,
              engine: engine,
              transmission: transmission,
              src: image.replace("static", ""),
              price: parseInt(price),
              quantity: parseInt(quantity),
            }
          : {
              model: model,
              type: type,
              src: image.replace("static", ""),
              price: parseInt(price),
              quantity: parseInt(quantity),
            };

      await products.insertOne(doc);
      response.send("Produkt dodany pomyślnie");
    } catch (error) {
      console.error("Error connecting to MongoDB", error);
      response.status(500).send("Błąd podczas dodawania produktu");
    } finally {
      await client.close();
    }
  }
);
adminRouter.get("/product/add", (request, response) => {
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
            <h2>Dodaj nowy samochód lub przyczepę</h2>
<form action="/admin/product/add" method="post" enctype="multipart/form-data">
    <label for="model">Model:</label>
    <input type="text" id="model" name="model" required><br><br>

    <label for="type">Type:</label>
    <select id="type" name="type" required>
        <option value="car">Car</option>
        <option value="trailer">Trailer</option>
    </select><br><br>

    <label for="engine">Engine:</label>
    <select id="engine" name="engine">
        <option value="electric">Electric</option>
        <option value="petrol">Petrol</option>
        <option value="hybrid">Hybrid</option>
    </select><br><br>

    <label for="transmission">Transmission:</label>
    <select id="transmission" name="transmission">
        <option value="automatic">Automatic</option>
        <option value="manual">Manual</option>
    </select><br><br>

    <label for="price">Price:</label>
    <input type="number" id="price" name="price" min="0" required><br><br>

    <label for="quantity">Quantity:</label>
    <input type="number" id="quantity" name="quantity" min="0" required><br><br>

    <label for="image">Product Image (JPG only):</label>
    <input type="file" id="image" name="image" accept="image/jpeg" required><br><br>

    <input type="submit" value="Submit">
</form>
            </div>
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
app.use("", clientRouter);
app.use("/admin", adminRouter);
app.listen(8000, () => {
  console.log("The server was started on port 8000");
  console.log('To stop the server, press "CTRL + C"');
});
