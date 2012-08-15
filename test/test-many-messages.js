// Test sending lots of messages.
require('./harness');

var recvCount = 0;
var body = new Buffer(100 * 1024);
var numMessages = 100000;

connection.addListener('ready', function () {
  puts("connected to " + connection.serverProperties.product);

  connection.exchange('node-simple-fanout', {type: 'fanout'}, function(exchange) {
      connection.queue('node-simple-queue', function(q) {
        q.bind(exchange, "*");
        q.on('queueBindOk', function() {
          q.on('basicConsumeOk', function () {

            puts("publishing messages");
            for (var i = 0; i < numMessages; i++) {
                exchange.publish("message.text", { num : i });
            }

            setTimeout(function () {
              // wait one second to receive the message, then quit
              connection.end();
            }, 1000);
          });

          q.subscribeRaw(function (m) {
            if (m.deliveryTag % 1000 === 0) {
                puts("--- Message (" + m.deliveryTag + ", '" + m.routingKey + "') ---");
            }
            recvCount++;
            m.acknowledge();
          });
        });
      });
  });
});


process.addListener('exit', function () {
  assert.equal(numMessages, recvCount);
});
