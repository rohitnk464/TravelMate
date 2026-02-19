const fs = require('fs');
// const fetch = require('node-fetch'); // Use built-in fetch

async function testAgentAPI() {
    const output = [];
    const log = (msg) => {
        console.log(msg);
        output.push(msg);
    };

    log("Testing Agent API at http://localhost:3000/api/agent...");
    try {
        const response = await fetch('http://localhost:3000/api/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'find food in bangalore', location: 'Bangalore' })
        });

        const data = await response.json();
        log("Response Status: " + response.status);
        log("Response Data: " + JSON.stringify(data, null, 2));
    } catch (error) {
        log("Test Failed: " + error);
    }

    fs.writeFileSync('verify_agent_output.txt', output.join('\n'));
}

testAgentAPI();
