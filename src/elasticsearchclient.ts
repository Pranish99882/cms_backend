// const { Client } = require("@elastic/elasticsearch");
import { Client } from '@elastic/elasticsearch';

import { config } from './config/config';

export const client = new Client({
    node: config.elasticsearch.host || 'http://localhost:9200', // Use environment variable or default
    auth: {
        username: config.elasticsearch.username || 'elastic', // Use environment variable or default
        password: config.elasticsearch.password || 'BD0wY*6saeWSdorUp3*O', // Use environment variable or default
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// async function createIndex() {
//     try {
//       await client.indices.create({
//         index: 'users',
//         body: {
//           mappings: {
//             properties: {
//               username: { type: 'text' },
//               email: { type: 'text' },
//               roleNames: { type: 'text' },
//             },
//           },
//         },
//       });

//       console.log('Index created successfully');
//     } catch (error: any) {
//       if (error.meta && error.meta.body) {
//         console.error('Error creating index:', error.meta.body);
//       } else {
//         console.error('Error creating index:', error);
//       }
//     }
//   }

async function checkElasticsearchConnection() {
    try {
        await client.ping();
        console.log('Elasticsearch connection successful');
    } catch (error: any) {
        if (error.meta && error.meta.body) {
            console.error('Elasticsearch connection error:', error.meta.body);
        } else {
            console.error('Elasticsearch connection error:', error);
        }
    }
}

checkElasticsearchConnection();

//   createIndex();
