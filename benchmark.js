const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:4000/api';
const ITERATIONS = 50;

async function measureRequest(name, requestFn) {
    let successCount = 0;
    let errorCount = 0;
    const latencies = [];

    console.log(`\nRunning benchmark for: ${name} (${ITERATIONS} iterations)`);

    for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        try {
            const res = await requestFn(i);

            // Consume the body fully to free up memory/connection
            const text = await res.text();

            if (res.ok) {
                successCount++;
            } else {
                errorCount++;
                if (i === 0) console.error(`Error ${res.status}: ${text}`);
            }
        } catch (e) {
            errorCount++;
            if (i === 0) console.error(`Network Error: ${e.message}`);
        }
        const end = performance.now();
        latencies.push(end - start);
    }

    // Calculate stats
    latencies.sort((a, b) => a - b);
    const min = latencies[0];
    const max = latencies[latencies.length - 1];
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];

    console.log(`Results for ${name}:`);
    console.log(`  Success: ${successCount}, Errors: ${errorCount}`);
    console.log(`  Min: ${min.toFixed(2)}ms`);
    console.log(`  Max: ${max.toFixed(2)}ms`);
    console.log(`  Avg: ${avg.toFixed(2)}ms`);
    console.log(`  p95: ${p95.toFixed(2)}ms`);
    console.log(`  p99: ${p99.toFixed(2)}ms`);

    return { name, successCount, errorCount, min, max, avg, p95, p99 };
}

async function runBenchmarks() {
    console.log('--- BHARATMEDIA v2.0 PERFORMANCE BENCHMARK ---');
    console.log('Warming up server...');

    try {
        await fetch('http://localhost:4000/health');
    } catch (e) {
        console.error('Failed to connect to backend. Is it running on port 4000?');
        process.exit(1);
    }

    const results = [];

    // 1. Health Endpoint
    results.push(await measureRequest('Health Check (GET /health)', () => fetch('http://localhost:4000/health')));

    // 2. Signup (Rate limiting check)
    results.push(await measureRequest('Signup (POST /api/auth/signup)', (i) =>
        fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `bench_user_${Date.now()}_${i}@example.com`,
                password: 'Password123!',
                name: 'Benchmark User',
                language: 'hi' // Fix: valid language required
            })
        })
    ));

    // 3. Login
    // Create a base user first
    const email = `login_bench_${Date.now()}@example.com`;
    await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Password123!', name: 'Bench', language: 'hi' })
    });

    results.push(await measureRequest('Login (POST /api/auth/login)', () =>
        fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'Password123!' })
        })
    ));

    // Print Summary Table
    console.log('\n=== SUMMARY ===');
    console.table(results.map(r => ({
        Endpoint: r.name,
        SuccessInfo: `${r.successCount}/${ITERATIONS} (${r.errorCount} err)`,
        Avg_ms: Math.round(r.avg),
        p95_ms: Math.round(r.p95)
    })));
}

runBenchmarks().catch(console.error);
