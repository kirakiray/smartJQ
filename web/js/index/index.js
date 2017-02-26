sr.config({
    baseUrl: "js/"
});

require('view/CheckGroup').done(function(Group) {

    //根据数据塞进去
    jqdatas.forEach(function(e, i) {
        var groupObj = new Group(e.title);

        //填充选项
        e.props.forEach(function(e) {
            groupObj.appendItem({
                val: e.val,
                name: e.val
            });
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
    $('.group li label').addClass('disable').find('input').attr('disabled', 'disabled');

    //将有的东西展示出来
    //在fn上的
    for (var i in $.fn) {
        var tar = $('[data-name="' + i + '"]');
        if (tar) {
            tar.removeClass('disable').find('input').removeAttr('disabled');
        }
    }

    //在$上的
    for (var i in $) {
        var tar = $('[data-name="$.' + i + '"]');
        if (tar) {
            tar.removeClass('disable').find('input').removeAttr('disabled');
        }
    }

    //展示出来
    $('.main').show();

    console.log('len =>', jqdatas.length);
});