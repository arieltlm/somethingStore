(function($){
    $.fn.inputdownauto = function(options){
        var inputdownauto = {
            init: function(el) {
                this.$inputs = $(el);
                this.settings = $.extend({
                    data: null, // 可以是数组也可以是html片段
                    key: '', // 当data为对象数组时其要渲染的key[{key:1},{key:2}],此时必填
                    blankShow: true, // 输入空白时下拉框是否全部展示(默认为true)
                    autoCompleteShow: true, // 是否自动提示(默认为true)
                }, options);
                
                this.currentdata = this.settings.data;
                this.renderData(el);
            },
            renderData: function(el){
                $('body #downWrap').remove();
                
                if(typeof(this.currentdata) != "string" && typeof(this.currentdata) != "object") return;
                if(typeof(this.currentdata) == "string") {
                    // 此时认为数据是一个html片段
                    /* <ul>
                        <li>ububuob</li>
                        <li>ububuob</li>
                        <li>ububuob</li>
                    </ul> */
                    $('body').append('<div id="downWrap" class="down-wrap">'+ this.currentdata +'</div>');
                } else if (this.currentdata.constructor == Array){
                    var val1 = this.$inputs.val();
                    var reg = this.settings.autoCompleteShow ? new RegExp(val1) : ''; 
                    var tmpl = '';
                    var key = this.settings.key;
                    var blankShow = this.settings.blankShow;
                    if(key){ //[{key:1},{key:2}]
                        $.each(this.currentdata, function(index, ele){
                            if (!blankShow && val1== '') {
                                var mm = null;
                            } else {
                                var mm = ele[key].match(reg);
                            }
                            if(mm!=null){
                                tmpl += '<li>' + ele[key] + '</li>';
                            }
                        })
                    } else { //[1,2,3]
                        $.each(this.currentdata, function(index, ele){
                            if (!blankShow && val1 == '') {
                                var mm = null;
                            } else {
                                var mm = ele.match(reg);
                            }
                            if(mm!=null){
                                tmpl += '<li>' + ele + '</li>';
                            }
                        })
                    }

                    $('body').append('<div id="downWrap" class="down-wrap"><ul>'+ tmpl +'</ul></div>');
                }
                $('body #downWrap').hide();
                this.renderPosition();
                this.bindEvents(el);
            },
            renderPosition: function(el) {
                var that = this;
                //页面大小发生变化下拉框位置随着变化
                window.onresize = function(){
                    that.downUlposition();
                };
                //滚动时下拉框位置随着变化
                // 监测滚轮事件
                if(document.addEventListener){
                   document.addEventListener('DOMMouseScroll',that.downUlposition(),false);
                }//W3C
                window.onmousewheel=document.onmousewheel=that.downUlposition;
            },
            downUlposition: function() {
                var EX = this.$inputs.offset().top,
                    EY = this.$inputs.offset().left,
                    EH = this.$inputs.height(),
                    EW = this.$inputs.width();
                $("#downWrap").css('position','absolute');
                $("#downWrap").css("top",EX+EH+5);
                $("#downWrap").css("left",EY);
                $("#downWrap").css("min-width",EW+5);
            },
            bindEvents: function(el) {
                var that = this;
                //先清除所有input聚集时下拉框出现的情况。
                $(document).off("focus","input").on("focus","input",function(event){
                    $("#downWrap").hide();
                })

                //再针对此输入框，定聚焦出现下拉框
                that.$inputs.off("click keyup").on("click keyup",function(e){
                    that.renderData();
                    that.renderPosition();
                    $("#downWrap").show();
                    //在页面其他地方点击时，下拉框消失
                    $(document).on('click', function () {  
                        $("#downWrap").hide();
                    })  
                    that.stopBubble(e);
                })
                //选中下拉框中的某个选项给input框，下拉框消失
                $(document).off("click","#downWrap ul li").on("click","#downWrap ul li",function(e){
                    that.$inputs.val($(this).text());
                    $("#downWrap").hide();
                    that.stopBubble(e);
                })  
                $(document).off("click","body").on("click","body",function(event){
                    $("#downWrap").hide();
                })
            },
            stopBubble: function (event){ //阻止冒泡事件
                //取消事件冒泡
                var e=arguments.callee.caller.arguments[0]||event; 
                if (e && e.stopPropagation) {
                // this code is for Mozilla and Opera
                    e.stopPropagation();
                } else if (window.event) {
                // this code is for IE
                    window.event.cancelBubble = true;
                }
            }
        }
        return this.each(function() {
            inputdownauto.init(this);
        });
    }
})(jQuery);