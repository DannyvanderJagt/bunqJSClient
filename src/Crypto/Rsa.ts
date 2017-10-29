const forge = require("./CustomForge");
import * as awaiting from "awaiting";
import KeyPair from "../Types/Keypair";

const forgeRsa = forge.rsa;
const forgePki = forge.pki;
const forgeCipher = forge.cipher;
const forgeUtil = forge.util;

/**
 * Generates a new keypair
 * @param {number} bits
 * @param {number} workers
 * @returns {Promise<object>}
 */
export const createKeyPair = async (
    bits: number = 2048,
    workers: number = -1
) => {
    return awaiting.callback(forgeRsa.generateKeyPair, {
        bits: bits,
        workers: workers
    });
};

/**
 * @param {KeyPair} keypair
 * @returns {Promise<{publicKey: any; privateKey: any}>}
 */
export const keyPairToPem = async (keypair: KeyPair) => {
    return {
        publicKey: await publicKeyToPem(keypair.publicKey),
        privateKey: await privateKeyToPem(keypair.privateKey)
    };
};

/**
 * @param {string} publicKey
 * @returns {Promise<any>}
 */
export const publicKeyToPem = async (publicKey: any) => {
    return forgePki.publicKeyToPem(publicKey);
};

/**
 * @param {string} privateKey
 * @returns {Promise<any>}
 */
export const privateKeyToPem = async (privateKey: any) => {
    return forgePki.privateKeyToPem(privateKey);
};

/**
 * @param {string} privateKeyPem
 * @returns {Promise<string>}
 */
export const publicKeyFromPem = async (privateKeyPem: string) => {
    return forgePki.publicKeyFromPem(privateKeyPem);
};
/**
 * @param {string} privateKeyPem
 * @returns {Promise<string>}
 */
export const privateKeyFromPem = async (privateKeyPem: string) => {
    return forgePki.privateKeyFromPem(privateKeyPem);
};

/**
 * Encrypt a string with a pre-defined encryption key
 * @param string
 * @param encryptionKey
 * @returns {Promise.<{iv: string, encryptedString: string}>}
 */
export const encryptString = async (string, encryptionKey) => {
    // create a random initialization vector
    const iv = forge.random.getBytesSync(16);
    // turn hex-encoded key into bytes
    const encryptionKeyBytes = forgeUtil.hexToBytes(encryptionKey);
    // create a new aes-cbc cipher with our key
    const cipher = forgeCipher.createCipher("AES-CBC", encryptionKeyBytes);
    // turn our string into a buffer
    const buffer = forgeUtil.createBuffer(string, "utf8");

    cipher.start({ iv: iv });
    cipher.update(buffer);
    cipher.finish();

    return {
        iv: forgeUtil.bytesToHex(iv),
        key: encryptionKey,
        encryptedString: cipher.output.toHex()
    };
};

/**
 * Decrypts a string using the key and iv
 * @param encryptedString
 * @param key
 * @param iv
 * @returns {Promise.<String>}
 */
export const decryptString = async (encryptedString, key, iv) => {
    // get byte data from hex encoded strings
    const encrypedBytes = forgeUtil.hexToBytes(encryptedString);
    // create a new forge buffer using the bytes
    const encryptedBuffer = forgeUtil.createBuffer(encrypedBytes, "raw");
    const keyBytes = forgeUtil.hexToBytes(key);
    const ivBytes = forgeUtil.hexToBytes(iv);

    // create a new decipher with our key and iv
    const decipher = forgeCipher.createDecipher("AES-CBC", keyBytes);
    decipher.start({ iv: ivBytes });
    decipher.update(encryptedBuffer);

    // check the decipher results
    const result = decipher.finish();
    if (!result) {
        throw new Error("Failed to decrypt string");
    }
    // get the raw bytes from the forge buffer
    const outputBytes = decipher.output.getBytes();

    // turn forge bytes into a regular buffer
    const nodeBuffer = new Buffer(outputBytes, "binary");

    // return the result as an utf8-encoded string
    return nodeBuffer.toString("utf8");
};
