//https://github.com/bigorangemachine/ksp_js_career_sci_list
function kspParser(){
	this.tnl='[\t\r\n]*';//regexp for tab and new lines
	this.tnl_p='[\t\r\n]+';
	this.tnls='[\t\r\n]*';
	this.tnls_='[^\t\r\n]*';//not the above
	this.nl='[\r\n]*';
	this.nl_p='[\r\n]+';
	//this.attr_regexp='('+this.tnls_+')+'+'(=+)(.*)[\r\n]+';
	this.attr_regexp='('+this.tnls_+')+'+'(=+)'+'('+this.tnls_+')+'+'[\r\n]+';
	this.chunk_regexp_str_1='((.*))('+this.tnl;//starts with anything then some white space then the ##ISLAND## of an index key
	this.chunk_regexp_str_2='(('+this.tnl+'\{){1}'+this.tnl+'))';//ending with some white space then '{' (at least once) <-that is wrong but not fixing it for now/<- follow by more white space
	this.sci_id_regex='';

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
kspParser.prototype.parse_sci_id=function(sciIdIn){
	var self=this;
	var attr_pat=new RegExp(self.sci_id_regex,'gi');
};
kspParser.prototype.attr_reader=function(strIn,dataOutObj,doDebug){
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
		attr_pat_test=new RegExp(self.attr_regexp,'gim'),
		found_str=[],
		attrs=[],
		attrs_as_obj={};

	var split_pat=new RegExp('([^=]+)','gim'),
		line_patt=new RegExp(self.tnl_p,'im'),
		t_arr=strIn.split(line_patt),
		attr_lines=[];
	for(var e=0;e<t_arr.length;e++){
		if(basic_check(t_arr[e])){
			var t_exp=t_arr[e].split(split_pat),
				t_key='',
				t_val='',
				a_inc=0;
//console.log('t_exp',t_exp);
			for(var t=0;t<t_exp.length;t++){
//console.log('-'+t,t_exp[t]);
				if(basic_check(t_exp[t])){
					if(a_inc==0){
						t_key=t_key+t_exp[t];
						var clean_regexp=new RegExp(self.tnl_p,'gim'),
							clean_str=t_exp[t].replace(clean_regexp,'');
//console.log('clean_str ',clean_str,JSON.stringify(clean_str),"\n","str_rep_count(clean_str,'=')",str_rep_count(clean_str,'='),'clean_str.length',clean_str.length);
						if((str_rep_count(clean_str,'=')!=clean_str.length)){a_inc++;}//might start with some equals? Who knows?!
					}else{
//console.log('+t_val',t_exp[t],JSON.stringify(t_exp[t]),"\n",'a_inc',a_inc);
						t_val=t_val+(a_inc>=2?t_exp[t]:self.l_trim(t_exp[t]));
						a_inc++;
					}
				//}else{//fix damage from exploding.  We don't have a schema for the data lets be safe.
					/*if(t==0){t_key=(a_inc==0?'=':'');}
					else{t_val=t_val+(a_inc!=0?'=':'');}*/
				}
			}
			var key_regexp=new RegExp('[ \t]*$','gim');
			t_key=t_key.replace(key_regexp,'');
			var val_regexp=new RegExp('^( )?(=)+( )+','gi');
			t_val=t_val.replace(val_regexp,'');
			found_str.push({'key':t_key,'val':t_val})
		}
	}
	//console.log("strIn.split(split_pat)",strIn.split(split_pat),'t_arr',t_arr);

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

		//if(out_meth=='arr'){
			attrs.push({'key':clean_key,'val':clean_val});
		//}else{
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
		//}

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
//console.log('attrs',attrs);
console.log('found_str',found_str);
//console.log('attrs_as_obj',attrs_as_obj);
}
	if(typeof(dataOutObj)=='object'){for(var k in attrs_as_obj){if(bdcheck_key(attrs_as_obj,k)){dataOutObj[k]=attrs_as_obj[k];}}}//push up values
	return attrs;
};
			
kspParser.prototype.chunk_reader=function(strIn,islandStr,doDebug){
	//since this isn't a universal format we are just 'seeking' the start of the island we're looking for.  Then string manipulate the rest
	var self=this,
		seek_pat=new RegExp(self.chunk_regexp_str_1+islandStr+self.chunk_regexp_str_2,'mg'),
		seek_pat_test=new RegExp(self.chunk_regexp_str_1+islandStr+self.chunk_regexp_str_2,'mg'),
		found_str=[],
		scenario_groups=[];
	if(!seek_pat_test.test(strIn)){return [];}
//console.log('islandStr',islandStr,'strIn',strIn);
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
};
kspParser.prototype.l_trim=function(strIn){//for parsing; trim the left side
	var self=this,
		regexp_trim_start=new RegExp('^'+self.tnl,'gi');
	return strIn.replace(regexp_trim_start,'');
};
kspParser.prototype.r_trim=function(strIn){//for parsing; trim the right side
	var self=this,
		regexp_trim_end=new RegExp(self.tnl+'$','gi');
	return strIn.replace(regexp_trim_end,'');
};



