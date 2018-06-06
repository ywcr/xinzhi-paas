function setCookie(c_name, value, expiredays) {
  if (getCookie(c_name) && getCookie(c_name) == value) {
    return;
  }
  expiredays = expiredays ? expiredays : 1;
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + ";path=/";
}

function getCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=");
    if (c_start !== -1) {
      c_start = c_start + c_name.length + 1;
      c_end = document.cookie.indexOf(";", c_start);
      if (c_end === -1) {
        c_end = document.cookie.length;
      }
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return null;
}

function delCookie(c_name, value) {
  var expiredays = -30;
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  if (c_name === 'csrftoken') {
    document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + ";path=/;domain=.paas.enncloud.cn";
  } else {
    document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + ";path=/";
  }
}

function addEvent(element, event_name, func) {
  if (element.addEventListener) {
    element.addEventListener(event_name, func, false);
  } else if (element.attachEvent) {
    element.attachEvent("on" + event_name, func);
  }
}