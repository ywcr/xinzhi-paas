"use strict"

const url = require('url')
const http = require('http')
const https = require('https')
const fs = require('fs')
const urllib = require('urllib')

/**
 * 除去对象中的空值和签名参数
 * @param para 签名参对象
 * return 去掉空值与签名参数后的新签名参对象
 */
exports.paraFilter = function(para){
    var para_filter = new Object();
    for (var key in para){
        if(key == 'sign' || key == 'sign_type' || para[key] == ''){
            continue;
        }
        else{
            para_filter[key] = para[key];
        }
    }
    return para_filter;
}


/**
 * 对对象排序, 按对象属性名称是ASCII排序
 * @param para 排序前的对象
 * return 排序后的对象
 */
exports.argSort = function(para){
    var result = new Object();
    var keys = Object.keys(para).sort();
    for (var i = 0; i < keys.length; i++){
        var k = keys[i];
        result[k] = para[k];
    }
    return result;
}


/**
 * 把对象所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
 * @param para 需要拼接的对象
 * return 拼接完成以后的字符串
 */
exports.createLinkstring = function(para){
  //queryString.stringify自带编码，在这里不适用
	var ls = '';
	for(var k in para){
		ls = ls + k + '=' + para[k] + '&';
	}
	ls = ls.substring(0, ls.length - 1);
	return ls;
}


exports.getResponse = function(url, cacertUrl) {
  const options = {
    method: 'GET',
    cert: fs.readFileSync(cacertUrl),
    dataType: 'text',
    headers: {
      'charset': 'utf-8'
    }
  }
  return urllib.request(url, options)
}
