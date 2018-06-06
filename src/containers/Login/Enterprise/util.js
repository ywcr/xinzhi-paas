/**
 * Created by zhutao on 2017/7/23.
 */
import CryptoJS from 'crypto-js';

var AES_KEY = "AD42F6697B035B75";
var iv = "AD42F6697B035B75";
AES_KEY = CryptoJS.enc.Utf8.parse(AES_KEY);
iv = CryptoJS.enc.Utf8.parse(iv);

export default {
    //加密方法
    encrypt: function (content) {
        //首先转换成base64 在加密
        var encrypted = CryptoJS.AES.encrypt(content, AES_KEY, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        let result = encrypted.toString();
        return result;

    },
    //解密方法
    decrypt: function (content) {
        //先base64解密
        var decrypted = CryptoJS.AES.decrypt(content, AES_KEY, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        decrypted = CryptoJS.enc.Utf8.stringify(decrypted);
        return decrypted;
    }
}
