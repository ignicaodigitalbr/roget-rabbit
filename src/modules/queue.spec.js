const { sendToQueue } = require('./queue');
const helpers = require('./helpers');

describe('modules/queue', () => {
  describe('sendToQueue', () => {
    let options;
    let channel;

    beforeEach(() => {
      options = {
        queue: {
          name: 'queue.name',
        },
        message: {
          message: true,
        },
      };

      channel = {
        sendToQueue: jest.fn(),
      };
    });

    test('call channel.sendToQueue', () => {
      sendToQueue(options, channel);

      expect(channel.sendToQueue).toHaveBeenCalledWith('queue.name', helpers.jsonToBuffer({ message: true }), {}, expect.any(Function));
    });

    describe('when message was sent to queue', () => {
      let sentMessage;

      beforeEach((done) => {
        channel.sendToQueue = (queueName, message, sendOptions, callback) => callback();

        jest.spyOn(helpers, 'log').mockImplementation(() => {});

        sendToQueue(options, channel).then((message) => {
          sentMessage = message;

          done();
        });
      });

      test('log that the message was published', () => {
        expect(helpers.log).toHaveBeenCalledWith('info', 'message is published', options);
      });

      test('return the message', () => {
        expect(sentMessage).toEqual({ message: true });
      });
    });

    describe('when message can not be sent to queue', () => {
      let errorMessage;

      beforeEach((done) => {
        channel.sendToQueue = (queueName, message, sendOptions, callback) => callback({ message: 'failed' });

        sendToQueue(options, channel).catch((error) => {
          errorMessage = error.message;

          done();
        });
      });

      test('log that the message was not published', () => {
        expect(helpers.log).toHaveBeenCalledWith('error', errorMessage, options);
      });
    });
  });
});
