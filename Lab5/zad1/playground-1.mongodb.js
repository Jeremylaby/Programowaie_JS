use("AGH")
db.students.insertMany([
  { fname: "Stanisław", lname: "Barycki", faculty: "WI" },
  { fname: "Grzegorz", lname: "Barycki", faculty: "WI" },
  { fname: "Michał", lname: "Barycki", faculty: "WI" },
  { fname: "Anna", lname: "Nowak", faculty: "WIET" },
  { fname: "Joanna", lname: "Nowak", faculty: "WIET" },
  { fname: "Weronika", lname: "Nowak", faculty: "WIET" },
  { fname: "Jan", lname: "Kowalski", faculty: "WMS" },
  { fname: "Andrzej", lname: "Kowalski", faculty: "WMS" },
  { fname: "Aleksander", lname: "Kowalski", faculty: "WMS" }
]);
db.students.find({faculty:"WI"})