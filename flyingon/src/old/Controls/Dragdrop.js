﻿//拖拉管理器
(function (flyingon) {




    var __ownerWindow,  //所属窗口

        __dragTarget,   //拖动目标控件

        __dragTargets,  //拖动控件集合

        __drag_original,//原始位置

        __dropTarget,   //接收目标

        __draggable,    //拖动类型

        __offsetLeft,   //拖动目标x偏移

        __offsetTop,    //拖动目标y偏移

        __execute,      //是否已执行拖动

        __dom_body,     //容器dom

        __dom_proxy = document.createElement("div"); //代理dom




    //开始拖动 鼠标按下如果不移动则不处理拖动操作
    function start(copy) {

        //分发拖拉事件
        var target,
            offset = flyingon.offset,
            offset1 = offset(__dom_body = __ownerWindow.dom_children.parentNode),
            length = __dragTargets.length,
            x = __dom_body.clientLeft,
            y = __dom_body.clientTop;

        //创建代理dom
        for (var i = 0; i < length; i++)
        {
            if ((target = __dragTargets[i]) && target.dom)
            {
                var dom = target.dom.cloneNode(true),
                    offset2 = offset(target.dom);

                dom.style.left = offset2.left - offset1.left - x + "px";
                dom.style.top = offset2.top - offset1.top - y + "px";

                __dom_proxy.appendChild(dom);
            }
        }

        if (copy)
        {
            for (var i = length - 1; i >= 0; i--)
            {
                target = __dragTargets[i];

                if (target[".parent"] && target.copy)
                {
                    target = target.copy();
                }

                __dragTargets[i] = target;
            }
        }
        else
        {
            __drag_original = [];

            //记录原始位置及父对象
            for (var i = length - 1; i >= 0; i--)
            {
                __drag_original.push([target = __dragTargets[i], target[".parent"], target.childIndex()]);
            }

            //从父控件中移除
            for (var i = length - 1; i >= 0; i--)
            {
                __dragTargets[i].remove();
            }
        }

        __dom_proxy.style.cssText = "position:absolute;left:0;top:0;";
        __dom_body.appendChild(__dom_proxy);
        __execute = true;
    };


    //分发事件
    this.trigger = function (target, type, event, pressdown) {

        event = new flyingon.DragEvent(type, event, pressdown);

        event.dragTarget = __dragTarget;
        event.dragTargets = __dragTargets;
        event.dropTarget = __dropTarget;

        event.offsetLeft = __offsetLeft;
        event.offsetTop = __offsetTop;

        if (pressdown)
        {
            if (__draggable === "horizontal")
            {
                event.clientY = pressdown.clientY;
                event.distanceY = 0;
            }
            else if (__draggable === "vertical")
            {
                event.clientX = pressdown.clientX;
                event.distanceX = 0;
            }
        }

        return target.trigger(event);
    };


    //开始拖动
    this.start = function (target, draggable, event) {

        var offset = flyingon.offset(target.dom, event.clientX, event.clientY);

        //拖动目标
        event = new flyingon.DragEvent("dragstart", event);

        event.dragTargets = [target];

        event.offsetLeft = __offsetLeft = offset.x;
        event.offsetTop = __offsetTop = offset.y;

        //取消则返回
        if (target.trigger(event) === false)
        {
            return false;
        }

        //缓存状态
        __ownerWindow = target.get_ownerWindow();
        __dragTarget = target;
        __draggable = draggable;
        __execute = false;

        //获取被拖动控件集合
        __dragTargets = event.dragTargets || [target];

        return true;
    };


    //移动
    this.move = function (event, pressdown) {

        //如果未开启拖动则开启
        if (!__execute)
        {
            if (Math.abs(event.clientX - pressdown.clientX) <= 2 &&
                Math.abs(event.clientY - pressdown.clientY) <= 2) //未移动大于2像素则退出
            {
                return;
            }

            start(event.shiftKey);
        }

        var offset = flyingon.offset(__ownerWindow.dom, event.clientX, event.clientY),
            target = __ownerWindow.findAt(offset.x, offset.y);

        //移动代理dom
        if (__draggable !== "vertical")
        {
            __dom_proxy.style.left = event.clientX - pressdown.clientX + __dom_body.scrollLeft + "px";
        }

        if (__draggable !== "horizontal")
        {
            __dom_proxy.style.top = event.clientY - pressdown.clientY + __dom_body.scrollTop + "px";
        }

        //往上找出可放置拖放的对象(复制模式时不能放置在目标控件上)
        while (target && (target === __dragTarget || !target.get_droppable()))
        {
            target = target[".parent"];
        }

        //如果放置目标发生变化则分发相关事件
        if (__dropTarget !== target)
        {
            if (__dropTarget)
            {
                this.trigger(__dropTarget, "dragleave", event, pressdown);
            }

            if (__dropTarget = target)
            {
                this.trigger(target, "dragenter", event, pressdown);
            }
        }

        //分发drag事件
        this.trigger(__dragTarget, "drag", event, pressdown);

        //分发dragover事件
        if (__dropTarget)
        {
            this.trigger(__dropTarget, "dragover", event, pressdown);
        }
    };


    //停止拖动
    this.stop = function (event, pressdown, cancel) {

        var result = __execute,
            cache;

        //如果已拖动则处理
        if (result)
        {
            //分发drop事件
            if (cancel !== true && __dropTarget)
            {
                this.trigger(__dropTarget, "drop", event, pressdown); //返回false则不处理回退
            }

            //分发dragend事件
            this.trigger(__dragTarget, "dragend", event, pressdown);

            //处理回退
            if (__drag_original)
            {
                for (var i = 0, _ = __drag_original.length; i < _; i++)
                {
                    if (!(cache = __drag_original[i])[0][".parent"])
                    {
                        cache[1].__children.insert(cache[2], cache[0]);
                    }
                }

                __drag_original = null;
            }

            //清空代理dom
            __dom_body.removeChild(__dom_proxy);
            __dom_proxy.innerHTML = "";
            __execute = false;
        }

        //清空缓存对象
        __ownerWindow = __dragTarget = __dragTargets = __dropTarget = __dom_body = null;

        //返回是否拖动过
        return result;
    };



}).call(flyingon.dragdrop = Object.create(null), flyingon);
