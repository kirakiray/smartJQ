(function(glo) {
    "use strict";
    //common
    var SMARTKEY = "_s_" + new Date().getTime();
    var SMARTEVENTKEY = SMARTKEY + "_e";

    //function
    var arrlyslice = Array.prototype.slice;
    var makeArray = function(arrobj) {
        return arrlyslice.call(arrobj);
    };

    //获取类型
    var getType = function(value) {
        return Object.prototype.toString.call(value).toLowerCase().replace(/(\[object )|(])/g, '');
    };

    //合并对象
    var extend = function(def) {
        var args = makeArray(arguments).slice(1);
        arrayEach(args, function(opt) {
            for (var key in opt) {
                def[key] = opt[key];
            }
        });
        return def;
    };

    //arr类型的遍历
    var arrayEach = function(arr, func) {
        !(arr instanceof Array) && (arr = makeArray(arr));
        arr.some(function(e, i) {
            return func(e, i) === false;
        });
        return arr;
    };

    //obj类型的遍历
    var objEach = function(obj, func) {
        var i;
        for (i in obj) {
            if (func(i, obj[i]) == false) {
                break;
            };
        }
        return obj;
    }

    //合并数组
    var merge = function(arr1, arr2) {
        var fakeArr2 = makeArray(arr2);
        fakeArr2.unshift(arr1.length, 0);
        arr1.splice.apply(arr1, fakeArr2);
        return arr1;
    };

    //SmartFinder---------start
    //匹配数组中的专用元素并返回
    var fliterDedicatedEles = function(beforeData, selecter) {
        var redata = [];
        switch (selecter) {
            case ":odd":
                redata = beforeData.filter(function(e, i) {
                    return !((i + 1) % 2);
                });
                break;
            case ":even":
                redata = beforeData.filter(function(e, i) {
                    return (i + 1) % 2;
                });
                break;
            case ":parent":
                redata = beforeData.filter(function(e) {
                    return !!e.innerHTML;
                });
                break;
            case ":first":
                redata = [beforeData[0]];
                break;
            case ":last":
                redata = beforeData.slice(-1);
                break;
            case ":header":
                redata = findEles(beforeData, "h1,h2,h3,h4,h5");
                break;
            case ":hidden":
                beforeData.forEach(function(e) {
                    if (getComputedStyle(e).display == "none" || e.type == "hidden") {
                        redata.push(e);
                    }
                });
                break;
            case ":visible":
                beforeData.forEach(function(e) {
                    if (getComputedStyle(e).display != "none" && e.type != "hidden") {
                        redata.push(e);
                    }
                });
                break;
            default:
                var expr_five;
                if (expr_five = selecter.match(/:eq\((.+?)\)/)) {
                    var e1 = parseInt(expr_five[1]);
                    redata = beforeData.slice(e1, e1 > 0 ? e1 + 1 : undefined);
                    break;
                }
                if (expr_five = selecter.match(/:lt\((.+?)\)/)) {
                    redata = beforeData.slice(0, expr_five[1]);
                    break;
                }
                if (expr_five = selecter.match(/:gt\((.+?)\)/)) {
                    redata = beforeData.slice(parseInt(expr_five[1]) + 1);
                    break;
                }
                if (expr_five = selecter.match(/:has\((.+?)\)/)) {
                    beforeData.forEach(function(e) {
                        var findele = findEles(e, expr_five[1]);
                        if (0 in findele) {
                            redata.push(e);
                        }
                    });
                    break;
                }
                if (expr_five = selecter.match(/:contains\((.+?)\)/)) {
                    beforeData.forEach(function(e) {
                        if (e.innerHTML.search(expr_five[1]) > -1) {
                            redata.push(e);
                        }
                    });
                    break;
                }
        }

        return redata;
    };

    var spe_expr = /(.*)(:even|:odd|:header|:parent|:hidden|:eq\(.+?\)|:gt\(.+?\)|:lt\(.+?\)|:has\(.+?\)|:contains\(.+?\)|:first(?!-)|:last(?!-))(.*)/;
    //查找元素的方法
    var findEles = function(owner, expr) {
        var redata = [];

        expr = expr.trim();

        //判断表达式是否空
        if (!expr) {
            return owner.length ? owner : [owner];
        }

        //判断是否有专属选择器
        var speMatch = expr.match(spe_expr);

        //存在专属字符进入专属字符通道
        if (speMatch) {
            if (/,/.test(expr)) {
                //带有分组信息需要分开处理
                expr.split(',').forEach(function(e) {
                    merge(redata, findEles(owner, e));
                });
            } else if (expr.match(/(.+?):not\((.+?)\)/)) {
                //not有对专用字符有特殊的处理渠道
                //筛选not关键信息
                //拆分括号
                var notStrArr = expr.replace(/([\(\)])/g, "$1&").split('&');

                //搜索到第一个not后开始计数
                var nCount = 0;
                var nAction = 0;
                var beforestr = "";
                var targetStr = "";
                var afterStr = "";
                notStrArr.forEach(function(e) {
                    if (!nAction) {
                        if (e.search(/:not\(/) > -1) {
                            nAction = 1;
                            nCount++;
                            //加上非not字符串
                            beforestr += e.replace(/:not\(/, "");
                        } else {
                            beforestr += e;
                        }
                    } else {
                        if (e.search(/\(/) > -1) {
                            nCount++;
                        } else if (e.search(/\)/) > -1) {
                            nCount--;
                        }
                        if (nAction == 1 && !nCount) {
                            nAction = 2;
                        } else if (nAction == 2) {
                            afterStr += e;
                        } else {
                            targetStr += e;
                        }
                    }
                });

                //获取相应关键元素
                var ruleInEle = findEles(owner, beforestr);
                var ruleOutEle = findEles(owner, beforestr + targetStr);
                ruleInEle.forEach(function(e) {
                    ruleOutEle.indexOf(e) == -1 && redata.push(e);
                }, this);

                //查找后续元素
                if (afterStr) {
                    redata = findEles(redata, afterStr);
                }
            } else {
                //没有not就好说
                //查找元素后，匹配特有字符
                redata = findEles(owner, speMatch[1]);
                redata = fliterDedicatedEles(redata, speMatch[2]);

                //查找后续元素
                if (speMatch[3]) {
                    redata = findEles(redata, speMatch[3]);
                }
            }
        } else {
            //没有的话直接查找元素
            if (owner.length) {
                owner.forEach(function(e) {
                    merge(redata, findEles(e, expr));
                });
            } else {
                //查看看是否有原生querySelectorAll支持但是有缺陷的表达方式
                var matchData;
                if (matchData = expr.match(/^>(\S*) *(.*)/)) {
                    if (1 in matchData) {
                        var expr2 = matchData[1];
                        makeArray(owner.children).forEach(function(e) {
                            judgeEle(e, expr2) && redata.push(e);
                        });
                    }
                } else {
                    redata = owner.querySelectorAll(expr);
                }
            }
        }

        return makeArray(redata);
    };
    //SmartFinder---------end

    //判断元素是否符合条件
    var judgeEle = function(ele, expr) {
        var fadeParent = document.createElement('div');
        if (ele == document) {
            return false;
        }
        fadeParent.appendChild(ele.cloneNode(false));
        return 0 in findEles(fadeParent, expr) ? true : false;
    };

    //转换字符串到html对象
    var transToEles = function(str) {
        var par = document.createElement('div');
        par.innerHTML = str;
        var ch = makeArray(par.children);
        par.innerHTML = "";
        return ch;
    };

    //main
    function smartJQ(arg1, arg2) {
        this.init(arg1, arg2);
    };

    var prototypeObj = Object.create(Array.prototype);

    //初始化函数
    prototypeObj.init = function(arg1, arg2) {
        //只有一个参数的情况
        var a1type = getType(arg1);
        switch (a1type) {
            case "string":
                if (/</.test(arg1)) {
                    //带有生成对象的类型
                    merge(this, transToEles(arg1));
                } else {
                    //查找元素
                    var eles = [];
                    var arg2type = getType(arg2);
                    if (arg2type == "string") {
                        //参数2有的情况下
                        var parnodes = findEles(document, arg2);
                        arrayEach(parnodes, function(e) {
                            var tareles = findEles(e, arg1);
                            arrayEach(tareles, function(e) {
                                if (eles.indexOf(e) == -1) {
                                    eles.push(e);
                                }
                            });
                        });
                    } else if (!arg2) {
                        eles = findEles(document, arg1);
                    }
                    merge(this, eles);
                }
                break;
            case "function":
                document.addEventListener('DOMContentLoaded', function() {
                    arg1($)
                }, false);
                break;
            default:
                if (arg1 instanceof smartJQ) {
                    return arg1;
                } else if (arg1 instanceof Array) {
                    merge(this, arg1);
                } else {
                    this.push(arg1);
                }
        }
    }

    smartJQ.fn = smartJQ.prototype = prototypeObj;

    //init
    var $ = function(selector, context) {
        if (selector instanceof smartJQ) {
            return selector;
        }
        if (!selector) {
            return $([]);
        }
        return new smartJQ(selector, context);
    };
    $.fn = $.prototype = smartJQ.fn;

    glo.smartJQ = glo.$ = $;

    //在$上的方法
    //随框架附赠的方法
    //@must---$.extend
    //@must---$.makearray
    //@must---$.merge
    //@must---$.type
    extend($, {
        // expando: SMARTKEY,
        extend: extend,
        makearray: makeArray,
        merge: merge,
        type: getType
    });
    extend(prototypeObj, {not:function (expr) {
            //@use---$.fn.filter
            return this.filter(function(i, e) {
                return !judgeEle(e, expr);
            });
        },filter:function (expr) {
            var arr = [];
            switch (getType(expr)) {
                case "string":
                    arrayEach(this, function(e) {
                        if (judgeEle(e, expr)) {
                            arr.push(e);
                        }
                    });
                    break;
                case "function":
                    arrayEach(this, function(e, i) {
                        var result = expr.call(e, i, e);
                        if (result) {
                            arr.push(e);
                        }
                    });
                    break;
                default:
                    if (expr instanceof smartJQ) {
                        arrayEach(this, function(e) {
                            arrayEach(expr, function(tar) {
                                (e == tar) && arr.push(e);
                            });
                        });
                    } else if (expr.nodeType) {
                        arrayEach(this, function(e) {
                            (e == expr) && arr.push(e);
                        });
                    }
            }
            return $(arr);
        },bind:function (event, data, callback) {
            //@use---$.fn.on
            return this.on(event, data, callback);
        },on:function (arg1, arg2, arg3, arg4, isOne) {
            //@use---$.fn._tr
            //@use---$.fn._ge
            //@use---$.Event
            var selectors, data, _this = this;

            if (getType(arg1) == 'object') {
                if (getType(arg2) == 'string') {
                    selectors = arg2;
                    data = arg3;
                } else {
                    data = arg2;
                }
                objEach(arg1, function(eventName, callback) {
                    _this.on(eventName, selectors, data, callback);
                });
                return;
            }

            var callback, eventArr = arg1.split(" ");

            //判断第二个参数是否字符串，是的话就是目标
            switch (getType(arg2)) {
                case 'function':
                    callback = arg2;
                    break;
                case 'string':
                    selectors = arg2;
                    if (getType(arg3) == "function") {
                        callback = arg3;
                    } else {
                        data = arg3;
                        callback = arg4;
                    }
                    break;
                default:
                    data = arg2;
                    callback = arg3;
                    break;
            }

            arrayEach(eventArr, function(eventName) {
                //判断空
                if (!eventName) return;

                arrayEach(_this, function(tar) {
                    //事件寄宿对象
                    var smartEventData = prototypeObj._ge(tar, SMARTEVENTKEY);
                    var smartEventObj = smartEventData[eventName];

                    if (!smartEventObj) {
                        //设定事件对象
                        smartEventObj = (smartEventData[eventName] = []);

                        //属于事件元素的，则绑定事件
                        // if (tar instanceof EventTarget) {
                        if (tar.nodeType) {
                            tar.addEventListener(eventName, function(oriEvent) {
                                prototypeObj._tr(tar, eventName, $.Event(oriEvent));
                            });
                        }
                    }

                    //添加callback
                    smartEventObj.push({
                        //主体funciton
                        f: callback,
                        //数据data
                        d: data,
                        // 是否执行一次
                        o: isOne,
                        // 选择目标
                        s: selectors
                    });
                });
            });
            return this;
        },_tr:function (ele, eventName, newEventObject, triggerData) {
            //@use---$.fn.parents
            var smartEventData = ele[SMARTEVENTKEY];
            if (!smartEventData) return

            var smartEventObjs = smartEventData[eventName];

            var newArr = [];
            smartEventObjs && arrayEach(smartEventObjs, function(handleObj, i) {
                //设置事件对象
                var currentTarget = newEventObject.delegateTarget = ele;

                //是否可以call
                var cancall = 1;

                var delegateFilter = handleObj.s;
                if (delegateFilter) {
                    var targetEle = newEventObject.target,
                        tarparent = $(targetEle).parents(delegateFilter);

                    if (0 in tarparent) {
                        currentTarget = tarparent[0];
                    } else if (judgeEle(targetEle, delegateFilter)) {
                        currentTarget = targetEle;
                    } else {
                        cancall = 0;
                    }
                }

                if (cancall) {
                    //设置事件名
                    newEventObject.type = eventName;

                    //设置数据
                    newEventObject.data = handleObj.d;
                    newEventObject.currentTarget = currentTarget;
                    newEventObject.target || (newEventObject.target = ele);

                    //运行事件函数
                    var f = handleObj.f.bind(currentTarget);
                    triggerData ? f(newEventObject, triggerData) : f(newEventObject);

                    //判断是否阻止事件继续运行下去
                    if (newEventObject._ips) {
                        return false;
                    }
                }

                if (!handleObj.o) {
                    newArr.push(handleObj);
                }
            });
            if (!(0 in newArr)) {
                delete smartEventData[eventName];
            } else {
                smartEventData[eventName] = newArr;
            }
            smartEventObjs = null;
        },_ge:function (obj, keyname) {
            obj[keyname] || Object.defineProperty(obj, keyname, {
                configurable: true,
                writable: true,
                value: {}
            });
            return obj[keyname];
        },parents:function (filter) {
            //@use---$.fn._nu
            return this._nu('parentNode', filter, document);
        },_nu:function (key, filter, lastExpr) {
            var arr = [];
            var getEle = function(tar) {
                var nextEle = tar[key];
                if (nextEle) {
                    if (lastExpr) {
                        if ((getType(lastExpr) == "string" && judgeEle(nextEle, lastExpr)) || lastExpr == nextEle || (lastExpr instanceof Array && lastExpr.indexOf(nextEle) > -1)) {
                            return;
                        }
                    }
                    if ((!filter || judgeEle(nextEle, filter)) && arr.indexOf(nextEle) == -1) {
                        arr.push(nextEle);
                    }
                    getEle(nextEle);
                }
            };
            arrayEach(this, function(tar) {
                getEle(tar);
            });
            getEle = null;
            return $(arr);
        }});
    $.Event = function(oriEvent, props) {
        var _this = this;

        if (!(this instanceof $.Event)) {
            return new $.Event(oriEvent, props);
        } else if (oriEvent instanceof $.Event) {
            return oriEvent;
        }

        if (oriEvent && oriEvent.type) {
            //添加相关属性
            arrayEach(['altKey', 'bubbles', 'cancelable', 'changedTouches', 'ctrlKey', 'detail', 'eventPhase', 'metaKey', 'pageX', 'pageY', 'shiftKey', 'view', 'char', 'charCode', 'key', 'keyCode', 'button', 'buttons', 'clientX', 'clientY', 'offsetX', 'offsetY', 'pointerId', 'pointerType', 'relatedTarget', 'screenX', 'screenY', 'target', 'targetTouches', 'timeStamp', 'toElement', 'touches', 'which'], function(e) {
                (oriEvent[e] != undefined) && (_this[e] = oriEvent[e]);
            });

            //判断是否自定义事件
            _this.originalEvent = oriEvent;
        } else {
            this.type = oriEvent;
            props && extend(this, props);
        }


        this.returnValue = true;
        this.cancelBubble = false;

        _this.timeStamp || (_this.timeStamp = new Date().getTime());
    };
    //主体event对象
    $.Event.prototype = {
        isDefaultPrevented: function() {
            return this.returnValue == false;
        },
        isPropagationStopped: function() {
            return this.cancelBubble;
        },
        isImmediatePropagationStopped: function() {
            return !!this._ips;
        },
        preventDefault: function() {
            var originalEvent = this.originalEvent;
            originalEvent && originalEvent.preventDefault();
            this.returnValue = false;
        },
        stopPropagation: function() {
            var originalEvent = this.originalEvent;
            originalEvent && originalEvent.stopPropagation();
            this.cancelBubble = true;
        },
        stopImmediatePropagation: function() {
            var originalEvent = this.originalEvent;
            originalEvent && originalEvent.stopImmediatePropagation();
            this._ips = true;
        }
    };
    })(window);