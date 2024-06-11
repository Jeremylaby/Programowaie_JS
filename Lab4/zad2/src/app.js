/**
 * @author Stanisław Barycki <barycki@agh.edu.pl>
 */
import http from "node:http";
import { URL } from "node:url";
import fs from "node:fs";
import fse from "fs-extra";
import { parse } from "querystring";
/**
 * Plik, w którym przechowywana jest lista gości.
 * @const {string}
 * @author Stanisław Barycki <barycki@agh.edu.pl>
 */

/**
 * Handles incoming requests.
 *
 * @param {IncomingMessage} request - Input stream — contains data received from the browser, e.g,. encoded contents of HTML form fields.
 * @param {ServerResponse} response - Output stream — put in it data that you want to send back to the browser.
 *  * The answer sent by this stream must consist of two parts: the header and the body.
 * <ul>
 *  <li>The header contains, among others, information about the type (MIME) of data contained in the body.
 *  <li>The body contains the correct data, e.g. a form definition.
 * </ul>

 * @author Stanisław Barycki <barycki@agh.edu.pl>
 */
const shopMagazinePath = "./shop_magazine.json";
const rentalMagazinePath = "./rental_magazine.json";
const usersPath = "./users.json";

// Obiekt do zapisania
const shopMagazineData = [
  {
    id: 1,
    model: "BMW-I4",
    type: "car",
    engine: "petrol",
    transmission: "automatic",
    src: "img/BMW%20i4.jpg",
    price: 4500,
    quantity: 10,
  },
  {
    id: 2,
    model: "Skoda-Superb",
    type: "car",
    engine: "petrol",
    transmission: "automatic",
    src: "img/skoda.jpg",
    price: 5000,
    quantity: 20,
  },
  {
    id: 3,
    model: "Przyczepa",
    type: "trailer",
    src: "img/przyczepa.jpg",
    price: 1000,
    quantity: 5,
  },
  {
    id: 4,
    model: "Przyczepa-z-plandeka",
    type: "trailer",
    src: "img/przyczepa-z-plandeką.jpg",
    price: 2000,
    quantity: 10,
  },
];
const rentalMagazineData = [
  {
    id: 1,
    model: "BMW-I4",
    type: "car",
    engine: "petrol",
    transmission: "automatic",
    src: "img/BMW%20i4.jpg",
    all: 40,
    borrowed: 0,
  },
  {
    id: 2,
    model: "Skoda-Superb",
    type: "car",
    engine: "petrol",
    transmission: "automatic",
    src: "img/skoda.jpg",
    all: 10,
    borrowed: 0,
  },
  {
    id: 3,
    model: "Przyczepa",
    type: "trailer",
    src: "img/przyczepa.jpg",
    all: 5,
    borrowed: 0,
  },
  {
    id: 4,
    model: "Przyczepa-z-plandeka",
    type: "trailer",
    src: "img/przyczepa-z-plandeką.jpg",
    all: 6,
    borrowed: 0,
  },
];
const usersData = [
  {
    id: 1,
    username: "Staszek Barycki",
    purchasedVehicle: [],
    rentedVehicle: [],
    totalMoney: 0,
  },
  {
    id: 2,
    username: "Jan Nowak",
    purchasedVehicle: [],
    rentedVehicle: [],
    totalMoney: 0,
  },
  {
    id: 3,
    username: "Adam Kowalski",
    purchasedVehicle: [],
    rentedVehicle: [],
    totalMoney: 0,
  },
  {
    id: 4,
    username: "Adam Nowak",
    purchasedVehicle: [],
    rentedVehicle: [],
    totalMoney: 0,
  },
];
async function writeJsonFile(filePath, fileData) {
  try {
    await fse.writeJson(filePath, fileData, { spaces: 2 }); // Dodajemy opcję `spaces` dla czytelności
    console.log("Data written to file successfully");
  } catch (err) {
    console.error("Error writing file:", err);
  }
}

