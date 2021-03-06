﻿

//字体图标
(function (flyingon) {




    var font_list = {},    //字体图标库

        css_template = "@font-face {\n"
            + "font-family: \"0\";\n"
            + "font-style: normal;\n"
            + "font-weight: normal;\n"
            + "src: url(\"1.eot\");\n" /* ie9 */
            + "src: url(\"1.eot?#iefix\") format(\"embedded-opentype\"),\n" /* ie6-ie8 */
                + "url(\"1.woff\") format(\"woff\"),\n" /* chrome, firefox */
                + "url(\"1.ttf\") format(\"truetype\"),\n" /* chrome, firefox, opera, safari, android, ios4.2+ */
                + "url(\"1.svg#0\") format(\"svg\");\n" /* ios4.1- */
        + "}";



    //注册字体名值对回调函数
    flyingon.icons = function (name, icons) {

        if (name && icons)
        {
            var list = font_list[name],
                items,
                length;

            flyingon.style(css_template.replace(/0/g, name).replace(/1/g, flyingon.settings.icons_path + name));

            font_list[name] = icons;

            if (list && (length = list.length) > 0)
            {
                name = flyingon.__textContent_name;

                for (var i = 0; i < length; i++)
                {
                    (items = list[i])[0][name] = icons[items[1]] || items[1];
                }
            }
        }
    };



    //生成icons预览html
    flyingon.__fn_icons_view = function (name) {

        var icons = font_list[name],
            items = [];

        if (icons)
        {
            for (var name in icons)
            {
                items.push("<span class='item'><div class='icon'>" + icons[name] + "</div><div class='text'>" + name + "<br/>" + escape(icons[name]).replace("%", "\\").toLowerCase() + "</div></span>");
            }
        }

        return items.join("");
    };

 

    //设置dom图标
    flyingon.dom_icon = (function (name) {

        return function (dom, icon) {

            if (icon)
            {
                var cache;

                if (icon.indexOf("url(") === 0 && (cache = icon.indexOf(")")) > 0)
                {
                    if (++cache < icon.length)
                    {
                        dom.style.backgroundPosition = icon.substring(cache + 1);
                        icon = icon.substring(0, cache);
                    }
                    else
                    {
                        dom.style.backgroundPosition = "";
                    }

                    dom.style.backgroundImage = icon.replace('@theme', flyingon.settings.theme).replace('@language', flyingon.current_language);
                }
                else
                {
                    var value = icon.indexOf(":");

                    if (value >= 0)
                    {
                        cache = icon.substring(0, value) || "flyingon";
                        icon = icon.substring(value + 1);
                    }
                    else
                    {
                        cache = "flyingon";
                    }

                    dom.style.fontFamily = cache;

                    if (value = font_list[cache])
                    {
                        if (value.__icon_cache__) //暂存
                        {
                            value.push([dom, icon]);
                        }
                        else
                        {
                            dom[name] = value[icon] || icon;
                        }
                    }
                    else
                    {
                        (font_list[cache] = [[dom, icon]]).__icon_cache__ = true; //暂存
                        flyingon.script(flyingon.settings.icons_path + cache + ".js");
                    }
                }
            }
            else
            {
                dom[name] = "";
            }
        };

    })();



})(flyingon);



//图标
$class("Icon", flyingon.Control, function (Class, prototype, base) {




    //设置默认大小
    prototype.defaultWidth = prototype.defaultHeight = 24;


    //创建dom元素模板
    prototype.create_dom_template("div", "overflow:hidden;text-align:center;vertical-align:middle;background-repeat:no-repeat;user-select:none;-webkit-user-select:none;-moz-user-select:none;");




    //图像
    //name:             字体图标名(系统字库)
    //library:name      指定字库的字体图标名
    //url(...)[x, y]    图片路径及位置
    prototype.defineProperty("image", "", {

        set_code: "this.dom && flyingon.dom_icon(this.dom, value);"
    });




    prototype.after_measure = function (box) {

        this.dom.style.lineHeight = this.clientHeight + "px";
    };



});