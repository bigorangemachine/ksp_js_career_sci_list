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
	var self=this,
		regex_str='';
	//bunch of loops and stuff
	var sci_pat=new RegExp(regex_str,'gi');
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

		///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
		var _args={'clean_key':clean_key,'clean_val':clean_val,'do_break':do_break},
			key_list=array_keys(_args),
			_vr='';
		self.i_callback('pre_attr_reader_line',_args);
		for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
		///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

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

		///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
		var _args={'clean_key':clean_key,'clean_val':clean_val,'do_break':do_break,'attrs':attrs,'attrs_as_obj':attrs_as_obj},
			key_list=array_keys(_args),
			_vr='';
		self.i_callback('attr_reader_line',_args);
		for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
		///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

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
	//used for both setting default values as a schema and providing an index to check against
	this.body_rails={//where can experiments happen - splashes and surfaces are kinda of a rail
		'high_orbit':false,
		'low_orbit':false,
		'high_fly':false,
		'low_fly':false,
		'surface':false,
		'splash':false//aka ocean
	};
	//used for both setting default values as a schema and providing an index to check against
	this.body_types={
		'asteroid':false,//no astmosphere and not many rules/science
		'atm_rocky':false,//you cannot splash!
		'atm_rocky_liquid':false,//you can splash!
		'rocky':false,//no atmosphere!
		'gas':false,//jool
		'star':false//kerbol
	};
	this.celestial_bodies=[];//our heap
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
		{'ident':'Eve','name':'Eve','orbiting_body':'Sun','body_type':'atm_rocky'},
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
	var self=this;//console.log('-kspUniverse init-',self.plugin);
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
		add_line=$.extend(true,{},self.celestial_bodies_schema,{});//must break js 'pass by reference'
	if($.inArray(planetType,array_keys(self.body_types))===-1){return false;}
	if(!self.is_celestial_body(orbitBodyId)){return false;}//orbiting something check
	if(self.is_celestial_body(ident)){return false;}//existing check
	add_line.ident=ident;
	add_line.name=(bdcheck_key(metaObj,'name')?metaObj.name:ident);
	add_line.orbiting_body=orbitBodyId;
	add_line.body_type=planetType;
	add_line.biomes=(typeof(planetBios)!='object' && planetBios instanceof Array && planetBios.length>0?planetBios:[]);

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'add_line':add_line},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('pre_add_body',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	self.celestial_bodies.push(add_line);

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'add_line':add_line},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('add_body',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	return true;
};
kspUniverse.prototype.get_rail_rules=function(planetType){
	var self=this,
		rails=$.extend(true,{},self.body_rails,{}),//must break js 'pass by reference'
		has_atmosphere=false;

	if($.inArray(planetType,array_keys(self.body_types))===-1){return false;}
	//if(!self.is_celestial_body(planetIdent)){return false;}

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'planetType':planetType,'rails':rails,'has_atmosphere':has_atmosphere},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('pre_get_rail_rules',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	if(planetType=='asteroid'){
		//do nothing
	}else if(planetType=='atm_rocky_liquid'){
		rails.high_orbit=true;
		rails.low_orbit=true;
		rails.high_fly=true;
		rails.low_fly=true;
		rails.surface=true;
		rails.splash=true;
		//non-rail rule
		has_atmosphere=true;
	}else if(planetType=='atm_rocky'){
		rails.high_orbit=true;
		rails.low_orbit=true;
		rails.high_fly=true;
		rails.low_fly=true;
		rails.surface=true;
		//non-rail rule
		has_atmosphere=true;
	}else if(planetType=='rocky'){
		rails.high_orbit=true;
		rails.low_orbit=true;
		rails.surface=true;
	}else if(planetType=='gas'){
		rails.high_orbit=true;
		rails.low_orbit=true;
		rails.high_fly=true;
		rails.low_fly=true;
		rails.surface=true;
		//non-rail rule
		has_atmosphere=true;
	}else{//planetType=='star'
		rails.high_orbit=true;
		rails.low_orbit=true;
	}

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'planetType':planetType,'rails':rails,'has_atmosphere':has_atmosphere},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('get_rail_rules',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////
	return {'rails':rails,'has_atmosphere':has_atmosphere};
};
kspUniverse.prototype.is_celestial_body=function(ident,foundObjRef){//foundObjRef is a 'push up' pass by reference
	var self=this,
		result=$.inArray(ident,flatten_array(self.celestial_bodies,'ident'));
	if(result!==-1 && typeof(foundObjRef)=='object'){
		for(var cb in self.celestial_bodies[result]){
			if(bdcheck_key(self.celestial_bodies[result],cb)){
				foundObjRef[cb]=self.celestial_bodies[result][cb];}}}
	return (result!==-1?true:false);//if not-not found
};



