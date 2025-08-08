import * as OTPAuth from "otpauth";
import fs from 'fs'
import decodeQRCodes from './readQRCodes.js'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseObject(object) {
    return {
        issuer: object.issuer,
        label: object.name,
        algorithm: object.algorithm,
        digits: object.digits,
        period: 30,
        secret: object.secret
    };
}

async function getAndLogCode(mfaName = "all", readFromFile = 0) {
    let codes = ""

    if(readFromFile){
        codes = fs.readFileSync(join(__dirname, "codes.json"), "utf8");
        codes = JSON.parse(codes)
    }

    else{
        codes = await decodeQRCodes()
    }

    if(mfaName !== "all"){
        const searchedCode = codes.find(code => code.name.includes(mfaName))
        const transformed = parseObject(searchedCode)
        const otp = new OTPAuth.TOTP(transformed)

        let token = otp.generate();
        console.log(token);
    }

    else {
        const result = {};
        codes.forEach(code => {
            const transformed = parseObject(code);
            const otp = new OTPAuth.TOTP(transformed);
            let token = otp.generate();
            result[transformed.label] = { token };
        });
        console.table(result);
    }
}

const mfaName = process.argv[2];
const readFromFile = parseInt(process.argv[3]);

if(process.argv.length === 2 || process.argv.length === 3){
    getAndLogCode(process.argv[2])
}
else{
    const mfaName = process.argv[3];
    const readFromFile = parseInt(process.argv[2]);
    getAndLogCode(mfaName, readFromFile)
}

