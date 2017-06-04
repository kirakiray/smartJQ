//把选项塞进视图
define(function(require) {
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

                var checkEle = groupObj.appendItem(itemOption);

                if (e.test) {
                    try {
                        if (eval(e.test)) {
                            checkEle.find('label').removeClass('disable').find('input').removeAttr('disabled');
                        }
                    } catch (err) {
                        console.warn('not defined => ', e.test);
                    }
                } else {
                    try {
                        if (eval(itemOption.name)) {
                            checkEle.find('label').removeClass('disable').find('input').removeAttr('disabled');
                        }
                    } catch (e) {
                        console.warn('not defined => ', itemOption.name);
                    }
                }
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
    });
});