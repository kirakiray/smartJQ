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
            if (obj.length) {
                arreach(obj, func);
            } else if (getType(obj) == "object") {
                for (var i in obj) {
                    func(i, obj[i]);
                }
            }
        };
    })();

    //查找元素的方法
    var findEles = function(owner, prop) {
        return owner.querySelectorAll(prop);
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

    //克隆节点
    var cloneEle = function(ele) {
        var par = document.createElement(tar == 'div');
        par.innerHTML = ele.outerHTML;
        return par.children[0];
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
            case "object":
                if (arg1.nodeType) {
                    this.push(arg1);
                } else if (arg1 instanceof smartyJQ) {
                    return arg1;
                }
                break;
            case "array":
                pushto(arg1, this);
                break;
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
        //添加元素公用的方法
        _embChild: function(ele, targets, func) {
            // @--fn:append
            // @--fn:prepend
            // @--fn:after
            // @--fn:before
            // @--fn:appendTo
            // @--fn:prependTo

            //最后的id
            var lastid = targets.length - 1;

            //公用循环方法
            var pubfun = function(e) {
                each(targets, function(i, tar) {
                    if (i == lastid) {
                        func(e, tar);
                    } else {
                        func(cloneEle(e), tar);
                    }
                });
                pubfun = null;
            }

            //判断类型
            if (ele instanceof smartyJQ) {
                each(ele, function(i, e) {
                    pubfun(e);
                });
            } else if (ele.nodeType) {
                pubfun(ele);
            } else if (getType(ele) == "string") {
                var eles = transToEles(ele);
                each(eles, function(i, e) {
                    pubfun(e);
                });
            }
        },
        //元素操作
        append: function(ele) {
            //判断类型
            this._embChild(ele, this, function(e, tar) {
                tar.appendChild(e);
            });
            return this;
        },
        prepend: function(ele) {
            this._embChild(ele, this, function(e, tar) {
                tar.insertBefore(e, tar.firstChild);
            });
            return this;
        },
        after: function(ele) {
            this._embChild(ele, this, function(e, tar) {
                var parnode = tar.parentNode;
                if (parnode.lastChild == tar) {
                    parnode.appendChild(e);
                } else {
                    parnode.insertBefore(e, tar.nextSibling);
                }
            });
            return this;
        },
        before: function(ele) {
            this._embChild(ele, this, function(e, tar) {
                tar.parentNode.insertBefore(e, tar);
            });
            return this;
        },
        appendTo: function(tars) {
            this._embChild(this, tars, function(e, tar) {
                tar.appendChild(e);
            });
            return this;
        },
        prependTo: function(tars) {
            this._embChild(this, tars, function(e, tar) {
                tar.insertBefore(e, tar.firstChild);
            });
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
            return new smartyJQ(eles);
        },
        attr: function(name, value) {
            var tar = this[0];
            switch (getType(name)) {
                case "string":
                    if (value == undefined) {
                        return tar && tar.getAttribute(name);
                    } else {
                        tar && tar.setAttribute(name, value);
                    }
                    break;
                case "object":
                    each(name, function(k, v) {
                        tar && tar.setAttribute(k, v);
                    });
                    break
            }
            return this;
        },
        removeAttr: function(name) {
            var tar = this[0];
            tar && tar.removeAttribute(name);
        },
        each: function(func) {
            each(this, function(i, e) {
                func.call(e, i, e);
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