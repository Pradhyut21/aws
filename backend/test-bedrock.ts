import 'dotenv/config';
import { invokeNovaPro } from './src/services/bedrock';

async function test() {
    console.log("Testing Bedrock connection via invokeNovaPro...");
    try {
        const result = await invokeNovaPro("Please say exactly 'Hello, AWS Bedrock is connected!' and nothing else.");
        console.log("\n--- SUCCESS! Response from Bedrock ---");
        console.log(result);
        console.log("--------------------------------------\n");
    } catch (e) {
        console.error("\n--- FAILED to connect or invoke model ---");
        console.error(e);
        console.error("-----------------------------------------\n");
    }
}

test();
