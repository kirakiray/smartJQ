sr.config({
    baseUrl: "js/"
});

require('view/CheckGroup').done(function(Group) {

    //根据数据塞进去
    jqdatas.forEach(function(e, i) {
        var groupObj = new Group(e.title);

        //填充选项
        e.props.forEach(function(e) {
            var itemOption = {
                val: e.val,
                name: e.val
            };

            //判断是否fn
            if (e.fn) {
                itemOption.name = "$.fn." + e.val;
            }

            //判断是否is
            if (e.is) {
                itemOption.name = e.is;
            }

            if (e.base) {
                itemOption.base = 1;
            }

            groupObj.appendItem(itemOption);
        });

        //手动排序
        if (i >= 0 && i < 3) {
            $('.uk-grid >div:nth-child(1)').append(groupObj.ele);
        } else if (i >= 3 && i < 7) {
            $('.uk-grid >div:nth-child(2)').append(groupObj.ele);
        } else if (i >= 7 && i < 10) {
            $('.uk-grid >div:nth-child(3)').append(groupObj.ele);
        } else if (i >= 10 && i < 12) {
            $('.uk-grid >div:nth-child(4)').append(groupObj.ele);
        } else if (i >= 12) {
            $('.uk-grid >div:nth-child(5)').append(groupObj.ele);
        }
    });

    //将有的东西展示出来
    $('.f_item > input').each(function(i, e) {
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

    //总体数据映射
    var smartJQTextData = {};
    window.smartJQTextData = smartJQTextData;

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
            var groupData = tarData.group;
            var checked = $('input[data-point="' + datapoint + '"]')[0].checked;
            groupData.forEach(function(e) {
                $('input[data-point="' + e + '"]')[0].checked = checked;
            });
        }
        // console.log(tarData);

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

            //修正fn的内容
            // var newoneGroupFuncNameArr = oneGroupFuncNameArr.map(function(e) {
            //     //判断是fn.开头的就添加$前置
            //     var fixStr = e;
            //     if (/^fn\./.test(e)) {
            //         fixStr = "$." + e;
            //     }
            //     return fixStr;
            // });

            //制作匹配正文的正则表达式
            var tarExp = new RegExp((e.replace(/\./g, '\\.').replace(/\$/g, "\\$") + '([\\s\\S]+?)//@set------end'));

            //获取相应的正文数组
            var tarArr = text.match(tarExp);
            //匹配到的正文内容
            var intext = tarArr[1];

            // console.log('oneGroupFuncNameArr=>', newoneGroupFuncNameArr);

            // var relyArr = [];

            // //根据正文获取依赖文件
            // var relytextArr = intext.match(/@use---(\S+)/g);
            // relytextArr && relytextArr.forEach(function(e) {
            //     var relytext = e.match(/@use---(\S+)/);
            //     if (1 in relytext) {
            //         relyArr.push(relytext[1]);
            //     }
            // });

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
            $('input[data-point="' + funcName + '"]').prop('checked', true).attr('disabled', 'disabled');

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
            // debugger;
        });

        console.log(smartJQTextData);
    };

    //查看依赖的方法
    function checkRely() {
        //获取所有选中的选项
        var checkedInput = $('input[type="checkbox"]:checked:not(:disabled)');

        checkedInput.each(function(i, e) {
            //获取相应的映射数据并进行设置依赖
            var pointData = $(this).data('point');
            console.log(pointData, smartJQTextData[pointData]);
        });
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

    //获取js文件内容
    fetch('../src/smartjq.js')
        .then(function(respone) {
            return respone.text();
        })
        .then(init);

    console.log('len =>', jqdatas.length);
});