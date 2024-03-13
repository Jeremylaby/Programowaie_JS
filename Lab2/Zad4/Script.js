let request = indexedDB.open("myDatabase", 1);

request.onupgradeneeded = function(event) {
    let db = event.target.result;
    let objectStore = db.createObjectStore("myObjectStore", { keyPath: "id" });
    objectStore.createIndex("nameIndex", "name", { unique: false });
};

request.onsuccess = function(event) {
    let db = event.target.result;
    console.log("wszystko git")
    let objectStore = db.createObjectStore("pojazdy");
    objectStore.createIndex("/", "name", { unique: false });
    // Database opened successfully
};

request.onerror = function(event) {
    // Error occurred while opening the database
};
