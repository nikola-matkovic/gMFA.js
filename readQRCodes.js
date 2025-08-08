import {Jimp} from 'jimp';
import jsQR from 'jsqr';
import fs from 'fs'
import parser from "otpauth-migration-parser"
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function decodeQRCodes() {

    let images = fs.readdirSync(join(__dirname, "qrcodes"))
    images = images.map(image => join(__dirname, "qrcodes", image))

    let data = []

    for (const imagePath of images) {
        const image = await Jimp.read(imagePath);

        const imageData = {
            data: new Uint8ClampedArray(image.bitmap.data),
            width: image.bitmap.width,
            height: image.bitmap.height,
        };

        const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);

        if (decodedQR) {
            data.push(decodedQR.data)
        }
    }

    data = data.map((string, index) => {
        if(index === 0){
            return string
        }

        return string.replace("otpauth-migration://offline?data=", "")
    })

    data = data.join("");

    const parsedDataList = await parser(data);

    fs.writeFileSync(join(__dirname, "codes.json"), JSON.stringify(parsedDataList, null, 4))
    return parsedDataList;
}
