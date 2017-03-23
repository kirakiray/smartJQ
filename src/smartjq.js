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
        prop: function(name, value) {
            switch (getType(name)) {
                case "string":
                    if (value == undefined) {
                        var tar = this[0];
                        return tar[name];
                    } else if (getType(value) == "function") {
                        each(this, function(i, e) {
                            var revalue = value.call(e, i, e[name]);
                            (revalue != undefined) && (e[name] = revalue);
                        });
                    } else {
                        each(this, function(i, e) {
                            e[name] = value;
                        });
                    }
                    return this;
                case "object":
                    each(this, function(i, e) {
                        each(name, function(k, v) {
                            e[k] = v;
                        });
                    });
                    return this;
            }
        },
        removeProp: function(name) {
            each(this, function(i, e) {
                if (e instanceof EventTarget && name in e.cloneNode()) {
                    e[name] = "";
                } else {
                    delete e[name];
                }
            });
            return this;
        },
        html: function(val) {
            //@use---fn.prop
            return this.prop('innerHTML', val);
        },
        text: function(val) {
            //@use---fn.prop
            return this.prop('innerText', val);
        },
        val: function(vals) {
            //@use---fn.prop
            if (getType(vals) == "array") {
                var mapvals = function(option) {
                    each(vals, function(i, val) {
                        var bool = false;
                        if (option.value == val) {
                            bool = true;
                        }
                        if ("selected" in option) {
                            option.selected = bool;
                        } else if ("checked" in option) {
                            option.checked = bool;
                        }
                        if (bool) {
                            return false;
                        }
                    });
                };
                each(this, function(i, ele) {
                    if (0 in ele) {
                        each(ele, function(i, option) {
                            mapvals(option);
                        });
                    } else {
                        mapvals(ele);
                    }
                });
                mapvals = null;
                return this;
            } else if (vals == "string") {

            } else {

            }
            // return this.prop('value', vals);
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
            targets = $(targets);
            ele = $(ele);
            //最后的id
            var lastid = targets.length - 1;

            each(ele, function(i, e) {
                each(targets, function(i, tar) {
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
            var arr = [];
            each(this, function(i, e) {
                var parentNode = e.parentNode;
                //确定没有重复
                if (arr.indexOf(parentNode) == -1) {
                    //有标识但找不到
                    if (expr && !judgeEle(parentNode, expr)) {
                        return;
                    }
                    arr.push(parentNode);
                }
            });
            return $(arr);
        },
        parentsUntil: function(expr, selector) {
            //@use---fn.parents
            var arr = [],
                tars = this,
                lastEles = $(expr);
            while (tars.length > 0) {
                var newtars = [];
                each(tars, function(i, e) {
                    var parentNode = e.parentNode;
                    if (parentNode && arr.indexOf(parentNode) < 0 && lastEles.indexOf(parentNode) < 0) {
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
        parents: function(selector) {
            //@use---fn.parentsUntil
            return this.parentsUntil(document, selector);
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
        //获取制定对象数据的方法
        _ge: function(obj, keyname) {
            obj[keyname] || Object.defineProperty(obj, keyname, {
                configurable: true,
                writable: true,
                value: {}
            });
            return obj[keyname];
        },
        data: function(name, value) {
            //@use---fn._ge
            var smartData;
            switch (getType(name)) {
                case "string":
                    if (value == undefined) {
                        var tar = this[0];
                        if (!tar) {
                            return;
                        }
                        smartData = prototypeObj._ge(tar, SMARTKEY);

                        return smartData[name] || tar.dataset[name];
                    } else {
                        each(this, function(i, tar) {
                            smartData = prototypeObj._ge(tar, SMARTKEY);
                            smartData[name] = value;
                        });
                    }
                    break;
                case "object":
                    each(this, function(i, tar) {
                        smartData = prototypeObj._ge(tar, SMARTKEY);
                        each(name, function(name, value) {
                            smartData[name] = value;
                        });
                    });
                    break;
                case "undefined":
                    var tar = this[0];
                    smartData = tar[SMARTKEY] || {};
                    return extend({}, tar.dataset, smartData);
            }
            return this;
        },
        removeData: function(name) {
            each(this, function(i, tar) {
                var smartData = prototypeObj._ge(tar, SMARTKEY);
                delete smartData[name];
            });
            return this;
        },
        //smartEvent事件触发器
        // _tr: function(ele, eventName, oriEvent, triggerData, delegatetargets) {
        _tr: function(ele, eventName, oriEvent, triggerData) {
            //@use---$._Event
            //@use---fn.parentsUntil
            var smartEventData = ele[SMARTKEY + "e"];
            if (!smartEventData) return

            var smartEventObjs = smartEventData[eventName];

            var newArr = [];
            each(smartEventObjs, function(i, handleObj) {
                var newEventObject = new $._Event(oriEvent);

                //设置事件对象
                var ct = newEventObject.delegateTarget = ele;

                //是否可以call
                var cancall = 0;

                var delegatetargets = handleObj.s;
                if (delegatetargets) {
                    var tarparent = $(newEventObject.target).parentsUntil(ele, delegatetargets);
                    if (tarparent.length) {
                        ct = tarparent[0];
                        cancall = 1;
                    }
                } else {
                    cancall = 1;
                }

                if (cancall) {
                    //设置事件名
                    newEventObject.type = eventName;

                    //设置数据
                    newEventObject.data = handleObj.d;
                    newEventObject.currentTarget = ct;
                    newEventObject.target || (newEventObject.target = ele);

                    //运行事件函数
                    var f = handleObj.f.bind(ct);
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
            smartEventData[eventName] = newArr;
            smartEventObjs = null;
        },
        //注册事件
        on: function(arg1, arg2, arg3, arg4, isOne) {
            //@use---fn._tr
            //@use---fn._ge
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
                    var smartEventData = prototypeObj._ge(tar, SMARTKEY + "e");
                    var smartEventObj = smartEventData[eventName];

                    if (!smartEventObj) {
                        //设定事件对象
                        smartEventObj = (smartEventData[eventName] = []);

                        //属于事件元素的，则绑定事件
                        if (tar instanceof EventTarget) {
                            tar.addEventListener(eventName, function(oriEvent) {
                                var data = oriEvent._args;
                                prototypeObj._tr(tar, eventName, oriEvent, data);
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
        },
        one: function(event, selector, data, callback) {
            return this.on(event, selector, data, callback, 1);
        },
        //触发事件
        trigger: function(eventName, data) {
            each(this, function(i, tar) {
                //拥有EventTarget的就触发
                if (tar instanceof EventTarget) {
                    var EventClass;
                    if (eventName == "click") {
                        EventClass = MouseEvent;
                    } else if (eventName in tar && ("on" + eventName) in tar) {
                        tar[eventName]();
                        return;
                    } else {
                        EventClass = Event;
                    }
                    // 触发自定义CustomEvent
                    var event = new EventClass(eventName, {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    });
                    event._args = data;
                    tar.dispatchEvent(event);
                } else {
                    //触发自定义事件
                    prototypeObj._tr(tar, eventName, null, data);
                }
            });
            return this;
        },
        off: function(types, selector, fn) {
            each(this, function(i, ele) {
                var smartEventData = ele[SMARTKEY + "e"];
                if (!smartEventData) return

                var arg2Type = getType(selector);

                switch (getType(types)) {
                    case "string":
                        var smartEventData_types = smartEventData[types];
                        if (!selector) {
                            delete smartEventData[types];
                        } else if (arg2Type == "function") {
                            smartEventData[types] = smartEventData_types.filter(function(e) {
                                return e.f == selector ? 0 : 1;
                            });
                        } else if (arg2Type == "string") {
                            if (!fn) {
                                smartEventData[types] = smartEventData_types.filter(function(e) {
                                    return e.s == selector ? 0 : 1;
                                });
                            } else {
                                smartEventData[types] = smartEventData_types.filter(function(e) {
                                    return (e.s == selector && e.f == fn) ? 0 : 1;
                                });
                            }
                        }
                        break;
                    case "undefined":
                        for (var i in smartEventData) {
                            delete smartEventData[i];
                        }
                        break;
                    case "object":
                        var _this;
                        each(types, function(k, v) {
                            _this.off(k, v);
                        });
                        return;
                }
            });
            return this;
        },
        bind: function(event, data, callback) {
            return this.on(event, data, callback);
        },
        unbind: function(event, callback) {
            return this.off(event, callback)
        },
        triggerHandler: function(eventName, data) {
            //@use---fn._tr
            var tar = this[0];
            tar && prototypeObj._tr(tar, eventName, null, data);
            return this;
        },
        delegate: function(selector, types, data, fn) {
            return this.on(types, selector, data, fn);
        },
        undelegate: function(selector, types, fn) {
            return this.off(types, selector, fn);
        },
        hover: function(fnOver, fnOut) {
            return this.on('mouseenter', fnOver).on('mouseleave', fnOut || fnOver);
        },
        clone: function(isDeep) {
            //@use---fn._tr
            var arr = [];

            //克隆自定义方法和自定义数据
            var mapCloneEvent = function(ele, tarele) {
                var customData = ele[SMARTKEY],
                    eventData = ele[SMARTKEY + "e"];

                if (eventData) {
                    //事件处理
                    each(eventData, function(eventName) {
                        tarele.addEventListener(eventName, function(oriEvent) {
                            var data = oriEvent._args;
                            prototypeObj._tr(tarele, eventName, oriEvent, data);
                        });
                    });
                    tarele[SMARTKEY + "e"] = eventData;
                }

                //设定数据
                customData && (tarele[SMARTKEY] = customData);

                //判断是否有children
                var childs = ele.children;
                var tarchild = tarele.children;
                if (childs.length) {
                    each(childs, function(i, e) {
                        mapCloneEvent(e, tarchild[i]);
                    });
                }
            };

            each(this, function(i, e) {
                var cloneEle = e.cloneNode(true);
                isDeep && mapCloneEvent(e, cloneEle);
                arr.push(cloneEle);
            });

            //回收
            mapCloneEvent = null;

            return $(arr);
        }
    });

    //设置event
    each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "), function(i, e) {
        prototypeObj[e] = function(callback) {
            callback ? this.on(e, callback) : this.trigger(e);
        }
    })

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
                each(['altKey', 'bubbles', 'cancelable', 'changedTouches', 'ctrlKey', 'detail', 'eventPhase', 'metaKey', 'pageX', 'pageY', 'shiftKey', 'view', 'char', 'charCode', 'key', 'keyCode', 'button', 'buttons', 'clientX', 'clientY', 'offsetX', 'offsetY', 'pointerId', 'pointerType', 'relatedTarget', 'screenX', 'screenY', 'target', 'targetTouches', 'timeStamp', 'toElement', 'touches', 'which'], function(i, e) {
                    (oriEvent[e] != undefined) && (_this[e] = oriEvent[e]);
                });

                //判断是否自定义事件
                _this.originalEvent = oriEvent;
            }

            _this.timeStamp || (_this.timeStamp = new Date().getTime());
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
            var originalEvent = this.originalEvent;
            originalEvent && originalEvent.preventDefault();
            this._dp = true;
        },
        stopPropagation: function() {
            var originalEvent = this.originalEvent;
            originalEvent && originalEvent.stopPropagation();
            this._ps = true;
        },
        stopImmediatePropagation: function() {
            var originalEvent = this.originalEvent;
            originalEvent && originalEvent.stopImmediatePropagation();
            this._ips = true;
        }
    };

    glo.$ = $;
    glo.smartyJQ = smartyJQ;

})(window);