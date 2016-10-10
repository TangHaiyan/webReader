		  //  交互，事件绑定，数据储存（html5本地存储），
		  (function() {
		  	//使用ES6语言必须申明使用严格模式
		  	'use strict'
		  	//localStorage设置获取
		  	var Util = (function() {
		  		//同一个域名共享。避免重复和别人误操作，加前缀。
		  		var prefix = 'html5_reader_';
		  		var StorageGetter = function(key) {
		  			return localStorage.getItem(prefix + key);
		  		};
		  		var StorageSetter = function(key, value) {
		  			return localStorage.setItem(prefix + key, value);
		  		};

		  		var getJSONP = function(url, callback) {

		  			return $.jsonp({
		  				url: url,
		  				cache: true,
		  				//callback是json中的调用数据函数。是本地定义好的函数接口。
		  				callback: 'duokan_fiction_chapter',
		  				//result是JSONP中的数据
		  				success: function(result) {
		  					//解码后的数据是Jason格式的数据
		  					var data = $.base64.decode(result);
		  					//escape() 函数可对字符串进行编码，这样就可以在所有的计算机上读取该字符串。
		  					//decodeURIComponent(URIstring)一个字符串，含有编码 URI 组件或其他要解码的文本。decodeURIComponent不能解码utf－8格式数据 只能解码 url转义后的数据格式
		  					var json = decodeURIComponent(escape(data));
		  					callback(json);
		  				}
		  			})
		  		}

		  		//接口暴露
		  		return {
		  			getJSONP: getJSONP,
		  			StorageGetter: StorageGetter,
		  			StorageSetter: StorageSetter,
		  		};
		  	})();

		  	var Dom = {
		  		top_nav: $('.top-nav'),
		  		bottom_nav: $('#bottom_nav'),
		  		icon_font: $('#icon_font'),
		  		icon_font_pic: $('.icon-font-pic'),
		  		nav_pannel_bk: $('.nav-pannel-bk'),
		  		nav_pannel: $('.nav-pannel'),
		  		icon_state_day: $('#icon-state-day'),
		  		icon_state_night: $('#icon-state-night'),
		  		large_font: $('#large-font'),
		  		small_font: $('#small-font'),
		  		bk_container_bk: $('.bk-container-bk'),
		  		bk_container: $('.bk-container'),
		  		fiction_container: $('#fiction_container'),
		  		// icon_state_nigh: $('#icon-state-night'),
		  		// icon_state_day: $('#icon-state-day'),
		  	};

		  	var color = [
		  		'rgb(255, 255, 255)',
		  		'rgb(233, 223, 199)',
		  		'rgb(164, 164, 164)',
		  		'rgb(205, 239, 206)',
		  		'rgb(40, 53, 72)',
		  		'rgb(15, 20, 16)',
		  	];
		  	var initialColor = color[1];

		  	var readerModel;
		  	var readerUI;
		  	var Win = $(window);
		  	var Doc = $(document);
		  	var Body = $('body');
		  	var RootContainer = $('#root');
		  	var initialFontSiza = Util.StorageGetter('font_size') ? parseInt(Util.StorageGetter('font_size')) : 14;
		  	var initialColor = Util.StorageGetter('background') ? Util.StorageGetter('background') : initialColor;
		  	var initialDay = Util.StorageGetter('initialDay') ? Util.StorageGetter('initialDay') : "block";
		  	var initialNight = Util.StorageGetter('initialNight') ? Util.StorageGetter('initialNight') : "none";

		  	//整个项目的入口函数
		  	function main() {
		  		EventHandler();

		  		readerModel = ReaderModel();
		  		readerModel.init();
		  		readerUI = ReaderBaseFrame(Dom.fiction_container);
		  		readerModel.init(function(data) {
		  			readerUI(data)

		  		});

		  		//这里运行才能一进入页面就启动缓存设置。
		  		Dom.fiction_container.css('font-size', initialFontSiza);
		  		Body.css('background', initialColor);
		  		Dom.icon_state_day.css('display', initialDay);
		  		Dom.icon_state_night.css('display', initialNight);

		  	}



		  	//实现和阅读器相关的数据交互的方法
		  	function ReaderModel() {
		  		var Chapter_id;
		  		var ChapterTotal;

		  		var init = function(UIcallback) {
		  			// getFictionInfo(function() {
		  			// 	//这里data是章节数据
		  			// 	getCurChapterContent(chapter_id, function(data) {
		  			// 		
		  			// 		UIcallback && UIcallback(data);
		  			// 	});
		  			// });
                    //返回的是promise对象，可以实现多层使用then代替回调函数。
		  			getFictionInfoPromise().then(function(d){
		  				return getCurChapterContentPromise();
		  				}).then(function(data) {		  				
		  				UIcallback && UIcallback(data);
		  				});
		  		};

		  		var getFictionInfo = function(callback) {
		  			//$.get(url, function(data, status, xhr){ ... })   ⇒ XMLHttpRequest
		  			//$.get(url, [data], [function(data, status, xhr){ ... }], [dataType]) 
		  			//这个 url 是跨域服务 器取 json 数据的接口。用json数据方便调试。data就是json文件里的数据。
		  			//XHR请求
		  			$.get('./data/chapter.json', function(data) {
		  				//获得章节信息之后的回调。chapters是一个数组。这里取得失
		  				//chapter_id 初始值为0
		  				Chapter_id = Util.StorageGetter('page') || data.chapters[0].chapter_id;
		  				ChapterTotal = data.chapters.length;
		  				callback && callback(data);

		  			}, 'json');
		  		};
		  		//获得当前章节的内容
		  		//Promise 方法
                var getFictionInfoPromise= function(){
                	return new Promise(function(resolve,reject){

		                 $.get('./data/chapter.json', function(data) {
			  				if (data.result==0) {
					  			Chapter_id = Util.StorageGetter('page') || data.chapters[0].chapter_id;  					
			  				    ChapterTotal = data.chapters.length;
			  				    resolve();		
			  				}else{
			  					reject();
			  				}

			  			}, 'json');

	                });
	            };    

		  		var getCurChapterContent = function(chapter_id, callback) {
		  			//XHR请求
		  			$.get('./data/data' + (parseInt(chapter_id) + 1) + '.json', function(data) {
		  				//服务器状态，result是事先约定好的状态描述
		  				if (data.result == 0) {
		  					//获取到json数据里面的jsonp链接数据，要对jsonp数据进行解码。
		  					var url = data.jsonp;
		  					//js请求
		  					Util.getJSONP(url, function(data) {
		  						//if(callback){callback()}
		  						callback && callback(data);
		  					});
		  				}

		  			}, 'json')
		  		};

                //Promise方法
                  var getCurChapterContentPromise= function(){
                  	  return  new Promise(function(resolve,reject){
	                       $.get('./data/data' + (parseInt(Chapter_id) + 1) + '.json', function(data) {
			  				if (data.result == 0) {
			  					var url = data.jsonp;
			  					Util.getJSONP(url, function(data) {
			  						resolve(data);    
			  					});
			  				}else{
			  					reject({msg:'fail'});
			  				}

			  			}, 'json')    
	                  })
                };

		  		var preChapter = function(UIcallback) {
		  			Chapter_id = parseInt(Chapter_id, 10);
		  			if (Chapter_id == 0) {
		  				return;
		  			}
		  			Chapter_id = Chapter_id - 1;
		  			Util.StorageSetter('page', Chapter_id);
		  			getCurChapterContent(Chapter_id, UIcallback);

		  		};

		  		var nextChapter = function(UIcallback) {
		  			Chapter_id = parseInt(Chapter_id, 10);
		  			if (Chapter_id == 4) {
		  				return;
		  			}
		  			Chapter_id = Chapter_id + 1;
		  			Util.StorageSetter('page', Chapter_id);
		  			getCurChapterContent(Chapter_id, UIcallback);
		  		};

		  		return {
		  			init: init,
		  			preChapter: preChapter,
		  			nextChapter: nextChapter
		  		};

		  	}

		  	//渲染基本的UI结构
		  	function ReaderBaseFrame(container) {
		  		function parseChapterData(jsonData) {
		  			//序列化json数据
		  			var jsonObj = JSON.parse(jsonData);
		  			var html = '<h4>' + jsonObj.t + '</h4>';
		  			for (var i = 0; i < jsonObj.p.length; i++) {
		  				html += '<p>' + jsonObj.p[i] + '</p>'
		  			}
		  			return html;
		  		}
		  		return function(data) {
		  			container.html(parseChapterData(data))
		  		}


		  	}
		  	//交互的事件绑定
		  	function EventHandler() {
		  		$('#action-mid').click(function() {
		  			if (Dom.bottom_nav.css('display') == 'none') {
		  				Dom.bottom_nav.show();
		  				Dom.top_nav.show();
		  				Dom.icon_font_pic.removeClass('icon-font-pic-wake');
		  			} else {
		  				Dom.bottom_nav.hide();
		  				Dom.top_nav.hide();
		  				Dom.nav_pannel_bk.hide();
		  				Dom.nav_pannel.hide();
		  			}

		  		});
		  		Win.scroll(function() {
		  			Dom.bottom_nav.hide();
		  			Dom.top_nav.hide();
		  			Dom.nav_pannel_bk.hide();
		  			Dom.nav_pannel.hide();
		  		});
		  		Dom.icon_font.click(function() {
		  			if (Dom.nav_pannel_bk.css('display') == 'none') {
		  				Dom.nav_pannel_bk.show();
		  				Dom.nav_pannel.show();
		  				Dom.icon_font_pic.addClass('icon-font-pic-wake');
		  			} else {
		  				Dom.nav_pannel_bk.hide();
		  				Dom.nav_pannel.hide();
		  				Dom.icon_font_pic.removeClass('icon-font-pic-wake');
		  			}
		  		});
		  		Dom.large_font.click(function() {
		  			console.log(1);
		  			if (initialFontSiza > 19) {
		  				return;
		  			};
		  			initialFontSiza += 1;
		  			Dom.fiction_container.css('font-size', initialFontSiza);
		  			Util.StorageSetter('font_size', initialFontSiza);
		  		});
		  		Dom.small_font.click(function() {
		  			if (initialFontSiza < 12) {
		  				return;
		  			};
		  			initialFontSiza -= 1;
		  			Dom.fiction_container.css('font-size', initialFontSiza);
		  			Util.StorageSetter('font_size', initialFontSiza);
		  		});

		  		//当前选中按钮背景色，并设置背景色。
		  		Dom.bk_container.each(function(index) {
		  			$(this).click(function() {
		  				var bk_container_current = $('.child-mod').find('.bk-container-current');
		  				bk_container_current.removeClass('bk-container-current');
		  				$(this).addClass('bk-container-current');
                        //如果选择到最后一个，则改变白天夜晚按钮
		  				if (this==Dom.bk_container[5]) {
			  				Dom.icon_state_day.hide();
			  				Dom.icon_state_night.show();		  					
		  				}else{
			  				Dom.icon_state_night.hide();
			  				Dom.icon_state_day.show(); 		  					
		  				}
		  				//会冒泡到父元素上，设置背景颜色。
		  				initialColor = color[index];
		  				Body.css('background', initialColor);
		  				Util.StorageSetter('background', initialColor);

		  			});
		  		});

		  		//白天黑夜切换.缓存状态切换，缓存颜色背景,缓存选择框状态
		  		$('#icon_state').click(function() {
		  			if (Dom.icon_state_day.css('display') == 'none') {
		  				Dom.icon_state_night.hide();
		  				Dom.icon_state_day.show(); 
		  				var bk_container_current = $('.child-mod').find('.bk-container-current');
		  				bk_container_current.removeClass('bk-container-current');
		  				Dom.bk_container.slice(1, 2).addClass('bk-container-current');
		  				Body.css('background', color[1]);
		  				initialColor = color[1];
		  				initialDay = Dom.icon_state_day.css('display');
		  				initialNight = Dom.icon_state_night.css('display');
		  				Util.StorageSetter('initialDay', initialDay);
		  				Util.StorageSetter('initialNight', initialNight);
		  				Body.css('background', initialColor);
		  				Util.StorageSetter('background', initialColor);

		  			} else if(Dom.icon_state_night.css('display') == 'none') {
		  				Dom.icon_state_day.hide();
		  				Dom.icon_state_night.show();
		  				var bk_container_current = $('.child-mod').find('.bk-container-current');
		  				bk_container_current.removeClass('bk-container-current');
		  				Dom.bk_container.slice(5, 6).addClass('bk-container-current');
		  				Body.css('background', color[5]);
		  				initialColor = color[5];
		  				initialDay = Dom.icon_state_day.css('display');
		  				Util.StorageSetter('initialDay', initialDay);
		  				Util.StorageSetter('initialNight', initialNight);
		  				Body.css('background', initialColor);
		  				Util.StorageSetter('background', initialColor);
		  			}
		  		});

		  		//上翻页
		  		$('#prev_button').click(function() {
		  			//获取章节的翻页数据》把数据拿出来渲染
		  			readerModel.preChapter(function(data) {
		  				readerUI(data);
		  			});



		  		});
		  		//下翻页
		  		$('#next_button').click(function() {
		  			readerModel.nextChapter(function(data) {
		  				readerUI(data);
		  			});

		  		});

		  		//返回.同上翻页
		  		$('#top_nav').click(function(){
		  			readerModel.preChapter(function(data){
		  		   readerUI(data);
		  		   });
		  		});


		  	}

		  	main();

		  })();