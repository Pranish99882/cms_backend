const { Client } = require('@elastic/elasticsearch');

// Create a client instance
export const client = new Client({
  node: 'https://localhost:9200', // Replace with your Elasticsearch node URL
  auth: {
    username: 'elastic', // Replace with your Elasticsearch username
    password: 'BD0wY*6saeWSdorUp3*O' // Replace with your Elasticsearch password
  },
  tls:{
    rejectUnauthorized:false
  }
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