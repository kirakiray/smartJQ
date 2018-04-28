var dragin_area = $('.dragin-area')[0];
dragin_area.addEventListener('drop', function(e) {
    e.preventDefault();
    var jsFile = e.dataTransfer.files[0];

    if (jsFile.type && jsFile.type.indexOf('javascript') == -1) {
        alert('只能读取javascript文件');
        return;
    }

    var fs = new FileReader();
    fs.onload = function() {
        //获取文本
        var text = fs.result;
        init(text);
    };
    fs.readAsText(jsFile);
}, false);
dragin_area.addEventListener('dragover', function(e) {
    e.preventDefault();
});

$('.open_tips_close').click(function() {
    $('.open_tips_in').empty().addClass('hasloading');
    $('.open_tips').hide();
});

//初始化
function init(scriptText) {
    var iframeEle = $('<iframe src="compat-page-inner.html"></iframe>');

    iframeEle.on('load', function() {
        iframeEle[0].contentWindow.postMessage({
            scriptText: scriptText
        }, iframeEle[0].src);
        setTimeout(function() {
            $('.open_tips_in').removeClass('hasloading');
        }, 500)
    });

    $('.open_tips_in').append(iframeEle);
    $('.open_tips').show();
};