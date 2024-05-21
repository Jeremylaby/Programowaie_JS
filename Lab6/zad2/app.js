import { MongoClient, ObjectId } from "mongodb";
import express from "express";
import morgan from "morgan";
import basicAuth from "express-basic-auth";

import xml from "xml";
import bodyParser from "body-parser"; // Dodaj ten import

const app = express();
app.set('view engine', 'pug');
app.set('views', './views');
app.locals.pretty = app.get("env") === "development";
app.use(morgan("dev"));
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Dodaj to, aby parsować JSON w ciele żądania

const clientRouter = express.Router();
const adminRouter = express.Router();

const uri = "mongodb://127.0.0.1:27017/";

async function getCollection(collectionName) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("CarShop");
        const collection = db.collection(collectionName);
        const items = await collection.find({}).toArray();
        return items;
    } finally {
        await client.close();
    }
}

async function sellCar(clientId, carId) {
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
            { $push: { borrowedProducts: carObjectId } }
        );
    } finally {
        await client.close();
    }
}

async function returnCar(clientId, carId) {
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
            { $inc: { borrowed: -1 } }
        );

        if (updateCarResult.modifiedCount === 0) {
            console.log("Nie udało się zaktualizować ilości samochodów.");
            return;
        }

        const updateClientResult = await clients.updateOne(
            { _id: clientObjectId },
            { $pull: { borrowedProducts: carObjectId } }
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

// Middleware to handle JSON and XML responses
function formatResponse(req, res, data) {
    const accept = req.headers.accept;
    if (accept === 'application/xml') {
        res.set('Content-Type', 'application/xml');
        res.send(xml(data));
    } else {
        res.json(data);
    }
}

clientRouter.get("/", async (req, res) => {
    let productsRecords = await getCollection("Products");
    let clientsRecords = await getCollection("Clients");
    res.render('index', { products: productsRecords, clients: clientsRecords });
});

clientRouter.get("/borrow", async (req, res) => {
    const productsRecords = await getCollection("BorrowItems");
    const clientsRecords = await getCollection("Clients");
    formatResponse(req, res, { products: productsRecords, clients: clientsRecords });
});

clientRouter.post("/buy", async (req, res) => {
    const { soldVehicle, userId } = req.body;
    await sellCar(userId, soldVehicle);
    formatResponse(req, res, { message: "Car sold successfully" });
});

clientRouter.get("/borrow/:clientId/:carId", async (req, res) => {
    const { clientId, carId } = req.params;
    await borrowCar(clientId, carId);
    formatResponse(req, res, { message: "Car borrowed successfully" });
});

clientRouter.delete("/return/:clientId/:carId", async (req, res) => {
    const { clientId, carId } = req.params;
    await returnCar(clientId, carId);
    formatResponse(req, res, { message: "Car returned successfully" });
});

clientRouter.post("/sell", async (req, res) => {
    const { clientId, carId } = req.body;
    await sellCar(clientId, carId);
    formatResponse(req, res, { message: "Car sold successfully" });
});


adminRouter.get("/clients", async (req, res) => {
    const clientsRecords = await getCollection("Clients");
    formatResponse(req, res, clientsRecords);
});

app.use("/api", clientRouter);
app.use("/admin", adminRouter);

app.listen(8000, () => {
    console.log("The server was started on port 8000");
    console.log('To stop the server, press "CTRL + C"');
});