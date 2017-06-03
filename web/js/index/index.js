sr.config({
    baseUrl: "js/"
});

require('index/setCheck', 'compatable').done(function() {
    //导出模块所有的方法
    window.exportMethodsDatas = [];

    //总体数据映射
    var smartJQTextData = {};

    //将有的东西展示出来
    $('.main .f_item > input').each(function(i, e) {
        var pointName = $(e).data('point');
        try {
            if (eval(pointName)) {
                var a = $(e).removeAttr('disabled')
                var b = a.parent();
                b.removeClass('disable');
            }
        } catch (e) {
            console.warn('not defined => ', pointName);
        }
    });

    $('#main_list').on("change", 'input', function(e) {
        //点解选中后，查看页面是否有同样名的也勾选上（主要解决is勾选）
        var datapoint = $(this).data('point');

        //all datapoint elements
        var allele = $('[data-point="' + datapoint + '"]');
        if (allele.length > 1) {
            var checked = this.checked;
            allele.prop('checked', checked);
        }

        //获取映射对象内的相关函数，并设置依赖关系
        var tarData = smartJQTextData[datapoint];
        if (tarData.to) {
            tarData = smartJQTextData[tarData.to];
        }
        var groupData = tarData.group;
        if (groupData) {
            var checked = $('.main input[data-point="' + datapoint + '"]')[0].checked;
            groupData.forEach(function(e) {
                $('.main input[data-point="' + e + '"]')[0].checked = checked;
            });
        }

        //依赖修正
        checkRely();
    });

    //展示出来
    $('.main').show();

    //获取文件后运行的方法
    var init = function(text) {
        //查找所有set的属性
        var setMethonArr = text.match(/\/\/@set---(.+)---start/g);

        //关联方法组（属于共同体的方法）
        setMethonArr.forEach(function(e) {
            //匹配到可选标题内容
            var oneGroupFuncName = e.match(/\/\/@set---(.+)---start/);

            //用空格区分开并生成关联
            var oneGroupFuncNameArr = oneGroupFuncName[1].split(' ');

            //制作匹配正文的正则表达式
            var tarExp = new RegExp((e.replace(/\./g, '\\.').replace(/\$/g, "\\$") + '([\\s\\S]+?)//@set------end'));

            //获取相应的正文数组
            var tarArr = text.match(tarExp);

            //匹配到的正文内容
            var intext = tarArr[1];

            var relyArr = findRely(intext);

            //映射记录
            //两个以上的记录到第一个映射上
            oneGroupFuncNameArr.forEach(function(e, i) {
                if (i == 0) {
                    //第一个
                    smartJQTextData[e] = {
                        // 属于单独项的，不是通过fn或$上动态设定的
                        type: "self",
                        text: intext,
                        group: [e],
                        rely: relyArr
                    }
                } else {
                    smartJQTextData[e] = {
                        to: oneGroupFuncNameArr[0]
                    };
                    //加入组
                    smartJQTextData[oneGroupFuncNameArr[0]].group.push(e);
                }
            });
        });

        //处理must定义的函数
        var mustArr = text.match(/\/\/@must---(.+)/g);
        mustArr.forEach(function(e) {
            //匹配获取must内容
            var funcName = e.match(/\/\/@must---(.+)/)[1];

            //设置相关方法默认选中并且不能取消
            $('.main input[data-point="' + funcName + '"]').prop('checked', true).attr('disabled', 'disabled');

            //写入映射
            smartJQTextData[funcName] = {
                type: "must"
            };
        });

        //处理非共同体的方法
        //在$上的
        $.each($, function(k, v) {
            //判断是否存在映射上，不存在的才是需要写入的
            //并且是函数
            if (!smartJQTextData['$.' + k] && typeof $[k] == "function") {
                smartJQTextData['$.' + k] = {
                    type: "$",
                    text: $[k].toString()
                };
            }
        });

        //在fn上的
        $.each($.fn, function(k, v) {
            var intext = $.fn[k].toString();
            var relydata = findRely(intext);

            if (!smartJQTextData['$.fn.' + k] && typeof $.fn[k] == "function" && k != "init") {
                smartJQTextData['$.fn.' + k] = {
                    type: "fn",
                    text: intext,
                    rely: relydata
                };
            }
        });

        console.log(smartJQTextData);
    };

    //查看依赖的方法
    function checkRely() {
        //去除所有高亮依赖
        $('.main .will_select').removeClass('will_select');
        //还原导出数据
        exportMethodsDatas = [];

        //获取所有选中的选项
        var checkedInput = $('.main input[type="checkbox"]:checked:not(:disabled)');

        checkedInput.each(function() {
            //查找依赖并设置样式
            var $this = $(this);
            if (exportMethodsDatas.indexOf($this.data('point')) == -1) {
                exportMethodsDatas.push($this.data('point'));
            }
            findRelyData($this.data('point'), function(e) {
                if (exportMethodsDatas.indexOf(e) == -1) {
                    exportMethodsDatas.push(e);
                }
                $('.main [data-point="' + e + '"]').parent().addClass('will_select');
            });
        });

        if (checkedInput && checkedInput.length) {
            //查看高亮的api是否需要依赖
            var needrely;
            do {
                needrely = 0;
                exportMethodsDatas.forEach(function(c) {
                    findRelyData(c, function(e) {
                        if (exportMethodsDatas.indexOf(e) == -1) {
                            exportMethodsDatas.push(e);
                        }
                        var tar = $('.main [data-point="' + e + '"]').parent();
                        if (tar && tar.length && !tar.hasClass('will_select')) {
                            tar.addClass('will_select');
                            needrely = 1;
                        }
                    });
                });
            } while (needrely);
        }
    }

    //获取依赖数据（smartJQTextData）的方法
    function findRelyData(pointDataStr, callback) {
        //获取相应的映射数据并进行设置依赖
        // var pointDataStr = $(ele).data('point');
        var pointData = smartJQTextData[pointDataStr];

        //对应的依赖文件设置高亮
        var relys = pointData.rely;
        if (relys && relys.length) {
            relys.forEach(function(e) {
                callback && callback(e);
            });
        }
    }

    //获取依赖的方法
    function findRely(intext) {
        var relyArr = [];

        //根据正文获取依赖文件
        var relytextArr = intext.match(/@use---(\S+)/g);
        relytextArr && relytextArr.forEach(function(e) {
            var relytext = e.match(/@use---(\S+)/);
            if (1 in relytext) {
                relyArr.push(relytext[1]);
            }
        });

        return relyArr;
    };

    //初始化按钮
    var initBtn = function(text) {
        //核心代码
        var coreCode = text.match(/\/\/@base---start([\s\S]+)\/\/@base---end/)[1];

        //按钮功能
        //点击取消选中
        $('#select_cancel').click(function() {
            $('.main [type=checkbox]').each(function() {
                this.checked = false;
            });
            checkRely();
        });

        //点击推荐选中
        $('#select_recommond').click(function() {
            // 在一直次序的情况下选中想要的
            $('.group:lt(10),.group:eq(13),.group:eq(14)').find('.f_item:not(.disable)').find('input[type="checkbox"]').prop('checked', true);
            checkRely();
        });

        //点击下载
        $('#download_btn').click(function() {
            //获取关键代码
            //fn上的代码
            var fnCode = "";

            //在$上的代码
            var $_code = "";

            //其他组代码
            var groupCode = "";

            exportMethodsDatas.forEach(function(e) {
                var tar = smartJQTextData[e];

                switch (tar.type) {
                    case "fn":
                        fnCode += e.replace('$.fn.', "") + ":" + tar.text + ",";
                        break;
                    case "$":
                        $_code += e.replace('$.', "") + ":" + tar.text + ",";
                        break;
                    case "self":
                        groupCode += tar.text;
                        break;
                }
            });

            //收尾
            if (fnCode) {
                fnCode = fnCode.slice(0, -1);
                fnCode = "extend(prototypeObj, {" + fnCode + "});"
            }
            if ($_code) {
                $_code = $_code.slice(0, -1);
                $_code = "extend($, {" + $_code + "});"
            }

            //撰写script文本
            var scriptText = "(function(glo) {";
            //加入核心代码
            scriptText += coreCode;
            //加入选中的代码
            scriptText += fnCode;
            scriptText += $_code;
            scriptText += groupCode;
            scriptText += "})(window);";

            //生成file文件
            var smartJQFile = new File([scriptText], "smartJQ-rebuild.js", { type: 'application/javascript' });

            var fileurl = URL.createObjectURL(smartJQFile);

            var link = $('<a download="smartJQ-rebuild.js" href="' + fileurl + '" />');
            link.click();

            console.log('smartJQFile', smartJQFile);
        });
    };

    //获取js文件内容
    fetch('../src/smartjq.js')
        .then(function(respone) {
            return respone.text();
        })
        .then(function(d) {
            init(d);
            initBtn(d);
        });


    console.log('len =>', jqdatas.length);
});