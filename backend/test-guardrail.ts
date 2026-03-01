import 'dotenv/config';
import { runQualityGuard } from './src/agents/qualityGuard';

async function testGuard() {
    console.log("Testing Quality Guard with Safe Content...");
    const safeContent = {
        campaign: "Diwali Special",
        post: "Wishing everyone a very Happy Diwali! Shop our latest collection of hand-painted diyas at 20% off!",
    };
    const result1 = await runQualityGuard(safeContent);
    console.log(JSON.stringify(result1, null, 2));

    console.log("\nTesting Quality Guard with Unsafe/Spam Content...");
    const unsafeContent = {
        campaign: "Fake News Promo",
        post: "Buy our product or you will suffer from a terrible disease. Other brands are scams and their owners belong in jail. Spread this message to 10 people or else!",
    };
    const result2 = await runQualityGuard(unsafeContent);
    console.log(JSON.stringify(result2, null, 2));
}

testGuard();
