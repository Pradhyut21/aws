import 'dotenv/config';
import { invokeNovaOmni, invokeNovaReel, invokeNovaSonic, generateTitanImage, invokeNovaPro } from './src/services/bedrock';

async function testAll() {
    console.log("Testing Bedrock Models...");
    const results: Record<string, string> = {};

    try {
        console.log("\\n1. Testing Nova Pro...");
        await invokeNovaPro("Say 'Nova Pro OK!'");
        results.NovaPro = "✅ OK";
    } catch (e: any) {
        results.NovaPro = "❌ " + e.message;
    }

    try {
        console.log("2. Testing Nova Omni...");
        await invokeNovaOmni("Say 'Nova Omni OK!'", 50);
        results.NovaOmni = "✅ OK";
    } catch (e: any) {
        results.NovaOmni = "❌ " + e.message;
    }

    try {
        console.log("3. Testing Nova Reel...");
        await invokeNovaReel("Create a 2-second video script.", 50);
        results.NovaReel = "✅ OK";
    } catch (e: any) {
        results.NovaReel = "❌ " + e.message;
    }

    try {
        console.log("4. Testing Nova Sonic...");
        await invokeNovaSonic("Say 'Nova Sonic OK!'", 50);
        results.NovaSonic = "✅ OK";
    } catch (e: any) {
        results.NovaSonic = "❌ " + e.message;
    }

    try {
        console.log("5. Testing Titan Image Generator...");
        await generateTitanImage("A simple red circle.", 512, 512);
        results.TitanImage = "✅ OK";
    } catch (e: any) {
        results.TitanImage = "❌ " + e.message;
    }

    console.log("\\n--- TEST RESULTS ---");
    console.table(results);
}

testAll();
