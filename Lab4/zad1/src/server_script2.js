import http from "node:http";
import { URL } from "node:url";
import fs from "node:fs";
import { argv } from "node:process";
const GUEST_LIST="guest_list.txt"
/**
 * Handles incoming requests.
 *
 * @param {IncomingMessage} request - Input stream — contains data received from the browser, e.g,. encoded contents of HTML form fields.
 * @param {ServerResponse} response - Output stream — put in it data that you want to send back to the browser.
 * The answer sent by this stream must consist of two parts: the header and the body.
 * <ul>
 *  <li>The header contains, among others, information about the type (MIME) of data contained in the body.
 *  <li>The body contains the correct data, e.g. a form definition.
 * </ul>
 * @author Stanisław Polak <polak@agh.edu.pl>
 */

function requestListener(request, response) {
  console.log("--------------------------------------");
  console.log(`The relative URL of the current request: ${request.url}`);
  console.log(`Access method: ${request.method}`);
  console.log("--------------------------------------");
  // Create the URL object
  const url = new URL(request.url, `http://${request.headers.host}`);
  /* ************************************************** */
  // if (!request.headers['user-agent'])
  if (url.pathname !== "/favicon.ico")
    // View detailed URL information
    console.log(url);

  /* *************** */
  /* "Routes" / APIs */
  /* *************** */

  switch ([request.method, url.pathname].join(" ")) {
    /* 
          -------------------------------------------------------
          Generating the form if 
             the GET method was used to send data to the server
          and 
             the relative URL is '/', 
          ------------------------------------------------------- 
        */
    case "GET /":

      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      let list = fs.readFileSync(GUEST_LIST).toString();
      response.write(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bootstrap demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <main class="ms-3 me-3">
      ${list}
    <hr>
      <h2>Nowy wpis</h2>
      <form  method="GET" action="/submit">
        <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">Twoje imie i nazwisko</label>
            <input type="text" name="name" class="form-control" id="exampleFormControlInput1" placeholder="Jan Kowalski">
        </div>
        <div class="mb-3">
            <label for="exampleFormControlTextarea1" class="form-label">Treść wpisu</label>
            <textarea name="description" class="form-control" id="exampleFormControlTextarea1" placeholder="Napiszco tylko zapragniesz pamiętaj o kulturze" rows="3"></textarea>
        </div>
        <button type="submit"  class="btn btn-warning">Warning</button>
      </form>
    </main>
  </body>
</html>`);
      /* ************************************************** */
      response.end(); // The end of the response — send it to the browser
      break;
    case "GET /submit":
        const htmlContent = `
                <h2>${url.searchParams.get("name")}</h2>
                <div>${url.searchParams.get("description")}</div>`;
        fs.appendFile(GUEST_LIST, htmlContent, (err) => {
          if (err) {
            console.error("Błąd podczas dopisywania do pliku:", err);
            return;
          }
          console.log("Nowe dane zostały dodane do pliku pomyślnie.");
        });
        response.writeHead(302, { Location: "/" });
        response.end();
      break;
  }
}
const server = http.createServer(requestListener); // The 'requestListener' function is defined above
server.listen(8000);
console.log("The server was started on port 8000");
console.log('To stop the server, press "CTRL + C"');