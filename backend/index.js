const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 4000;
const withPuppeteer = require("./withPuppeteer");
// const withSerpApi = require("./withSerpApi");

app.use(cors());
app.use(express.json());

// app.get('/search', (req, res) => {
// 	const {searchFilter} = req.query;
// 	withPuppeteer.getLocalPlacesInfo(searchFilter).then((result) => console.dir(result, { depth: null }));
// })

app.get("/", (req, res) => {
  res.send("Backend working ")
})

app.get("/search", (req, res) => {
  const { searchFilter } = req.query;
  withPuppeteer
    .getLocalPlacesInfo(searchFilter)
    .then((result) => {
      console.log("Get the response")
      res.json(result); // Send the result as JSON response
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "An error occurred" }); // Send an error response if there's an error
    });
});

app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
