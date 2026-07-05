const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const { log } = require("console");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  fs.readdir(`./files`, function (err, files) {
      console.log(err);
    if (err) return res.status(500).send("Internal Server Error");

    const notes = files.map(function (file) {
      const content = fs.readFileSync(`./files/${file}`, "utf-8");
      return {
        filename: file,
        title: file.replace(".txt", "").split("-").join(" "),
        description: content,
      };
    });

    res.render("index", { files: notes });
  });
});

app.get("/files/:filename", function (req, res) {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "files", filename); 
  fs.readFile(filepath, "utf-8", function (err, data) {
    if (err) return res.status(404).send("File not found");
    res.render("show", 
        { file: 
            { 
                filename: filename, 
                title: filename.replace(".txt", "").split("-").join(" "),
                description: data 
            } 
        });
  });
});

app.post("/create", function (req, res) {
  fs.writeFile(
    `./files/${req.body.title.split(" ").join("-")}.txt`,
    req.body.description,
    function (err) {
      if (err) {
        console.error("Error creating file:", err);
        return res.status(500).send("Internal Server Error");
      }
      res.redirect("/");
    },
  );
});

app.post("/delete/:filename", function (req, res) {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "files", filename);

  fs.unlink(filepath, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Unable to delete file");
    }

    res.redirect("/");
  });
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
