// // config.ts

// import * as dotenv from 'dotenv';

// dotenv.config();

// interface Config {
//     mysql: {
//         host: string;
//         port: number;
//         username: string;
//         password: string;
//         database: string;
//     };
//     redis: {
//         url: string;
//     };
//     mongo: {
//         uri: string;
//         dbName: string;
//     };
//     elasticsearch: {
//         host: string;
//         username: string;
//         password: string;
//     };
// }

// export const config: Config = {
//     mysql: {
//         host: process.env.MYSQL_HOST || 'localhost',
//         port: parseInt(process.env.MYSQL_PORT || '3306', 10),
//         username: process.env.MYSQL_USERNAME || 'root',
//         password: process.env.MYSQL_PASSWORD || '',
//         database: process.env.MYSQL_DATABASE || '',
//     },
//     redis: {
//         url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
//     },
//     mongo: {
//         uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
//         dbName: process.env.MONGO_DB_NAME || '',
//     },
//     elasticsearch: {
//         host: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200',
//         username: process.env.ELASTICSEARCH_USERNAME || '',
//         password: process.env.ELASTICSEARCH_PASSWORD || '',
//     },
// };

import * as dotenv from 'dotenv';

dotenv.config();

interface Config {
    mysql: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    redis: {
        url: string;
    };
    mongo: {
        uri: string;
        dbName: string;
    };
    elasticsearch: {
        host: string;
        username: string;
        password: string;
    };
    rabbitmq: {
        host: string;
        port: number;
        user: string;
        password: string;
    };
}

export const config: Config = {
    mysql: {
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306', 10),
        username: process.env.MYSQL_USERNAME || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || '',
    },
    redis: {
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
    },
    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
        dbName: process.env.MONGO_DB_NAME || '',
    },
    elasticsearch: {
        host: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200',
        username: process.env.ELASTICSEARCH_USERNAME || '',
        password: process.env.ELASTICSEARCH_PASSWORD || '',
    },
    rabbitmq: {
        host: process.env.RABBITMQ_HOST || 'localhost',
        port: Number(process.env.RABBITMQ_PORT) || 5672,
        user: process.env.RABBITMQ_USER || 'guest',
        password: process.env.RABBITMQ_PASSWORD || 'guest',
    },
};
