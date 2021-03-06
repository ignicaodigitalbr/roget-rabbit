const helpers = require('./helpers');

const Module = {};

Module.consume = (options, channel, callback) => {
  const { queue } = options;

  return channel.consume(queue.name, async (receivedMessage) => {
    try {
      const message = helpers.bufferToJson(receivedMessage.content);

      await Promise.resolve(callback(message));

      channel.ack(receivedMessage);

      helpers.log('info', 'message was consumed', Object.assign({}, options, { message }));
    } catch (error) {
      helpers.log('error', error.message, options);

      channel.reject(receivedMessage);
    }

    return receivedMessage;
  });
};

module.exports = Module;
