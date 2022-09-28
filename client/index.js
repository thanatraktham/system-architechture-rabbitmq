const client = require("./client");

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  client.getAllMenu(null, (err, data) => {
    if (!err) {
      res.render("menu", {
        results: data.menu,
      });
    }
  });
});

var amqp = require("amqplib/callback_api");

app.post("/placeorder", (req, res) => {
  var orderItem = {
    id: req.body.id,
    name: req.body.name,
    quantity: req.body.quantity,
  };

  function getType(dishName) {
    if (dishName === "Neaw Kai" || dishName === "Somtam") return "thaiDishes";
    else if (dishName === "Ice Cream" || dishName === "Bingsoo")
      return "desserts";
    else if (dishName === "Coffee" || dishName === "Tea") return "drinks";
    else if (dishName === "Pizza" || dishName === "Pasta")
      return "italianDishes";
  }

  // Send the order msg to RabbitMQ
  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      const exchange = "";
      const routingKey = getType(orderItem.name);
      channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(orderItem)),
        { persistent: true }
      );
      console.log(" [x] Sent '%s'", orderItem);
    });
  });

  res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running at port %d", PORT);
});
