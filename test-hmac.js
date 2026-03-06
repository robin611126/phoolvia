const requestBody = {
    cart_data: {
        items: [{ variant_id: "1244539923890450", quantity: 1 }]
    },
    redirect_url: "https://test-checkout.requestcatcher.com/test?key=val",
    timestamp: "2023-12-29T12:06:33.085563Z"
};

const shiprocketBodyStr = JSON.stringify(requestBody);
const secretKey = 'C3TMxIORicQUmJ70OYFCSqlXxTO1tADvFItwGp0kE60='; // random dummy

async function testHMAC() {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const bodyData = encoder.encode(shiprocketBodyStr);
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, bodyData);

    // Convert to Base64
    const uint8Array = new Uint8Array(signature);
    let binaryString = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    const hmacBase64 = btoa(binaryString);
    console.log("WebCrypto:", hmacBase64);

    // Node crypto check
    const cryptoNode = await import('crypto');
    const hmacNode = cryptoNode.createHmac('sha256', secretKey).update(shiprocketBodyStr).digest('base64');
    console.log("NodeCrypto:", hmacNode);
}

testHMAC();
