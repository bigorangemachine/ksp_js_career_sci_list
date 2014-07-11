function kspParser(){
	this.tnl='[\t\r\n]*';//regexp for tab and new lines
	this.tnls='[\t\r\n]*';
	this.tnls_='[^\t\r\n]*';//not the above
	this.nl='[\r\n]*';
	this.attr_regexp='('+this.tnls_+')+'+'(=+)(.*)[\r\n]+';
	this.chunk_regexp_str_1='((.*))('+this.tnl;//starts with anything then some white space then the ##ISLAND## of an index key
	this.chunk_regexp_str_2='(('+this.tnl+'\{){1}'+this.tnl+'))';//ending with some white space then '{' (at least once) <-that is wrong but not fixing it for now/<- follow by more white space

	this.fsp_obj=false;

	this.plugin={
		'pre_attr_reader_line':false,
		'attr_reader_line':false
	};
}
kspParser.prototype.i_callback=function(hookIn,argsIn){//internal callback - pluginable hooks
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
kspParser.prototype.attr_reader=function(strIn,doDebug){
	var self=this,
		child_obj=[],
		seekObjs=true;
	if(seekObjs){//find all child objects?
		var pre_parse=self.chunk_reader(strIn,self.tnls_);//find anything resembling a child object
		for(var p=0;p<pre_parse.length;p++){
			strIn=strIn.replace(pre_parse[p].clean_chunk,'');//clean while we are at it hasten parsing
			child_obj.push({'key':pre_parse[p].key,'pos':pre_parse[p].open_pos});}
	}
	
	var attr_pat=new RegExp(self.attr_regexp,'gim'),
		found_str=[],
		attrs=[],
		attrs_as_obj={};
	//var out_meth='obj';
	var out_meth='arr';
	//if(!attr_pat.test(strIn)){return [];}
	while((match = attr_pat.exec(strIn)) != null){found_str.push({'pos':match.index,'match':match,'key':check_strip_last(match[1],' '),'val':check_strip_first(match[3],' ')});}//pre-parse
	if(child_obj.length>0){
		for(var i=0;i<child_obj.length;i++){//quick lazy
			found_str.push({'val':(new kspDataChild(strIn,child_obj[i].key)),'key':child_obj[i].key});
		}
	}
	for(var i=0;i<found_str.length;i++){
		var clean_key=found_str[i].key,
			clean_val=found_str[i].val,
			do_break=false;

		var _args={'clean_key':clean_key,'clean_val':clean_val,'do_break':do_break},
			key_list=array_keys(_args),
			_vr='';
		self.i_callback('pre_attr_reader_line',_args);
		for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope

		if(out_meth=='arr'){
			attrs.push({'key':clean_key,'val':clean_val});
		}else{
			if(typeof(attrs_as_obj[clean_key])=='undefined'){
				attrs_as_obj[clean_key]=clean_val;
			}else{
				if(typeof(attrs_as_obj[clean_key])=='object' && attrs_as_obj[clean_key] instanceof Array){attrs_as_obj[clean_key].push(clean_val);}
				else{
					var old_val=attrs_as_obj[clean_key]+'';//breaking live reference with +''
					attrs_as_obj[clean_key]=[];//setup as array
					attrs_as_obj[clean_key].push(old_val);
					attrs_as_obj[clean_key].push(clean_val);
					delete old_val;
				}
			}
		}

		var _args={'clean_key':clean_key,'clean_val':clean_val,'do_break':do_break,'attrs':attrs,'attrs_as_obj':attrs_as_obj},
			key_list=array_keys(_args),
			_vr='';
		self.i_callback('attr_reader_line',_args);
		for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
if(doDebug){
//console.log('found_str',found_str[i].match);
//console.log('found_str',found_str[i],"\n",'attrs',attrs[attrs.length-1]);
//console.log('attrs',attrs[attrs.length-1]);
}
		if(do_break){break;}
	}

if(doDebug){
console.log('found_str',found_str);
//console.log('attrs_as_obj',attrs_as_obj);
}
	if(out_meth=='arr'){
		return attrs;}
	else{
		return attrs_as_obj;}
};
			
kspParser.prototype.chunk_reader=function(strIn,islandStr,doDebug){
	//since this isn't a universal format we are just 'seeking' the start of the island we're looking for.  Then string manipulate the rest
	var self=this,
		seek_pat=new RegExp(self.chunk_regexp_str_1+islandStr+self.chunk_regexp_str_2,'mg'),
		found_str=[],
		scenario_groups=[];
	//if(!seek_pat.test(strIn)){return [];}
console.log('islandStr',islandStr,'strIn',strIn);
	while((match = seek_pat.exec(strIn)) != null){found_str.push({'pos':match.index,'match':match});}//pre-parse
	for(var i=0;i<found_str.length;i++){
if(doDebug){
console.log('i: ',i,found_str[i]);
}
		var	wrapper_close_str=found_str[i].match[5].replace('{','}'),//preserve white spaces
			close_pos=strIn.indexOf(wrapper_close_str,found_str[i].match.index+1),
			chunk_start=found_str[i].match.index+found_str[i].match[1].length,//trim previous close from regex
			chunk_end=strIn.indexOf(wrapper_close_str,chunk_start)+wrapper_close_str.length,
			chunk=strIn.substr(chunk_start, chunk_end-chunk_start+1),//startPos, length
			regexp_trim_end=new RegExp(self.tnl+'$','gi'),//weird replacement to preserve formatting.  I wrote attr_before this so I need just the little fix for clean_chunk
			clean_island=found_str[i].match[3].replace(regexp_trim_end,''),
			clean_chunk_1=check_strip_first(chunk,clean_island).replace(regexp_trim_end,''),//\r was giving me trouble.  I just need to match what I have anyways
			clean_chunk_2=check_strip_last(clean_chunk_1,wrapper_close_str),
			clean_chunk=clean_chunk_2,
			regexp_trim_start=new RegExp('^'+self.tnl,'gi'),//weird replacement to preserve formatting.
			regexp_key_clean=new RegExp('('+self.tnls+'[\{]*)','gi');//change [^ - NOT to include the bracket
			clean_found_key=clean_island.replace(regexp_trim_start,'').replace(regexp_key_clean,'');
if(doDebug){
console.log('wrapper_close_str',wrapper_close_str
	,"\n",'JSON.stringify(wrapper_close_str)',JSON.stringify(wrapper_close_str)
	,"\n",'close_pos',close_pos
	,"\n",'chunk_start',chunk_start
	,"\n",'chunk_end',chunk_end
	,"\n",'chunk',chunk
	,"\n",'clean_chunk',clean_chunk
	,"\n",'clean_island',clean_island
);
//console.log('chunk',chunk);
}
		scenario_groups.push({'open_pos':chunk_start,'close_pos':chunk_end,'chunk':chunk,'clean_chunk':clean_chunk,'key':clean_found_key});//,'matches':found_str[i].match
/*
		for(var m=0;m<found_str[i].match.length;m++){
console.log('-['+i+']['+m+']: ',"\n",found_str[i].match[m],"\n","json",JSON.stringify(found_str[i].match[m]));
//						scenario_groups.push({'pos':match.index,'match':match});
		}
*/
	}
	return scenario_groups;
}



////////////////////////////////////
function kspDataChild(strIn,keyIn){
	this.chunk=strIn;
	this.top_key=keyIn;
}
kspDataChild.prototype.get=function(){
};