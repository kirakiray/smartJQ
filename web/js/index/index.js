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

    //获取js文件内容
    fetch('../src/smartjq.js')
        .then(function(respone) {
            return respone.text();
        })
        .then(function(text) {
            //查找所有set的属性
            var setMethonArr = text.match(/\/\/@set---(.+)---start/g);

            //去除回车
            text = text.replace(/\n/g, " ");

            setMethonArr.forEach(function(e) {
                //制作匹配正则表达式
                var tarExp = new RegExp((e.replace(/\./g, '\\.').replace(/\$/g, "\\$") + '(.+)//@set------end'));

                //获取匹配对象
                var tarArr = text.match(tarExp);

                //匹配到的正文内容

                console.log(tarArr)
            });
        });

    console.log('len =>', jqdatas.length);
});