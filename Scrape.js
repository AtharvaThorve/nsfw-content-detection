const request = require("request");
const cheerio = require("cheerio");
const toxicity = require("@tensorflow-models/toxicity");

const checkURL = (req, resp) => {
  console.log(req.body.url);
  request(req.body.url, async function (err, res, body) {
    const tweets = [];
    const values = [];
    if (err) {
      console.log(err);
    } else {
      let $ = cheerio.load(body); //loading of complete HTML body
      $("li.stream-item").each(function (index) {
        const text = $(this).find("p.tweet-text").text();
        const name = $(this).find(".fullname").text();
        console.log("user : " + name); //name of the user
        console.log("tweet : " + text); //tweet content
        tweets.push(text);
        const value = { user: name, tweet: text, labels: [] };
        values.push(value);
        console.log("===========================");
        return index < 4;
      });
    }
    try {
      const model = await toxicity.load();
      const predictions = await model.classify(tweets);
      for (let i = 0; i < predictions.length; i++) {
        for (let j = 0; j < predictions[i].results.length; j++) {
          if (predictions[i].results[j].match) {
            const value = values[j];
            value.labels.push(predictions[i].label);
            values[j] = value;
          }
        }
      }
      console.log(values);
      resp.status(200).send({ values: values });
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = {
  checkURL,
};
