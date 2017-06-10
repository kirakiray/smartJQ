$(function() {
    $('#parse_target').on('paste', function(e) {
        e = e.originalEvent;
        var clipboardData = e.clipboardData;
        var data;
        try {
            data = clipboardData.getData('text/plain');
            if (!data) {
                return;
            }
            data = JSON.parse(data);
        } catch (e) {
            alert('粘贴的数据有问题');
            return;
        }

        //打开iframe
        var iframeEle = $('<iframe src="offjq-page-inner.html" style="opacity:0;width:1;height:1;" />')[0];
        iframeEle.onload = function() {
            iframeEle.contentWindow.postMessage(data, iframeEle.src);
        };

        window.addEventListener('message', function(e) {
            if (e.data == 'click_ok') {
                $(iframeEle).remove();
            }
        });

        $('body').append(iframeEle);
    });
});