import request from 'request-promise-native';
import { Item } from '../modals/itemSchema';
interface ExternalApiResponse {
    code: string;
    total ?: number;
    offset?: number;
    items ?: Item[];
}

// Function to fetch item from the external UPC API
export default async function fetchItemFromExternalApi(upcCode: string): Promise<ExternalApiResponse> {
    try {
        const options = {
            uri: 'https://api.upcitemdb.com/prod/trial/lookup',
            headers: {
                "Content-Type": "application/json",
            },
            gzip: true,
            body: { upc: upcCode },
            json: true, // Ensures the response is automatically parsed as JSON
        };

        const body = await request.post(options);
        return body as ExternalApiResponse; // Type assertion for type safety
    } catch (error) {
        throw new Error(`Error occurred during the external API request: ${(error as Error).message}`);
    }
}
