use("CarShop");
db.Clients.insertMany([
  {
    username: "Stanisław Barycki",
    purchasedProducts: [],
    borrowedProducts: [],
    totalMoney: 0,
  },
  {
    username: "Grzegorz Barycki",
    purchasedProducts: [],
    borrowedProducts: [],
    totalMoney: 0,
  },
  {
    username: "Paweł2137",
    purchasedProducts: [],
    borrowedProducts: [],
    totalMoney: 0,
  },
  {
    username: "Moniczka123",
    purchasedProducts: [],
    borrowedProducts: [],
    totalMoney: 0,
  },
]);
db.Products.insertMany([
  {
    model: "BMW-I4",
    type: "car",
    engine: "petrol",
    transmission: "automatic",
    src: "/img/BMW%20i4.jpg",
    price: 4500,
    quantity: 10,
  },
  {
    model: "Skoda-Superb",
    type: "car",
    engine: "petrol",
    transmission: "automatic",
    src: "/img/skoda.jpg",
    price: 5000,
    quantity: 18,
  },
  {
    model: "Przyczepa",
    type: "trailer",
    src: "/img/przyczepa.jpg",
    price: 1000,
    quantity: 5,
  },
  {
    model: "Przyczepa-z-plandeka",
    type: "trailer",
    src: "/img/przyczepa-z-plandeką.jpg",
    price: 2000,
    quantity: 10,
  },
]);
db.BorrowItems.insertMany([
  {
    model: "BMW-I4",
    type: "car",
    engine: "petrol",
    transmission: "automatic",
    src: "img/BMW%20i4.jpg",
    all: 40,
    borrowed: 6,
  },
  {
    model: "Skoda-Superb",
    type: "car",
    engine: "petrol",
    transmission: "automatic",
    src: "img/skoda.jpg",
    all: 10,
    borrowed: 0,
  },
  {
    model: "Przyczepa",
    type: "trailer",
    src: "img/przyczepa.jpg",
    all: 5,
    borrowed: 0,
  },
  {
    model: "Przyczepa-z-plandeka",
    type: "trailer",
    src: "img/przyczepa-z-plandeką.jpg",
    all: 6,
    borrowed: 0,
  },
]);
