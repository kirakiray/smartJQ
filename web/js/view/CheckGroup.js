define(function(require, exports, module) {
    function Group(title) {
        this.ele = $('<div class="group"><h3 class="group_title">' + title + '</h3><ul class="uk-list"></ul></div>');
        // this.uk_list = this.ele.find('.uk-list');
        this.uk_list = this.ele[0].querySelector('.uk-list');
    };

    Group.prototype.appendItem = function(options) {
        var defaults = {
            val: "",
            name: "",
            base: 0
        };
        $.extend(defaults, options);
        var ele = $('<li><label class="f_item disable"><input type="checkbox" disabled data-point="' + defaults.name + '">' + (defaults.val || defaults.name) + '</label></li>');

        this.uk_list.appendChild(ele[0]);
        if (defaults.base) {
            ele[0].querySelector('input').checked = true;
            ele[0].querySelector('label').classList.remove('disable');
        }

        return ele;
    };

    return Group;
});