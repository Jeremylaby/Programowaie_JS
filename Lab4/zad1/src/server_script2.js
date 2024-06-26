/**
 * @author Stanisław Barycki <barycki@agh.edu.pl>
 */
import http from "node:http";
import { URL } from "node:url";
import fs from "node:fs";
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

function requestListener(request, response) {
  console.log("--------------------------------------");
  console.log(`The relative URL of the current request: ${request.url}`);
  console.log(`Access method: ${request.method}`);
  console.log("--------------------------------------");

  const url = new URL(request.url, `http://${request.headers.host}`);

  switch ([request.method, url.pathname].join(" ")) {
    case "GET /":
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
      response.end();
      break;
    case "GET /submit":
      response.end();
      break;
  }
}
const server = http.createServer(requestListener); // The 'requestListener' function is defined above
server.listen(8000);
console.log("The server was started on port 8000");
console.log('To stop the server, press "CTRL + C"');