////////////////////////////////////
function kspSci(kspUniObj){
	this.ksp_uni_obj=(typeof(kspUniObj)=='object' && kspUniObj.constructor==kspUniverse?kspUniObj:new kspUniverse());
	this.sciences=[];
	this.sciences_schema={
		'ident':'',
		'name':'',
		'meta':{'ignore_planet_rail':false,'require_atmosphere':false},
		'rail_context':false,
		'biome_context':false
	};
/*
// situation bits:
// SrfLanded = 1,
// SrfSplashed = 2,
// FlyingLow = 4,
// FlyingHigh = 8,
// InSpaceLow = 16,
// InSpaceHigh = 32
	situationMask = 63 -> all added together
	biomeMask = 7 -> first 3 added together
*/
	this.default_sciences=[
		{'ident':'asteroidSample','name':'Asteroid Surface Sample','biome_context':{'low_fly':true,'surface':true,'splash':true},'rail_context':true},//,'meta':{'ignore_planet_rail':'asteroid'} <- was here but I realized you can't have astroids as places there are more like vessels
		{'ident':'surfaceSample','name':'Surface Sample','biome_context':{'surface':true,'splash':true},'rail_context':{'splash':true,'surface':true}},
		{'ident':'evaReport','name':'EVA Report','biome_context':{'low_orbit':true,'low_fly':true,'surface':true,'splash':true},'rail_context':true},
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
		'pre_add_science':false,
		'add_science':false,
		'pre_get_rail_rules':false,
		'get_rail_rules_line':false,
		'get_rail_rules':false
	};

	this.init();
}
//kspSci.prototype = new kspUniverse();
kspSci.prototype.init=function(){//kspSci.init fires then kspUniverse.init
	var self=this;//console.log('-kspSci init-',this.plugin);
	for(var b=0;b<self.default_sciences.length;b++){
		var new_line=$.extend(true,{},self.sciences_schema,self.default_sciences[b]);
		self.add_science(new_line.ident, new_line.biome_context, new_line.rail_context, $.extend(true,{},new_line.meta,{'name':new_line.name}));
	}
};
kspSci.prototype.i_callback=function(hookIn,argsIn){//internal callback - pluginable hooks
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
kspSci.prototype.add_science=function(ident,biomeObj,railObj,metaObj){
	var self=this,
		default_rails=$.extend(true,{},self.ksp_uni_obj.body_rails,{}),//must break js 'pass by reference'
		add_line=$.extend(true,{},self.sciences_schema,{});//must break js 'pass by reference'
	if(typeof(biomeObj)=='object'){//possible it comes through as boolean!
		for(var tk in biomeObj){
			if(bdcheck_key(biomeObj,tk)){
				if($.inArray(tk,array_keys(default_rails))===-1){return false;}}}}//1 not found we reject it.  Important to populate the KSP Universe object first!
	if(typeof(railObj)=='object'){//possible it comes through as boolean!
		for(var tk in railObj){
			if(bdcheck_key(railObj,tk)){
				if($.inArray(tk,array_keys(default_rails))===-1){return false;}}}}//1 not found we reject it.  Important to populate the KSP Universe object first!
	if(self.is_science(ident)){return false;}//existing check

	add_line.ident=ident;
	if(bdcheck_key(metaObj,'name')){
		add_line.name=metaObj.name;
		delete metaObj.name;
	}else{
		add_line.name=ident;}

	add_line.meta=metaObj;
	if(typeof(biomeObj)=='object' && biomeObj instanceof Object){
		add_line.biome_context=$.extend(true,{},default_rails,biomeObj);}//include defaults
	else{
		add_line.biome_context=(typeof(biomeObj)=='boolean'?biomeObj:false);}
	if(typeof(railObj)=='object' && railObj instanceof Object){
		add_line.rail_context=$.extend(true,{},default_rails,railObj);}//include defaults
	else{
		add_line.rail_context=(typeof(railObj)=='boolean'?railObj:false);}

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'add_line':add_line},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('pre_add_science',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	self.sciences.push(add_line);

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'add_line':add_line},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('add_science',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////

	return true;
};
kspSci.prototype.get_rail_rules=function(scienceIdent,planetType){
	var self=this,
		science_data={};//for a pass by reference

	if($.inArray(planetType,array_keys(self.ksp_uni_obj.body_types))===-1){return false;}//valid body type
	if(!self.is_science(scienceIdent,science_data)){return false;}//valid science id

	var rules={ //default values.  Should all be false!
		'biome':$.extend(true,{},self.ksp_uni_obj.body_rails,{}),//must break js 'pass by reference'
		'rail':$.extend(true,{},self.ksp_uni_obj.body_rails,{}) //must break js 'pass by reference'
	};

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'planetType':planetType,'scienceIdent':scienceIdent,'rules':rules,'science_data':science_data},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('pre_get_rail_rules',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////
	var boolean_to_context_obj=function(objIn,objOut){
		var output={};
		for(var itm in objOut){//objOut aka rules.biome looping through the defaults basically
			if(bdcheck_key(objOut,itm)){//key not a prototype!
				if(typeof(objIn)=='boolean'){//objIn aka science_data.biome_context -> might be boolean - just expand the boolean value into the object index one might be expecting
					output[itm]=(objIn?true:false);
//console.log(itm,'bool',objIn,"\n",'output['+itm+']',output[itm]);
				}else{
					if(bdcheck_key(objIn,itm)){//were we provided the value from the science rules
//console.log('objIn['+itm+'](sci rule)',objIn[itm]);
						output[itm]=(objIn[itm]?true:false);}
					else{
//console.log('objOut['+itm+'](default rule)',objOut[itm]);
						output[itm]=objOut[itm];}//use the default!
//console.log(itm,'obj!',"\n",'output['+itm+']',output[itm]);
				}
			}
		}
//console.log('context(science rules)',(typeof(objIn)=='boolean'?objIn:$.extend(true,{},objIn)),'rule(defaults)',(typeof(objOut)=='boolean'?objOut:$.extend(true,{},objOut)),'output',(typeof(output)=='boolean'?output:$.extend(true,{},output)));
		return output;
	};

	rules.rail=boolean_to_context_obj(science_data.rail_context,rules.rail);//expand the values
//console.log('==========================================');
	rules.biome=boolean_to_context_obj(science_data.biome_context,rules.biome);//expand the values

	//cross reference planetary abilities
	var planet=self.ksp_uni_obj.get_rail_rules(planetType);
/*console.log('planet',planet,"\n",
	'rules.rail',$.extend(true,{},rules.rail),"\n",
	'rules.biome',$.extend(true,{},rules.biome),"\n");*/
	for(var pr in planet.rails){
		if(bdcheck_key(planet.rails,pr)){
			var line_rule={'planet_rule':planet.rails[pr],'has_atmosphere':planet.has_atmosphere,'rail':rules.rail[pr],'biome':rules.biome[pr]},
				has_rail_exception=false,
				has_atm_exception=false;

			if(science_data.meta.ignore_planet_rail==planetType || science_data.meta.ignore_planet_rail==true){has_rail_exception=true;}
			else if(science_data.meta.ignore_planet_rail instanceof Array && $.inArray(planetType, science_data.meta.ignore_planet_rail)!==-1){has_rail_exception=true;}

			
			if(science_data.meta.require_atmosphere==pr || science_data.meta.require_atmosphere==true){has_atm_exception=true;}
			else if(science_data.meta.require_atmosphere instanceof Array && $.inArray(pr,science_data.meta.require_atmosphere)!==-1){has_atm_exception=true;}
			if(pr=='high_fly' || pr=='low_fly'){has_atm_exception=true;}//you can only fly if there is an atmosphere!


			if(line_rule.planet_rule===false && has_rail_exception===true){
				line_rule.planet_rule=true;
			}else if(line_rule.planet_rule===false){//no rail no experiment! unless there is an exception specifically listed (above)
				line_rule.rail=false;
				line_rule.biome=false;
			}
			
			//apply scientific dependancies!
			if(line_rule.rail===false){//no scientific rail... no biome!
				line_rule.biome=false;}
			if(line_rule.has_atmosphere===false && has_atm_exception){//atmosphere required!
//if(scienceIdent=='asteroidSample'){console.log('atm except',pr);}
				line_rule.rail=false;
				line_rule.biome=false;}
			///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
			var _args={'planetType':planetType,'scienceIdent':scienceIdent,'rules':rules,'science_data':science_data,'line_rule':line_rule},
				key_list=array_keys(_args),
				_vr='';
			self.i_callback('get_rail_rules_line',_args);
			for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
			///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////
			
			//transfer to the return output
			rules.rail[pr]=line_rule.rail;
			rules.biome[pr]=line_rule.biome;
		}
	}

	///////\\\\\\\\\\PLUGIN HOOK\\\\\\\\/////////
	var _args={'planetType':planetType,'scienceIdent':scienceIdent,'rules':rules,'science_data':science_data},
		key_list=array_keys(_args),
		_vr='';
	self.i_callback('get_rail_rules',_args);
	for(var kl=0;kl<key_list.length;kl++){_vr=key_list[kl];eval(_vr+' = _args.'+_vr+';');}delete key_list;delete _vr;//populate into this scope
	///////\\\\\\\\\\END PLUGIN HOOK\\\\\\\\/////////
console.log(scienceIdent,'rules: rail ',rules.rail,'biome',rules.biome);
	//return rules;
};
kspSci.prototype.is_science=function(ident,foundObjRef){//foundObjRef is a 'push up' pass by reference
	var self=this,
		result=$.inArray(ident,flatten_array(self.sciences,'ident'));
	if(result!==-1 && typeof(foundObjRef)=='object'){
		for(var s in self.sciences[result]){
			if(bdcheck_key(self.sciences[result],s)){
				foundObjRef[s]=self.sciences[result][s];}}}
	return (result!==-1?true:false);//if not-not found
};