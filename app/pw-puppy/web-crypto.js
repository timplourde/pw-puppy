
/* global TextEncoder, TextDecoder, Promise */

var saltString = "pw-puppy salt",
    envelopeVersion = 1;

function stringToArrayBufferView(str)
{
    return (new TextEncoder("utf-8")).encode(str);
}

function arrayBufferViewToString(buffer)
{
    return (new TextDecoder("utf-8")).decode(buffer);
}

function jsonFriendlySerialize(arrayBuffer) {
    return Array.apply(null, arrayBuffer)
        .reduce(function(p, c){
            return p + String.fromCharCode(c);
        }, "");
}

function jsonFriendlyDeserialize(str){
    var arr = new Uint8Array(str.length);
    for(var i=0;i<str.length;i++){
        arr[i] = str.charCodeAt(i);
    }
    return arr;
}

function generateKeyFromPassword(password){
    var promise = new Promise(function(resolve, reject) {
        if(!password){
            reject("password is required");
        }
        window.crypto.subtle.importKey(
            "raw",
            stringToArrayBufferView(password),
            {
                name : "PBKDF2"
            },
            false,
            ["deriveKey"])
        .then(function(baseKey) {
            return window.crypto.subtle.deriveKey(
                {
                    "name": "PBKDF2",
                    "salt": stringToArrayBufferView(saltString),
                    "iterations": 1000,
                    "hash": "SHA-256"
                },
                baseKey,
                {
                    name: "AES-CBC",
                    length: 128
                },
                true,         
                ["encrypt", "decrypt"]);
        })
        .then(function(aesKey) {
            resolve(aesKey);
        })
        .catch(reject);
    });
    return promise;
}

function encryptContent(key, stringContent) {
    
    var promise = new Promise(function(resolve, reject) {
        var vector = crypto.getRandomValues(new Uint8Array(16)); 
        
        if(!stringContent){
            reject("stringContent is required");
        }

        var contentArrayBuffer = stringToArrayBufferView(stringContent);
        crypto.subtle.encrypt(
            {
                name: "AES-CBC", 
                iv: vector
            }, 
            key, 
            contentArrayBuffer)
        .then(function(result){
            var encrypted_data = new Uint8Array(result);
            resolve({
                ver: envelopeVersion,
                iv: jsonFriendlySerialize(vector),
                cta: jsonFriendlySerialize(encrypted_data)
            });
        })
        .catch(reject);
    });
    return promise;
}

function decryptContent(key, envelope) {
    var promise = new Promise(function(resolve, reject) {
        if(!envelope.iv || !envelope.cta){
            reject("iv and cta are required");
        }
        crypto.subtle.decrypt(
            {
                name: "AES-CBC", 
                iv: new Uint8Array(jsonFriendlyDeserialize(envelope.iv))
            },
            key, 
            new Uint8Array(jsonFriendlyDeserialize(envelope.cta)))
        .then(function(result){
            var decrypted_data = new Uint8Array(result);
            var decrypted_string = arrayBufferViewToString(decrypted_data);
            resolve(decrypted_string);
        })
        .catch(reject);
    });
    return promise; 
}

export var webCrypto = {
    decryptContent: decryptContent,
    encryptContent: encryptContent,
    generateKeyFromPassword: generateKeyFromPassword
};