////////////////////////////////////
function kspDataChild(strIn,keyIn){
	this.chunk=strIn;
	this.top_key=keyIn;
}
kspDataChild.prototype.get=function(){
};



////////////////////////////////////
function kspUniverse(){
	this.body_rails={//where can experiments happen - splashes and surfaces are kinda of a rail
		'high_orbit':false,
		'low_orbit':false,
		'high_fly':false,
		'low_fly':false,
		'surface':false,
		'splash':false//aka ocean
	};
	this.body_types={
		'asteroid':false,
		'atm_rocky':false,
		'atm_rocky_liquid':false,
		'rocky':false,
		'gas':false,
		'star':false
	};
	this.celestial_bodies=[];
	this.celestial_bodies_schema={
		'ident':'',//string
		'name':'',//string
		'orbiting_body':false,//string - false if sun
		'body_type':'',//string white list -> this.body_types
		'biomes':[]
	};
	this.default_bodies=[
		{'ident':'Sun','name':'Kerbold','orbiting_body':false,'body_type':'star'},
		{
			'ident':'Kerbin',
			'name':'Kerbin',
			'orbiting_body':'Sun',
			'body_type':'atm_rocky_liquid',
			'biomes':['Grasslands','Highlands','Mountains','Deserts','Badlands','Tundra','IceCaps','Water','Shores','KSC','LaunchPad','Runway']
		},
			{
				'ident':'Mun',
				'name':'Mun',
				'orbiting_body':'Kerbin',
				'body_type':'rocky',
				'biomes':['NorthernBasin','HighlandCraters','Highlands','MidlandCraters','Midlands','Canyons','EastCrater','EastFarsideCrater',
					'FarsideCrater','NorthwestCrater','Southwest Crater','TwinCraters','PolarCrater','PolarLowlands','Poles']
			},
			{
				'ident':'Mun',
				'name':'Mun',
				'orbiting_body':'Kerbin',
				'body_type':'rocky',
				'biomes':['Highland','Midlands','Lowlands','Slopes','LesserFlats','Flats','GreatFlats','GreaterFlats','Poles']
			},
		{'ident':'Moho','name':'Moho','orbiting_body':'Sun','body_type':'rocky'},
		{'ident':'Eve','name':'Eve','orbiting_body':'Sun','body_type':'atm_rocky_liquid'},
			{'ident':'Gilly','name':'Gilly','orbiting_body':'Eve','body_type':'rocky'},
		{'ident':'Duna','name':'Duna','orbiting_body':'Sun','body_type':'atm_rocky'},
			{'ident':'Ike','name':'Ike','orbiting_body':'Duna','body_type':'rocky'},
		{'ident':'Dres','name':'Dres','orbiting_body':'Sun','body_type':'atm_rocky'},
		{'ident':'Jool','name':'Jool','orbiting_body':'Sun','body_type':'gas'},
			{'ident':'Laythe','name':'Laythe','orbiting_body':'Jool','body_type':'atm_rocky_liquid'},
			{'ident':'Vall','name':'Vall','orbiting_body':'Jool','body_type':'rocky'},
			{'ident':'Tylo','name':'Tylo','orbiting_body':'Jool','body_type':'rocky'},
			{'ident':'Bop','name':'Bop','orbiting_body':'Jool','body_type':'rocky'},
			{'ident':'Pol','name':'Pol','orbiting_body':'Jool','body_type':'rocky'},
		{'ident':'Eeloo','name':'Eeloo','orbiting_body':'Sun','body_type':'rocky'}
	];


	this.plugin={
		'pre_add_body':false,
		'add_body':false,
		'pre_get_rail_rules':false,
		'get_rail_rules':false
	};
	this.init();
}
kspUniverse.prototype.init=function(){
	var self=this;console.log('-kspUniverse init-',self.plugin);
	for(var b=0;b<self.default_bodies.length;b++){
		var new_line=$.extend(true,{},self.celestial_bodies_schema,self.default_bodies[b]);
		self.add_body(new_line.orbiting_body, new_line.ident, new_line.biomes, {'name':new_line.name});
	}
};
kspUniverse.prototype.i_callback=function(hookIn,argsIn){//internal callback - pluginable hooks
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
kspUniverse.prototype.add_body=function(orbitBodyId,ident,planetType,planetBios,metaObj){
	var self=this,
		add_line=self.celestial_bodies_schema;
	if($.inArray(planetType,array_keys(self.body_types))===-1){return false;}
	if($.inArray(orbitBodyId,flatten_array(self.celestial_bodies,'ident'))===-1){return false;}
	add_line.ident=ident;
	add_line.name=(bdcheck_key(metaObj,'name')?metaObj.name:ident);
	add_line.orbiting_body=orbitBodyId;
	add_line.body_type=planetType;
	add_line.biomes=(typeof(planetBios)!='object' && planetBios instanceof Array && planetBios.length>0?planetBios:[]);

	var _args={'add_line':add_line},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('pre_add_body',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope

	self.celestial_bodies.push(add_line);

	var _args={'add_line':add_line},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('add_body',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope

	return true;
};
kspUniverse.prototype.get_rail_rules=function(planetType,planetIdent){
	var self=this,
		rules=self.body_rails;

	if($.inArray(planetType,array_keys(self.body_types))===-1){return false;}
	if($.inArray(planetIdent,flatten_array(self.celestial_bodies,'ident'))===-1){return false;}

	var _args={'planetType':planetType,'planetIdent':planetIdent,'rules':rules},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('pre_get_rail_rules',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope

	if(planetType=='asteroid'){
		//do nothing
	}else if(planetType=='atm_rocky_liquid'){
		rules.high_orbit=true;
		rules.low_orbit=true;
		rules.high_fly=true;
		rules.low_fly=true;
		rules.surface=true;
		rules.splash=true;
	}else if(planetType=='atm_rocky'){
		rules.high_orbit=true;
		rules.low_orbit=true;
		rules.high_fly=true;
		rules.low_fly=true;
		rules.surface=true;
	}else if(planetType=='rocky'){
		rules.high_orbit=true;
		rules.low_orbit=true;
		rules.surface=true;
	}else if(planetType=='gas'){
		rules.high_orbit=true;
		rules.low_orbit=true;
		rules.high_fly=true;
		rules.low_fly=true;
	}else{//planetType=='star'
		rules.high_orbit=true;
		rules.low_orbit=true;
	}

	var _args={'planetType':planetType,'planetIdent':planetIdent,'rules':rules},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('get_rail_rules',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	return rules;
};



////////////////////////////////////
function kspSci(){
	this.celestial_sciences=[];
	this.celestial_sciences_schema={
			'ident':'',
			'name':'',
			'rail_context':false,
			'biome_context':false
	};

	this.default_sciences=[
		{'ident':'surfaceSample','name':'Surface Sample','biome_context':{'surface':true,'splash':true},'rail_context':{'splash':true,'surface':true}},
		{'ident':'evaReport','name':'EVA Report','biome_context':{'low_fly':true,'surface':true,'splash':true},'rail_context':true},
		{'ident':'crewReport','name':'Crew Report','biome_context':{'low_fly':true,'surface':true,'splash':true},'rail_context':true},
		{'ident':'mysteryGoo','name':'Goo','biome_context':{'surface':true,'splash':true},'rail_context':true},
		{'ident':'mobileMaterialsLab','name':'Materials Bay','biome_context':{'surface':true,'splash':true},'rail_context':true},
		{'ident':'temperatureScan','name':'Temperature Scan','biome_context':{'low_fly':true,'surface':true,'splash':true},'rail_context':{'low_orbit':true,'high_fly':true,'low_fly':true,'splash':true,'surface':true}},
		{'ident':'barometerScan','name':'Barometer Scan','biome_context':{'surface':true,'splash':true},'rail_context':{'high_fly':true,'low_fly':true,'splash':true,'surface':true}},
		{'ident':'gravityScan','name':'Gravioli Particles','biome_context':{'high_orbit':true,'low_orbit':true,'surface':true,'splash':true},'rail_context':{'high_orbit':true,'low_orbit':true,'splash':true,'surface':true}},
		{'ident':'seismicScan','name':'Seismic Scan','biome_context':{'surface':true},'rail_context':{'surface':true}},
		{'ident':'atmosphereAnalysis','name':'Sensor Array Computing Nose Cone','biome_context':{'high_fly':true,'low_fly':true,'surface':true},'rail_context':{'high_fly':true,'low_fly':true,'surface':true}}
	];

	this.plugin={
		'pre_get_rail_rules':false,
		'get_rail_rules':false
	};

	this.init();
}
//kspSci.prototype = new kspUniverse();
kspSci.prototype.init=function(){//kspSci.init fires then kspUniverse.init
	$.extend(true,this,new kspUniverse(),this);//make universe the parent
	var self=this;console.log('-kspSci init-',this.plugin);
};
kspSci.prototype.get_rail_rules=function(planetType,scienceIdent){

	if(planetType=='asteroid'){
		//do nothing
	}else if(planetType=='atm_rocky_liquid'){
		rules.high_orbit=true;
		rules.low_orbit=true;
		rules.high_fly=true;
		rules.low_fly=true;
		rules.surface=true;
		rules.splash=true;
	}else if(planetType=='atm_rocky'){
		rules.high_orbit=true;
		rules.low_orbit=true;
		rules.high_fly=true;
		rules.low_fly=true;
		rules.surface=true;
	}else if(planetType=='rocky'){
		rules.high_orbit=true;
		rules.low_orbit=true;
		rules.surface=true;
	}else if(planetType=='gas'){
		rules.high_orbit=true;
		rules.low_orbit=true;
		rules.high_fly=true;
		rules.low_fly=true;
	}else{//planetType=='star'
		rules.high_orbit=true;
		rules.low_orbit=true;
	}

};