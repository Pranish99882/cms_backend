// const { Client } = require("@elastic/elasticsearch");
import { Client } from '@elastic/elasticsearch';

export const client = new Client({
    node: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200', // Use environment variable or default
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic', // Use environment variable or default
        password: process.env.ELASTICSEARCH_PASSWORD || 'BD0wY*6saeWSdorUp3*O', // Use environment variable or default
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
