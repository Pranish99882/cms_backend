import amqp from 'amqplib';
import { config } from '../backend/src/config/config';

const QUEUE = 'myQueue';

let channel: amqp.Channel;

export async function connectRabbitMQ() {
    try {
        const rabbitmqUrl = `amqp://${config.rabbitmq.user}:${config.rabbitmq.password}@${config.rabbitmq.host}:${config.rabbitmq.port}`;
        const connection = await amqp.connect(rabbitmqUrl);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE, { durable: false });
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

export function getChannel() {
    if (!channel) {
        throw new Error('RabbitMQ channel is not initialized');
    }
    return channel;
}
