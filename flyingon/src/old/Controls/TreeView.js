﻿
//TreeView
(function (flyingon) {



    //节点基础服务
    var node_base = function () {


        //添加子节点
        this.appendChild = function (node) {

            var nodes = this.__nodes || this.get_nodes();

            nodes.append.apply(nodes, arguments);

            return this;
        };


        //在指定位置插入子节点
        this.insertChild = function (index, node) {

            var nodes = this.__nodes || this.get_nodes();

            nodes.insert.apply(nodes, arguments);

            return this;
        };


        //移除子节点
        this.removeChild = function (node) {

            var nodes;

            if (nodes = this.__nodes)
            {
                nodes.remove.call(nodes, node);
            }

            return this;
        };


        //移除指定位置的子节点
        this.removeAt = function (index, length) {

            var nodes;

            if (nodes = this.__nodes)
            {
                nodes.removeAt.call(nodes, index, length);
            }

            return this;
        };


        //循环处理子节点
        this.forEach = function (fn, cascade) {

            var nodes, node;

            if (fn && (nodes = this.__nodes))
            {
                for (var i = 0, _ = nodes.length; i < _; i++)
                {
                    fn.call(node = nodes[i], i);

                    if (cascade && node.__nodes)
                    {
                        node.forEach(fn, true);
                    }
                }
            }
        };


        //查找指定选中的节点
        function find(nodes, cascade, name, exports) {

            for (var i = 0, _ = nodes.length; i < _; i++)
            {
                var node = nodes[i];

                if (node.__fields[name])
                {
                    exports.push(node);
                }

                if (cascade && node.__nodes)
                {
                    find(node.__nodes, true, name, exports);
                }
            }

            return exports;
        };


        this[".find"] = function (cascade, name) {

            var nodes = this.__nodes,
                length,
                node;

            if (nodes && (length = nodes.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    if ((node = nodes[i]).__fields[name])
                    {
                        return node;
                    }

                    if (cascade && node.__nodes && (node = node[".find"](true, name)))
                    {
                        return node;
                    }
                }
            }
        };


        //获取选择节点
        this.checked_nodes = function (cascade) {

            var nodes = this.__nodes;
            return nodes ? find(nodes, cascade, "checked", []) : null;
        };


        //获取选中节点
        this.selected_nodes = function (cascade) {

            var nodes = this.__nodes;
            return nodes ? find(nodes, cascade, "selected", []) : null;
        };



        var serialize = this.serialize;


        //自定义序列化
        this.serialize = function (writer) {

            var nodes = this.__nodes;

            serialize.call(this, writer);

            if (nodes && nodes.length > 0)
            {
                writer.write_array("nodes", nodes);
            }
        };


        //默认序列化类型
        this.deserialize_xtype = flyingon.TreeNode;


        this.deserialize_nodes = function (reader, name, value) {

            if (value)
            {
                var nodes = this.get_nodes(),
                    type = flyingon.TreeNode;

                for (var i = 0, _ = value.length; i < _; i++)
                {
                    nodes.append(reader.read_object(value[i], type));
                }
            }
        };


        this.deserialize_from_dom = function (dom, dom_wrapper) {

            var children = dom.children,
                length;

            if (children && (length = children.length) > 0)
            {
                var nodes = this.get_nodes(),
                    type = flyingon.TreeNode;

                for (var i = 0; i < length; i++)
                {
                    nodes.append(dom_wrapper(children[i], type));
                }
            }
        };

    };



    //树节点
    $class("TreeNode", function (Class, prototype) {



        $constructor(Class = function () {

            var dom = this.dom_node = (this.dom = this.dom_template.cloneNode(true)).children[0];

            (this.dom_collapse = dom.children[0]).__target = this;
            (this.dom_check = dom.children[1]).__target = this;
            this.dom_image = dom.children[2];
            this.dom_text = dom.children[3];

        }, 2);


        

        //是否需要更新dom
        prototype.__dom_dirty = true;


        //创建dom模板
        prototype.dom_template = (function () {

            var div = document.createElement("div");

            div.className = "flyingon-TreeView-node";
            div.innerHTML = "<div class='flyingon-TreeNode'>"
                    + "<span class='flyingon-TreeNode-empty'></span>"
                    + "<span class='flyingon-TreeNode-unchecked'></span>"
                    + "<span class='flyingon-TreeNode-image'></span><span class='flyingon-TreeNode-text'></span>"
                + "</div>";

            return div;

        })();


        //节点图像
        prototype.defineProperty("image", "", {

            set_code: "flyingon.dom_icon(this.dom_image, value);"
        });


        //节点文字
        prototype.defineProperty("text", "", {

            set_code: "flyingon.dom_textContent(this.dom_text, value, this.is_html_text);"
        });


        //是否展开(只读)
        prototype.defineProperty("expanded", false, {

            setter: null
        });


        //是否选择
        prototype.defineProperty("checked", false, {

            set_code: "this.dom_check.className = value ? 'flyingon-TreeNode-checked' : 'flyingon-TreeNode-unchecked';"
        });


        //是否选中
        prototype.defineProperty("selected", false, {

            set_code: "this.dom_node.className = 'flyingon-TreeNode' + (value ? ' flyingon-TreeNode-selected' : '')"
        });


        //延迟加载子节点
        //string:       url || json array
        //array:        子节点数组
        prototype.defineProperty("delay", null, {

            set_code: "if (value && !fields.expanded) this['.dom_collapse']('delay');"
        });



        //修改dom_collapse
        prototype[".dom_collapse"] = function (type) {

            this.dom_collapse.className = "flyingon-TreeNode-" + type;

            if (!this.get_image())
            {
                flyingon.dom_icon(this.dom_image, "url('/themes/@theme/images/flyingon.gif') " + (type === "expand" ? "-120px -80px" : "-80px -80px"));
            }
        };


        //展开子节点
        function expand(cascade) {

            var nodes = this.__nodes,
                dom = nodes.dom,
                length,
                cache;

            if (this.__dom_dirty)
            {
                if ((length = nodes.length) > 0)
                {
                    cache = document.createDocumentFragment();

                    for (var i = 0; i < length; i++)
                    {
                        cache.appendChild(nodes[i].dom);
                    }

                    dom.appendChild(cache);
                    this.dom.appendChild(dom);
                }

                this.__dom_dirty = false;
            }

            if (cascade)
            {
                for (var i = 0, _ = nodes.length; i < _; i++)
                {
                    nodes[i].expand(true);
                }
            }

            dom.style.display = "";
        };


        //展开节点
        prototype.expand = function (cascade) {

            var fields = this.__fields,
                delay;

            if (!fields.expand)
            {
                fields.expanded = true;
                this[".dom_collapse"]("expand");
            }

            if (delay = fields.delay)
            {
                if (delay.constructor === String) //url
                {
                    if (delay.charAt(0) !== "[")
                    {
                        var target = this;

                        flyingon.ajax_get(delay, "json", {

                            success: function (data) {

                                target.__dom_dirty = true;
                                target.appendChild.apply(target, new flyingon.SerializeReader().deserialize(data, false, flyingon.TreeNode));

                                expand.call(target, cascade);
                                fields.delay = null;
                            }
                        });

                        return;
                    }

                    delay = new flyingon.SerializeReader().deserialize(delay, false, flyingon.TreeNode);
                }

                if (delay.constructor === Array)
                {
                    this.__dom_dirty = true;
                    this.appendChild.apply(this, delay);

                    expand.call(this, cascade);
                }

                fields.delay = null;
            }
            else if (this.__nodes)
            {
                expand.call(this, cascade);
            }
        };


        //收拢节点
        prototype.collapse = function (cascade) {

            var nodes = this.__nodes;

            if (nodes)
            {
                nodes.dom.style.display = "none";

                if (cascade)
                {
                    for (var i = 0, _ = nodes.length; i < _; i++)
                    {
                        nodes[i].collapse(true);
                    }
                }
            }

            this.__fields.expanded = false;
            this[".dom_collapse"]("collapse");
        };



        //父节点
        flyingon.defineProperty(prototype, "parent", function () {

            return this[".parent"];
        });


        //根节点
        flyingon.defineProperty(prototype, "root", function () {

            var node = this;

            while (node[".parent"])
            {
                node = node[".parent"];
            }

            return node;
        });



        //子节点集合
        flyingon.defineProperty(prototype, "nodes", function () {

            return this.__nodes || (this.__nodes = new flyingon.TreeNodeCollection(this, this));
        });




        //扩展节点基础服务
        node_base.call(prototype);


    });



    //树节点集合
    $class("TreeNodeCollection", function (Class, prototype) {



        var TreeNode = flyingon.TreeNode,
            splice = Array.prototype.splice;



        $constructor(Class = function (owner, parent) {

            this.owner = owner;

            if (this.parent = parent)
            {
                (this.dom = document.createElement("div")).className = "flyingon-TreeView-nodes";
            }
            else
            {
                this.dom = owner.dom;
            }

        }, 2);



        //扩展集合接口
        flyingon.ICollection(Class, prototype);




        //添加进集合时进行验证
        function validate(target, item, index, change) {

            if (item instanceof TreeNode)
            {
                var owner = target.owner,
                    parent = target.parent,
                    cache = item.__owner;

                if (cache) //从原有父控件中删除
                {
                    if (cache !== owner)
                    {
                        item.remove();
                    }
                    else
                    {
                        splice.call(target, target.indexOf(item), 1);
                    }
                }

                item.__owner = owner;

                if (index === 0 && parent && target.length === 0)
                {
                    parent[".dom_collapse"](owner.__fields.expanded ? "expand" : "collapse");
                }

                if (!(item[".parent"] = parent) || !owner.__dom_dirty) //根节点或dom已更新
                {
                    target.dom.appendChild(item.dom);
                }

                return true;
            }

            throw new flyingon.Exception("只能添加TreeNode类型的对象!");
        };


        //移除子项
        function remove_item(item) {

            var dom = item.dom;

            item.__owner = null;
            item[".parent"] = null;

            if (dom && dom.parentNode)
            {
                dom.parentNode.removeChild(dom); //IE无法清除dom.parentNode对象,存在内存泄漏
            }
        };


        //添加子项
        prototype[".append"] = function () {

            var change = !flyingon.__initializing;

            for (var i = 0, _ = arguments.length; i < _; i++)
            {
                validate(this, arguments[i], i, change);
            }
        };


        //在指定位置插入子节点
        prototype[".insert"] = function (index) {

            var change = !flyingon.__initializing;

            for (var i = 1, _ = arguments.length; i < _; i++)
            {
                validate(this, item = arguments[i], i, change);
            }
        };


        //移除指定子节点
        prototype[".remove"] = remove_item;


        //移除指定位置的子节点
        prototype[".removeAt"] = function (index, length) {

            for (var i = 0; i < length; i++)
            {
                remove_item(this[index + i]);
            }
        };


        //清除子节点
        prototype[".clear"] = function () {

            for (var i = 0, _ = this.length; i < _; i++)
            {
                remove_item(this[i]);
            }
        };


    });




    //树控件
    $class("TreeView", flyingon.Control, function (Class, prototype, base) {




        prototype.defaultWidth = 200;
        prototype.defaultHeight = 400;




        //是否隐藏图像
        prototype.defineProperty("noImage", false, {

            set_code: "this.toggleClass('flyingon-TreeView-no-image');"
        });


        //是否允许选择
        prototype.defineProperty("allowCheck", false, {

            set_code: "this.toggleClass('flyingon-TreeView-check');"
        });


        flyingon.defineProperty(prototype, "selectedNode",

            function () {

                return this[".find"](true, "selected");
            },

            function (value) {

                var nodes = this.selected_nodes(true),
                    node,
                    length;

                if (nodes && (length = nodes.length) > 0)
                {
                    for (var i = 0; i < length; i++)
                    {
                        if ((node = nodes[i]) !== value)
                        {
                            node.set_selected(false);
                        }
                    }
                }

                if (value && !value.get_selected())
                {
                    value.set_selected(value);
                }
            });


        //子节点集合
        flyingon.defineProperty(prototype, "nodes", function () {

            return this.__nodes || ((this.__nodes = new flyingon.TreeNodeCollection(this)).__dom_dirty = false, this.__nodes);
        });


        //扩展节点基础服务
        node_base.call(prototype);



        prototype["on.bubble.mousedown"] = function (event) {

            if (event.which === 1) //左键按下
            {
                var dom = event.dom,
                    target = dom.__target;

                if (target)
                {
                    switch (event.dom.className)
                    {
                        case "flyingon-TreeNode-collapse":
                        case "flyingon-TreeNode-delay":
                            target.expand();
                            break;

                        case "flyingon-TreeNode-expand":
                            target.collapse();
                            break;

                        case "flyingon-TreeNode-checked":
                            target.set_checked(false);
                            break;

                        case "flyingon-TreeNode-unchecked":
                        case "flyingon-TreeNode-unkown":
                            target.set_checked(true);
                            break;
                    }

                    if (!dom.__user_select)
                    {
                        flyingon.dom_user_select(dom, false);
                    }

                    event.disable_click(false);
                    event.disable_dbclick(false);
                }
                else if ((target = (dom.children[0] || dom.parentNode.children[0]).__target) && !target.get_selected())
                {
                    if (event.ctrlKey)
                    {
                        target.set_selected(true);
                    }
                    else
                    {
                        this.set_selectedNode(target);
                    }
                }
            }
        };




        //展开节点
        prototype.expand = function (cascade) {

            var nodes = this.__nodes;

            for (var i = 0, _ = nodes.length; i < _; i++)
            {
                nodes[i].expand(true, cascade);
            }
        };


        //收拢节点
        prototype.collapse = function (cascade) {

            var nodes = this.__nodes;

            for (var i = 0, _ = nodes.length; i < _; i++)
            {
                nodes[i].expand(false, cascade);
            }
        };


    });




})(flyingon);