

function bdTabler(){
	this.table_grid=[];
	this.reserve_chars={/*
		'tc':'{t(c)}',//temp merge column
		'tr':'{t(r)}',//temp merge row*/
		'm':'{m(a)}',//merge all
		'mc':'{m(c)}',//merge column
		'mr':'{m(r)}'//merge row
	};
	this.row_count=0;
	this.col_count=0;
	/*
		xy: x is row, y is cols aka default
		yx: x is cols, y is rows
		-xy: x is rows but reversed, y is cols
		-x-y: x is rows but reversed, y is cols but reversed
	*/
	this.draw_method='xy';
	this.table_has={'thead':false,'tbody':false,'tfoot':false};
	this.plugin={
		'table':false,
		'thead':false,
		'thead_row':false,
		'tbody':false,
		'tbody_row':false,
		'tfoot':false,
		'tfoot_row':false,
		'pre_add_line':false,
		'add_line':false
	};
}
bdTabler.prototype.str_to_tags=function(str){
	return '<'+str+'></'+str+'>';
};
bdTabler.prototype.i_callback=function(hookIn,argsIn){//internal callback - pluginable hooks
	var self=this,
		has_callback=false;
	try{
		//if(typeof(this.plugin[hookIn])=='object' &&  this.plugin[hookIn] instanceof Array){has_callback=true;}
		//else 
		if(typeof(self.plugin[hookIn])=='function'){has_callback=true;}
	}catch(e){}
	if(has_callback){
		var args=Array(argsIn);
		self.plugin[hookIn].apply(self, args);
		obj=args[0];//push values up
		return true;
	}
	return false;
};
bdTabler.prototype.add_line=function(lineArrIn,metaObj){
	var self=this;
	metaObj=(typeof(metaObj)=='object'?metaObj:{});
	if(!bdcheck_key(metaObj,'row_type')){metaObj.row_type='body';}

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'lineArrIn':lineArrIn,'metaObj':metaObj},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('pre_add_line',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	self.table_grid.push({'row':lineArrIn,'meta':metaObj});
	self.row_count=self.table_grid.length;
	if(lineArrIn.length>self.col_count){self.col_count=lineArrIn.length;}//store the largest
	if(bdcheck_key(metaObj,'row_type')){
		if(metaObj.row_type=='head'){self.table_has.thead=true;}
		else if(metaObj.row_type=='foot'){self.table_has.tfoot=true;}
		else{self.table_has.tbody=true;}//metaObj.row_type=='body'
	}else{
		self.table_has.tbody=true;}

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'lineArrIn':lineArrIn,'metaObj':metaObj},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('add_line',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////
};
bdTabler.prototype.reserve_merge=function(){//no preference
	var self=this;
	return (new bdTablerSpan('m',this));//references self.reserve_chars.m;
	//return function(){return self.reserve_chars.m;};//failed
};
bdTabler.prototype.reserve_merge_row=function(){//please merge this row
	var self=this;
	return (new bdTablerSpan('mr',this));//references self.reserve_chars.mr;
	//return function(){return self.reserve_chars.mr;};//failed
};
bdTabler.prototype.reserve_merge_col=function(){//please merge this column
	var self=this;
	return (new bdTablerSpan('mc',this));//references self.reserve_chars.mc;
	//return function(){return self.reserve_chars.mc;};//failed
};
bdTabler.prototype.draw_table=function(obj){//please merge this column
	var self=this,
		t_html={
			'start':'<table>',
				'hd_start':'<thead>',
					'hd_row_start':'<tr>',
						'hd_col_start':'<th>',
						'hd_col_end':'</th>',
					'hd_row_end':'</tr>',
				'hd_row_end':'</thead>',
				'bd_start':'<tbody>',
					'bd_row_start':'<tr>',
						'bd_col_start':'<td>',
						'bd_col_end':'</td>',
					'bd_row_end':'</tr>',
				'bd_start':'</tbody>',
			'start_end':'</table>'//not used for reference
		},
		table_dom_obj;
	for(var t in t_html){if(bdcheck_key(t_html,t)){t_html[t]=check_strip_last(check_strip_first(check_strip_first(t_html[t],'</'),'<'),'>');}}//converting into something useful
	table_dom_obj=document.createElement(t_html.start);//create a table

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'table_dom_obj':table_dom_obj},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('table',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	if(self.table_has.thead){
		$(table_dom_obj).append(self.str_to_tags(t_html.hd_start));//add thead
		var do_arr=array_object_search(self.table_grid,{'meta':{'row_type':'head'}},'head'),
			new_thead=$(t_html.hd_start,table_dom_obj);
		new_thead=new_thead[new_thead.length-1];//what we really want

		///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
		var _args={'table_dom_obj':table_dom_obj,'do_arr':do_arr,'new_thead':new_thead},
			key_list=array_keys(_args),
			_vr='';
		self.i_callback('thead',_args);
		for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
		///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////
self.section_parse(do_arr);
		for(var h=0;h<do_arr.length;h++){
			var new_str='',
				cur_row=do_arr[h].row;
			
			$(new_thead).append(self.str_to_tags(t_html.hd_row_start));//add tr
			var new_tr=$(t_html.hd_row_start,table_dom_obj);
			new_tr=new_tr[new_tr.length-1];

				$(new_tr).append(self.str_to_tags(t_html.hd_col_start));//add th
				var new_th=[],
					_new_th=$(t_html.hd_col_start,table_dom_obj);
				_new_th=_new_th[_new_th.length-1];
				new_th.push(_new_th);

			///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
			var _args={'table_dom_obj':table_dom_obj,'new_thead':new_thead,'new_tr':new_tr,'new_th':new_th,'do_arr':do_arr,'cur_row':cur_row},
				key_list=array_keys(_args),
				_vr='';
			self.i_callback('thead_row',_args);
			for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
			///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////
		}
	}
	//$(table_dom_obj).xxxxxxxx();
	$(obj).append(table_dom_obj);
};
bdTabler.prototype.section_parse=function(rowsArrIn){//prioritize column merging over row merging
	var self=this,
		spans_schema={'col':{'span':0,'first':false},'row':{'span':0,'first':false}};
		m_func={//merge functions
			'b':self.reserve_merge.bind(self),//both - either is fine aka self.reserve_chars.m
			'c':self.reserve_merge_col.bind(self),//column priority aka self.reserve_chars.mc
			'r':self.reserve_merge_row.bind(self)//row priority aka self.reserve_chars.mr
		};
	if(self.row_count==0 && self.col_count==0){return;}
	for(var ri=0;ri<rowsArrIn.length;ri++){//pre-parse
		var this_row=rowsArrIn[ri].row;
		if(self.col_count-this_row.length>0){//stop neg numbers
			if(ri==0){
				var default_cell='';}
			else{
				var default_cell=m_func.b.apply(self);}
			for(var rk=(this_row.length);rk<self.col_count;rk++){//for(var rk=0;this_row.length;rk++){
				rowsArrIn[ri].row.push(default_cell);}}//set default table cell content
		rowsArrIn[ri]=$.extend(true,rowsArrIn[ri],{'spans':[]});
	}

	//ENSURE OUR IDENTIFIER IS UNIQUE!
	var tmp_s={//confusing work around: chose to keep context within the function
			'b':m_func.b().get(),//making it clear! if the function doesn't look good revert to what it should be
			'c':m_func.c().get(),
			'r':m_func.r().get()
		},
		marker_correction=false;

	var new_str_count=0;
	for(var ri=0;ri<rowsArrIn.length;ri++){
		var tmp_join_arr=[];
		for(var rk=0;rk<rowsArrIn[ri].row.length;rk++){
			if(rowsArrIn[ri].row[rk].constructor!=bdTablerSpan){tmp_join_arr.push(rowsArrIn[ri].row[rk]);}}
	}
	tmp_join_arr=tmp_join_arr.join('');
tmp_join_arr=tmp_join_arr+tmp_s.b;
	do{
		var allow_continue=false;
		if(tmp_join_arr.indexOf(tmp_s.b)!==-1 || tmp_join_arr.indexOf(tmp_s.c)!==-1 || tmp_join_arr.indexOf(tmp_s.r)!==-1){

			var str_len=2,//3 letters because of origianl!
				rand_mod=Math.floor(new_str_count/10),
				str_len_rand=str_len+rand_mod,
				rand_num_max=(1000*(rand_mod+1))-1;
			tmp_s.b=check_strip_last(tmp_s.b,')}')+randomString(str_len_rand)+'-'+getRandomInt(100, rand_num_max)+')}';
			tmp_s.c=check_strip_last(tmp_s.c,')}')+randomString(str_len_rand)+'-'+getRandomInt(100, rand_num_max)+')}';
			tmp_s.r=check_strip_last(tmp_s.r,')}')+randomString(str_len_rand)+'-'+getRandomInt(100, rand_num_max)+')}';
			
			marker_correction=true;
			allow_continue=true;
		}
		new_str_count++;
	}while(allow_continue);
	if(marker_correction===true){
		self.reserve_chars.m=tmp_s.b;
		self.reserve_chars.mc=tmp_s.c;
		self.reserve_chars.mr=tmp_s.r;
	}
	delete tmp_s;
	delete marker_correction;
	// \\ENSURE OUR IDENTIFIER IS UNIQUE!

	/*
	for(var ri=0;ri<rowsArrIn.length;ri++){//apply the place holder
		for(var rk=0;rk<rowsArrIn[ri].row.length;rk++){
			if(rowsArrIn[ri].row[rk].constructor==bdTablerSpan){
				rowsArrIn[ri].row[rk]=rowsArrIn[ri].row[rk].get.apply(rowsArrIn[ri].row[rk]);}}}*/
	var set_col_data=function(doDebug){
if(doDebug){
console.log('----c',row+'x'+col,"\n",'is_col_spaning',is_col_spaning,'tmp_col_span',tmp_col_span);}
			if(this_cell==m_func.r().get()){
if(doDebug){
console.log('----c',row+'x'+col,"\n",'is_col_spaning',is_col_spaning,'tmp_col_span',tmp_col_span);}
				if(is_col_spaning===false){
					is_col_spaning=col-1;
					tmp_col_span++;
					rowsArrIn[row].spans[is_col_spaning].col.first=true;}
			}else{//do this at end of this for loop!
				if(is_col_spaning!==false){//compile the row
console.log('col',col,'tmp_col_span',tmp_col_span);
					for(var cs=1;cs<tmp_col_span;cs++){
console.log('-cs',cs,' of ',tmp_col_span,'tmp_col_span-cs',tmp_col_span-cs,'tmp_col_span+cs',tmp_col_span+cs,'col-cs-1',col-cs-1);
						rowsArrIn[row].spans[col-cs-1].col.span=tmp_col_span-cs;
					}
					rowsArrIn[row].spans[is_col_spaning].col.span=tmp_col_span;
				}
				tmp_col_span=0;//resets!
				is_col_spaning=false;
			}
			if(is_col_spaning!==false){tmp_col_span++;}
		},
		set_row_data=function(doDebug){
			if(this_cell==m_func.c().get()){
if(doDebug){
console.log('----r',row+'x'+col,"\n",'is_row_spaning('+is_row_spaning.length+')',is_row_spaning,'tmp_col_span('+tmp_row_span.length+')',tmp_row_span);}
				if(is_row_spaning[col]===false){
					is_row_spaning[col]=row-1;
					tmp_row_span[col]++;//count the first one.  You can't rowspan 1!
					rowsArrIn[ (is_row_spaning[col]) ].spans[col].row.first=true;}
			}else{
				if(is_row_spaning[col]!==false){
					rowsArrIn[ (is_row_spaning[col]) ].spans[col].row.span=tmp_row_span[col];}//compile the column
				
				tmp_row_span[col]=0;//resets!
				is_row_spaning[col]=false;
			}
			if(is_row_spaning[col]!==false){tmp_row_span[col]++;}
		};
	var count=0,
		count_max=10;
	count_max=5;
	do{//keep doing until we resolve all the indifferent place holders
		var span_added=false,
			priority_merge='col',
			tmp_row_span=[],
			tmp_col_span=0,
			is_row_spaning=[],
			is_col_spaning=false,
			all_rows=[];

console.log('================================');
		for(var row=0;row<rowsArrIn.length;row++){//populate all rows
			var this_row=rowsArrIn[row].row.concat([]);//break live reference
			rowsArrIn[row].spans=[];
			for(var col=0;col<this_row.length;col++){
				rowsArrIn[row].spans.push($.extend(true,{},spans_schema));//break live reference
				if(this_row[col].constructor==bdTablerSpan){//detect place holder character
					this_row[col]=this_row[col].get.apply(this_row[col]);}//replace place holder
				var this_cell=this_row[col];
				if(this_row.length>is_row_spaning.length){is_row_spaning.push(false);}
				if(this_row.length>tmp_row_span.length){tmp_row_span.push(0);}				

				
				
				if(count!=0 && this_cell==m_func.b().get()){//after the first sweep we resolve the indifferent holders
					//if the whole row is pretty much merged
					if(priority_merge=='row'){
						var sub_do=['row','col'];}
					else{
						var sub_do=['col','row'];}
					for(var sd=0;sd<sub_do.length;sd++){
						var rule=sub_do[sd];
						if(count>1){//everything after 3rd sweep
							if(rule=='col'){
							}else{
							}
						}else{//2nd run only!
							if(rule=='col'){
								//if we're looking at columns - we want to see if the column above/below has a rule  If so we inherit that rule
							}else{
							}
						}
					}
				}

//console.log('this_row.length',this_row.length,"\n",'is_row_spaning('+is_row_spaning.length+')',is_row_spaning,"\n",'tmp_col_span('+tmp_row_span.length+')',tmp_row_span);
				//priority_merge - what we do know -> m_func.c().get() & m_func.r().get() used here
				if(row!=0){set_row_data();}
				if(col!=0){set_col_data();}
				all_rows.push(this_cell);
			}
			this_cell='';//unset for the function below
			set_col_data(true);
			is_col_spaning=false;//end of row... no more col span!
		}

		
		if($.inArray(m_func.b().get(),all_rows)!==-1){span_added=true;}//gotta fix all unresolved spans. m_func.b is a place holder!
if(count>=count_max){console.log('breakout===========================');break;}
		count++;
span_added=false;
	}while(span_added);
	for(var ri=0;ri<rowsArrIn.length;ri++){
		var this_obj=rowsArrIn[ri],
			this_row=this_obj.row;
console.log('this_obj['+ri+']',this_obj);
		//for(var rk=0;this_row.length;rk++){
		//}
	}
};
function bdTablerSpan(letterIn,contextObj){
	this.letter=letterIn;
	this.tabler_obj=contextObj;
}
bdTablerSpan.prototype.get=function(){
	return this.tabler_obj.reserve_chars[this.letter];
};