// writeJsonFile(shopMagazinePath, shopMagazineData);
// writeJsonFile(rentalMagazinePath, rentalMagazineData);
// writeJsonFile(usersPath, usersData);
async function readMagazine(filePath) {
  try {
    const data = await fse.readJson(filePath);
    // console.log(data);
    return data;
  } catch (err) {
    console.error("Error reading file:", err);
  }
}
async function generateShopItems(items) {
  return items
    .map((item) => {
      if (item.quantity > 0) {
        return `<option value="${item.id}">${item.model} Price: ${item.price} Quantity: ${item.quantity}</option>`;
      }
      return "";
    })
    .join("");
}
async function generateRentalItems(items) {
  return items
    .map((item) => {
      if (item.all > item.borrowed > 0) {
        return `<option value="${item.id}">${item.model} Available: ${
          item.all - item.borrowed
        } </option>`;
      }
      return "";
    })
    .join("");
}
async function generateUsersItems(items) {
  return items
    .map((item) => `<option value="${item.id}">${item.username}</option>`)
    .join("");
}
async function requestListener(request, response) {
  console.log("--------------------------------------");
  console.log(`The relative URL of the current request: ${request.url}`);
  console.log(`Access method: ${request.method}`);
  console.log("--------------------------------------");
  // Create the URL object
  const url = new URL(request.url, `http://${request.headers.host}`);

  switch ([request.method, url.pathname].join(" ")) {
    case "GET /":
      const shopItems = await readMagazine(shopMagazinePath);
      const rentalItems = await readMagazine(rentalMagazinePath);
      const usersItems = await readMagazine(usersPath);
      const shop = await generateShopItems(shopItems);
      const rental = await generateRentalItems(rentalItems);
      const users = await generateUsersItems(usersItems);
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.write(`
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
                        ${shop}
                    </select>
                </div>
                <div class="col">
                <label for="rent">Vehicles to rent:</label>
                    <select id="rent" name="rentedVehicle" class="form-select form-select-lg mb-3 mt-3" aria-label="Large select example ">
                        ${rental}
                    </select>
                </div>
                </div>
            
            <input type="radio" id="option1" name="options" value="rent">
            <label for="option1">Rent</label>
            <input type="radio" id="option2" name="options" value="buy" checked>
            <label for="option2">Buy</label><br>
            <label for="users">Użytkownicy: </label>
                    <select name="users" id="users" class="form-select form-select-lg mb-3 mt-3" aria-label="Large select example ">
                        ${users}
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
      response.end();
      break;
    case "POST /submit":
      let body;
      request.on("data", (chunk) => {
        body = chunk.toString();
      });

      request.on("end", async () => {
        const data = parse(body);
        console.log(data);
        const id = parseInt(data.users);
        const option = data.options;
        let carId = null; // Zmienna na wartość carId

        if (option === "buy") {
          carId = data.soldVehicle;
        } else if (option === "rent") {
          carId = data.rentedVehicle;
        }
        if (!carId) {
          console.log("hej ");
          return;
        }
        console.log("hej ");

        const usersItems2 = await readMagazine(usersPath);
        const userIndex = usersItems2.findIndex((user) => user.id == id);
        let index;
        if (option === "buy") {
          console.log("hej ");
          const shopItems2 = await readMagazine(shopMagazinePath);
          index = shopItems2.findIndex((item) => item.id == carId);
          if (index === -1) {
            return;
          }
          shopItems2[index].quantity -= 1;
          usersItems2[userIndex].purchasedVehicle.push(carId);
          usersItems2[userIndex].totalMoney += shopItems2[index].price;
          writeJsonFile(shopMagazinePath, shopItems2);
          console.log(
            "Car sold succesfully \n" +
              shopItems2[index] +
              "\n to : \n" +
              usersItems2[userIndex]
          );
        } else {
          const rentalItems2 = await readMagazine(rentalMagazinePath);
          index = rentalItems2.findIndex((item) => (item.id = carId));
          if (index === -1) {
            return;
          }
          rentalItems2[index].borrowed += 1;
          usersItems2[userIndex].rentedVehicle.push(carId);
          writeJsonFile(rentalMagazinePath, rentalItems2);
          console.log(
            "Car rented succesfully \n" +
              rentalItems2[index] +
              "\n to : \n" +
              usersItems2[userIndex]
          );
        }
        response.writeHead(302, { Location: "/" });
        response.end();
      });
      break;
  }
}
const server = http.createServer(requestListener); // The 'requestListener' function is defined above
server.listen(8000);
console.log("The server was started on port 8000");
console.log('To stop the server, press "CTRL + C"');
