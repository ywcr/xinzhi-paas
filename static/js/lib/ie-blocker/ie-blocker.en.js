(function () {
    var ibContainer;
    var html;
    var browserIcons;
    var scriptPath;
    var imgPath;
    var browserName;

    ibContainer = document.createElement('div');
    ibContainer.setAttribute('id', 'ib-container');

    html += "<div class=\"ib-modal\">";
    html += "    <div class=\"ib-up\">";
    html += "        <div class=\"ib-header\">";
    html += "            <p class=\"ib-h1\">Browser version is too low, please upgrade immediately !<\/p>";
    html += "            <p>Visit the ";
    html += "                <a href=\"https:\/\/portal.tenxcloud.com\">";
    html += "                    <strong>Portal | Tenxcloud<\/strong> ";
    html += "                </a>";
    html += "                for a better speed experience using the following browsers.";
    html += "            <\/p>";
    html += "        <\/div>";
    html += "    <\/div>";
    html += "    <div class=\"ib-down\">";
    html += "        <ul class=\"ib-browsers\">";
    html += "            <li>";
    html += "                <a href=\"http:\/\/www.google.cn\/chrome\/browser\/desktop\/index.html\">";
    html += "                    <i class=\"ib-browser-icon ib-ua-chrome\"><\/i>";
    html += "                    <div class=\"ib-browser-name\">Chrome<\/div>";
    html += "                <\/a>";
    html += "            <\/li>";
    html += "            <li>";
    html += "                <a href=\"http:\/\/www.firefox.com.cn\">";
    html += "                    <i class=\"ib-browser-icon ib-ua-firefox\"><\/i>";
    html += "                    <div class=\"ib-browser-name\">Firefox<\/div>";
    html += "                <\/a>";
    html += "            <\/li>";
    html += "            <li>";
    html += "                <a href=\"https:\/\/www.apple.com\/cn\/safari\">";
    html += "                    <i class=\"ib-browser-icon ib-ua-safari\"><\/i>";
    html += "                    <div class=\"ib-browser-name\">Safari<\/div>";
    html += "                <\/a>";
    html += "            <\/li>";
    html += "            <li>";
    html += "                <a href=\"http:\/\/www.opera.com\/zh-cn\">";
    html += "                    <i class=\"ib-browser-icon ib-ua-opera\"><\/i>";
    html += "                    <div class=\"ib-browser-name\">Opera<\/div>";
    html += "                <\/a>";
    html += "            <\/li>";
    html += "            <li>";
    html += "                <a href=\"http:\/\/windows.microsoft.com\/zh-cn\/internet-explorer\/download-ie\">";
    html += "                        <i class=\"ib-browser-icon ib-ua-ie11\"><\/i>";
    html += "                    <div class=\"ib-browser-name\">IE 11<\/div>";
    html += "                <\/a>";
    html += "            <\/li>";
    html += "        <\/ul>";
    html += "        <div class=\"ib-footer\">";
    html += "            <a class=\"ib-try\" href=\"http:\/\/www.google.com\/chrome\/browser\/desktop\/index.html\">Try Chrome<\/a>";
    html += "        <\/div>";
    html += "    <\/div>";
    html += "<\/div>";
    html += "<div class=\"ib-mask\"><\/div>";

    ibContainer.innerHTML = html;

    // the path to the image cannot be relative in a filter. Have to use javascript to get the absolute path.
    browserIcons = ibContainer.getElementsByTagName('i');

    for (var i = 0; i < document.scripts.length; i++) {
        if (match = document.scripts[i].src.match(/(.*)ie-blocker.en\.js/)) {
            scriptPath = match[1];
            imgPath = scriptPath + (document.scripts[i].getAttribute('img-path') || 'img/');
            break;
        }
    }

    for (var i = 0; i < browserIcons.length; i++) {
        if (browserName = browserIcons[i].className.match(/ib-ua-(\w+)/)[1]) {
            browserIcons[i].style['filter'] = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' +
                imgPath + browserName + '.png",sizingMethod="scale"))';
        }
    }

    window.onload = function () {
        document.body.appendChild(ibContainer);
        ibContainer.style.display = 'block';
    };
})();
