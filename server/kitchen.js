#!/usr/bin/env node

var amqp = require("amqplib/callback_api");

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    queue = ["thaiDishes", "desserts", "drinks", "italianDishes"];
    queue.forEach((type) => {
      channel.assertQueue(type, {
        durable: true,
      });
    });
    channel.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C");
    queue.forEach((type) => {
      channel.consume(
        type,
        function (msg) {
          var secs = msg.content.toString().split(".").length - 1;
          console.log(" [x] Received " + type);
          console.log(JSON.parse(msg.content));

          setTimeout(function () {
            console.log(" [x] Done");
            channel.ack(msg);
          }, secs * 1000);
        },
        {
          noAck: false,
        }
      );
    });
  });
});
