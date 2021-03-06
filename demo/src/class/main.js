$include('demo/src/class/class1.js');
$include('demo/src/class/class2.js');


$namespace('flyingon.test', function (test) {
    
    
    
    $class('MainPage', function () {
        
        
        $constructor(function () {
            

            //引入名字空间
            var test = flyingon.test;


            //创建对象
            var obj1 = new test.BaseClass(1, 2);
            var obj2 = new test.ChildClass(1, 2, 3);


            //类型判断
            obj1.constructor === test.BaseClass; //true
            obj2.constructor === test.ChildClass; //true
            
            //类型检测
            obj2.is(test.BaseClass) === true; //true
            obj2.is(test.ChildClass) === true; //true

            //调用实例方法
            obj1.instance_fn() === 'BaseClass'; //true

            //调用继承的实例方法
            obj2.instance_fn() === 'ChildClass'; //true

            //调用静态方法
            test.BaseClass.static_fn() === 'static'; //true



            //获取属性值
            obj2.p_boolean() === false;    

            //设置属性值 第二个参数表示是否触发变更事件及数据绑定, 默认触发
            obj2.p_boolean(true);

            //自动类型转换
            obj2.p_boolean('2', false);    //true;
            obj2.p_int(3.2);        //3;
            obj2.p_int('3.5');      //3;
            obj2.p_int('3int');     //0
            obj2.p_string(3.2);     //'3.2'

            obj2.p_readonly();      //返回当前时间
            obj2.p_readonly(12);    //无法修改值
            
            //批量设置属性值 第二个参数表示是否触发变更事件及数据绑定, 默认不触发
            obj2.sets({
                
                p_boolean: true,
                p_int: 20
                
            });


            //注册全局事件(可优先捕获任意对象触发的事件)
            obj1.on('my_event', function (e) {

                //停止冒泡
                e.stopPropagation();

            }, true);

            //注册事件(支持事件冒泡)
            obj2.on('my_event', function (event, data) {

                alert(event.type + data);
            });

            //触发事件
            obj2.trigger('my_event', '+dddddd'); //弹出"my_event+dddddd"

            //注销obj1上的所有my_event全局事件
            //obj1.off('my_event', null, true);

            //注销obj3上的所有my_event事件
            obj2.off('my_event');

            //再次触发事件
            obj2.trigger('my_event', '+dddddd'); //不会弹出对话框
            
        });

        
    });

    
    
});
