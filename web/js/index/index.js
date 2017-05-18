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

    //将所有的input都disable
    // $('.group li label').addClass('disable').find('input').attr('disabled', 'disabled');

    //将有的东西展示出来
    $('.f_item > input').each(function(i, e) {
        var pointName = $(e).data('point');
        try {
            if (eval(pointName)) {
                $(e).removeAttr('disabled').parent().removeClass('disable');
            }
        } catch (e) {
            console.log('not defined => ', pointName);
        }
    });

    //点解选中后，查看页面是否有同样名的也勾选上（主要解决is勾选）
    $('#main_list').on("change", 'input', function(e) {
        var datapoint = $(this).data('point');

        //all datapoint elements
        var allele = $('[data-point="' + datapoint + '"]');
        if (allele.length <= 1) {
            return;
        }
        var checked = this.checked;
        allele.prop('checked', checked);
    });

    //展示出来
    $('.main').show();

    //总体数据映射
    var smartJQTextData = {};
    window.smartJQTextData = smartJQTextData;

    //获取js文件内容
    fetch('../src/smartjq.js')
        .then(function(respone) {
            return respone.text();
        })
        .then(function(text) {
            //查找所有set的属性
            var setMethonArr = text.match(/\/\/@set---(.+)---start/g);

            //关联方法组（属于共同体的方法）
            setMethonArr.forEach(function(e) {
                //匹配到可选标题内容
                var tarTitle = e.match(/\/\/@set---(.+)---start/);

                //用空格区分开并生成关联
                var tarTitleArr = tarTitle[1].split(' ');

                //修正fn的内容
                var newtarTitleArr = tarTitleArr.map(function(e) {
                    //判断是fn.开头的就添加$前置
                    var fixStr = e;
                    if (/^fn\./.test(e)) {
                        fixStr = "$." + e;
                    }
                    return fixStr;
                });

                if (1 in newtarTitleArr) {
                    //关联点击
                    newtarTitleArr.forEach(function(e) {
                        $('input[data-point="' + e + '"]').click(function() {
                            var checked = this.checked;

                            //其他的所有都修改相应状态
                            newtarTitleArr.forEach(function(e2) {
                                $('input[data-point="' + e2 + '"]')[0] && ($('input[data-point="' + e2 + '"]')[0].checked = checked);
                            });
                        });
                    });
                }

                //制作匹配正文的正则表达式
                var tarExp = new RegExp((e.replace(/\./g, '\\.').replace(/\$/g, "\\$") + '([\\s\\S]+)//@set------end'));

                //获取相应的正文数组
                var tarArr = text.match(tarExp);
                var intext = tarArr[1];

                console.log('tarTitleArr=>', newtarTitleArr);

                //获取依赖功能
                var relyArr = [];

                //根据正文获取依赖文件
                var relytextArr = intext.match(/@use---(\S+)/g);
                relytextArr.forEach(function(e) {
                    var relytext = e.match(/@use---(\S+)/);
                    if (1 in relytext) {
                        // relytext = relytext[1];
                        relyArr.push(relytext[1]);
                    }
                    console.log('relytext=>', relytext);
                });

                //映射记录
                //两个以上的记录到第一个映射上
                newtarTitleArr.forEach(function(e, i) {
                    if (i == 0) {
                        //第一个
                        smartJQTextData[e] = {
                            // 属于单独项的，不是通过fn或$上动态设定的
                            type: "self",
                            text: intext,
                            group: [],
                            rely: relyArr
                        }
                    } else {
                        smartJQTextData[e] = {
                            to: newtarTitleArr[0]
                        };
                        //加入组
                        smartJQTextData[newtarTitleArr[0]].group.push(e);
                    }
                });

                //匹配到的正文内容
                console.log(tarArr);
            });
        });

    console.log('len =>', jqdatas.length);
});