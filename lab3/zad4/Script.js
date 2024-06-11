let db;

function initDB() {
    let request = indexedDB.open("carShop", 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        let clientsStore = db.createObjectStore("clients", {keyPath: "id", autoIncrement: true});
        clientsStore.createIndex("fullname", ["firstname", "lastname"], {unique: true});
        let vehicleStore = db.createObjectStore("vehicles", {keyPath: "id", autoIncrement: true});
        vehicleStore.createIndex("model", "model", {unique: true});
        vehicleStore.createIndex("type", "type", {unique: false});
        let purchasesStore = db.createObjectStore("purchases", {keyPath: "id", autoIncrement: true});
        purchasesStore.createIndex("clientId", "clientId", {unique: false})
        purchasesStore.createIndex("model", "model", {unique: false})
        console.log("utworzono bazę danych")
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        // buildMagazine();
        console.log("wszystko git")
    };

    request.onerror = function (event) {
        window.alert("Błąd podczas otwierania bazy danych:", event.target.errorCode);
    };
    // var request = indexedDB.deleteDatabase('carShop');
    //
    // request.onerror = function(event) {
    //     window.alert("Błąd podczas usuwania bazy danych:", event.target.errorCode);
    // };
    //
    // request.onsuccess = function(event) {
    //     console.log("Baza danych została pomyślnie usunięta.");
    // };

}

function doCommand() {
    const input = document.getElementById("command-input");
    const command = input.value.split(" ");
    switch (command[0]) {
        case "sell":
            if (command.length < 4) {
                window.alert("Too few arguments")
                return;
            }
            sellOrAddClient(command[1], command[2], command[3]);
            break;
        case "magazine":
            showMagazine();
            break;
        case "sales":
            showClientsPurchases();
    }

}

function addNewPurchase(model, clientId, price) {
    let purchaseData = {
        model: model,
        clientId: clientId,
        price: price
    }
    let transaction = db.transaction("purchases", "readwrite");
    let purchaseStore = transaction.objectStore("purchases");
    let addPurchase = purchaseStore.add(purchaseData);
    addPurchase.onsuccess = function (event) {
        console.log("Purchase added successfully");
    }
    addPurchase.onerror = function (event) {
        window.alert("Something went wrong adding purchase")
    }
}

function updateMoneySpent(clientId, price) {
    let transaction = db.transaction("clients", "readwrite");
    let clientStore = transaction.objectStore("clients");
    let getClient = clientStore.get(clientId);
    getClient.onerror = function (event) {
        window.alert("Something went wrong updating money Spent")
    }
    getClient.onsuccess = function (event) {
        let client = event.target.result;
        client.moneyspent += price;
        let updateRequest = clientStore.put(client);
        updateRequest.onsuccess = function (event) {
            console.log("Money spent updated successfully");
        }
        updateRequest.onerror = function (event) {
            window.alert("Something went wrong updating money spent")
        }
    }
}

function sellVehicleTo(model, clientId) {
    let transaction = db.transaction("vehicles", "readwrite")
    let vehicleStore = transaction.objectStore("vehicles");
    let indexVehicle = vehicleStore.index("model");
    let vehiclerequest = indexVehicle.get(model)
    vehiclerequest.onerror = function (event) {
        window.alert("Something went wrong getting model")
    }
    vehiclerequest.onsuccess = function (event) {
        let vehicle = event.target.result;
        if (vehicle && vehicle.quantity > 0) {
            vehicle.quantity -= 1;
            let putVehicle = vehicleStore.put(vehicle);
            putVehicle.onerror = function (event) {
                window.alert("Something went wrong putting Vehicle")
            }
            putVehicle.onsuccess = function (event) {
                console.log("vehicle sold successfully")
            }
            addNewPurchase(model, clientId, vehicle.price);
            updateMoneySpent(clientId, vehicle.price);
        } else {
            window.alert("there is no such model or it is not available");
        }
    }
}

function sellOrAddClient(firstname, lastname, model) {
    let transaction = db.transaction("clients", "readonly");
    let clientStore = transaction.objectStore("clients");
    let index = clientStore.index("fullname");
    let range = IDBKeyRange.only([firstname, lastname]);
    let request = index.get(range);
    request.onsuccess = function (event) {
        let client = event.target.result;
        if (client) {
            sellVehicleTo(model, client.id);
        } else {
            addClient(firstname, lastname);
            sellOrAddClient(firstname, lastname, model);
        }
    }
    request.onerror = function (event) {
        window.alert("Something went wrong")
    }
}

