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
            return obj;
        };
    })();

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

        //判断表达式是否空
        if (!expr) {
            return owner.length ? owner : [owner];
        }

        //判断是否有专属选择器
        var speMatch = expr.match(spe_expr);

        //存在专属字符进入专属字符通道
        if (speMatch) {
            //not有对专用字符有特殊的处理渠道
            if (expr.match(/(.+?):not\((.+?)\)/)) {
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
                redata = owner.querySelectorAll(expr);
            }
        }

        return makeArray(redata);
    };
    //SmartFinder---------end

    //判断元素是否符合条件
    var judgeEle = function(ele, expr) {
        var fadeParent = document.createElement('div');
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
            default:
                if (arg1 instanceof smartyJQ) {
                    return arg1;
                } else if (arg1 instanceof Array) {
                    merge(this, arg1);
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
                        var psv = parseFloat(v);
                        if (psv && psv == v) {
                            v += "px";
                        }
                        e.style[n] = v;
                    });
                });
            } else if (getType(name) == "string" && value != undefined) {
                each(this, function(i, e) {
                    e.style[name] = value;
                });
            } else if (getType(name) == "string" && !value) {
                return getComputedStyle(this[0])[name];
            }
            return this;
        },
        offset: function() {
            // if (!options) {
            var tar = this[0];
            var boundingClientRect = tar.getBoundingClientRect();

            return {
                top: boundingClientRect.top + window.pageYOffset,
                left: boundingClientRect.left + window.pageXOffset
            };
            // }
        },
        position: function() {
            //@use---fn.css
            //@use---fn.offset
            //获取父元素
            var offsetParent = $(this[0].offsetParent);
            // var parentOffset = offsetParent.offset();
            var tarOffset = this.offset();

            var martop = parseFloat(this.css('marginTop'));
            var marleft = parseFloat(this.css('marginLeft'));

            var parentBordertop = parseFloat(offsetParent.css('borderTopWidth'));
            var parentBorderleft = parseFloat(offsetParent.css('borderLeftWidth'));

            return {
                // top: tarOffset.top - parentOffset.top - martop - parentBordertop,
                // left: tarOffset.left - parentOffset.left - marleft - parentBorderleft,
                top: tarOffset.top - martop - parentBordertop,
                left: tarOffset.left - marleft - parentBorderleft
            };
        },
        _sc: function(key, val) {
            return val == undefined ? this[0][key] : each(this, function(i, tar) {
                tar[key] = val;
            });
        },
        scrollTop: function(val) {
            //@use---fn._sc
            return this._sc('scrollTop', val);
        },
        scrollLeft: function(val) {
            //@use---fn._sc
            return this._sc('scrollLeft', val);
        },
        _wh: function(key, val) {
            //@use---fn.css
            switch (getType(val)) {
                case "function":
                    return each(this, function(i, tar) {
                        var $tar = $(tar);
                        var reval = val.call(tar, i, parseFloat($tar.css(key)));
                        reval && $tar[key](reval);
                    });
                case "undefined":
                    return parseFloat(this.css(key));
                case "number":
                    val += "px";
                case "string":
                    return each(this, function(i, tar) {
                        $(tar).css(key, val);
                    });
            }
        },
        height: function(val) {
            //@use---fn._wh
            return this._wh("height", val);
        },
        width: function(val) {
            //@use---fn._wh
            return this._wh("width", val);
        },
        innerHeight: function() {
            return this[0].clientHeight;
        },
        innerWidth: function() {
            return this[0].clientWidth;
        },
        outerHeight: function() {
            return this[0].offsetHeight;
        },
        outerWidth: function() {
            return this[0].offsetWidth;
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
            return each(this, function(i, tar) {
                tar.removeAttribute(name);
            });
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
                    break;
                case "object":
                    each(this, function(i, e) {
                        each(name, function(k, v) {
                            e[k] = v;
                        });
                    });
            }
            return this;
        },
        removeProp: function(name) {
            return each(this, function(i, e) {
                // if (e instanceof EventTarget && name in e.cloneNode()) {
                if (e.nodeType && name in e.cloneNode()) {
                    e[name] = "";
                } else {
                    delete e[name];
                }
            });
        },
        html: function(val) {
            //@use---fn.prop
            if (val instanceof smartyJQ) {
                //市面上有好多插件使用不规范写法，下面针对不规范写法做兼容，有需要以后会去除掉
                each(this, function(i, e) {
                    e.innerHTML = "";
                    e.appendChild(val[0]);
                });
            } else {
                return this.prop('innerHTML', val);
            }
        },
        text: function(val) {
            //@use---fn.prop
            return this.prop('innerText', val);
        },
        val: function(vals) {
            //@use---fn.prop
            switch (getType(vals)) {
                case "array":
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
                case "undefined":
                    var tar = this[0];
                    if (tar.multiple) {
                        var rearr = [];
                        each(tar, function(i, e) {
                            (e.selected || e.checked) && rearr.push(e.value);
                        });
                        return rearr;
                    }
                default:
                    return this.prop('value', vals);

            }
        },
        addClass: function(name) {
            return each(this, function(i, e) {
                e.classList.add(name);
            });
        },
        removeClass: function(name) {
            return each(this, function(i, e) {
                e.classList.remove(name);
            });
        },
        toggleClass: function(name) {
            return each(this, function(i, e) {
                e.classList.toggle(name);
            });
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
        replaceWith: function(newContent) {
            //@use---fn.before
            return this.before(newContent).remove();
        },
        replaceAll: function(tar) {
            //@use---fn.replaceWith
            tar = $(tar);
            tar.replaceWith(this);
            return this;
        },
        wrap: function(val) {
            var valtype = getType(val);
            each(this, function(i, tar) {
                var reval = val;
                if (valtype == "function") {
                    reval = val.call(tar, i);
                }
                if (reval) {
                    reval = $(reval)[0];
                    tar.parentNode.insertBefore(reval, tar);
                    reval.appendChild(tar);
                }
            });
        },
        unwrap: function() {
            //@use---fn.parent
            //@use---fn.replaceWith
            this.parent().each(function(i, tar) {
                $(tar).replaceWith(makeArray(this.childNodes))
            })
            return this
        },
        wrapAll: function(structure) {
            //@use---fn.children
            if (this[0]) {
                $(this[0]).before(structure = $(structure))
                var children
                while ((children = structure.children()).length) structure = $(children[0])
                $(structure).append(this)
            }
            return this
        },
        wrapInner: function(content) {
            //@use---fn.append
            // var func = getType(structure) == "function";
            // return this.each(function(index) {
            //     var self = $(this),
            //         contents = self.contents(),
            //         dom = func ? structure.call(this, index) : structure
            //     contents.length ? contents.wrapAll(dom) : self.append(dom)
            // });

            return each(this, function(i, tar) {
                var c = content;
                if (getType(content) == "function") {
                    c = content.call(tar, i);
                }
                c = $(c)[0];
                each(tar.childNodes, function(i, tar) {
                    c.appendChild(tar);
                });
                // c = $(c).append(makeArray(tar.childNodes));
                tar.appendChild(c);
            });
        },
        empty: function() {
            return each(this, function(i, e) {
                e.innerHTML = "";
            });
        },
        remove: function(expr) {
            each(this, function(i, e) {
                if (expr) {
                    if (!judgeEle(e, expr)) return;
                }
                e.parentNode.removeChild(e);
            });
        },
        offsetParent: function() {
            var arr = [];
            each(this, function(i, e) {
                arr.push(e.offsetParent || document.body);
            });
            return $(arr);
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
        first: function() {
            //@use---fn.eq
            return this.eq(0);
        },
        last: function() {
            //@use---fn.eq
            return this.eq(-1);
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
                    break;
                default:
                    if (expr instanceof smartyJQ) {
                        each(this, function(i, e) {
                            each(expr, function(i, tar) {
                                (e == tar) && arr.push(e);
                            });
                        });
                    } else if (expr.nodeType) {
                        each(this, function(i, e) {
                            (e == expr) && arr.push(e);
                        });
                    }
            }
            return $(arr);
        },
        not: function(expr) {
            //@use---fn.filter
            return this.filter(function(i, e) {
                return !judgeEle(e, expr);
            });
        },
        is: function(expr) {
            //@use---fn.filter
            var tars = this.filter(expr);
            return !!tars.length;
        },
        _np: function(expr, key) {
            var arr = [];
            each(this, function(i, tar) {
                tar = tar[key];
                if (!tar || arr.indexOf(tar) != -1 || (expr && !judgeEle(tar, expr))) {
                    return;
                }
                arr.push(tar);
            });
            return $(arr);
        },
        next: function(expr) {
            //@use---fn._np
            return this._np(expr, "nextElementSibling");
        },
        prev: function(expr) {
            //@use---fn._np
            return this._np(expr, "previousElementSibling");
        },
        parent: function(expr) {
            //@use---fn._np
            return this._np(expr, "parentNode");
        },
        _nu: function(key, filter, lastExpr) {
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
            each(this, function(i, tar) {
                getEle(tar);
            });
            getEle = null;
            return $(arr);
        },
        nextUntil: function(lastExpr, filter) {
            //@use---fn._nu
            return this._nu('nextElementSibling', filter, lastExpr);
        },
        prevUntil: function(lastExpr, filter) {
            //@use---fn._nu
            return this._nu('previousElementSibling', filter, lastExpr);
        },
        parentsUntil: function(lastExpr, filter) {
            //@use---fn._nu
            return this._nu('parentNode', filter, lastExpr);
        },
        nextAll: function(filter) {
            //@use---fn._nu
            return this._nu('nextElementSibling', filter);
        },
        prevAll: function(filter) {
            //@use---fn._nu
            return this._nu('previousElementSibling', filter);
        },
        parents: function(filter) {
            //@use---fn._nu
            return this._nu('parentNode', filter, document);
        },
        closest: function(selector, context) {
            //@use---fn.parentsUntil
            //@use---fn.parent
            var parentEles = $(selector).parent();
            context && parentEles.push(context);
            return this.parentsUntil(parentEles, selector);
        },
        siblings: function(expr) {
            //@use---fn.parent
            //@use---fn.children
            //@use---fn.map
            var _this = this;
            return this.parent().children(expr).map(function() {
                if (_this.indexOf(this) == -1) return this
            });
        },
        find: function(arg) {
            //@use---fn.parentsUntil
            var eles = [];
            if (getType(arg) == "string") {
                each(this, function(i, e) {
                    var arr = findEles(e, arg);
                    each(arr, function(i, e) {
                        if (eles.indexOf(e) == -1) {
                            eles.push(e);
                        }
                    });
                });
            } else if (arg instanceof smartyJQ || arg.nodeType) {
                arg.nodeType && (arg = [arg]);
                var $this = this;
                each(arg, function(i, tar) {
                    var lastele = [].pop.call($(tar).parentsUntil($this));
                    if (lastele != document) {
                        eles.push(lastele);
                    }
                });
            }
            return $(eles);
        },
        has: function(expr) {
            //@use---fn.find
            var arr = [];
            each(this, function(i, tar) {
                if (0 in $(tar).find(expr)) {
                    arr.push(tar);
                }
            });
            return $(arr);
        },
        each: function(func) {
            return each(this, function(i, e) {
                func.call(e, i, e);
            });
            // return this;
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
            return each(this, function(i, e) {
                e.style['display'] = "none";
            });
            // return this;
        },
        show: function() {
            return each(this, function(i, e) {
                e.style['display'] = "";
            });
            // return this;
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
            return each(this, function(i, tar) {
                var smartData = prototypeObj._ge(tar, SMARTKEY);
                delete smartData[name];
            });
            // return this;
        },
        //smartEvent事件触发器
        _tr: function(ele, eventName, newEventObject, triggerData) {
            //@use---fn.parentsUntil
            var smartEventData = ele[SMARTEVENTKEY];
            if (!smartEventData) return

            var smartEventObjs = smartEventData[eventName];

            var newArr = [];
            each(smartEventObjs, function(i, handleObj) {
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
            if (!(0 in newArr)) {
                delete smartEventData[eventName];
            } else {
                smartEventData[eventName] = newArr;
            }
            smartEventObjs = null;
        },
        //注册事件
        on: function(arg1, arg2, arg3, arg4, isOne) {
            //@use---fn._tr
            //@use---fn._ge
            //@use---$.Event
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
        },
        one: function(event, selector, data, callback) {
            //@use---fn.on
            return this.on(event, selector, data, callback, 1);
        },
        //触发事件
        trigger: function(eventName, data) {
            //@use---fn._tr
            //@use---$.Event
            return each(this, function(i, tar) {
                var event = $.Event(eventName);
                //拥有EventTarget的就触发
                // if (tar instanceof EventTarget) {
                if (tar.nodeType) {
                    var eName = event.type;

                    //判断自身是否有该事件触发
                    if (eName in tar && ("on" + eName) in tar) {
                        tar[eName]();
                        return;
                    }
                    //设置target
                    event.target = tar;

                    //手动模拟事件触发
                    var popTriggerEle = function(ele) {
                        prototypeObj._tr(ele, eName, event, data);

                        //没有阻止冒泡就继续往上触发
                        if (!event.cancelBubble) {
                            var parentNode = ele.parentNode;
                            if (parentNode != document) { popTriggerEle(parentNode); }
                        }
                    };

                    //点火
                    popTriggerEle(tar);

                    //内存回收
                    popTriggerEle = null;
                } else {
                    //触发自定义事件
                    prototypeObj._tr(tar, eventName, event, data);
                }
            });
        },
        off: function(types, selector, fn) {
            return each(this, function(i, ele) {
                var smartEventData = ele[SMARTEVENTKEY];
                if (!smartEventData) return

                if (!types) {
                    for (var k in smartEventData) {
                        delete smartEventData[k];
                    }
                    return;
                }

                var arg2Type = getType(selector);
                each(types.split(' '), function(ii, eventName) {
                    switch (getType(eventName)) {
                        case "string":
                            var smartEventData_eventName = smartEventData[eventName];
                            if (!selector) {
                                delete smartEventData[eventName];
                            } else if (arg2Type == "function") {
                                smartEventData[eventName] = smartEventData_eventName.filter(function(e) {
                                    return e.f == selector ? 0 : 1;
                                });
                            } else if (arg2Type == "string") {
                                if (!fn) {
                                    smartEventData[eventName] = smartEventData_eventName.filter(function(e) {
                                        return e.s == selector ? 0 : 1;
                                    });
                                } else {
                                    smartEventData[eventName] = smartEventData_eventName.filter(function(e) {
                                        return (e.s == selector && e.f == fn) ? 0 : 1;
                                    });
                                }
                            }
                            break;
                            // case "undefined":
                            //     break;
                        case "object":
                            var _this;
                            each(eventName, function(k, v) {
                                _this.off(k, v);
                            });
                            return;
                    }
                });
            });
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
            tar && prototypeObj._tr(tar, eventName, $.Event(eventName), data);
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
            //@use---$.Event
            var arr = [];

            //克隆自定义方法和自定义数据
            var mapCloneEvent = function(ele, tarele) {
                var customData = ele[SMARTKEY],
                    eventData = ele[SMARTEVENTKEY];

                if (eventData) {
                    //事件处理
                    each(eventData, function(eventName) {
                        tarele.addEventListener(eventName, function(oriEvent) {
                            prototypeObj._tr(tarele, eventName, $.Event(oriEvent));
                        });
                    });
                    tarele[SMARTEVENTKEY] = extend({}, eventData);
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
        },
        add: function(expr, content) {
            var $this = this;
            each($(expr, content), function(i, e) {
                if ($this.indexOf(e) == -1) {
                    $this.push(e);
                }
            });
            return $this;
        },
        contents: function() {
            var arr = [];
            each(this, function(i, tar) {
                merge(arr, tar.childNodes);
            });
            return $(arr);
        }
    });



    //init
    var $ = function(selector, context) {
        if (selector instanceof smartyJQ) {
            return selector;
        }
        if (!selector) {
            return $([]);
        }
        return new smartyJQ(selector, context);
    };
    $.fn = $.prototype = smartyJQ.fn;

    //在$上的方法
    extend($, {
        extend: extend,
        each: each,
        makeArray: makeArray,
        merge: merge,
        type: getType,
        isPlainObject: function(val) {
            for (var i in val) {
                return true;
            }
            return false;
        },
        proxy: function(arg1, arg2) {
            var args = makeArray(arguments).slice(2);
            var tarfun, context;

            //修正必要参数
            var arg1type = getType(arg1);
            if (arg1type == "object") {
                tarfun = arg1[arg2];
                context = arg1;
            } else if (arg1type == "function") {
                tarfun = arg1;
                context = arg2;
            }

            return function() {
                tarfun.apply(context, args);
            };
        },
        isFunction: function(tar) {
            return getType(tar) == "function";
        }
    });

    //@set---fn.blur fn.focus fn.focusin fn.focusout fn.resize fn.scroll fn.click fn.dblclick fn.mousedown fn.mouseup fn.mousemove fn.mouseover fn.mouseout fn.mouseenter fn.mouseleave fn.change fn.select fn.submit fn.keydown fn.keypress fn.keyup fn.contextmenu---start
    //设置event
    each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "), function(i, e) {
            prototypeObj[e] = function(callback) {
                callback ? this.on(e, callback) : this.trigger(e);
            }
        })
        //@set---fn.blur fn.focus fn.focusin fn.focusout fn.resize fn.scroll fn.click fn.dblclick fn.mousedown fn.mouseup fn.mousemove fn.mouseover fn.mouseout fn.mouseenter fn.mouseleave fn.change fn.select fn.submit fn.keydown fn.keypress fn.keyup fn.contextmenu---end

    //动画
    //@set---fn.animate fn.stop---start
    //获取立方根的方法
    var getCbrt = (function() {
        if (Math.cbrt) {
            return Math.cbrt;
        } else {
            return function(x) {
                var y = Math.pow(Math.abs(x), 1 / 3);
                return x < 0 ? -y : y;
            };
        }
    })();

    //动画函数主体
    prototypeObj.animate = function(prop, arg2, arg3, arg4) {
        var animateTime = 400,
            easing = 'swing',
            callback;
        var _this = this;
        //以下为增强选项
        var delay = 0,
            progress, start, queue = 1;

        //设置 _task array
        _this._tasks || (_this._tasks = []);

        //对齐参数
        switch (getType(arg2)) {
            case "number":
                animateTime = arg2
                if (getType(arg3) == "string") {
                    easing = arg3
                    callback = arg4;
                } else {
                    callback = arg3;
                }
                break;
            case "string":
                if (/\D/.test(arg2)) {
                    easing = arg2;
                    callback = arg3;
                    break;
                }
                arg2 = parseFloat(arg2);
            case "function":
                callback = arg2;
                break;
            case "object":
                arg2.duration && (animateTime = arg2.duration);
                arg2.easing && (easing = arg2.easing);
                arg2.complete && (callback = arg2.complete);
                arg2.delay && (delay = arg2.delay);
                arg2.start && (start = arg2.start);
                arg2.progress && (progress = arg2.progress);
                (arg2.queue != undefined) && (queue = arg2.queue)
                break;
        }

        //获取动画帧的方法
        var getFrame = function(t) {
            //默认就是得到返回的
            return t;
        };
        //判断是否有动画曲线
        if (easing && easing != "linear") {
            //得到坐标点
            var p1x, p1y, p2x, p2y;

            if (/cubic-bezier/.test(easing)) {
                //替换相应字符串
                easing = easing.replace('cubic-bezier(', "").replace(")", "");
                var easingArr = easing.split(',');
                //得到坐标点
                p1x = parseFloat(easingArr[0]);
                p1y = parseFloat(easingArr[1]);
                p2x = parseFloat(easingArr[2]);
                p2y = parseFloat(easingArr[3]);
            } else {
                switch (easing) {
                    case "ease":
                        p1x = 0.25, p1y = 0.1, p2x = 0.25, p2y = 1;
                        break;
                    case "ease-in":
                        p1x = 0.42, p1y = 0, p2x = 1, p2y = 1;
                        break;
                    case "ease-out":
                        p1x = 0, p1y = 0, p2x = 0.58, p2y = 1;
                        break;
                    case "swing":
                    case "ease-in-out":
                        p1x = 0.42, p1y = 0, p2x = 0.58, p2y = 1;
                        break;
                }
            }

            //筛选到最后，使用盛金公式法求解t
            //区间在0-1之间，t绝对不会出现负数或大于1的情况
            getFrame = function(tt) {
                if (tt == 0 || tt == 1) {
                    return tt;
                }
                var a = 1 + 3 * p1x - 3 * p2x;
                var b = 3 * p2x - 6 * p1x;
                var c = 3 * p1x;
                var d = -tt;

                var A = b * b - 3 * a * c;
                var B = b * c - 9 * a * d;
                var C = c * c - 3 * b * d;
                var delta = B * B - 4 * A * C;

                var t;
                if (delta > 0) {
                    var Y1 = A * b + 3 * a * (-B + Math.sqrt(delta)) / 2;
                    var Y2 = A * b + 3 * a * (-B - Math.sqrt(delta)) / 2;

                    //t只会在区间0-1，综合测试后得到的这个0到1区间的值
                    t = (-b - (getCbrt(Y1) + getCbrt(Y2))) / (3 * a);
                } else {
                    var Y = (2 * A * b - 3 * a * B) / (2 * Math.sqrt(A * A * A));
                    var angle = Math.acos(Y) / 3;
                    t = (-b + Math.sqrt(A) * (Math.cos(angle) - Math.sqrt(3) * Math.sin(angle))) / (3 * a);
                }
                var by = Math.pow(t, 3) + (3 * p1y * t * Math.pow(1 - t, 2)) + (3 * p2y * Math.pow(t, 2) * (1 - t));
                return by;
            };
        }

        var animationId;
        var funArr = [];

        var startTime;
        var animeFun = function(timestamp) {
            //记录开始时间
            startTime || (startTime = timestamp);

            //获取进度时间
            var diffTime = timestamp - startTime;

            //当前进度
            var nowPercentage = (diffTime > animateTime ? animateTime : diffTime) / animateTime;
            nowPercentage = getFrame(nowPercentage)
            funArr.forEach(function(e) {
                e(nowPercentage);
            });

            //运行进度函数
            progress && progress(nowPercentage);

            if (diffTime <= animateTime) {
                animationId = requestAnimationFrame(animeFun);
            } else {
                animateEnd(1);
            }
        };

        var animateEnd = function(isEnd) {
            //清除动画
            cancelAnimationFrame(animationId);

            if (isEnd) {
                funArr.forEach(function(e) {
                    e(1);
                });
                callback && callback();
            }

            //内存回收
            callback = funArr = getFrame = animeFun = null;
            delete _this._aEnd;

            //有下一个任务就运行下一个任务
            if (queue) {
                var nextTask = _this._tasks.shift();
                if (nextTask) {
                    nextTask(0);
                } else {
                    delete _this._tasks;
                    delete _this._isRT;
                }
            }
            _this = null;
        };

        var runanime = function() {
            _this._aEnd = animateEnd;

            //添加运行函数
            each(_this, function(i, tar) {
                var computeStyleObj = getComputedStyle(tar);
                each(prop, function(name, value) {
                    //获取当前值
                    var nowValue = parseFloat(computeStyleObj[name]);

                    if (nowValue) {
                        //修正值
                        value = parseFloat(value);

                        //获取差值
                        var diffVal = value - nowValue;

                        funArr.push(function(p) {
                            //设置当前值
                            tar.style[name] = nowValue + diffVal * p + "px";
                        });
                    } else {
                        nowValue = tar[name];

                        //获取差值
                        var diffVal = value - nowValue;

                        funArr.push(function(p) {
                            //设置当前值
                            tar[name] = nowValue + diffVal * p;
                        });
                    }
                });
            });

            setTimeout(function() {
                start && start();
                animeFun && animeFun(0);
            }, delay);
        };

        if (!_this._isRT || !queue) {
            runanime();
        } else {
            _this._tasks.push(runanime);
        }

        //设置动画进程开始
        _this._isRT = 1;

        return this;
    };

    prototypeObj.stop = function(clearQueue, gotoEnd) {
        if (clearQueue) {
            this._tasks = [];
        }
        var aEndArg = 0;
        gotoEnd && (aEndArg = 1);
        this._aEnd(aEndArg);
    }

    //@set---fn.animate fn.stop---end

    //@set---$.Event---start
    $.Event = function(oriEvent, props) {
        var _this = this;

        if (!(this instanceof $.Event)) {
            return new $.Event(oriEvent, props);
        } else if (oriEvent instanceof $.Event) {
            return oriEvent;
        }

        if (oriEvent && oriEvent.type) {
            //添加相关属性
            each(['altKey', 'bubbles', 'cancelable', 'changedTouches', 'ctrlKey', 'detail', 'eventPhase', 'metaKey', 'pageX', 'pageY', 'shiftKey', 'view', 'char', 'charCode', 'key', 'keyCode', 'button', 'buttons', 'clientX', 'clientY', 'offsetX', 'offsetY', 'pointerId', 'pointerType', 'relatedTarget', 'screenX', 'screenY', 'target', 'targetTouches', 'timeStamp', 'toElement', 'touches', 'which'], function(i, e) {
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
    //@set---$.Event---end


    //@set---$.Deferred---start
    //@use---fn.one
    //@use---fn.off
    //_p是内置事件名
    var _PROMISE_DONE = "_resolved";
    var _PROMISE_REJECT = "_rejected";
    var _PROMISE_PENDING = "_pending";
    $.Deferred = function() {
        if (this instanceof $.Deferred) {
            this._state = _PROMISE_PENDING;
        } else {
            return new $.Deferred();
        }
    };
    $.Deferred.prototype = {
        notify: function(data) {
            $(this).trigger(_PROMISE_PENDING, data);
        },
        progress: function(callback) {
            var _this = this;
            $(_this).on(_PROMISE_PENDING, function(e, data) {
                callback(data);
            });
            return _this;
        },
        resolve: function(data) {
            $(this).trigger(_PROMISE_DONE, data);
        },
        done: function(callback) {
            var _this = this;
            $(_this).one(_PROMISE_DONE, function(e, data) {
                _this._state = _PROMISE_DONE;
                callback(data);
                //清除无用事件
                $(_this).off(_PROMISE_REJECT + " " + _PROMISE_PENDING);
            });
            return _this;
        },
        reject: function(data) {
            $(this).trigger(_PROMISE_REJECT, data);
        },
        fail: function(callback) {
            var _this = this;
            $(_this).one(_PROMISE_REJECT, function(e, data) {
                _this._state = _PROMISE_REJECT;
                callback(data);
                //清除无用事件
                $(_this).off(_PROMISE_DONE + " " + _PROMISE_PENDING);
            });
            return _this;
        },
        always: function(callback) {
            $(this).one(_PROMISE_DONE + " " + _PROMISE_REJECT, function(e, data) {
                callback(data);
            });
            return this;
        },
        state: function() {
            return this._state.replace("_", "");
        },
        promise: function() {
            var newDeferred = new $.Deferred();
            //继承事件
            $(this).on(_PROMISE_DONE + " " + _PROMISE_REJECT + " " + _PROMISE_PENDING, function(e, data) {
                $(newDeferred).trigger(e.type, data);
            });
            return newDeferred;
        }
    };
    //@set---$.Deferred---end

    //@set---$.ajax $.ajaxSetup---start
    //@use---$.Deferred
    //@use---$.extend
    //@use---$.each
    //@use---fn.on
    //@use---fn.trigger
    var ajaxDefaults = {
        type: "GET",
        url: "",
        // context: "",
        // data: "",
        dataType: "json",
        // headers: "",
        jsonp: "callback",
        jsonpCallback: SMARTKEY + "_c",
        mimeType: "",
        username: null,
        password: null,
        // statusCode: {},
        success: "",
        // timeout: "",
        global: 1,
        // xhr: "",
        async: true
    };
    var ajax = function(options) {
        var defaults = extend({
            beforeSend: "",
            error: "",
            dataFilter: "",
            success: "",
            complete: ""
        }, ajaxDefaults, options);

        //根据dataType做不同操作
        var dataType = defaults.dataType.toLowerCase();

        //生成返回的deferred对象
        var deferred = new $.Deferred();

        //绑定函数
        deferred.done(function(e) {
            defaults.success && defaults.success(e);
        });
        deferred.fail(function(e) {
            defaults.error && defaults.error(e);
        });
        deferred.always(function(e) {
            defaults.complete && defaults.complete(e);
        });

        if (dataType == "jsonp") {
            var script = $('<script src="' + defaults.url + ((defaults.url.search(/\?(.+)/) > -1) ? "&" : "?") + defaults.jsonp + "=" + defaults.jsonpCallback + '" />')[0];
            window[defaults.jsonpCallback] = function(data) {
                deferred.resolve(data);
                delete window[defaults.jsonpCallback];
                $(ajaxDefaults).trigger('success');
                $(ajaxDefaults).trigger('complete');
            };
            // script.onload = function() {};
            script.onerror = function(e) {
                deferred.reject(e);
                $(ajaxDefaults).trigger('error');
                $(ajaxDefaults).trigger('complete');
            };
            $('head').append(script);

            return deferred;
        }

        //发送请求主体
        var xhr = defaults.xhr || new XMLHttpRequest();

        //设置专用函数
        var deferredObj = {
            //状态
            readyState: 0,
            //注销请求的方法
            abort: function() {
                xhr.abort();
            },
            getResponseHeader: function(name) {
                return xhr.getResponseHeader(name);
            }
        };
        $.extend(deferred, deferredObj);

        //设置返回数据类型
        xhr.responseType = dataType;

        //注册状态改变事件
        xhr.addEventListener('readystatechange', function(e) {
            deferred.readyState = xhr.readyState;
            //判断响应
            if (defaults.statusCode && defaults.statusCode[xhr.status]) {
                defaults.statusCode[xhr.status]();
            }
        });
        xhr.addEventListener('load', function(e) {
            deferred.resolve(e.result);
            $(ajaxDefaults).trigger('success', e);
            $(ajaxDefaults).trigger('complete', e);
        });
        xhr.addEventListener('error', function(e) {
            deferred.reject(e);
            $(ajaxDefaults).trigger('error', e);
            $(ajaxDefaults).trigger('complete', e);
        });

        //设置timeout
        defaults.timeout && (xhr.timeout = defaults.timeout);
        xhr.addEventListener('timeout', function() {
            $(ajaxDefaults).trigger('stop');
        });

        //设置请求头
        defaults.headers && $.each(defaults.headers, function(k, v) {
            xhr.setRequestHeader(k, v);
        });

        //MIME
        defaults.mimeType && xhr.overrideMimeType(defaults.mimeType);

        //设置请求类型
        xhr.open(defaults.type, defaults.url, defaults.async, defaults.username, defaults.password);

        $(ajaxDefaults).trigger('start');

        //发送请求
        xhr.send(defaults.data);

        $(ajaxDefaults).trigger('send');

        return deferred;
    };
    $.ajax = ajax;
    $.ajaxSetup = function(options) {
        extend(ajaxDefaults, options);
    };
    // var setAjaxFun = function(arr, func) {
    //     arr.forEach(function(fname) {
    //         $["ajax" + fname.replace(/(^\w)(.+)/, function(a, b, c) {
    //             return b.toUpperCase() + c
    //         })] = function(callback) {
    //             $(ajaxDefaults).on(fname, function(e, event) {
    //                 callback(event, xhr, defaults);
    //             });
    //         }
    //     });
    // };
    // $.ajaxSuccess = function(callback) {
    //     $(ajaxDefaults).on('success', function(e, event) {
    //         callback(event, xhr, defaults);
    //     });
    // };
    // $.ajaxError = function(callback) {
    //     $(ajaxDefaults).on('error', function(e, event) {
    //         callback(event, xhr, defaults);
    //     });
    // };
    // $.ajaxComplete = function(callback) {
    //     $(ajaxDefaults).on('complete', function(e, event) {
    //         callback(event, xhr, defaults);
    //     });
    // };
    ['success', 'error', 'complete'].forEach(function(fname) {
        $["ajax" + fname.replace(/(^\w)(.+)/, function(a, b, c) {
            return b.toUpperCase() + c
        })] = function(callback) {
            $(ajaxDefaults).on(fname, function(e, event) {
                callback(event, xhr, defaults);
            });
        }
    });
    $.ajaxSend = function(callback) {
        $(ajaxDefaults).on('send', callback);
    };
    $.ajaxStart = function(callback) {
        $(ajaxDefaults).on('start', callback);
    };
    $.ajaxStop = function(callback) {
        $(ajaxDefaults).on('stop', callback);
    };
    //@set---$.ajax $.ajaxSetup---end

    glo.$ = $;
    glo.smartyJQ = smartyJQ;
})(window);