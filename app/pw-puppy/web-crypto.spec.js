import {webCrypto} from './web-crypto';

describe("webCrypto", function () {
    var key; 
    beforeEach(function(done){
        webCrypto.generateKeyFromPassword("password")
        .then(function(cryptoKey){
           key = cryptoKey;
           done();
        });
    });
    it("encrypts and decrypts", function (done) {
        var message = "classified";
        webCrypto.encryptContent(key, message)
            .then(function(encryptedEnvelope){
               webCrypto.decryptContent(key, encryptedEnvelope)
                .then(function(decryptedMessage){
                    expect(decryptedMessage).toEqual(message);
                    done();
                });
            });
    });
    it("decrypts version 1 of the envelope", function(done){
        var v1Envelope = {
                ver : 1, 
                iv : "ºvF)5I7êî7UÕDB", 
                cta : "on¸[j0lñ»Þ¥¡hJ"
            },
            expected = "hello there";
        webCrypto.decryptContent(key, v1Envelope)
            .then(function(decryptedMessage){
                expect(decryptedMessage).toEqual(expected);
                done();
            });
    });
});
