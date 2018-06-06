"use strict"

const crypto = require('crypto')

/**
 * 验证签名
 * @param prestr 需要签名的字符串
 * @param sign 签名结果
 * @param key 私钥
 * return 签名结果
 */
exports.md5Verify = function(prestr, sign, key){
    prestr = prestr + key;
    var mysign = crypto.createHash('md5').update(prestr, 'utf8').digest("hex");

    if(mysign === sign) {
        return true;
    }
    else {
        return false;
    }
}

/**
 * 签名字符串
 * @param prestr 需要签名的字符串
 * @param key 私钥
 * return 签名结果
 */
exports.md5Sign = function(prestr, key){
    prestr = prestr + key;
    return crypto.createHash('md5').update(prestr, 'utf8').digest("hex");
}
