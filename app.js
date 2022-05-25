const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { checkURL } = require("./Scrape");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static(path.join(__dirname, "./webapp/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./webapp/build"));
});

app.post("/api/scrapeURL", checkURL);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.use(express.static("webapp/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/webapp/build/index.html"));
  });
}
