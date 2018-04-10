/*!
 * Table Grid Library v3.0
 *
 * Copyright 2013, zhangshaolong
 * QQ: 369669902
 * email: zhangshaolongjj@163.com
 *
 */
;var Grid = (function(doc, win){
	var trReg = /@([^(]+)\(([^)]*)\)|\{([^}]+)\}|(\[\])/g,
		propReg = /\{([^}]+)\}/,
		dotReg = /\s*,\s*/,
		pageReg = /\{([^}]+)\}/g,
		isIE = win.navigator.userAgent.indexOf('MSIE') >= 0,
		textContent = 'textContent' in doc ? 'textContent' : 'innerText',
		init = function(options){
			return new Grid(options);
		},
		addEvent = function(node, type, fun, useCapture){
			type = type.replace(/^on/, '');
			node.addEventListener ? node.addEventListener(type, fun, useCapture) :
			node.attachEvent ? node.attachEvent('on' + type, fun) : 
			node['on' + type] = fun;
		},
		initSort = function(o, sorts) {
	    	var orderBy = o.params[o.mapKeys.orderBy],
	    		order = o.params[o.mapKeys.order];
	        each(sorts, function(sortNode){
	        	var th = sortNode.node,
	        		sort = sortNode.sort,
	        		sortType = sortNode.sortType,
	        		sp = doc.createElement('span');
	        	if(orderBy === sort){
	        		sp.className = 'sort-' + order;
	        	}else{
	        		sp.className = 'sort-default';
	        	}
	        	th.style.cursor = 'pointer';
	            sp.innerHTML = '&nbsp;';
	            th.appendChild(sp);
	            th.onclick = function(sort, sortType){
	            	return function(){
            			var order = 'desc',
	            			p = {},
	            			that = this;
	                	each(sorts, function(sortNode){
	                		var thNode = sortNode.node,
	                		sp = thNode.lastChild, cls;
	                		if(that === thNode){
	                			if(hasClass(sp, 'sort-desc')){
	    	                		order = 'asc';
	    	                	}
	    	                	cls = 'sort-' + order;
	                		}else{
		            			cls = 'sort-default';
	                		}
	                		removeClass(sp);
	                		addClass(sp, cls);
	            		});
	                	p[o.mapKeys.order] = order;
	                	p[o.mapKeys.orderBy] = sort;
	                	p[o.mapKeys.sortType] = sortType;
	                    o.send(p);
	            	}
	            }(sort, sortType);
	        });
	    },
	    initParams = function(o, options) {
			o.holder = getNode(options.holder);
		    o.bodyTemplate = options.bodyTemplate;
		    o.headTemplate = options.headTemplate;
		    o.dataSource = options.dataSource;
		    o.nopage = options.nopage;
		    o.query = options.query || {};
		    o.method = options.method || 'POST';
		    o.pageNode = getNode(options.pageNode);
		    o.sendOnPageSize = options.sendOnPageSize;
		    o.noDataMessage = options.noDataMessage || '没有数据';
		    o.ellipsis = options.ellipsis || 'auto';
		    o.nostripe = options.nostripe;
		    o.sorts = [];
	        o.pageTemplate = options.pageTemplate
	                || '每页行数<select class="page-size"><option value="6">6</option><option value="10">10</option></select>&nbsp;&nbsp;共{totalCount}条记录&nbsp;&nbsp;共{totalPage}页&nbsp;&nbsp;<input type="button" value="首页" class="page-bt first-page" title="首页">&nbsp;&nbsp;<input type="button" value="上一页" class="page-bt pre-page" title="上一页">&nbsp;&nbsp;第{pageNo}页&nbsp;&nbsp;<input type="button" value="下一页" class="page-bt next-page" title="下一页">&nbsp;&nbsp;<input type="button" value="末页" class="page-bt last-page" title="末页">&nbsp;&nbsp;跳转至&nbsp;&nbsp;<input type="text" size="4" maxlength="5" class="some-page"/>';
	        o.params = options.params || {};
	        options[o.mapKeys.orderBy] && (o.params[o.mapKeys.orderBy] = options[o.mapKeys.orderBy]);
	        options[o.mapKeys.order] && (o.params[o.mapKeys.order] = options[o.mapKeys.order]);
	        options[o.mapKeys.sortType] && (o.params[o.mapKeys.sortType] = options[o.mapKeys.sortType]);
	        if (!o.nopage) {
	            o.params[o.mapKeys.pageNo] = options[o.mapKeys.pageNo] || 1;
	            o.params[o.mapKeys.pageSize] = options[o.mapKeys.pageSize] || 15;
	        }
	        addClass(o.holder, 'grid');
	        mappingKeys(o.mapKeys, options.mapKeys);
	        bindResize(o);
	    },
	    bindResize = function(o){
	    	var timer = null;
	    	if(o.ellipsis === 'auto'){
	    		addEvent(win, 'resize', function(){
	    			clearTimeout(timer);
	    			timer = setTimeout(function(){ellipsisColumn(o);}, 200);
	    		});
	    	}
	    },
	    ellipsisColumn = function(o){
			each(o.thead.getElementsByTagName('th'), function(th){
        		if(th.scrollWidth > th.clientWidth){
        			addClass(th, 'ellipsis');
        			th.title = th[textContent];
        			o.onellipsised(th);
        		}else{
        			th.removeAttribute('title');
        		}
        	});
        	each(o.tbody.childNodes, function(tr){
        		each(tr.childNodes, function(td){
        			if(td.scrollWidth > td.clientWidth){
            			addClass(td, 'ellipsis');
            			td.title = td[textContent];
            			o.onellipsised(td);
            		}else{
            			td.removeAttribute('title');
            		}
        		});
        	});
		},
		resizeColume = function(o){
			var tTD; //用来存储当前更改宽度的Table Cell,避免快速移动鼠标的问题   
			each(o.thead.getElementsByTagName('th'), function(th){
				th.onmousedown = function (event) {   
					var event = event || window.event;
					//记录单元格   
					tTD = this;   
					if (event.offsetX > tTD.offsetWidth - 10) {   
						tTD.mouseDown = true;   
						tTD.oldX = event.x;   
						tTD.oldWidth = tTD.offsetWidth;   
					}   
				};   
				th.onmouseup = function (event) { 
					var event = event || window.event;  
					//结束宽度调整   
					if (tTD == undefined) tTD = this;   
					tTD.mouseDown = false;   
					tTD.style.cursor = 'default'; 

					//超出隐藏
					if(th.scrollWidth > th.clientWidth){
						addClass(th, 'ellipsis');
						th.title = th[textContent];
					}else{
						th.removeAttribute('title');
					}
					each(o.tbody.childNodes, function(tr){
						each(tr.childNodes, function(td){
							if(td.scrollWidth > td.clientWidth){
				    			addClass(td, 'ellipsis');
				    			td.title = td[textContent];
				    			o.onellipsised(td);
				    		}else{
				    			td.removeAttribute('title');
				    		}
						});
					});
						
				};   
				th.onmousemove = function (event) {
					var event = event || window.event;   
					//更改鼠标样式   
					if (event.offsetX > this.offsetWidth - 10)   
						this.style.cursor = 'col-resize';   
					else   
						this.style.cursor = 'default';   
					//取出暂存的Table Cell   
					if (tTD == undefined) tTD = this;   
					//调整宽度   
					if (tTD.mouseDown != null && tTD.mouseDown == true) {   
						tTD.style.cursor = 'default';   
						if (tTD.oldWidth + (event.x - tTD.oldX)>0)   
						tTD.width = tTD.oldWidth + (event.x - tTD.oldX);   
						//调整列宽   
						tTD.style.width = tTD.width;   
						tTD.style.cursor = 'col-resize';   
						 
					}  
				}; 
			})

		},
	    initTable = function(o, options){
	    	var thead = o.thead = o.holder.tHead,
	    		tbodies = o.holder.tBodies,
	    		sorts;
		    if(!thead){
		    	thead = o.thead = createNode('thead');
		    	o.holder.appendChild(thead);
		    }
		    if(!tbodies){
		    	o.holder.appendChild(o.tbody = createNode('tbody'));
		    }else{
		    	o.tbody = tbodies[0];
		    }
		    if(o.headData || o.headTemplate){
		    	buildHead(o, o.headData);
		    }else{
		    	sorts = [];
		    	each(thead.getElementsByTagName('th'), function(th){
		    		var sort = th.getAttribute(o.mapKeys.sort),
		    			styles = th.getAttribute(o.mapKeys.styles);
		    		if(sort){
		    			sorts.push({
		    				node:th,
							sort:sort,
							sortType:th.getAttribute(o.mapKeys.sortType)
		    			});
		    		}
		    		if(styles){
						th.style.cssText = styles;
					}
		    	});
		    	initSort(o, o.sorts = sorts);
		    }
	    },
	    initPage = function(o, data) {
	    	o.params[o.mapKeys.totalPage] = data[o.mapKeys.totalPage] = parseInt((data[o.mapKeys.totalCount] - 1) / data[o.mapKeys.pageSize] + 1);
	    	var btns = [,,,,,[]],
	    		txt = o.pageTemplate.replace(pageReg, function() {
	    			return o.params[o.mapKeys[arguments[1]]] = data[o.mapKeys[arguments[1]]];
	    		}),
	    		pageNode = o.pageNode;
	        if (!pageNode) {
	        	pageNode = o.pageNode = createNode('div');
	            o.holder.parentNode.insertBefore(pageNode, o.holder.nextSibling);
	            addClass(pageNode, 'page-node');
	        }
	        pageNode.innerHTML = txt;
        	addClass(pageNode, 'page-node');
			each(pageNode.childNodes, function(btn){
				if(hasClass(btn, 'first-page')){
					btns[0] = btn;
				}else if(hasClass(btn, 'pre-page')){
					btns[1] = btn;
				}else if(hasClass(btn, 'next-page')){
					btns[2] = btn;
				}else if(hasClass(btn, 'last-page')){
					btns[3] = btn;
				}else if(hasClass(btn, 'some-page')){
					btns[4] = btn;
				}else if(hasClass(btn, 'page-size')){
					btns[5].push(btn);
				}
			});
	        setPageDisabled(o, btns);
	        addPageEvent(o, btns);
	        resizeColume(o);
	        
	    },
	    trim = function(txt) {
	    	return txt = txt + '', txt.trim ? txt.trim() : txt.replace(/^\s+|\s+$/, '');
	    },
		getNode = function(ele) {
			return ele && (typeof ele == 'string' ? doc.getElementById(ele)
					: ele.nodeName ? ele : ele[0]);
		},
		mappingKeys = function(keys, keysMap) {
	        if (typeof keysMap == 'object') {
	        	each(keysMap, function(v, p){
	        		keys[p] = v;
	        	})
	        }
	    },
	    setTableHTML = function(node, html) {
	    	var nodeName = node.nodeName,
	    		firstChild,
	    		temp,
	    		htmlParentNode;
			if (isIE && nodeName !== 'TD' && nodeName !== 'TH') {
				temp = node.ownerDocument.createElement('div');
				if(nodeName === 'TR'){
					temp.innerHTML = '<table><tbody><tr>' + html + '</tr></tbody></table>';
					htmlParentNode = temp.firstChild.firstChild.firstChild;
				}else if(nodeName === 'TBODY'){
					temp.innerHTML = '<table><tbody>' + html + '</tbody></table>';
					htmlParentNode = temp.firstChild.firstChild;
				}else if(nodeName === 'THEAD'){
					temp.innerHTML = '<table><thead>' + html + '</thead></table>';
					htmlParentNode = temp.firstChild.firstChild;
				}else if(nodeName === 'TABLE'){
					temp.innerHTML = '<table>' + html + '</table>';
					htmlParentNode = temp.firstChild;
				}
				temp = null;
				each(node.childNodes, function(child){
					node.removeChild(child);
					child = null;
				}, !0);
				while(firstChild = htmlParentNode.firstChild){
					node.appendChild(firstChild);
				}
			} else {
				node.innerHTML = html;
			}
			return node;
		},
		each = function(arr, fun, reverse) {
			var len,
				idx;
			if(!arr) return ;
			len = arr.length;
			if(len){
				if(!reverse){
					for(idx=0; idx<len;) if(fun.call(arr[idx], arr[idx], idx++) === !1){
						break;
					}
				}else{
					for(idx=len; idx>0;) if(fun.call(arr[--idx], arr[idx], idx) === !1){
						break;
					}
				}
			}else if(arr.constructor === Object){
				for(idx in arr) if(fun.call(arr[idx], arr[idx], idx) === !1) {
					break;
				}
			}
		},
		createNode = function(tag, cls){
			var node = doc.createElement(tag);
			cls && (node.className = cls);
			return node;
		},
		buildHead = function(o, headData){
	    	var thead = o.thead,
	    		headTemplate = o.headTemplate,
	    		sorts = o.sorts = [],
	    		trs = [],
	    		maxLevel = 0,
	    		levels = [],
	    		deepLevelThs = [],
	    		tr,
	    		buildRow;
			each(thead.childNodes, function(tr){
				thead.removeChild(tr), tr = null;
			}, !0);
			if(headTemplate){
				tr = parseHeadTemplate(o, headData);
				setTableHTML(thead, tr);
				each(thead.getElementsByTagName('th'), function(th, idx){
					var sort = th.getAttribute(o.mapKeys.sort),
						styles = th.getAttribute(o.mapKeys.styles);
					if(sort){
						sorts.push({
							node:th,
							sort:sort,
							sortType:th.getAttribute(o.mapKeys.sortType)
						})
						th.removeAttribute(o.mapKeys.sort);
					}
					if(styles){
						th.style.cssText = styles;
					}
					o.oncolumned.call(th, th, headData);
				});
			}else{
				buildRow = function(ths, level){
					var tr = trs[level];
					if(!tr){
						if(level > maxLevel){
							maxLevel = level;
						}
						tr = createNode('tr');
						thead.appendChild(tr);
						trs.push(tr);
					}
		    		each(ths, function(column, idx){
		    			var th,
		    				text,
		    				sort,
		    				childs,
		    				styles;
		    			if(typeof column === 'string'){
		    				th = createNode('th');
		    				th.appendChild(doc.createTextNode(column));
							tr.appendChild(th);
							deepLevelThs.push({
								node:th,
								level:level
							});
		    			}else{
		    				text = column[o.mapKeys.text];
		    				sort = column[o.mapKeys.sort];
		    				childs = column[o.mapKeys.childs];
		    				styles = column[o.mapKeys.styles];
		    				th = createNode('th');
		    				th.appendChild(doc.createTextNode(text));
		    				tr.appendChild(th);
		    				if(sort){
		    					sorts.push({
		    						node:th,
		    						sort:column[o.mapKeys.sort],
		    						sortType:column[o.mapKeys.sortType]
		    					});
		    				}
		    				if(childs){
								th.setAttribute('colSpan', getLastLevelChilds(childs));
								buildRow(childs, level + 1);
		    				}else{
								deepLevelThs.push({
									node:th,
									level:level
								});
							}
		    				if(styles){
		    					th.style.cssText = styles;
		    				}
		    				o.oncolumned.call(th, th, ths);
		    			}
		    		});
		    	}
		    	buildRow(headData, 0);
				each(deepLevelThs, function(nodeInfo){
					var size = maxLevel - nodeInfo.level + 1;
					if(size > 1){
						nodeInfo.node.setAttribute('rowSpan', size);
						nodeInfo.node.style.verticalAlign = 'middle';
					}
				});
			}
			initSort(o, sorts);
	    },
	    getLastLevelChilds = function(data){
    		var count = 0,
    		getPathChild = function(data){
    			each(data, function(item){
	    			if(typeof item === 'string'){
	    				count++;
	    			}else{
	    				item.childs ? getPathChild(item.childs) : count++;
	    			}
	    		});
    		};
    		getPathChild(data);
    		return count;
    	},
    	buildBody = function(o, bodyData){
	    	var trs = '',
	    		mergeRecord = [],
	    		lastTrIdx;
	    	each(bodyData, function(model, index){
				var modelList = flatModel(model, o.mapKeys.childs),
					autoIndex = modelList.length * index;
				each(modelList, function(model, idx){
					o.modifyModel(model);
	                trs += parseBodyTemplate(o, model, autoIndex + idx);
				});
			});
			setTableHTML(o.tbody, trs);
			each(trs = o.tbody.getElementsByTagName('tr'), function(tr, trIdx){
				each(tr.childNodes, function(td, tdIdx){
					var merge = td.getAttribute(o.mapKeys.merge),
						edit = td.getAttribute(o.mapKeys.edit),
						tdInfo,
						text,
						preText;
					if(merge === 'true'){
						tdInfo = mergeRecord[tdIdx];
						text = td.innerHTML;
						if(!tdInfo){
							mergeRecord[tdIdx] = tdInfo = {
								preText:text,
								startIdx:trIdx
							};
						}
						preText = tdInfo.preText;
						if(text !== preText){
							mergeTr(trs, mergeRecord, tdInfo.startIdx, trIdx, tdIdx);
							tdInfo.preText = text;
							tdInfo.startIdx = trIdx;
						}
					}
					td.removeAttribute(o.mapKeys.merge);
					if(edit){
						(function(td, edit){
							var value = td.innerHTML;
							td.style.cursor = 'pointer';
							td.ondblclick = function(){
								var input = createNode('input', 'edit-node');
								input.type = 'text';
								input.value = value;
								td.innerHTML = '';
								td.appendChild(input);
								input.focus();
								input.onkeydown = function(e){
									var target;
									e = e || win.event;
									if(e.keyCode === 13){
										target = e.target || e.srcElement;
										e.preventDefault ? e.preventDefault() : e.returnValue = !1;
										if(value !== target.value){
											o.onedited(target, edit, value, value = target.value);
										}
										target.blur();
									}
								};
								input.onblur = function(){
									td.innerHTML = value;
								};
							}
						})(td, edit);
					}
					o.oncolumned.call(td, td, bodyData);
				}, !0);
				o.onrowed.call(tr, tr, bodyData);
			});
			lastTrIdx = trs.length;
			each(mergeRecord, function(tdInfo, tdIdx){
				if(tdInfo){
					mergeTr(trs, mergeRecord, tdInfo.startIdx, lastTrIdx, tdIdx);
					tdInfo = null;
				}
			});
			mergeRecord = null;
	    },
	    mergeTr = function(trs, mergeRecord, trStart, trEnd, tdIdx){
	    	var i,
	    		size,
	    		td;
			for(i=trStart+1; i<trEnd; i++){
				trs[i].removeChild(trs[i].childNodes[tdIdx]);
			}
			size = trEnd - trStart;
			if(size > 1){
				td = trs[trStart].childNodes[tdIdx];
				td.setAttribute('rowSpan', size);
				td.style.verticalAlign = 'middle';
			}
	    },
	    emptyBody = function(o, data){
	    	var colspan = 0;
	    	var trs = o.thead.getElementsByTagName('tr');
    		var trsLen = trs.length;
    		each(trs, function(tr, trIdx){
    			each(tr.getElementsByTagName('th'), function(th, tdIdx){
    				var rowSpan = +th.getAttribute('rowSpan') || 1;
	    			if(rowSpan === (trsLen - trIdx)){
	    				colspan += +(th.getAttribute('colSpan')) || 1;
	    			}
    			});
        	});
	        setTableHTML(o.tbody, '<tr><td style="text-align:center;width:'+ o.thead.clientWidth +'px" colSpan="' + colspan + '">' + o.noDataMessage + '</td></tr>');
	        if (!o.nopage) {
				data && (data[o.mapKeys.totalPage] = data[o.mapKeys.pageNo] = 0);
			}
	    },
    	highlight = function(o) {
			each(o.tbody.childNodes, function(tr, idx){
	    		if (idx & 1) {
	                addClass(tr, 'zebra-even');
	            } else {
	                removeClass(tr, 'zebra-even');
	            }
	    		tr.onmouseover = function(){
	    			addClass(this, 'mouseover');
	    		};
	    		tr.onmouseout = function(){
	    			removeClass(this, 'mouseover');
	    		}
	    	});
	    },
	    setPageDisabled = function(o, btns) {
	    	var firstPage = btns[0],
	    		prePage = btns[1],
	    		nextPage = btns[2],
    			lastPage = btns[3],
    			somePage = btns[4],
    			pageNo = o.params[o.mapKeys.pageNo],
    			totalPage = o.params[o.mapKeys.totalPage];
	        if (pageNo <= 1) {
	        	if(firstPage){
	        		firstPage.disabled = !0;
	        		addClass(firstPage, 'bt-dis');
	        	}
	        	if(prePage){
	        		prePage.disabled = !0;
	        		addClass(prePage, 'bt-dis');
	        	}
	        }else{
	        	if(firstPage){
	        		firstPage.disabled = !1;
	        		removeClass(firstPage, 'bt-dis');
	        	}
	        	if(prePage){
	        		prePage.disabled = !1;
	        		removeClass(prePage, 'bt-dis');
	        	}
	        }
	        if (pageNo >= totalPage) {
	        	if(nextPage){
	        		nextPage.disabled = !0;
	        		addClass(nextPage, "bt-dis");
	        	}
	        	if(lastPage){
	        		lastPage.disabled = !0;
	        		addClass(lastPage, "bt-dis");
	        	}
	        }else{
	        	if(nextPage){
	        		nextPage.disabled = !1;
	        		removeClass(nextPage, "bt-dis");
	        	}
	        	if(lastPage){
	        		lastPage.disabled = !1;
	        		removeClass(lastPage, "bt-dis");
	        	}
	        }
	    },
	    addPageEvent = function(o, btns) {
	    	var firstPage = btns[0],
	    		prePage = btns[1],
	    		nextPage = btns[2],
				lastPage = btns[3],
				somePage = btns[4],
				pageSizes = btns[5],
				pageNo = o.params[o.mapKeys.pageNo];
	    	if(firstPage){
	    		firstPage.onclick = function() {
	                goToPage(o, 1);
	            };
	    	}
	    	if(prePage){
	    		prePage.onclick = function() {
	    			goToPage(o, pageNo - 1);
	            };
	    	}
	    	if(nextPage){
	    		nextPage.onclick = function() {
	    			goToPage(o, pageNo + 1);
	            };
	    	}
	    	if(lastPage){
	    		lastPage.onclick = function() {
	    			goToPage(o, o.params[o.mapKeys.totalPage]);
	            };
	    	}
	    	if(somePage){
	    		somePage.onkeydown = function(e) {
	                e = e || win.event;
	                if (e.keyCode == 13) {
	                	goToPage(o, (e.target || e.srcElement)['value']);
	                }
	            };
	            somePage.style.imeMode = 'disabled';
	            somePage.oncontextmenu = function() {
	                return !1;
	            };
	    	}
	    	if(pageSizes.length){
	    		each(pageSizes, function(pageSize){
	    			if(pageSize.nodeName === 'SELECT'){
	    				pageSize.onchange = function(){
	    					o.params[o.mapKeys.pageSize] = this.value >> 0;
		    				if(o.sendOnPageSize){
		    					o.send();
		    				}
	    				}
	    				pageSize.value = o.params[o.mapKeys.pageSize];
	    				return false;
	    			}
	    			pageSize.onclick = function(){
	    				var that = this;
	    				each(pageSizes, function(btn){
	    					if(that === btn){
	    						addClass(that, 'page-active');
	    					}else{
	    						removeClass(btn, 'page-active');
	    					}
	    				});
	    				o.params[o.mapKeys.pageSize] = this.value;
	    				if(o.sendOnPageSize){
	    					o.send();
	    				}
	    			};
	    			if(pageSize.value == o.params[o.mapKeys.pageSize]){
						addClass(pageSize, 'page-active');
					}else{
						removeClass(pageSize, 'page-active');
					}
	    		});
	    	}
	    },
	    goToPage = function(o, page){
	    	var p = {};
	    	page = ('' + page).replace(/^\s+|\s+$/, '');
	        if (!/^\d+$/.test(page))
	            return;
	        page = +page;
	        if (page < 1)
	            page = 1;
	        if (page > o.params[o.mapKeys.totalPage])
	            page = o.params[o.mapKeys.totalPage];
	        p[o.mapKeys.pageNo] = page;
	        o.send(p);
	    },
	    flatModel = function(model, deepSign){//不处理层级间key相同的情况，暂时需要使用者自己保证。
			var list = [],
			dealModel = function(model, pModel){
				var mol = {};
				each(model, function(value, key){
					if(key !== deepSign){
						mol[key] = value;
					}
				});
				each(pModel, function(pv, pk){
					mol[pk] = pv;
				});
				var childs = model[deepSign];
				if(childs){
					each(childs, function(model){
						dealModel(model, mol);
					});
				}else{
					list.push(mol);
				}
			};
			if(model.constructor === Array){
				each(model, function(model){
					dealModel(model);
				});
			}else{
				dealModel(model);
			}
			return list;
		},
		jsMeta = {
		    '\b' : '\\b',
		    '\t' : '\\t',
		    '\n' : '\\n',
		    '\f' : '\\f',
		    '\r' : '\\r',
		    '\\' : '\\\\'
		},
		htmlMeta = {
		    '&' : '&amp;',
		    '<' : '&lt;',
		    '>' : '&gt;',
		    '"' : '&quot;',
		    "'" : '&#39;',
		    '\\' : '\\\\',
		    '\"' : '\\"'
		},
		escapeHTML = function(txt) {
		    if (typeof txt == 'undefined')
		        return "";
		    if (typeof txt != 'string')
		        return txt;
		    return txt.replace(/\\|\"|&|<|>|"|'/g, function() {
		        return htmlMeta[arguments[0]];
		    });
		},
		escapeJS = function(str) {
		    if (typeof str == 'undefined')
		        return ;
		    str = str.replace(/[\x00-\x1f\\]/g, function(chr) {
		        var special = jsMeta[chr];
		        return special ? special : '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
		    });
		    return '"' + str.replace(/"/g, '\\"') + '"';
		},
		parseBodyTemplate = function(o, model, idx) {
	        return o.bodyTemplate.replace(trReg, function(full, fun, args, prop, autoIdx){
	        	return parseTemplate(o, fun, args, prop, autoIdx, model, idx);
	        });
	    },
	    parseTemplate = function(o, fun, args, prop, autoIdx, model, idx){
	        var size, current, arr;
	        if (fun) {
	            arr = [];
	            each(args.split(dotReg), function(param){
	            	var isRep = propReg.exec(param), p;
	                if (isRep) {
						p = model[isRep[1]];
	                    if (typeof p == 'string'){
	                    	arr.push(escapeJS(p));
	                    }else{
	                    	arr.push(p + '');
	                    }
	                } else {
	                    if (typeof param == 'string'){
	                    	arr.push(escapeJS(param));
	                    }else{
	                    	arr.push(param + '');
	                    }
	                }
	            });
				return eval('0, ' + fun + '(' + arr.join(',') + ')');
	        } else if (prop) {
	            return model[prop] === undefined ? '' : model[prop];
	        } else if(autoIdx){
				if(o.nopage){
					return idx + 1;
				}
	        	return ((current || (current = o.params[o.mapKeys.pageNo])) - 1) * (size || (size = o.params[o.mapKeys.pageSize])) + idx + 1;
	        }
	    },
	    parseHeadTemplate = function(o, model) {
	        return o.headTemplate.replace(trReg, function(full, fun, args, prop, autoIdx){
	        	return parseTemplate(o, fun, args, prop, autoIdx, model);
	        });
	    },
	    hasClass = function(node, cls){
	    	var className, find, constructor;
	    	if(!node) return !1;
	    	className = ' ' + (node.className ? node.className.replace(/\s+/mg, ' ') : node) + ' ', constructor = cls.constructor;
	    	if(constructor === String){
	    		return className.indexOf(' ' + trim(cls) + ' ') > -1;
	    	}
	    	if(constructor === RegExp){
	    		find = !1;
	    		each(className.split(' '), function(c){
	    			if(cls.test(c)){
	    				return !(find = !0);
	    			}
	    		});
	    		return find;
	    	}
	    	return !1;
	    },
	    addClass = function(node, cls){
	    	var className = node.className,
	    		used = [];
	    	cls = trim(cls);
	    	if(/\s/.test(cls)){
	    		each(cls.split(/\s+/), function(cls){
	    			if(!hasClass(className, cls)){
	    				used.push(cls);
	    			}
	    		});
	    	}else{
	    		if(!hasClass(className, cls)){
					used.push(cls);
				}
	    	}
	    	node.className = trim(className + ' ' + used.join(' '));
	    },
	    removeClass = function(node, cls){
	    	if(!cls){
	    		node.className = '';
	    	}else{
	    		var className = ' ' + node.className.replace(/\s+/mg, ' ') + ' ',
	    		isString = cls.constructor === String, classNames;
		    	if(isString) cls = trim(cls);
		    	if(/\s/.test(cls)){
		    		each(cls.split(/\s+/), function(cls){
		    			if(hasClass(className, cls)){
		    				if(isString){
		    					className = className.replace(' ' + cls + ' ', ' ');
		    				}else{
		    					classNames = [];
		    					each(className.split(/\s+/), function(c){
		    						if(!cls.test(c)){
		    							classNames.push(c);
		    						}
		    					});
		    					className = classNames.join(' ');
		    				}
		    			}
		    		});
		    	}else{
		    		if(hasClass(className, cls)){
		    			if(isString){
							className = className.replace(' ' + cls + ' ', ' ');
						}else{
							classNames = [];
							each(className.split(/\s+/), function(c){
								if(!cls.test(c)){
									classNames.push(c);
								}
							});
							className = classNames.join(' ');
						}
		    		}
		    	}
		    	node.className = trim(className.split(/\s+/).join(' '));
	    	}
	    },
	    fill = function(o, data){
			var headData, bodyData;
	        if (data && typeof data == 'object') {
	        	headData = data[o.mapKeys.headData];
	        	bodyData = data[o.mapKeys.bodyData];
	        	if(data[o.mapKeys.bodyTemplate]){
	        		o.bodyTemplate = data[o.mapKeys.bodyTemplate];
	        	}
	        	if(data[o.mapKeys.headTemplate]){
	        		o.headTemplate = data[o.mapKeys.headTemplate];
	        	}
	        	if(headData || o.headTemplate){
	        		buildHead(o, o.headData = headData);
	        	}
	        	if(bodyData && bodyData.length){
	        		buildBody(o, o.bodyData = bodyData);
	            } else {
	            	emptyBody(o, data);
	            }
	        } else {
	        	emptyBody(o, data);
	        }
	        if (!o.nopage) {
	            initPage(o, data);
	        }
	        if(!o.nostripe){
	        	highlight(o);
	        }
	        
	        if(o.ellipsis === 'auto'){
	        	ellipsisColumn(o);
	        }
	       
	        o.onfilled(data);

	    };
    var Grid = function(options) {
	    this.mapKeys = {
	        pageNo : 'pageNo',
	        pageSize : 'pageSize',
	        query : 'query',
	        body : 'body',
	        order : 'order',
	        orderBy : 'orderBy',
	        totalCount : 'totalCount',
	        totalPage : 'totalPage',
	        headTemplate : 'headTemplate',
	        bodyTemplate : 'bodyTemplate',
	        sort : 'sort',
	        sortType : 'sortType',
	        merge : 'merge',
	        styles : 'styles',
	        edit : 'edit',
	        text : 'text',
	        childs : 'childs',
	        headData : 'headData',
	        bodyData : 'bodyData'
	    };
	    initParams(this, options);
	    initTable(this, options);
	};
    Grid.prototype.send = function(params) {
    	var that = this, constructor = this.dataSource.constructor;
    	this.beforeSend(params);
        if (typeof params == 'object') {
        	each(params, function(val, p){
                that.params[that.mapKeys[p] || p] = val;
        	})
        }
        if(!this.nopage){
        	if(this.params[this.mapKeys.pageNo] < 1){
        		this.params[this.mapKeys.pageNo] = 1;
        	}
        }
        if(constructor === String){
        	$.ajax({
            	url : this.dataSource,
                data : this.params && JSON.stringify(this.params),
                contentType : "application/json",
                type : this.method,
                dataType : 'json',
                context : this,
                success : function(data){fill(that, data);},
                error : this.onerror
            });
        }else if(constructor === Function){
        	fill(this, this.dataSource(this.params));
        }else if(constructor === Object){
        	fill(this, this.dataSource);
        }
    };
    Grid.prototype.destroy = function(){
    	this.holder.removeChild(this.thead);
    	this.holder.removeChild(this.tbody);
    	this.holder.parentNode.removeChild(this.holder);
    	if(this.pageNode){
    		this.pageNode.parentNode.removeChild(this.pageNode);
    	}
    	this.holder = this.thead = this.tbody = this.pageNode = null;
    };
    each(['beforeSend', 'modifyModel', 'oncolumned', 'onrowed', 'onfilled', 'onedited', 'onerror', 'onellipsised'], function(method){
    	Grid.prototype[method] = function(fun){
    		if(fun && fun.constructor === Function){
    			this[method] = fun;
	    	}
	    	return this;
	    };
    });
	Grid.init = init;
	Grid.flatModel = flatModel;
	return Grid;
})(document, window);