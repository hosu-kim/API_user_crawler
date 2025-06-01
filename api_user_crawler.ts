const BASE_URL: string = 'https://api.socialplatform.com/users';
const MAX_USERS_PER_CALL: number = 200;
let totalApiCalls: number = 0;

interface User {
	[key: string]: any;
}

interface ApiResponseData {
	"totalInRange": number;
	"countReturned": number;
	"users": User[];
}

async function fetchResponseData(minId: number, maxId: number): Promise<ApiResponseData> {
	const url: string = `${ BASE_URL }?minId=${ minId }&maxId=${ maxId }`;

	const response: Response = await fetch(url);
	totalApiCalls++;
	if (!response.ok) {
		throw new Error(`Failed to fetch response data. HTTP status: ${ response.status }`);
	}
	return response.json() as Promise<ApiResponseData>;
}

async function getTotalUserdata(minId: number): Promise<User[]> {
	const totalUsers: User[] = [];
	let currentMinId = minId;
	let keepFetching = true;

	while (keepFetching) {
		const currentMaxId = currentMinId + MAX_USERS_PER_CALL - 1;
		try {
			const responseData = await fetchResponseData(currentMinId, currentMaxId);
			totalUsers.push(...responseData.users);

			if (responseData.countReturned < MAX_USERS_PER_CALL) {
				keepFetching = false;
			} else {
				currentMinId = currentMaxId + 1;
			}
		} catch (error) {
			console.error(`Error fetching users from minId ${ currentMinId } to ${ currentMaxId }: ${ error }`);
			keepFetching = false;
			throw error;
		}
	}
	return totalUsers;
}

async function main() {
	try {
		console.log('Fetching all users...');
		const users: User[] = await getTotalUserdata(1);

		console.log(`Successfully fetched ${ users.length } users`);
		console.log(`Total API calls made: ${ totalApiCalls }`);
	} catch (error) {
		console.error(`Error occurred: ${ error }`);
	}
}

main();
