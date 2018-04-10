var ArrayUtil = (function(win, dom) {
	var ArrayUtil = win.ArrayUtil || {};
	ArrayUtil.sortType = {
		'int' : function(order) {
			return function(str1, str2){
				return order * (parseInt(str1) - parseInt(str2));
			}
		},
		'float' : function(order) {
			return function(str1, str2){
				return order * (parseFloat(str1) - parseFloat(str2));
			}
		},
		'date' : function(order) {
			return function(str1, str2){
				return order * (new Date(str1) - new Date(str2));
			}
		},
		'character' : function(order) {
			return function(str1, str2){
				return order * str1.localeCompare(str2);
			}
		},
		'string' : function(order) {
			return function(str1, str2){
				var rlst;
				if(str1 > str2){
					rlst = 1;
				}else if(str1 < str2){
					rlst = -1;
				}else{
					rlst = 0;
				}
				return rlst * order;
			}
		},
		'object' : function(order) {
			return function(attribute, sortType){
				return function(o1, o2) {
					return ArrayUtil.sortType[sortType || this.string](order)(o1[attribute], o2[attribute]);
				};
			}
		}
	};
	ArrayUtil.sort = function(arr, order, sortType) {
		var order = /desc/i.test(order) ? -1 : 1;
		if(Function !== sortType.constructor){
			sortType = this.sortType[sortType] || this.sortType.string;
		}
		arr.sort(sortType(order));
	};
	ArrayUtil.sortObj = function(arr, attribute, order, sortType) {
		var order = /desc/i.test(order) ? -1 : 1;
		arr.sort(ArrayUtil.sortType['object'](order)(attribute, sortType));
	};
	ArrayUtil.isArray = function(arr){
		return Object.prototype.toString.call(arr) === '[object Array]';
	};
	ArrayUtil.sum = function(arr, trim){
		if(this.isArray(arr)){
			
		}
	};
	return ArrayUtil;
})(window, document);