function addClient(firstname, lastname) {
    const clientData = {
        firstname: firstname,
        lastname: lastname,
        moneyspent: 0
    }
    let transaction = db.transaction("clients", "readwrite");
    let clients = transaction.objectStore("clients");
    let addClient = clients.add(clientData);
    addClient.onsuccess = function (event) {
        console.log("New clients added successfully " + firstname + " " + lastname);
    };
    addClient.onerror = function (event) {
        window.alert("Failed to add client " + firstname + " " + lastname);
    };
}

function buildMagazine() {
    const magazineData = [
        {model: "BMW-I4", type: "car", engine: "petrol", transmission: "automatic",src: "img/BMW%20i4.jpg" ,price: 4500, quantity: 10},
        {model: "Skoda-Superb", type: "car", engine: "petrol", transmission: "automatic",src: "img/skoda.jpg" , price: 5000, quantity: 20},
        {model: "Przyczepa", type: "trailer",src: "img/przyczepa.jpg" , price: 1000, quantity: 5},
        {model: "Przyczepa-z-plandeka", type: "trailer",src: "img/przyczepa-z-plandeką.jpg" , price: 2000, quantity: 10}
    ]
    let transaction = db.transaction("vehicles", "readwrite");
    let vehicles = transaction.objectStore("vehicles");
    magazineData.forEach(vehicle => {
        let addVehicle = vehicles.add(vehicle);
        addVehicle.onsuccess = function (event) {
            console.log("New car added successfully " + vehicle.model);
        };
        addVehicle.onerror = function (event) {
            window.alert("Failed to add vehicle "+vehicle.model);
        };
    })

}

function showClients() {
    let transaction = db.transaction("clients", "readonly");
    let clientStore = transaction.objectStore("clients");
    let clientCursor = clientStore.openCursor();
    clientCursor.onerror = function (event) {
        window.alert("Something went wrong showing clients")
    }
    clientCursor.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let client = cursor.value;
            console.log("ClientId: " + client.id + " Firstname: " + client.firstname + " Lastname: " + client.lastname + " Money spent: " + client.moneyspent);
            cursor.continue();
        }
    }
}

function showMagazine() {
    let transaction = db.transaction("vehicles", "readonly");
    let vehicleStore = transaction.objectStore("vehicles");
    let vehicleCursor = vehicleStore.openCursor();
    vehicleCursor.onerror = function (event) {
        window.alert("Something went wrong showing clients")
    }
    vehicleCursor.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let vehicle = cursor.value;
            switch (vehicle.type) {
                case "car":
                    console.log("CarId: " + vehicle.id + ", Model: " + vehicle.model + ", Type " + vehicle.type + ", Price: " + vehicle.price + ", Quantity: " + vehicle.quantity + ", Engine type: " + vehicle.engine + ", Transmission type: " + vehicle.transmission);
                    break;
                case "trailer":
                    console.log("CarId: " + vehicle.id + ", Model: " + vehicle.model + ", Type " + vehicle.type + ", Price: " + vehicle.price + ", Quantity: " + vehicle.quantity);
                    break;
                default:
                    console.log("Wrong type");
                    break;

            }
            cursor.continue();
        }
    }

}

function showPurchases(clientId, money) {
        let transaction = db.transaction("purchases", "readonly");
        let purchaseStore = transaction.objectStore("purchases");
        let clientIndex = purchaseStore.index("clientId");
        let purchaseCursor = clientIndex.getAll(clientId)
        purchaseCursor.onerror = function (event) {
            window.alert("Something went wrong showing clients")
            reject(event.target.error);
        }
        purchaseCursor.onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
                let purchase = cursor;
                console.log(purchase);
                console.log("Total money: " + money);
            }
        };
}

function showClientsPurchases() {
        let transaction = db.transaction("clients", "readonly");
        let clientStore = transaction.objectStore("clients");
        let clientCursor = clientStore.openCursor();

        let cursorCount = 0;

        clientCursor.onerror = function (event) {
            window.alert("Something went wrong showing clients");
        };

        clientCursor.onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
                let client = cursor.value;
                console.log(client.id + ": Fullname: " + client.firstname + " " + client.lastname);
                console.log("Purchases: ");
                showPurchases(client.id, client.moneyspent)
                cursor.continue();  
            }
        };
}
