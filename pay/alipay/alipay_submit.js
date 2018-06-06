"use strict"

const queryString = require('querystring')
const coreFunc = require('./alipay_core')
const md5Func = require('./alipay_md5')

class AliPaySubmit {
  constructor(aliPayConfig) {
    this.alipayGetwayNew = 'https://mapi.alipay.com/gateway.do'
    this.aliPayConfig = aliPayConfig
  }

  /**
   * 生成签名结果
   * @param para_sort 已排序要签名的数组
   * return 签名结果字符串
   */
  buildRequestMysign(paraSort) {
    //把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
    const prestr = coreFunc.createLinkstring(paraSort);

    let mysign = "";

    let sign_type = this.aliPayConfig['sign_type'].trim().toUpperCase();
    if (sign_type == "MD5") {
      mysign = md5Func.md5Sign(prestr, this.aliPayConfig['key']);
    }
    else {
      mysign = "";
    }
    return mysign;
  }

  /**
   * 生成要请求给支付宝的参数数组
   * @param para_temp 请求前的参数数组
   * @return 要请求的参数数组
   */
  buildRequestPara(para_temp) {
    //除去待签名参数数组中的空值和签名参数
    var para_filter = coreFunc.paraFilter(para_temp);

    //对待签名参数数组排序
    var para_sort = coreFunc.argSort(para_filter);

    //生成签名结果
    var mysign = this.buildRequestMysign(para_sort);
    //签名结果与签名方式加入请求提交参数组中
    para_sort['sign'] = mysign;
    para_sort['sign_type'] = this.aliPayConfig['sign_type'].trim().toUpperCase();
    return para_sort;
  }

  buildRequestForm(params, method, button_name) {
    //待请求参数数组
    var para = this.buildRequestPara(params);
    var sHtml = "<form id='alipaysubmit' name='alipaysubmit' action='"
      + this.alipayGetwayNew
      + "?_input_charset="
      + this.aliPayConfig['input_charset'].toLowerCase().trim()
      + "' method='" + method.toLowerCase().trim() + "'>";

    for (var key in para) {
      var val = para[key];
      sHtml += "<input type='hidden' name='" + key + "' value='" + val + "'/>";
    }

    //submit按钮控件请不要含有name属性
    sHtml = sHtml + "<input type='submit' style='display:none' value='" + button_name + "'></form>";

    sHtml = sHtml + "<script>document.forms['alipaysubmit'].submit();</script>";

    return sHtml;
  }
}

module.exports = AliPaySubmit
