//用于记录jquery使用的方法
(function(glo) {
    var $data = {};
    var $fndata = {
        constructor: 0
    };

    //转接函数的方法
    var retofun = function(tar, mapobj) {
        for (var i in tar) {
            if (typeof tar[i] == "function") {
                (function(i) {
                    var oldfunc = tar[i];
                    tar[i] = function() {
                        mapobj[i] ? mapobj[i]++ : (mapobj[i] = 1);
                        return oldfunc.apply(this, arguments);
                    };

                    //把在fun层的元素也桥接过去
                    for (var d in oldfunc) {
                        tar[i][d] = oldfunc[d];
                    }

                    //带上原型
                    tar[i].prototype = oldfunc.prototype;
                })(i);
            }
        }
    };

    retofun($, $data);
    retofun($.fn, $fndata);

    //暴露到全局
    glo.jqrecord = {
        $: $data,
        $fn: $fndata,
        output: function() {
            return JSON.stringify({
                $: $data,
                $fn: $fndata
            });
        }
    };
})(window);