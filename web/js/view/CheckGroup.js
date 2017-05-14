define(function(require, exports, module) {
    function Group(title) {
        this.ele = $('<div class="group"><h3 class="group_title">' + title + '</h3><ul class="uk-list"></ul></div>');
        this.uk_list = this.ele.find('.uk-list');
    };
    Group.prototype.appendItem = function(options) {
        var defaults = {
            val: "",
            name: "",
            base: 0
        };
        $.extend(defaults, options);
        var ele = $('<li><label class="f_item disable"><input type="checkbox" disabled data-point="' + defaults.name + '">' + (defaults.val || defaults.name) + '</label></li>');

        this.uk_list.append(ele);
        if (defaults.base) {
            ele.find('input').prop('checked', true);
            ele.find('label').removeClass('disable');
        }

    };

    return Group;
});