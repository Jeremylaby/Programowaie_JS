import fs from "node:fs";
import { argv } from "node:process";
import { exec,spawn } from "child_process";

function main(){
    const mode = argv[2];
    switch(mode){
        case "--sync":
            let counter = parseInt(fs.readFileSync("counter.txt"))+1;
            console.log("Liczba uruchomień: "+counter)
            fs.writeFileSync("counter.txt", counter.toString(), "utf8");
        break;
        case '--async':

            fs.readFile("counter.txt", 'utf8',(err,data)=>{
                if(err){
                    if(fs.existsSync("counter.txt")){
                        console.error("błąd odczytu pliku")
                        return
                    }else{
                        data =0
                    }
                }
                let counter= parseInt(data)+1
                console.log("Liczba uruchomień: " + counter);
                fs.writeFile("counter.txt",counter.toString(),(err)=>{
                    if(err){
                      console.error("Błąd podczas zapisu pliku");
                      return
                    }
                })
            });
        break;
        default:
                process.stdin.on("data", (data) => {
                  const command = data.toString().trim(); // Pobieramy komendę systemową ze standardowego wejścia

                  // Wywołujemy komendę za pomocą exec
                  const childProcess = exec(
                    command,
                    (error, stdout, stderr) => {
                      if (error) {
                        console.error("Error:", error.message);
                        return;
                      }
                      if (stderr) {
                        console.error("stderr:", stderr);
                        return;
                      }
                      console.log("Output:", stdout);
                    }
                  );
                });


    }
}
main()