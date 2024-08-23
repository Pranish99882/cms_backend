import { User } from '../entities/User';
import { client } from '../elasticsearchclient';

export const indexUsersToElasticsearch = async (users: User[]) => {
    const bulkOperations = users.flatMap((user) => [
        {
            index: { _index: 'users', _id: user.id },
        },
        {
            id: user.id,
            username: user.username,
            email: user.email,
            roleNames: user.roleNames,
            permissionNames: user.permissionNames,
        },
    ]);

    await client.bulk({ refresh: true, body: bulkOperations });

    console.log('Users have been indexed into Elasticsearch!');
};
