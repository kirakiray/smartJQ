(function(glo) {
    "use strict";
    //function
    var transtoarray = function(arrobj) {
        return Array.prototype.slice.call(arrobj);
    };

    //获取类型
    var getType = function(value) {
        return Object.prototype.toString.call(value).toLowerCase().replace(/(\[object )|(])/g, '');
    };

    //合并对象
    var extend = function(def, opt) {
        for (var i in opt) {
            def[i] = opt[i];
        }
        return def;
    };

    //集大成each
    var each = (function() {
        var arreach = (function() {
            if ([].forEach) {
                return function(arrobj, func) {
                    arrobj = transtoarray(arrobj);
                    arrobj.forEach(function(e, i) {
                        func(i, e);
                    });
                };
            } else {
                return function(arrobj, func) {
                    for (var len = arrobj.length, i = 0; i < len; i++) {
                        func(i, arrobj[i]);
                    }
                };
            }
        })();
        return function(obj, func) {
            if ('length' in obj) {
                arreach(obj, func);
            } else if (getType(obj) == "object") {
                for (var i in obj) {
                    func(i, obj[i]);
                }
            }
        };
    })();

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

    //合并数组
    var pushto = function(arr1, arr2) {
        each(arr1, function(i, e) {
            arr2.push(e);
        });
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
        //只有一个参数的情况
        var a1type = getType(arg1);
        switch (a1type) {
            case "string":
                if (/</.test(arg1)) {
                    //带有生成对象的类型
                    pushto(transToEles(arg1), this);
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
                    } else {
                        eles = findEles(document, arg1);
                    }
                    pushto(eles, this);
                }
                break;
            case "function":
                document.addEventListener('DOMContentLoaded', function() {
                    arg1($);
                }, false);
                break;
            case "array":
                pushto(arg1, this);
                break;
            default:
                if (arg1.nodeType) {
                    this.push(arg1);
                } else if (arg1 instanceof smartyJQ) {
                    return arg1;
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
            return tar ? tar.classList.value.search(name) > -1 : false;
        },
        //添加元素公用的方法
        _ec: function(ele, targets, func) {
            //最后的id
            var lastid = targets.length - 1;

            //公用循环方法
            var pubfun = function(e) {
                each(targets, function(i, tar) {
                    if (i == lastid) {
                        func(e, tar);
                    } else {
                        func(e.cloneNode(true), tar);
                    }
                });
            }

            //判断类型
            if (ele instanceof smartyJQ) {
                each(ele, function(i, e) {
                    pubfun(e);
                });
                pubfun = null;
            } else if (ele.nodeType) {
                pubfun(ele);
                pubfun = null;
            } else if (getType(ele) == "string") {
                var eles = transToEles(ele);
                each(eles, function(i, e) {
                    pubfun(e);
                });
                pubfun = null;
            }
        },
        //元素操作
        append: function(ele) {
            //@use---fn._ec
            //判断类型
            this._ec(ele, this, function(e, tar) {
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
            this._ec(ele, this, function(e, tar) {
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
            this._ec(ele, this, function(e, tar) {
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
            this._ec(ele, this, function(e, tar) {
                tar.parentNode.insertBefore(e, tar);
            });
            return this;
        },
        insertBefore: function(tars) {
            //@use---fn.before
            this.before.call(tars, this);
            return this;
        },
        clone: function() {
            return this.map(function(i, e) {
                return e.cloneNode(true);
            });
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
            return new smartyJQ(eles);
        },
        get: function(index) {
            return this[index] || transtoarray(this);
        },
        map: function(callback) {
            var arr = [];
            each(this, function(i, e) {
                var resulte = callback(i, e);
                (resulte != undefined) && arr.push(resulte);
            });
            return new smartyJQ(arr);
        },
        slice: function() {

        },
        filter: function(expr) {
            //@use---fn.map
            switch (getType(expr)) {
                case "string":
                    return this.map(function(i, e) {
                        if (judgeEle(e, expr)) {
                            return e;
                        }
                    });
                case "function":
                    return this.map(function(i, e) {
                        return expr(i, e) && e;
                    });
            }
        },
        not: function(expr) {

        },
        parent: function(expr) {
            //@use---fn.map
            return this.map(function(i, e) {
                if (expr) {
                    if (judgeEle(e.parentNode, expr)) {
                        return e.parentNode;
                    }
                } else {
                    return e.parentNode;
                }
            })
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
                owner = transtoarray(tar.parentNode.children);
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
        }
    });

    extend(smartyJQ, {
        extend: extend,
        each: each
    });

    //init
    var $ = function(selector, context) {
        return new smartyJQ(selector, context);
    };
    glo.$ = $;
    glo.smartyJQ = smartyJQ;

})(window);