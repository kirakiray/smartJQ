(function(glo) {
    "use strict";
    //common
    var SMARTKEY = "_s_" + new Date().getTime();

    //function
    var makeArray = function(arrobj) {
        return Array.prototype.slice.call(arrobj);
    };

    //获取类型
    var getType = function(value) {
        return Object.prototype.toString.call(value).toLowerCase().replace(/(\[object )|(])/g, '');
    };

    //判断是否空对象
    //    var isEmptyObject = function(obj) {
    //        for (var i in obj) {
    //            return false;
    //        }
    //        return true;
    //    };

    //合并对象
    var extend = function(def) {
        var args = makeArray(arguments).slice(1);
        each(args, function(i, opt) {
            for (var key in opt) {
                def[key] = opt[key];
            }
        });
        return def;
    };

    //集大成each
    var each = (function() {
        var arreach;
        if ([].some) {
            arreach = function(arrobj, func) {
                makeArray(arrobj).some(function(e, i) {
                    return func(i, e) === false;
                });
            };
        } else {
            arreach = function(arrobj, func) {
                for (var len = arrobj.length, i = 0; i < len; i++) {
                    if (func(i, arrobj[i]) === false) {
                        break;
                    };
                }
            };
        }
        return function(obj, func) {
            if (!obj) return;
            if ('length' in obj) {
                arreach(obj, func);
            } else if (getType(obj) == "object") {
                for (var i in obj) {
                    func(i, obj[i]);
                }
            }
        };
    })();

    //合并数组
    var merge = function(arr1, arr2) {
        each(arr2, function(i, e) {
            arr1.push(e);
        });
    };

    //查找元素的方法
    var findEles = function(owner, expr) {
        return owner.querySelectorAll(expr);
    };

    //判断元素是否符合条件
    var judgeEle = function(ele, expr) {
        var fadeParent = document.createElement('div');
        fadeParent.appendChild(ele.cloneNode(false));
        return findEles(fadeParent, expr).length ? true : false;
    };

    //转换字符串到html对象
    var transToEles = function(str) {
        var par = document.createElement('div');
        par.innerHTML = str;
        return par.children;
    };

    //main
    function smartyJQ(arg1, arg2) {
        //根据参数不同，做不同处理
        if (arg2 && arg1 instanceof smartyJQ) {
            return arg1;
        }

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
                        each(parnodes, function(i, e) {
                            var tareles = findEles(e, arg1);
                            each(tareles, function(i, e) {
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
            case "array":
                merge(this, arg1);
                break;
            default:
                if (arg1 instanceof smartyJQ) {
                    return arg1;
                } else {
                    this.push(arg1);
                }

        }
    };

    var prototypeObj = Object.create(Array.prototype);

    smartyJQ.fn = smartyJQ.prototype = prototypeObj;

    extend(prototypeObj, {
        //设置样式
        css: function(name, value) {
            //第一个是对象类型
            if (getType(name) == "object") {
                each(this, function(i, e) {
                    each(name, function(n, v) {
                        e.style[n] = v;
                    });
                });
            } else if (getType(name) == "string" && getType(value) == "string") {
                each(this, function(i, e) {
                    e.style[name] = value;
                });
            } else if (getType(name) == "string" && !value) {
                return getComputedStyle(this[0])[name];
            }
            return this;
        },
        attr: function(name, value) {
            var _this = this;
            switch (getType(name)) {
                case "string":
                    if (value == undefined) {
                        return _this[0].getAttribute(name);
                    } else {
                        each(_this, function(i, tar) {
                            tar.setAttribute(name, value);
                        });
                    }
                    break;
                case "object":
                    each(name, function(k, v) {
                        each(_this, function(i, tar) {
                            tar.setAttribute(k, v);
                        });
                    });
                    break
            }
            return _this;
        },
        removeAttr: function(name) {
            each(this, function(i, tar) {
                tar.removeAttribute(name);
            });
            return this;
        },
        addClass: function(name) {
            each(this, function(i, e) {
                e.classList.add(name);
            });
            return this;
        },
        removeClass: function(name) {
            each(this, function(i, e) {
                e.classList.remove(name);
            });
            return this;
        },
        toggleClass: function(name) {
            each(this, function(i, e) {
                e.classList.toggle(name);
            });
            return this;
        },
        hasClass: function(name) {
            var tar = this[0];
            return tar ? makeArray(tar.classList).indexOf(name) > -1 : false;
        },
        //添加元素公用的方法
        _ec: function(ele, targets, func) {
            //最后的id
            var lastid = targets.length - 1;

            each($(ele), function(i, e) {
                each($(targets), function(i, tar) {
                    if (i == lastid) {
                        func(e, tar);
                    } else {
                        func(e.cloneNode(true), tar);
                    }
                });
            });
        },
        //元素操作
        append: function(ele) {
            //@use---fn._ec
            //判断类型
            prototypeObj._ec(ele, this, function(e, tar) {
                tar.appendChild(e);
            });
            return this;
        },
        appendTo: function(tars) {
            //@use---fn.append
            this.append.call(tars, this);
            return this;
        },
        prepend: function(ele) {
            //@use---fn._ec
            prototypeObj._ec(ele, this, function(e, tar) {
                tar.insertBefore(e, tar.firstChild);
            });
            return this;
        },
        prependTo: function(tars) {
            //@use---fn.prepend
            this.prepend.call(tars, this);
            return this;
        },
        after: function(ele) {
            //@use---fn._ec
            prototypeObj._ec(ele, this, function(e, tar) {
                var parnode = tar.parentNode;
                if (parnode.lastChild == tar) {
                    parnode.appendChild(e);
                } else {
                    parnode.insertBefore(e, tar.nextSibling);
                }
            });
            return this;
        },
        insertAfter: function(tars) {
            //@use---fn.after
            this.after.call(tars, this);
            return this;
        },
        before: function(ele) {
            //@use---fn._ec
            prototypeObj._ec(ele, this, function(e, tar) {
                tar.parentNode.insertBefore(e, tar);
            });
            return this;
        },
        insertBefore: function(tars) {
            //@use---fn.before
            this.before.call(tars, this);
            return this;
        },
        empty: function() {
            each(this, function(i, e) {
                e.innerHTML = "";
            });
            return this;
        },
        remove: function() {
            each(this, function(i, e) {
                e.parentNode.removeChild(e);
            });
        },
        find: function(str) {
            var eles = [];
            each(this, function(i, e) {
                var arr = findEles(e, str);
                each(arr, function(i, e) {
                    if (eles.indexOf(e) == -1) {
                        eles.push(e);
                    }
                });
            });
            return $(eles);
        },
        children: function(expr) {
            var eles = [];
            each(this, function(i, e) {
                e.nodeType && each(e.children, function(i, e) {
                    if (expr) {
                        judgeEle(e, expr) && eles.push(e);
                    } else {
                        eles.push(e);
                    }
                });
            });
            return $(eles);
        },
        get: function(index) {
            return this[index] || makeArray(this);
        },
        map: function(callback) {
            var arr = [];
            each(this, function(i, e) {
                var resulte = callback.call(e, i, e);
                (resulte != undefined) && arr.push(resulte);
            });
            return $(arr);
        },
        slice: function(start, end) {
            return $([].slice.call(this, start, end));
        },
        eq: function(i) {
            //@use---fn.slice
            return this.slice(i, i + 1 || undefined);
        },
        filter: function(expr) {
            var arr = [];
            switch (getType(expr)) {
                case "string":
                    each(this, function(i, e) {
                        if (judgeEle(e, expr)) {
                            arr.push(e);
                        }
                    });
                    break;
                case "function":
                    each(this, function(i, e) {
                        var result = expr.call(e, i, e);
                        if (result) {
                            arr.push(e);
                        }
                    });
            }
            return $(arr);
        },
        not: function(expr) {
            //@use---fn.filter
            return this.filter(function(i, e) {
                return !judgeEle(e, expr);
            });
        },
        parent: function(expr) {
            //@use---fn.map
            var arr = [];
            if (expr) {
                each(this, function(i, e) {
                    var parentNode = e.parentNode;
                    if (judgeEle(parentNode, expr) && arr.indexOf(parentNode) == -1) {
                        arr.push(parentNode);
                    }
                });
            } else {
                each(this, function(i, e) {
                    var parentNode = e.parentNode;
                    if (arr.indexOf(parentNode) == -1) {
                        arr.push(parentNode);
                    }
                });
            }
            return $(arr);
        },
        parents: function(selector) {
            //@use---fn.filter
            var arr = [],
                tars = this;
            while (tars.length > 0) {
                var newtars = [];
                each(tars, function(i, e) {
                    var parentNode = e.parentNode;
                    if (parentNode && parentNode != document && arr.indexOf(parentNode) < 0) {
                        arr.push(parentNode);
                        if (newtars.indexOf() < 0) {
                            newtars.push(parentNode);
                        }
                    }
                });
                tars = newtars;
            };
            return selector ? $(arr).filter(selector) : $(arr);
        },
        each: function(func) {
            each(this, function(i, e) {
                func.call(e, i, e);
            });
            return this;
        },
        index: function(ele) {
            var owner, tar;
            if (!ele) {
                tar = this[0];
                owner = makeArray(tar.parentNode.children);
            } else if (ele.nodeType) {
                tar = ele;
                owner = this;
            } else if (ele instanceof smartyJQ) {
                tar = ele[0];
                owner = this;
            } else if (getType(ele) == "string") {
                tar = this[0];
                owner = $(ele);
            }
            return owner.indexOf(tar);
        },
        hide: function() {
            each(this, function(i, e) {
                e.style['display'] = "none";
            });
            return this;
        },
        show: function() {
            each(this, function(i, e) {
                e.style['display'] = "";
            });
            return this;
        },
        data: function(name, value) {
            var smartData;
            switch (getType(name)) {
                case "string":
                    if (value == undefined) {
                        var tar = this[0];
                        if (!tar) {
                            return;
                        }
                        smartData = tar[SMARTKEY] || (tar[SMARTKEY] = {});

                        return smartData[name] || tar.dataset[name];
                    } else {
                        each(this, function(i, tar) {
                            smartData = tar[SMARTKEY] || (tar[SMARTKEY] = {});
                            smartData[name] = value;
                        });
                    }
                    break;
                case "object":
                    each(this, function(i, tar) {
                        smartData = tar[SMARTKEY] || (tar[SMARTKEY] = {});
                        each(name, function(name, value) {
                            smartData[name] = value;
                        });
                    });
                    break;
                case "undefined":
                    var tar = this[0];
                    smartData = tar[SMARTKEY] || (tar[SMARTKEY] = {});
                    return extend({}, tar.dataset, smartData);
            }
            return this;
        },
        removeData: function(name) {
            each(this, function(i, tar) {
                var smartData = tar[SMARTKEY] || (tar[SMARTKEY] = {});
                delete smartData[name];
            });
            return this;
        },
        //smartEvent事件触发器
        _tr: function(ele, eventName, oriEvent, triggerData, targets) {
            //@use---$._Event
            //@use---fn.parents
            var smartEventData = ele[SMARTKEY + "e"] || (ele[SMARTKEY + "e"] = {});
            var smartEventObj = smartEventData[eventName];

            targets = findEles(ele, targets);

            var newArr = [];
            each(smartEventObj, function(i, handleObj) {
                var newEventObject = new $._Event(oriEvent);

                //设置事件对象
                var ct = newEventObject.delegateTarget = ele;

                //是否可以call
                var cancall = 0;

                //设置targets
                if (targets) {
                    each($(newEventObject.target).parents(), function(i, e) {
                        if (ele == e) {
                            return false;
                        }
                        each(targets, function(i, e2) {
                            if (e == e2) {
                                cancall = 1;
                                ct = e2;
                                return false;
                            }
                        });
                        if (cancall) {
                            return;
                        }
                    });
                } else {
                    cancall = 1;
                }

                if (cancall) {
                    //设置事件名
                    newEventObject.type = eventName;

                    //设置数据
                    newEventObject.data = handleObj.d;
                    newEventObject.currentTarget = ct;

                    //运行事件函数
                    handleObj.f.bind(ele)(newEventObject, triggerData);

                    //判断是否阻止事件继续运行下去
                    if (newEventObject._ips) {
                        return false;
                    }
                }

                if (!handleObj.o) {
                    newArr.push(handleObj);
                }
            });
            smartEventData[eventName] = newArr;
            smartEventObj = null;
        },
        //注册事件
        on: function(arg1, arg2, arg3, arg4, isOne) {
            //@use---fn._tr
            var selectors, data, _this = this;

            if (getType(arg1) == 'object') {
                if (getType(arg2) == 'string') {
                    selectors = arg2;
                    data = arg3;
                } else {
                    data = arg2;
                }
                each(arg1, function(eventName, callback) {
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

            each(eventArr, function(i, eventName) {
                //判断空
                if (!eventName) return;

                each(_this, function(i, tar) {
                    //事件寄宿对象
                    var smartEventData = tar[SMARTKEY + "e"] || (tar[SMARTKEY + "e"] = {});
                    var smartEventObj = smartEventData[eventName];

                    if (!smartEventObj) {
                        //设定事件对象
                        smartEventObj = (smartEventData[eventName] = []);

                        //属于事件元素的，则绑定事件
                        if (tar instanceof EventTarget) {
                            tar.addEventListener(eventName, function(oriEvent) {
                                prototypeObj._tr(tar, eventName, oriEvent, oriEvent.detail, selectors);
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
                        o: isOne
                    });
                });
            });
        },
        //触发事件
        trigger: function(eventName, data) {
            each(this, function(i, tar) {
                //拥有EventTarget的就触发
                if (tar instanceof EventTarget) {
                    // 触发自定义CustomEvent
                    tar.dispatchEvent(new CustomEvent(eventName, {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true,
                        detail: data
                    }));
                    return;
                }

                //触发自定义事件
                prototypeObj._tr(tar, eventName, null, data);
            });
        },
        clone: function() {
            return this.map(function(i, e) {
                return e.cloneNode(true);
            });
        }
    });

    //init
    var $ = function(selector, context) {
        return new smartyJQ(selector, context);
    };
    $.fn = $.prototype = smartyJQ.fn;

    //在$上的方法
    extend($, {
        extend: extend,
        each: each,
        makearray: makeArray,
        merge: merge,
        type: getType,
        _Event: function(oriEvent) {
            var _this = this;

            if (oriEvent) {
                //添加相关属性
                each(['altKey', 'bubbles', 'cancelable', 'changedTouches', 'ctrlKey', 'eventPhase', 'metaKey', 'pageX', 'pageY', 'shiftKey', 'view', 'char', 'charCode', 'key', 'keyCode', 'button', 'buttons', 'clientX', 'clientY', 'offsetX', 'offsetY', 'pointerId', 'pointerType', 'relatedTarget', 'screenX', 'screenY', 'target', 'targetTouches', 'toElement', 'touches', 'which'], function(i, e) {
                    (oriEvent[e] != undefined) && (_this[e] = oriEvent[e]);
                });

                //判断是否自定义事件
                _this._oe = _this.originalEvent = oriEvent;
            }

            extend(_this, {
                // currentTarget: "",
                // data: handleObj.d,
                // delegateTarget: "",
                timeStamp: new Date().getTime(),
            });
        }
    });

    //主体event对象
    $._Event.prototype = {
        isDefaultPrevented: function() {
            return this._dp || false;
        },
        isPropagationStopped: function() {
            return this._ps || false;
        },
        isImmediatePropagationStopped: function() {
            return this._ips || false;
        },
        preventDefault: function() {
            var originalEvent = this._oe;
            originalEvent && originalEvent.preventDefault();
            this._dp = true;
        },
        stopPropagation: function() {
            var originalEvent = this._oe;
            originalEvent && originalEvent.stopPropagation();
            this._ps = true;
        },
        stopImmediatePropagation: function() {
            var originalEvent = this._oe;
            originalEvent && originalEvent.stopImmediatePropagation();
            this._ips = true;
        }
    };

    glo.$ = $;
    glo.smartyJQ = smartyJQ;

})(window);