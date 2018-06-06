! function() {
  var url = "/img/sider/svg/svg-symbols.svg?ver=7-30";
  var div = document.createElement("div");
  div.style.display = "none";
  document.body.appendChild(div);
  // 载入SVG
  if(localStorage.getItem(url)) {
    // 本地获取，减少请求
    div.innerHTML = localStorage.getItem(url);
  } else {
    localStorage.clear()
    var xhr = new XMLHttpRequest();
    xhr.open("get", url);
    xhr.onload = function() {
      if(xhr.responseText) {
        div.innerHTML = xhr.responseText;
        // 本地存储
        localStorage.setItem(url, xhr.responseText);
      }
    };
    xhr.send(null);
  }
}();