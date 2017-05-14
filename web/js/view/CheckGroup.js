define(function(require, exports, module) {
    function Group(title) {
        this.ele = $('<div class="group"><h3 class="group_title">' + title + '</h3><ul class="uk-list"></ul></div>');
        this.uk_list = this.ele.find('.uk-list');
    };
    Group.prototype.appendItem = function(options) {
        var defaults = {
            check: false,
            disable: false,
            val: "",
            name: ""
        };
        $.extend(defaults, options);
        var ele = $('<li><label class="f_item"><input type="checkbox" data-point="' + defaults.name + '">' + (defaults.val || defaults.name) + '</label></li>');

        this.uk_list.append(ele);
    };

    return Group;
});