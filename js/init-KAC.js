
	document.body.className=document.body.className+' hasJS';
	var loading_stages={
			'error':'Something seems to have gone wrong',
			'ready':'Please drop your career file into the box provided and have your ID ready for verification.',
			'have_file':'Don\'t mind the radioactive goo; it always does that when there is someone new.',
			'searching_file':'Here we are!<br>Oh, Hello Jeb!  Sorry about that last test flight...',
			'searching_science':'I always forget the parachutes; Fuel lines and struts are one thing... but parachutes!?<BR> Erm.....',
			'reviewing_science':'You seem to have recovered well though!<br>Let\'s see if we can make sense of this K-EB-A2.',
			'count_off_science':' Scientific Mission',
			'sorting_data':'Boss Kerman is going to fire someone. This data is a mess... ',
			'data_anomaly':'Oh there is some weird data... We\'ll rearrange the ',
			'sorting_table':'Okay everything is order. Here we go!',
			'done':'A Distinguished Career!'
		},
		page_data_schema={
			'science_max_total':0,
			'parsed_science':[],
			'parsed_kac':[],
			'scenarios':{},
			'scenarios_attribs':{},
			'sciences':{},
			'sciences_attribs':{}
		},
		surface_only_biome={'Kerbin':['KSC','Administration','AstronautComplex','FlagPole','LaunchPad','Crawlerway','VAB','VABPodMemorial','VABMainBuilding','VABSouthComplex','VABTanks','VABRoundTank','Runway','SPH','SPHMainBuilding','SPHWaterTower','SPHRoundTank','SPHTanks','TrackingStation','TrackingStationDishEast','TrackingStationDishSouth','TrackingStationDishNorth','TrackingStationHub','R&D','R&DCentralBuilding','R&DSmallLab','R&DMainBuilding','R&DObservatory','R&DCornerLab','R&DTanks','R&DWindTunnel','R&DSideLab','MissionControl']},
		biome_names={'Kerbin':{
			'AstronautComplex':'Astronaut Complex',
			'FlagPole':'Flag Pole',
			'LaunchPad':'Launch Pad',
			'VABPodMemorial':'VAB Pod Memorial',
			'VABMainBuilding':'VAB Main Building',
			'VABSouthComplex':'VAB South Complex',
			'VABTanks':'VAB Tanks',
			'VABRoundTank':'VAB Round Tank',
			'Runway':'Runway',
			'SPHMainBuilding':'SPH Main Building',
			'SPHWaterTower':'SPH Water Tower',
			'SPHRoundTank':'SPH Round Tank',
			'SPHTanks':'SPH Tanks',
			'TrackingStation':'Tracking Station',
			'TrackingStationDishEast':'Tracking Station Dish East',
			'TrackingStationDishSouth':'Tracking Station Dish South',
			'TrackingStationDishNorth':'Tracking Station Dish North',
			'TrackingStationHub':'Tracking Station Hub',
			'R&D':'R&D',
			'R&DCentralBuilding':'R&D Central Building',
			'R&DSmallLab':'R&D Small Lab',
			'R&DMainBuilding':'R&D Main Building',
			'R&DObservatory':'R&D Observatory',
			'R&DCornerLab':'R&D Corner Lab',
			'R&DTanks':'R&D Tanks',
			'R&DWindTunnel':'R&D Wind Tunnel',
			'R&DSideLab':'R&D Side Lab',
			'MissionControl':'Mission Control'
		}},
		processor_clock={'start':false,'end':false},
		body_busy_class='is-busy',
		page_data={},
		table_target_obj=$('.table-output')[0],
		tableObj=new bdTabler(),
		altTableObj=new bdTabler(),
		kspUniObj=new kspUniverse(),
		kspSciObj=new kspSci(kspUniObj),
		kspObj=new kspParser(kspUniObj,kspSciObj),
		base_fps=15,
		FPSObj=new fpsHandler(base_fps),//for the processing of data and green area messages
		FPSUIObj=new fpsHandler(5),//for the bordered area
		run_count=0,
		base_delay=4000,
		show_all_sci=true,
		show_all_bodies=true,
		show_roids=true,
		current_state_key='ready',
		drag_target = $('#holder'),
		msg_obj = $('#status'),
		asteroid_sample_ident='asteroidSample';

		//tableObj.plugin.table=function(packObj){/*$(packObj.table_dom_obj).attr('border',1);*/};
		page_data=$.extend(true,{},page_data_schema);//break pass by reference - populate defaults

	function get_sticky_table_obj(){
		if($('table',table_target_obj).first().length>0){
			return $('table',table_target_obj).first()[0];}
		return table_target_obj;
	}
	function do_sticky_table(){
		$(get_sticky_table_obj()).stickyTableHeaders('destroy');
		$(get_sticky_table_obj()).stickyTableHeaders();
	}
	$(window).on('resize',function(){
		$(get_sticky_table_obj()).stickyTableHeaders('toggleHeaders');
	});


//console.log(kspObj.attr_reader("\r\n\t\t\tid = crewReport@KerbinSrfLandedLaunchPad\r\n\t\t\ttitle = Crew Report from LaunchPad\r\n\t\t\tdsc = 1\r\n\t\t\tscv = 0\r\n\t\t\tsbv = 0.3\r\n\t\t\tsci = 1.5\r\n\t\t\tcap = 1.5",true));

	function update_status_msg(keyIn,extraStr){
		if(bdcheck_key(loading_stages,keyIn)){
			var prefix=(bdcheck_key(extraStr,'pre')?extraStr.pre:''),
				suffix=(bdcheck_key(extraStr,'end')?extraStr.end:'');
			$(msg_obj).html(prefix+loading_stages[keyIn]+suffix);
			if(keyIn=='error'){$(msg_obj).removeClass('success').addClass('fail');}
			else if($(msg_obj).hasClass('fail')){$(msg_obj).addClass('success').removeClass('fail');}
			current_state_key=keyIn;
		}
	}
	var ui_msg='',ui_lastcallback=function(){return false;},default_ui_msg=$('p',drag_target).html(),ui_no_anim_array=[default_ui_msg,'Output Below'];
	function _update_ui_msg(msg){
		ui_msg=msg;
		return function(){
			if(basic_check(msg)){
				var clock_str='',
					clock_diff=(processor_clock.end!==false?processor_clock.end:new Date()).getTime()-(processor_clock.start!==false?processor_clock.start:new Date()).getTime(),
					dot_num=1,
					do_max=7,
					dot_num_hide=do_max-dot_num,
					rchr='.',
					ctxt=$('p .dot-show',drag_target).text(),
					rep_count=str_rep_count(ctxt,rchr);

				clock_str='<BR>'+' Seconds: '+(clock_diff/1000).toFixed(3);
				if(rep_count<do_max){dot_num=rep_count+1;dot_num_hide=do_max-dot_num;}

				if(msg==default_ui_msg){dot_num=0;clock_str='';}
				else if($.inArray(msg,ui_no_anim_array)!==-1){dot_num=0;}
				$('p',drag_target).html(msg+(dot_num>0?'<br>'+'<span class="dot-show">'+str_rep(rchr,dot_num)+'</span>'+'<span class="dot-hide">'+str_rep(rchr,dot_num_hide)+'</span>':'')+clock_str);
			}
		}
	}
	function update_ui_msg(msg){
		FPSUIObj.remove_callback(ui_lastcallback);
		if($.inArray(msg,ui_no_anim_array)!==-1){(_update_ui_msg(msg)).apply(this,[]);}//call the function?
		else if(basic_check(msg)){
			ui_lastcallback=_update_ui_msg(msg);
			FPSUIObj.add_callback(ui_lastcallback);}
	}
	function declare_finished(){
		FPSObj.change_fps(base_fps);//reset
		tableObj.draw_table(table_target_obj);
		//try{
//console.log('altTableObj',altTableObj,'table_target_obj',table_target_obj);
			if(altTableObj.row_count>0 && altTableObj.col_count>0){
				altTableObj.draw_table(table_target_obj);}
		//}catch(err){}
		do_sticky_table();
		processor_clock.end=new Date();
		update_status_msg('done');
		update_ui_msg('Output Below');
		$('body').removeClass(body_busy_class);
		$('.file-browse,fieldset').css('display','');
	}
	function draw_science(){
		update_ui_msg('Generating Ouput');
		//clear the old
		$(table_target_obj).html('');
		var old_plugs=tableObj.plugin;
			tableObj=new bdTabler();
			tableObj.plugin=old_plugs;
		delete old_plugs;
		var old_plugs=altTableObj.plugin;
			altTableObj=new bdTabler();
			altTableObj.plugin=old_plugs;
		delete old_plugs;
		// \\clear the old

		//variable declarations
		var head_filler=[
				'',//body
				tableObj.reserve_merge_row(),//rail
				tableObj.reserve_merge_row()//biome
			],
			head_filler_class=[
				'head-body',//body
				'head-rail',//rail
				'head-biome'//biome
			],
			alt_sci_table_func=function(objIn,contextIn){
				if(contextIn='sci'){if(objIn.ident==asteroid_sample_ident){return false;}}
				return true;
			},
			mods_row=[]
			found_sci=[],
			found_c_body=[],
			celestial_body_arr=[],
			science_arr=[],
			alt_science_arr=[],
			planet_class=[
				'cell-body',
				'cell-rail',
				'cell-biome'
			],
			cell_css={
				'sci_zero':'sci-zero',
				'sci_grey':'sci-grey',
				'sci_empty':'sci-empty',
				'sci_rate_full':'sci-full',
				'sci_rate_high':'sci-green',
				'sci_rate_mid':'sci-yellow',
				'sci_rate_low':'sci-blue',
				'mod_row':'mod-plaent-row',
				'sci':'row-sci',
				'sci_head':'sci-header',
				'sci_cell':'cell-sci'
			},
			do_push_sci=function(valIn){
				if(!show_all_sci){
					if($.inArray(valIn,flatten_array(page_data.parsed_science,'science_ident'))!==-1){return true;}
					return false;
				}
				return true;
			},
			do_push_body=function(valIn){
				if(!show_all_bodies){
					if($.inArray(valIn,flatten_array(page_data.parsed_science,'planet_ident'))!==-1){return true;}
					return false;
				}
				return true;
			},
			do_push_alt_tbl=function(){//show roids if we have roids
				if(show_roids){
					if($.inArray(asteroid_sample_ident,flatten_array(page_data.parsed_science,'science_ident'))!==-1){return true;}
					return false;
				}
				return false;
			};
		//\\variable declarations
		for(var s=0;s<kspSciObj.default_sciences.length;s++){
			if(alt_sci_table_func(kspSciObj.default_sciences[s],'sci')){
				found_sci.push(kspSciObj.default_sciences[s].ident);
				if(do_push_sci(kspSciObj.default_sciences[s].ident)){science_arr.push(kspSciObj.default_sciences[s]);}
			}else{//asteroid sample!
				found_sci.push(kspSciObj.default_sciences[s].ident);
				if(do_push_alt_tbl(kspSciObj.default_sciences[s].ident)){alt_science_arr.push(kspSciObj.default_sciences[s]);}
			}
		}

		for(var s=0;s<kspSciObj.sciences.length;s++){//put mods last
			if(alt_sci_table_func(kspSciObj.sciences[s],'sci') && $.inArray(kspSciObj.sciences[s].ident,found_sci)===-1){
				found_sci.push(kspSciObj.sciences[s].ident);
				science_arr.push(kspSciObj.sciences[s]);
			}
		}
		delete found_sci;
		tableObj.add_line(head_filler.concat(flatten_array(science_arr,'name')),{'add_class_row':'sci-head','add_class':head_filler_class.concat(repeat_val_into_arr('sci-header',science_arr.length)),'row_type':'head'});//'row_type':'head',

		for(var s=0;s<kspUniObj.default_bodies.length;s++){
			var body_data={};
			if(kspUniObj.is_celestial_body(kspUniObj.default_bodies[s].ident,body_data) && $.inArray(kspUniObj.celestial_bodies[s].ident,found_c_body)===-1){
				found_c_body.push(kspUniObj.default_bodies[s].ident);
				if(do_push_body(kspUniObj.default_bodies[s].ident)){celestial_body_arr.push(kspUniObj.default_bodies[s].ident);}
				if(body_data.satellite_bodies.length>0 && kspUniObj.default_bodies[s].ident!='Sun'){//body_data.orbiting_body!==false
					for(var o=0;o<body_data.satellite_bodies.length;o++){
						var moon_data={};
						found_c_body.push(body_data.satellite_bodies[o]);
						kspUniObj.is_celestial_body(body_data.satellite_bodies[o],moon_data);
						if(do_push_body(moon_data.ident)){
							if(!do_push_body(kspUniObj.default_bodies[s].ident)){celestial_body_arr.push(kspUniObj.default_bodies[s].ident);}//if planet is not preset then lets add it if it previously failed
							celestial_body_arr.push(moon_data.ident);
						}
					}
				}
			}
		}

		var c_body_count=0;
		for(var s=0;s<kspUniObj.celestial_bodies.length;s++){//put mods last
			if($.inArray(kspUniObj.celestial_bodies[s].ident,found_c_body)===-1){//we don't care about moons since we can't extract that from the save game
				c_body_count++;
				if(c_body_count==1){//visual assistance.  Draw a hard line to show where the mod planets begin
					mods_row=['Mod-Planets'];
					var r_cnt=science_arr.length+head_filler.length-mods_row.length;//head_filler
					mods_row=mods_row.concat(repeat_val_into_arr(tableObj.reserve_merge_row(),r_cnt));
					delete r_cnt;}
				found_c_body.push(kspUniObj.celestial_bodies[s].ident);
				if(do_push_body(kspUniObj.celestial_bodies[s].ident)){celestial_body_arr.push(kspUniObj.celestial_bodies[s].ident);}
			}
		}
		delete found_c_body;
		//PARSE OUT THE DATA
		var build_td_sci_cell=function(pushUpObj,sciIdent,seekKey,userSci){
			var sci_cell={};

//console.log('userSci[seekKey]',userSci[seekKey],'seekKey',seekKey);
			sci_cell.cap=userSci[seekKey].cap.toFixed(1);
			sci_cell.sci=userSci[seekKey].sci.toFixed(1);
			sci_cell.sci_num=parseFloat(userSci[seekKey].sci);
			sci_cell.percent=userSci[seekKey].percent;
			sci_cell.percent_num=parseFloat(userSci[seekKey].percent);
			sci_cell.rail=userSci[seekKey].rail;
			var t_sci='',
				p_num=sci_cell.percent_num,
				t_class=cell_css.sci_cell;

			if(p_num>=100){t_sci='100%';}//100+
			else if(p_num<1){t_sci='0%';}//<0.999
			else{t_sci=sci_cell.percent+'%';}

			if(p_num>=1 && p_num<=33){t_class=t_class+' '+cell_css.sci_rate_low;}/*1%-33%*/
			else if(p_num>=33 && p_num<=66){t_class=t_class+' '+cell_css.sci_rate_mid;}/*33%-66%*/
			else if(p_num>=66 && p_num<100){t_class=t_class+' '+cell_css.sci_rate_high;}/*66%-<100%*/
			else if(p_num>=100){t_class=t_class+' '+cell_css.sci_rate_full;}/*>100%*/

			if(p_num>=1){
				pushUpObj[ (sciIdent) ].add_class=t_class;
				pushUpObj[ (sciIdent) ].html_out=t_sci+'<br>'+'<span class="sml-txt">'+sci_cell.sci+'/'+sci_cell.cap+'<span>';
			}else{
				pushUpObj[ (sciIdent) ].add_class=cell_css.sci_zero;
				pushUpObj[ (sciIdent) ].html_out='0';
			}

			pushUpObj[ (sciIdent) ].text=userSci[seekKey].text;
		};
		var build_td_sci_vals=function(bCount,planetObj,rail,biome,sciArr,userSci){
			var found_user_sci=userSci.concat([]),//break pass by reference
				row_meta={'add_class':[],'title_txt':[],'valid_sci':[],'rails_as_groups':[]},
				this_sci_row=[],
				this_sci_index={},
				planet_rails=kspUniObj.get_rail_rules(planetObj.body_type);
//if(planetObj.ident=='Kerbin'){console.log('planetObj',planetObj,'userSci',userSci,"\n\n",'sciArr',sciArr,"\n\n",'planet_rails',planet_rails,"\n\n",'rail',rail,"\n\n",'biome('+rail.ident+')',biome);}
			bCount;
			for(var sa=0;sa<sciArr.length;sa++){
//console.log('sciArr[sa].ident',sciArr[sa].ident, 'planetObj.body_type',planetObj.body_type);
				var sci_rails=kspSciObj.get_rail_rules(sciArr[sa].ident, planetObj.body_type),//,(sciArr[sa].ident=='surfaceSample' && planetObj.ident=='Moho'?true:false)
					sci_data_obj={},
					is_sci=kspSciObj.is_science(sciArr[sa].ident,sci_data_obj),
					seek_u_sci_key_ident=-1,
					seek_u_sci_key_group=-1,
					seek_u_sci_key=-1,
					sci_cell={},
					rails_as_groups=false,
					valid_sci={'rail':false,'biome':false};//we have the rail biome!

				this_sci_index[ (sciArr[sa].ident) ]={'html_out':'','add_class':'','text':'','valid_sci':{}};//default

				if(rail.ident===false){//expansion rail?
					if(sci_data_obj.meta.rails_as_groups){rails_as_groups=true;}//weird merge for as groups
					var grouped_biome_context=object_group_val(sci_rails.biome_context);
					if(inArray_multi_seek([sciArr[sa].ident,rail.rail], [flatten_array(page_data.parsed_science,'science_ident'),flatten_array(page_data.parsed_science,'rail')])!==-1){//if this experiment is found without a planet filter
						valid_sci.rail=true;}
					if(valid_sci.rail){
						if((grouped_biome_context.length==1 && grouped_biome_context[0]===true) || (grouped_biome_context.length>1 && $.inArray(true,grouped_biome_context)!==-1)){//if the experiment allows all biomes or some biomes
							valid_sci.biome=true;}}
//if(planetObj.ident=='Mun' && sciArr[sa].ident=='temperatureScan' && (biome=='HighlandCraters' || biome=='NorthernBasin')){console.log('biome',biome,'rail',rail,'sci_rails',sci_rails,'grouped_biome_context',grouped_biome_context,'$.inArray(true,grouped_biome_context)',$.inArray(true,grouped_biome_context),"\n",'---valid_sci',valid_sci);}
					delete grouped_biome_context;
				}else{//not expansion rail?
					if(sci_data_obj.meta.rails_as_groups){rails_as_groups=true;}//weird merge for as groups
					if(planet_rails.rails[rail.key]){
						if(sci_rails.rail_context[rail.key]){valid_sci.rail=true;}
						if(sci_rails.biome_context[rail.key]){
//if(planetObj.ident=='Kerbin' && sciArr[sa].ident=='crewReport' && biome=='Grasslands' && rail.key=='surface'){console.log('rail.key BIOME!',sci_rails.biome_context[rail.key]);}
							valid_sci.biome=true;}
					}
				}

				//seek_u_sci_key_biome=inArray_multi_seek([sciArr[sa].ident,rail.ident,biome], [flatten_array(userSci,'science_ident'),flatten_array(userSci,'rail'),flatten_array(userSci,'biome_ident')]);//,(planetObj.ident=='Kerbin'?true:false)
				if(rail.ident===false){
					var force_mode=(bCount==0 && valid_sci.biome===false && biome.length>0?true:false);
					if(biome===false || valid_sci.biome===false){
						seek_u_sci_key_ident=inArray_multi_seek([
								sciArr[sa].ident,
								rail.rail
							],
							[
								flatten_array(userSci,'science_ident'),
								flatten_array(userSci,'rail')
						]);//,(planetObj.ident=='Kerbin'?true:false)
					}else{
						seek_u_sci_key_ident=inArray_multi_seek([
								sciArr[sa].ident,
								rail.rail,
								false
							],
							[
								flatten_array(userSci,'science_ident'),
								flatten_array(userSci,'rail'),
								flatten_array(userSci,'biome_ident')
						]);//,(planetObj.ident=='Kerbin'?true:false)
					}
					seek_u_sci_key_ident=inArray_multi_seek([
							sciArr[sa].ident,
							rail.rail,
							(force_mode?false:biome)//if its the first row of the rail; there is no indication of it using biomes, and the parent process things we should be considering biomes (its a string !==false) then look for a false biome... otherwise always allow it to fail
						],
						[
							flatten_array(userSci,'science_ident'),
							flatten_array(userSci,'rail'),
							flatten_array(userSci,'biome_ident')
					]);//,(planetObj.ident=='Kerbin'?true:false)
					//valid_sci.rail=(force_mode && seek_u_sci_key_ident===-1?false:valid_sci.rail);//forcing a cell merge!

//if(planetObj.ident=='Mun' && sciArr[sa].ident=='temperatureScan' && (biome=='HighlandCraters' || biome=='NorthernBasin')){console.log('('+bCount+'==0 && valid_sci.biome===false && biome.length>0?false:biome)',(bCount==0 && valid_sci.biome===false && biome.length>0?false:biome));}
				}else{
					if(biome===false || valid_sci.biome===false){
						seek_u_sci_key_ident=inArray_multi_seek([sciArr[sa].ident,rail.ident], [flatten_array(userSci,'science_ident'),flatten_array(userSci,'rail')]);//,(planetObj.ident=='Kerbin'?true:false)
						seek_u_sci_key_group=inArray_multi_seek([sciArr[sa].ident,rail.group_ident], [flatten_array(userSci,'science_ident'),flatten_array(userSci,'rail')]);//,(planetObj.ident=='Kerbin'?true:false)
					}else{
						seek_u_sci_key_ident=inArray_multi_seek([sciArr[sa].ident,rail.ident,biome], [flatten_array(userSci,'science_ident'),flatten_array(userSci,'rail'),flatten_array(userSci,'biome_ident')]);//,(planetObj.ident=='Kerbin'?true:false)
						seek_u_sci_key_group=inArray_multi_seek([sciArr[sa].ident,rail.group_ident,biome], [flatten_array(userSci,'science_ident'),flatten_array(userSci,'rail'),flatten_array(userSci,'biome_ident')]);//,(planetObj.ident=='Kerbin'?true:false)
					}
				}
				seek_u_sci_key=(seek_u_sci_key_ident===-1?seek_u_sci_key_group:seek_u_sci_key_ident);
//if(planetObj.ident=='Kerbin' && sciArr[sa].ident=='crewReport' && biome=='Grasslands' && rail.key=='surface'){console.log(sciArr[sa].ident,'sci_rails',$.extend(true,{},sci_rails),"\n",'is_sci',is_sci,"\n",'sci_data_obj',$.extend(true,{},sci_data_obj),"\n",'rail.ident',rail.ident,"\n",'seek_u_sci_key ',seek_u_sci_key,"\n",'userSci[seek_u_sci_key]',(seek_u_sci_key>=0?userSci[seek_u_sci_key]:false));}
//if(planetObj.ident=='Mun' && sciArr[sa].ident=='temperatureScan' && (biome=='HighlandCraters' || biome=='NorthernBasin')){if(rail.ident===false){console.log(sciArr[sa].ident,'sci_rails',$.extend(true,{},sci_rails),"\n",'is_sci',is_sci,"\n",'sci_data_obj',$.extend(true,{},sci_data_obj),"\n",'rail.ident',rail.ident,'rail.rail',rail.rail,"\n",'seek_u_sci_key ',seek_u_sci_key,"\n",'userSci[seek_u_sci_key]',(seek_u_sci_key>=0?userSci[seek_u_sci_key]:false));}}
				if(planetObj.ident=='Kerbin' && sci_data_obj.ident=='recovery'){//temp hack!
					if(rail.key=='splash' || rail.key=='surface'){
						valid_sci.rail=false;}}
				//else if(planetObj.ident=='Kerbin' && rail.key=='splash' && biome!==false && $.inArray(biome,surface_only_biome['Kerbin'])!==-1){//temp hack!
				else if(planetObj.ident=='Kerbin' && rail.key!='surface' && biome!==false && $.inArray(biome,surface_only_biome['Kerbin'])!==-1){//Do nothing if its not surface and a KSC Biome
					valid_sci.biome=false;
					valid_sci.rail=false;}
				//if(bdcheck_key(planet_rails.rails,rail.key)){planet_rails.rails[rail.key];}

//if(planetObj.ident=='Kerbin' && sciArr[sa].ident=='crewReport' && biome=='Grasslands' && rail.key=='surface'){console.log('=============valid_sci:',valid_sci);}
//if(planetObj.ident=='Mun' && sciArr[sa].ident=='temperatureScan' && (biome=='HighlandCraters' || biome=='NorthernBasin')){if(rail.ident===false){console.log('=============valid_sci:',valid_sci);}}
				if(valid_sci.rail===true){
					if(valid_sci.rail===true && valid_sci.biome===false && biome.length>0 && seek_u_sci_key!==-1){//ignore biome but rail is there... this planet has rails! found experiment!
//if(planetObj.ident=='Kerbin' && sciArr[sa].ident=='crewReport' && biome=='Grasslands' && rail.key=='surface'){console.log('==============================valid_sci.rail===true, valid_sci.biome===false TRUE!========================',"\n",bCount);}
						if(bCount==0){
							build_td_sci_cell(this_sci_index,sciArr[sa].ident,seek_u_sci_key,userSci);
						}else{
							this_sci_index[ (sciArr[sa].ident) ].html_out='';
							this_sci_index[ (sciArr[sa].ident) ].add_class='';
						}
					}else if(seek_u_sci_key!==-1){//valid rail & biome
//if(planetObj.ident=='Kerbin' && sciArr[sa].ident=='crewReport' && biome=='Grasslands' && rail.key=='surface'){console.log('==============================seek_u_sci_key!==-1 TRUE!========================',"\n",bCount,(seek_u_sci_key>=0?userSci[seek_u_sci_key]:false));}
						build_td_sci_cell(this_sci_index,sciArr[sa].ident,seek_u_sci_key,userSci);
					}else{//no user data!
						this_sci_index[ (sciArr[sa].ident) ].add_class=cell_css.sci_zero;
						this_sci_index[ (sciArr[sa].ident) ].html_out='0';
					}
//planet has biomes but not this experiment
//planet has biomes normally
				}else{
					if(bCount!=0){
					}else{//bcount is 0!
						this_sci_index[ (sciArr[sa].ident) ].add_class=cell_css.sci_cell+' '+cell_css.sci_grey;
						this_sci_index[ (sciArr[sa].ident) ].html_out='';
					}
				}
				this_sci_index[ (sciArr[sa].ident) ].valid_sci=$.extend(true,{},valid_sci);//break pass by reference
				this_sci_index[ (sciArr[sa].ident) ].rails_as_groups=rails_as_groups;

//console.log(sa,sciArr[sa].ident,'sci_rails',sci_rails,'seek_u_sci_key',seek_u_sci_key);
				//this_sci_row.push();
				sciArr[sa];
			}
			if(biome!==false){
			}
			/*
			for(var us=0;us<userSci.length;us++){
				userSci[us];
			}*/
			for(var sa=0;sa<sciArr.length;sa++){//prase out
//console.log('this_sci_index[ (sciArr[sa].ident) ]',this_sci_index[ (sciArr[sa].ident) ],'this_sci_index[ (sciArr[sa].ident) ].html_out',this_sci_index[ (sciArr[sa].ident) ].html_out);

				this_sci_row.push((basic_check(this_sci_index[ (sciArr[sa].ident) ].html_out)?this_sci_index[ (sciArr[sa].ident) ].html_out:''));
				row_meta.add_class.push((basic_check(this_sci_index[ (sciArr[sa].ident) ].add_class)?this_sci_index[ (sciArr[sa].ident) ].add_class:''));
				row_meta.title_txt.push((basic_check(this_sci_index[ (sciArr[sa].ident) ].text)?this_sci_index[ (sciArr[sa].ident) ].text:''));
				row_meta.valid_sci.push(this_sci_index[ (sciArr[sa].ident) ].valid_sci);
				row_meta.rails_as_groups.push(this_sci_index[ (sciArr[sa].ident) ].rails_as_groups);
			}

			return {'row':this_sci_row,'meta':row_meta};
		};
		var build_td_vals=function(planetObj,railArr,biomeArr,sciArr,userSci){
//if(planetObj.name=='Kerbin'){console.log('=====================================',biomeArr);}
//console.log('railArr',railArr);
			var output=[],
				found_user_sci=userSci.concat([]),//break pass by reference
				meta_out={'add_class':planet_class.concat(repeat_val_into_arr(cell_css.sci_cell,sciArr.length))},
				add_body_name=false,
				build_count=0;
			for(var r=0;r<railArr.length;r++){
				var this_line=[],
					new_ouput=[],
					this_rail={
						'rail':railArr[r],
						'ident':false,
						'group_ident':false,
						'key':false,
						'label':''
					};
				build_count=0;//row count per rail
				if(add_body_name===false){this_line.push(planetObj.name);add_body_name=true;}
				else{this_line.push(tableObj.reserve_merge_col());}//reserve empty going forward

				if(bdcheck_key(kspUniObj.body_rails,this_rail.rail)){
					this_rail.key=this_rail.rail;
					this_rail.group_ident=kspUniObj.body_rails[this_rail.rail].group_ident;
					this_rail.ident=kspUniObj.body_rails[this_rail.rail].ident;
					this_rail.label=kspUniObj.body_rails[this_rail.rail].title;}
				else{
					this_rail.label=this_rail.rail;}

				if(biomeArr.length>0){
					for(var b=0;b<biomeArr.length;b++){
						if(planetObj.ident=='Kerbin' && this_rail.rail!='surface' && biomeArr[b]!==false && $.inArray(biomeArr[b],surface_only_biome['Kerbin'])!==-1){continue;}
						if(b==0){
							this_line.push(this_rail.label);//first rail label
							this_line.push(biomeArr[b]);}//first biome rail
						else{
							this_line=[tableObj.reserve_merge_col(),tableObj.reserve_merge_col(),biomeArr[b]];}//planet name,rail,biome

						var arr_fill=repeat_val_into_arr('',this_line.length),
							sci_arr=build_td_sci_vals(build_count,planetObj,this_rail,biomeArr[b],sciArr,found_user_sci);
						sci_arr.meta.title_txt=arr_fill.concat(sci_arr.meta.title_txt);
						sci_arr.meta.add_class=arr_fill.concat(sci_arr.meta.add_class);
						sci_arr.meta.valid_sci=arr_fill.concat(sci_arr.meta.valid_sci);
						sci_arr.meta.rails_as_groups=arr_fill.concat(sci_arr.meta.rails_as_groups);
						this_line=this_line.concat(sci_arr.row);

						//biome_names
						if(bdcheck_key(biome_names,planetObj.name)){
							if(bdcheck_key(biome_names[planetObj.name],this_line[2])){
								this_line[2]=biome_names[planetObj.name][this_line[2]];}}
						//\\biome_names

						new_ouput={'row':this_line,'meta':$.extend(true,{},merge_array_obj_val_str(meta_out,sci_arr.meta))};
						new_ouput=new_line_colspan(build_count,planetObj,biomeArr[b],output,new_ouput);
						output.push(new_ouput);
						build_count++;
					}
				}else{
					this_line.push(this_rail.label);//output rail
					this_line.push('');//biome

					var arr_fill=repeat_val_into_arr('',this_line.length),
						sci_arr=build_td_sci_vals(build_count,planetObj,this_rail,false,sciArr,found_user_sci);
					sci_arr.meta.title_txt=arr_fill.concat(sci_arr.meta.title_txt);
					sci_arr.meta.add_class=arr_fill.concat(sci_arr.meta.add_class);
					sci_arr.meta.valid_sci=arr_fill.concat(sci_arr.meta.valid_sci);
					sci_arr.meta.rails_as_groups=arr_fill.concat(sci_arr.meta.rails_as_groups);
					this_line=this_line.concat(sci_arr.row);
					new_ouput={'row':this_line,'meta':$.extend(true,{},merge_array_obj_val_str(meta_out,sci_arr.meta))};
					new_ouput=new_line_colspan(build_count,planetObj,false,output,new_ouput);
					output.push(new_ouput);
					build_count++;
				}
				//end of rail
				if(r!=0){//console.log('output['+output.length+'-'+build_count+']',output[output.length-build_count]);
					var last_row=output[output.length-build_count];
					for(var lr=0;lr<last_row.row.length;lr++){
						//if(lr>=3 && tableObj.reserve_merge_col()===last_row.row[lr]){
						if(lr>=3 && last_row.row[lr].constructor==bdTablerSpan){
//console.log(lr,'output[output.length-build_count].row',output[output.length-build_count].row);
							output[output.length-build_count].row[lr]='';}}
					delete last_row;
				}
			}

//console.log('output',$.extend(true,{},output));
			for(var o=0;o<output.length;o++){
				delete output[o].meta.valid_sci;//its annoying to have this data in debug
				delete output[o].meta.rails_as_groups;//its annoying to have this data in debug
			}
			return output;
		};
		var new_line_colspan=function(bCount,planetObj,biome,allOutput,newRow){
//console.log('new_line_colspan',newRow)
			var spanned_row={};
			for(var vi=0;vi<newRow.meta.valid_sci.length;vi++){
				newRow.meta.valid_sci[vi];
				var group_valid_sci=object_group_val(newRow.meta.valid_sci[vi]);
				if(group_valid_sci.length==1 && group_valid_sci[0]===false && allOutput.length>=1){//all rails false!
					var prev_key=allOutput.length-1,//this key because we haven't added newRow yet
						prev_group_valid_sci=object_group_val(allOutput[prev_key].meta.valid_sci[vi]);
					if(prev_group_valid_sci.length==1 && prev_group_valid_sci[0]===false){
						allOutput[prev_key].meta.add_class[vi]=cell_css.sci_cell+' '+cell_css.sci_grey;
						newRow.row[vi]=tableObj.reserve_merge_col();
					}
				}else if(newRow.meta.valid_sci[vi].rail===true && newRow.meta.valid_sci[vi].biome===false && biome.length>0 && allOutput.length>=1 && bCount>0){
					//if(bCount==0){}//rail entry count
					newRow.row[vi]=tableObj.reserve_merge_col();
				}
			}
			/*
				delete newRow.meta.valid_sci;//its annoying to have this data in debug
				delete newRow.meta.rails_as_groups;//its annoying to have this data in debug
			*/
//console.log('new_line_colspan newRow',newRow)
			return newRow;
		};
		var flat_rail_groups=flatten_object(kspUniObj.body_rails,'group_ident'),
			flat_rail_idents=flatten_object(kspUniObj.body_rails,'ident');
//console.log('flat_rail_idents',flat_rail_idents,'flat_rail_groups',flat_rail_groups);
//var test_key=111;//if(b>test_key
		var planet_inc=0;
		var planet_table_line=function(){

			//for(var planet_inc=0;planet_inc<celestial_body_arr.length;planet_inc++){
				var planet_data={};
				kspUniObj.is_celestial_body(celestial_body_arr[planet_inc],planet_data);
				var rail_rules=kspUniObj.get_rail_rules(planet_data.body_type),
					t_rail=[];
				for(var r in rail_rules.rails){
					if(bdcheck_key(rail_rules.rails,r)){
						if(rail_rules.rails[r]===true){
							t_rail.push(r);}}}

				var user_sci=array_object_search(page_data.parsed_science,'planet_ident',planet_data.ident),extra_rail=[];
				for(var us=0;us<user_sci.length;us++){
					if(inObject(user_sci[us].rail,flat_rail_groups)===-1 && inObject(user_sci[us].rail,flat_rail_idents)===-1){
						extra_rail.push(user_sci[us].rail);
					}
				}
//if(b!=0 && planet_inc<=test_key){continue;}
//console.log('========================='+planet_data.name+'=========================');
				if($.inArray(planet_data.ident,flatten_array(kspUniObj.default_bodies,'ident'))===-1 && mods_row.length>0){
					tableObj.add_line(mods_row,{'add_class_row':cell_css.mod_row});
					mods_row=[];//unset
				}
				var new_arr=build_td_vals(planet_data,t_rail.concat(extra_rail),planet_data.biomes,science_arr,user_sci);
				if(new_arr.length>0){
					for(var m=0;m<new_arr.length;m++){
//console.log('new_arr[m].row',new_arr[m].row);
						tableObj.add_line(new_arr[m].row, new_arr[m].meta);
					}
				}

//if(planet_inc>test_key){break;}
				//tableObj.add_line(['','',''],{'add_class':planet_class.concat(repeat_val_into_arr(cell_css.sci_cell,science_arr.length))});
				planet_inc++;
				if(planet_inc>=celestial_body_arr.length){
//console.log('page_data',page_data,'tableObj',tableObj);
//declare_finished();return;
					if(alt_science_arr.length==0){
						declare_finished();}
					else{
						FPSObj.add_once_callback(asteroid_table_line);}
				}else{
					FPSObj.add_once_callback(planet_table_line);
				}
			//}//end for
			//tableObj.add_line(['','',''],{'add_class_row':cell_css.sci,'add_class':head_filler_class.concat(repeat_val_into_arr(cell_css.sci_head,celestial_body_arr.length))});//'row_type':'head',

		};
		var alt_science_inc=0,
			alt_table_data={'cols_info':[],'roid_list':[]};
		var asteroid_table_line=function(){
			if(alt_science_inc==0){
				var body_row=[''],
					rail_row=[''],
					biome_row=[''],
					alt_head_filler_class=[
						'head-body',//asteroid
					];

				for(var b=0;b<celestial_body_arr.length;b++){
					var planet_data={};
					kspUniObj.is_celestial_body(celestial_body_arr[b],planet_data);
					var sci_rails=kspSciObj.get_rail_rules(asteroid_sample_ident, planet_data.body_type);
					var rail_arr_keys=[],
						context_data={
							'body_ident':false,
							'rail':false,
							'biome':false
						},
						push_context_data=function(){
							alt_table_data.cols_info.push($.extend(true,{},context_data));
						},
						new_rails=0,
						new_biomes=0,
						grouped_rail_context=object_group_val(sci_rails.rail_context),
						grouped_biome_context=object_group_val(sci_rails.biome_context);
					for(var k in kspUniObj.body_rails_schema){if(bdcheck_key(kspUniObj.body_rails_schema,k)){rail_arr_keys.push(k);}}//rail_arr_keys IN ORDER!
					var rail_span=0,
						biome_span=0;
					context_data.body_ident=celestial_body_arr[b];//push_context_data();
//console.log('planet_data',planet_data,"\n\n",'sci_rails',$.extend(true,{},sci_rails),"\n\n",'rail_arr_keys: ',rail_arr_keys);

					if((grouped_rail_context[0]===false && grouped_rail_context.length==1)){
						//do nothing
					}else{
						for(var r=0;r<rail_arr_keys.length;r++){
							rail_span=0;
							context_data.rail=rail_arr_keys[r];//push_context_data();
							if(sci_rails.rail_context[rail_arr_keys[r]]){
								var allow_biome=true;
								if((grouped_biome_context[0]===false && grouped_biome_context.length==1) || planet_data.biomes.length==0){//no biome rail or no biomes
									allow_biome=false;}
								if(!sci_rails.biome_context[rail_arr_keys[r]]){allow_biome=false;}
								if(!allow_biome){
									biome_row.push('');
									context_data.biome=false;push_context_data();
									new_biomes++;
								}else{
									for(var b=0;b<planet_data.biomes.length;b++){
										//if(planet_data.ident=='Kerbin' && rail_arr_keys[r]=='splash' && $.inArray(planet_data.biomes[b],surface_only_biome['Kerbin'])!==-1){//temp hack!
										if(planet_data.ident=='Kerbin' && rail_arr_keys[r]!='surface' && $.inArray(planet_data.biomes[b],surface_only_biome['Kerbin'])!==-1){//Do nothing if its not surface and a KSC Biome
										}else{
											var biome_txt=planet_data.biomes[b];
											//biome_names
											if(bdcheck_key(biome_names,planet_data.ident)){
												if(bdcheck_key(biome_names[planet_data.ident],biome_txt)){
													biome_txt=biome_names[planet_data.ident][biome_txt];}}
											//\\biome_names
											biome_row.push('<div class="rotator">'+biome_txt+'</div>');
											context_data.biome=planet_data.biomes[b];push_context_data();
											new_biomes++;
											rail_span++;
										}
									}
								}
								rail_row.push(kspUniObj.body_rails[rail_arr_keys[r]].title);
								new_rails++;
								if(rail_span>1){
									rail_span=rail_span-1;
									rail_row=rail_row.concat(repeat_val_into_arr(altTableObj.reserve_merge_row(),rail_span));}
								if(biome_span>0){
									biome_row=biome_row.concat(repeat_val_into_arr(altTableObj.reserve_merge_row(),biome_span));}
							}
						}
					}
					body_row.push(planet_data.name);
					if(new_rails>1 || new_biomes>1){
						body_row=body_row.concat(repeat_val_into_arr(altTableObj.reserve_merge_row(),Math.max(new_rails,new_biomes)-1));}
				}
//console.log('body_row',body_row,"\n\n",'rail_row',rail_row,"\n\n",'biome_row',biome_row,"\n\n",{'add_class_row':'sci-head','add_class':alt_head_filler_class.concat(repeat_val_into_arr('sci-header',body_row.length)),'row_type':'head'});
//console.log('body len: ',body_row.length,'rail_row len: ',rail_row.length,'biome_row len: ',biome_row.length);
				altTableObj.add_line(body_row,{'add_class_row':'sci-head','add_class':alt_head_filler_class.concat(repeat_val_into_arr('body-header',body_row.length-1)),'row_type':'head'});
				altTableObj.add_line(rail_row,{'add_class_row':'sci-head','add_class':alt_head_filler_class.concat(repeat_val_into_arr('rail-header',rail_row.length-1)),'row_type':'head'});
				altTableObj.add_line(biome_row,{'add_class_row':'sci-head','add_class':alt_head_filler_class.concat(repeat_val_into_arr('biome-header',biome_row.length-1)),'row_type':'head'});
				alt_table_data.row_count=body_row.length;

//altTableObj.add_line(['test'].concat(repeat_val_into_arr(altTableObj.reserve_merge_row(),Math.max(body_row.length,rail_row.length,biome_row.length)-1)),{'add_class_row':'sci-head','row_type':'head'});
			}
//return declare_finished();

			//for(var alt_science_inc=0;alt_science_inc<alt_science_arr.length;alt_science_inc++){//for reference.  This is whats happening inside the FPS loop
				var alt_sci_list=array_object_search(page_data.parsed_science,'science_ident',alt_science_arr[alt_science_inc].ident),
					roid_ids=[];
//console.log('alt_science_arr['+alt_science_inc+']',alt_science_arr[alt_science_inc],"\n\n",'alt_sci_list: ',alt_sci_list,"\n\n",'alt_science_arr['+alt_science_inc+']: ',alt_science_arr[alt_science_inc],'== asteroid_sample_ident: ',asteroid_sample_ident);
				if(alt_science_arr[alt_science_inc].ident==asteroid_sample_ident){
					for(var rt=0;rt<alt_sci_list.length;rt++){
						if(alt_sci_list[rt].meta.asteroid_ident!==false && $.inArray(alt_sci_list[rt].meta.asteroid_ident,roid_ids)===-1){
							alt_table_data.roid_list.push(alt_sci_list[rt].meta.asteroid_ident);
							roid_ids.push(alt_sci_list[rt].meta.asteroid_ident);
						}
					}
				}

				for(var al=0;al<alt_table_data.roid_list.length;al++){
					var current_roid=alt_table_data.roid_list[al],
						_tmp=[current_roid],
						out_data=[{'row':current_roid,'meta':altTableObj.cell_schema}];//{'row':current_roid,'meta':altTableObj.cell_schema}
					for(var i=0;i<alt_table_data.cols_info.length;i++){
						var planet_data={};
						kspUniObj.is_celestial_body(alt_table_data.cols_info[i].body_ident,planet_data);
						var sci_data_obj={},
							is_sci=kspSciObj.is_science(alt_science_arr[alt_science_inc].ident,sci_data_obj),
							extra_rail=[],
							t_rail=[];
//console.log('===============FIX USER SCI ARRAY - INCLUDE FLEXIBILITY TO EXPAND OTHER EXPERIMENTS IN THE FUTURE===============');
						if(alt_science_arr[alt_science_inc].ident==asteroid_sample_ident){
							var user_sci=array_object_search(array_object_search(alt_sci_list,{'meta':{'asteroid_ident':current_roid}},current_roid),'planet_ident',planet_data.ident);
						}else{
							var user_sci=alt_sci_list;}

						//var new_arr=build_td_vals(planet_data,t_rail.concat(extra_rail),planet_data.biomes,science_arr,user_sci);
						var new_arr=build_td_vals(planet_data, [alt_table_data.cols_info[i].rail], (alt_table_data.cols_info[i].biome!==false?[alt_table_data.cols_info[i].biome]:[]), alt_science_arr, user_sci);
						if(new_arr.length>0){
							for(var m=0;m<new_arr.length;m++){
								var new_row=new_arr[m].row.slice(3),
									new_meta=new_arr[m].meta,
									display_roid_name=current_roid;
								for(var nm in new_meta){if(bdcheck_key(new_meta,nm) && new_meta[nm] instanceof Array){new_meta[nm]=new_meta[nm].slice(3);}}
								out_data.push({'row':new_row[0],'meta':new_meta});
							}
						}else{
							out_data.push({'row':0, 'meta':altTableObj.cell_schema});}
					}
					var out_line=[],
						out_meta={};
					for(var o=0;o<out_data.length;o++){
						out_line.push(out_data[o].row);
						for(var cs in altTableObj.cell_schema){
							if(bdcheck_key(altTableObj.cell_schema,cs)){
								if(typeof(out_meta[cs])=='undefined'){out_meta[cs]=[];}
								out_meta[cs].push((bdcheck_key(out_data[o].meta,cs)?out_data[o].meta[cs][0]:''));}}
					}
					altTableObj.add_line(out_line,out_meta);
				}
/*
				if(1==2){//old reference output
					var planet_data={};
					kspUniObj.is_celestial_body(celestial_body_arr[alt_science_inc],planet_data);
					var rail_rules=kspUniObj.get_rail_rules(planet_data.body_type),
						t_rail=[];
					for(var r in rail_rules.rails){
						if(bdcheck_key(rail_rules.rails,r)){
							if(rail_rules.rails[r]===true){
								t_rail.push(r);}}}

					var user_sci=array_object_search(page_data.parsed_science,'planet_ident',planet_data.ident),extra_rail=[];
					for(var us=0;us<user_sci.length;us++){
						if(inObject(user_sci[us].rail,flat_rail_groups)===-1 && inObject(user_sci[us].rail,flat_rail_idents)===-1){
							extra_rail.push(user_sci[us].rail);
						}
					}
					if($.inArray(planet_data.ident,flatten_array(kspUniObj.default_bodies,'ident'))===-1 && mods_row.length>0){
						altTableObj.add_line(mods_row,{'add_class_row':cell_css.mod_row});
						mods_row=[];//unset
					}
					var new_arr=build_td_vals(planet_data,t_rail.concat(extra_rail),planet_data.biomes,science_arr,user_sci);
					if(new_arr.length>0){
						for(var m=0;m<new_arr.length;m++){
							altTableObj.add_line(new_arr[m].row, new_arr[m].meta);
						}
					}
				}
*/
				alt_science_inc++;
				if(alt_science_inc>=alt_science_arr.length){
					declare_finished();}
				else{
					FPSObj.add_once_callback(asteroid_table_line);}

		};
		FPSObj.change_fps(40);//lets speed it up!
		FPSObj.add_once_callback(planet_table_line);
		/*
	console.log('page_data',page_data,'tableObj',tableObj);
			declare_finished();*/
	}

	function on_captured_science(dataSetIn){
		var added_ident={
				'biome':[],
				'sci':[],
				'body':[]
			},
			update_found_counts=function(sciLen,bodyLen,biomeLen){
				var fun_str='',
					pre_fun_str_un=' Unknown ',
					pre_fun_str='';

				if(sciLen>0){
					fun_str='Rules of Science';
					pre_fun_str=pre_fun_str+sciLen.toString()+pre_fun_str_un+'Science Mission'+(sciLen!=1?'s':'')+"<BR>\n";}
				if(biomeLen>0){
					fun_str='Planetary Geography';
					pre_fun_str=pre_fun_str+biomeLen.toString()+pre_fun_str_un+'Planetary '+(biomeLen!=1?'Geographies':'Geography')+"<BR>\n";}
				if(bodyLen>0){
					fun_str='Universe';
					pre_fun_str=pre_fun_str+bodyLen.toString()+pre_fun_str_un+'Astronomical Object'+(bodyLen!=1?'s':'')+"<BR>\n";}
				if(sciLen>0 || biomeLen>0 || bodyLen>0){
					update_status_msg('data_anomaly',{'pre':'<span class="sml-txt">'+pre_fun_str+'</span>','end':fun_str});}
			};
		var report_iter_kac=function(){
			update_status_msg('sorting_data');
			$('#file-output').val('');
			var nl="\r\n",
				el="<ENDLINE>",
				sep='|',
				quick_escape=function(str){return str.replace(/\|/gi,'-');},
				fileoutput= 'AlarmsFileVersion|3|<ENDLINE>'+nl+
							'VesselID|Name|Notes|AlarmTime.UT|AlarmMarginSecs|Type|Enabled|HaltWarp|PauseGame|ActionedAt|Manuever|Xfer|Target|Options|'+el+nl;
			for(var s=0;s<page_data.parsed_kac.length;s++){
				fileoutput= fileoutput+
							quick_escape(page_data.parsed_kac[s].VesselID) +sep+
							quick_escape(page_data.parsed_kac[s].Name) +sep+
							quick_escape(page_data.parsed_kac[s].NotesStorage) +sep+
							quick_escape(page_data.parsed_kac[s].AlarmTimeStorage) +sep+
							quick_escape(page_data.parsed_kac[s].AlarmMarginSecs) +sep+
							quick_escape(page_data.parsed_kac[s].TypeOfAlarm) +sep+
							quick_escape(page_data.parsed_kac[s].Enabled) +sep+
							(page_data.parsed_kac[s].AlarmAction=='KillWarp'?'True':'False') +sep+//HaltWarp
							(page_data.parsed_kac[s].AlarmAction=='PauseGame'?'True':'False') +sep+//PauseGame
							'0' +sep+//ActionedAt
							page_data.parsed_kac[s].ManNodesStorage +sep+
							'' +sep+
							'' +sep+
							'' +sep+
							el+nl;

/*
Xfer
Target
Options

9e655c97-829c-439f-8274-06f321c5e261	//VesselID
New Science	//Name
Time to pay attention to\r\n    New Science\r\nNearing Maneuver Node	//Notes
59109530.0335189	//AlarmTime.UT
1800	//AlarmMarginSecs
Maneuver	//Type
True	//Enabled
True	//HaltWarp
True	//PauseGame
0	//ActionedAt
59111330.0335189,0,0,-801.719634931616,0.005634537,0.936446,0.01899466,-0.3502519//Manuever
	//Xfer
	//Target
	//Options



parsed_kac[s].ID
parsed_kac[s].AlarmAction
parsed_kac[s].ManNodesStorage
parsed_kac[s].XferOriginBodyName
parsed_kac[s].XferTargetBodyName
parsed_kac[s].RepeatAlarm
parsed_kac[s].RepeatAlarmPeriodStorage
parsed_kac[s].TargetObjectStorage
parsed_kac[s].ContractGUIDStorage
parsed_kac[s].ContractAlarmType
parsed_kac[s].DeleteOnClose
parsed_kac[s].Triggered
parsed_kac[s].Actioned
parsed_kac[s].AlarmWindowClosed
*/
			}

			update_ui_msg('Generating Ouput');
			$('#file-output').val(fileoutput);
			$('#file-output').attr('rows','');
			$('#file-output').attr('rows',page_data.parsed_kac.length+2);
			declare_finished();
		};
		var report_iter=function(){
			update_status_msg('sorting_data');
			var all_stop=false,
				captured_sci_ids=[],
				captured_body_ids=[],
				captured_biome_ids=[];
			for(var s=0;s<page_data.parsed_science.length;s++){
				var parsed_attr=kspSciObj.parse_sci_id(page_data.parsed_science[s].raw_id),
					new_props={};
//console.log('parsed_attr',parsed_attr);
				if(parsed_attr!==false){
					page_data.parsed_science[s]={
						'num':s,
						'raw_id':page_data.parsed_science[s].raw_id,
						'text':page_data.parsed_science[s].title,
						'sci':page_data.parsed_science[s].sci,
						'cap':page_data.parsed_science[s].cap,
						'percent':(page_data.parsed_science[s].cap!=0 && !isNaN(page_data.parsed_science[s].cap && page_data.parsed_science[s].cap!=Infinity)?(page_data.parsed_science[s].sci/page_data.parsed_science[s].cap*100).toFixed(2):0),
						'science_ident':parsed_attr.science_ident,
						'planet_ident':parsed_attr.planet_ident,
						'biome_ident':(basic_check(parsed_attr.biome_ident)?parsed_attr.biome_ident:false),
						'rail_ident':parsed_attr.rail_ident,
						'rail':parsed_attr.rail,
						'meta':(typeof(parsed_attr.meta)=='object'?parsed_attr.meta:false)
					};

/*var testing_arr=['crewReport@KerbinSrfLandedLaunchPad','crewReport@KerbinFlyingLowShores','crewReport@KerbinSrfSplashedWater','evaReport@KerbinInSpaceLowHighlands'	];
var testing_arr=['evaReport@MunInSpaceLowHighlands'];
if($.inArray(page_data.parsed_science[s].raw_id,testing_arr)!==-1){
//console.log('page_data.parsed_science[s]', $.extend(true,{},page_data.parsed_science[s]));
console.log('parsed_attr', $.extend(true,{},parsed_attr));
}
if(page_data.parsed_science[s].science_ident=='recovery'){
console.log('page_data.parsed_science[s].raw_id',page_data.parsed_science[s].raw_id);
}*/
					if((!kspSciObj.is_science(page_data.parsed_science[s].science_ident)) && $.inArray(page_data.parsed_science[s].science_ident,captured_sci_ids)===-1){//unfound science experiment
						captured_sci_ids.push(page_data.parsed_science[s].science_ident);
						new_props.science_ident=page_data.parsed_science[s].science_ident;}
					if((!kspUniObj.is_celestial_body(page_data.parsed_science[s].planet_ident)) && $.inArray(page_data.parsed_science[s].planet_ident,captured_body_ids)===-1){//unfound planet/moon
						captured_body_ids.push(page_data.parsed_science[s].planet_ident);
						new_props.planet_ident=page_data.parsed_science[s].planet_ident;}
					if(basic_check(page_data.parsed_science[s].biome_ident)){//its possible it doesn't need to have a biome
/*if($.inArray(page_data.parsed_science[s].raw_id,testing_arr)!==-1){
console.log('-------YES',$.inArray(page_data.parsed_science[s].biome_ident,flatten_array(captured_biome_ids,'biome')),$.inArray(page_data.parsed_science[s].planet_ident,flatten_array(captured_biome_ids,'planet')));}
*/
						var seek={
							'biome':$.inArray(page_data.parsed_science[s].biome_ident,flatten_array(captured_biome_ids,'biome')),
							'planet':$.inArray(page_data.parsed_science[s].planet_ident,flatten_array(captured_biome_ids,'planet'))
						};
						if((!kspUniObj.is_biome(page_data.parsed_science[s].biome_ident,page_data.parsed_science[s].planet_ident)) && (seek.biome===-1 || seek.planet===-1 || seek.planet!==seek.biome)){//unfound biome //-1 not found if != idents are not the same test against Kerin-Highlands, Mun-Highlands
							captured_biome_ids.push({'biome':page_data.parsed_science[s].biome_ident,'planet':page_data.parsed_science[s].planet_ident});
							new_props.biome_ident=page_data.parsed_science[s].biome_ident;}}
					if($.inArray(page_data.parsed_science[s].rail_ident,array_keys(kspUniObj.body_rails_schema))===-1){//unfound rail
						all_stop=true;
						update_status_msg('error');
						try{console.warn('=======RAIL NOT FOUND',"\n",'ident',page_data.parsed_science[s].rail_ident,'parsed_rail',rail);}catch(e){}
						break;
						//new_props.rail=page_data.parsed_science[s].rail;
					}
					//page_data.parsed_science[s].meta.asteroid_ident;
				}
				update_found_counts(captured_sci_ids.length,captured_body_ids.length,captured_biome_ids.length);
			}

			if(all_stop){return;}//if no rail we should just stop
			if(captured_sci_ids.length==0 && captured_biome_ids.length==0 && captured_biome_ids.length==0){
				//FPSObj.remove_callback(report_iter);//if I wasn't using 'FPSObj.add_once_callback()'
				update_status_msg('sorting_table');
				setTimeout(function(){
					draw_science();
				},base_delay*0.75);//short message
			}else{
				//FPSObj.remove_callback(report_iter);//if I wasn't using 'FPSObj.add_once_callback()'
				update_found_counts(captured_sci_ids.length,captured_body_ids.length,captured_biome_ids.length);

				for(var bi=0;bi<captured_body_ids.length;bi++){//body_ids
					var body_new=captured_body_ids[bi];
						body_type=kspSciObj.guess_body_type_from_sci(array_object_search(page_data.parsed_science,'planet_ident',body_new));
//console.log('body_new',body_new,'body_type',body_type);

					if(kspUniObj.add_body((body_type=='star'?false:'Sun'), body_new, body_type, [], {'name':body_new})){//assume everything orbits the sun ^_^
						added_ident.body.push(body_new);}
				}
				for(var bo=0;bo<captured_biome_ids.length;bo++){//biome_ids - no guessing.  Biome is either there or not.  In the a planet or not?  That is handled in the add function.  Make sure planet is added first
					var biome_new=captured_biome_ids[bo];
					if(kspUniObj.add_biome(biome_new.planet,biome_new.biome)){
						added_ident.biome.push(biome_new);}
				}
				if(captured_body_ids.length==0){//add new science last!
					var did_add=false;
					for(var si=0;si<captured_sci_ids.length;si++){//sci_ids
						var new_sci=captured_sci_ids[si];
//console.log('new_sci',new_sci);
						var new_sci_obj=kspSciObj.guess_science(new_sci,page_data.parsed_science);

//console.log(new_sci, 'biome_context',biome_context, 'rail_context',rail_context, $.extend(true,{},new_meta,{'name':new_sci}));
						if(kspSciObj.add_science(new_sci_obj.sci_id, new_sci_obj.biome_context, new_sci_obj.rail_context, new_sci_obj.meta)){
							did_add=true;
							added_ident.sci.push(new_sci);}
					}
					if(did_add){//re-evaulate the new bodies because new sci exps might change the new planets
						for(var bi=0;bi<added_ident.body.length;bi++){//body_ids
							var planet_ident=added_ident.body[bi],
								body_key=$.inArray(planet_ident, flatten_array(kspUniObj.celestial_bodies,'ident'));
							if($.inArray(kspUniObj.celestial_bodies[body_key].ident,flatten_array(kspUniObj.default_bodies,'ident'))!==-1){continue;}//don't correct defaults!
							kspUniObj.celestial_bodies[body_key].body_type=kspSciObj.guess_body_type_from_sci(array_object_search(page_data.parsed_science,'planet_ident',planet_ident));

						}
					}
				}
				setTimeout(function(){
					//FPSObj.add_once_callback(report_iter);//KAC FIX
					FPSObj.add_once_callback(report_iter_kac);
				},base_delay);
			}
/*
console.log('captured_sci_ids',captured_sci_ids,
			'captured_body_ids',captured_body_ids,
			'captured_biome_ids',captured_biome_ids);*/
		};
		//FPSObj.add_once_callback(report_iter);//KAC FIX
		FPSObj.add_once_callback(report_iter_kac);
		update_ui_msg('Sorting Relevant Data');
	}
	function read_scenario_chunks(strIn){
		var scenario_inc=0,
			use_data_set=false;
		page_data.scenarios=kspObj.chunk_reader(strIn,'SCENARIO');
		if(page_data.scenarios.length==0){//error handling
			update_status_msg('error');
			return;}
//console.log('page_data.scenarios',page_data.scenarios);
		FPSObj.add_once_callback(function(){
			update_status_msg('searching_science');
			var scenario_iter=function(){
				if(use_data_set!==false){FPSObj.remove_callback(scenario_iter);return;}//probably not needed
				FPSObj.remove_callback(scenario_iter);//stop from stacking
				kspObj.plugin.attr_reader_line=function(packObj){
					//if(packObj.clean_key=='name' && packObj.clean_val=='ResearchAndDevelopment'){
					if(packObj.clean_key=='name' && packObj.clean_val=='KerbalAlarmClockScenario'){
						packObj.do_break=true;}
				};
				page_data.scenarios_attribs=kspObj.attr_reader(page_data.scenarios[scenario_inc].clean_chunk);
				kspObj.plugin.attr_reader_line=false;//unset

				if(page_data.scenarios_attribs.length>0){
//console.log('-'+scenario_inc,'page_data.scenarios_attribs',$.extend(true,{},page_data.scenarios_attribs));
					for(var a=0;a<page_data.scenarios_attribs.length;a++){
						//if(page_data.scenarios_attribs[a].key=='name' && page_data.scenarios_attribs[a].val=='ResearchAndDevelopment'){
						if(page_data.scenarios_attribs[a].key=='name' && page_data.scenarios_attribs[a].val=='KerbalAlarmClockScenario'){
							use_data_set=page_data.scenarios[scenario_inc];}
					}
				}
				FPSObj.add_callback(scenario_iter);//stop from stacking
				if(scenario_inc>=(page_data.scenarios.length-1) || use_data_set!==false){
					FPSObj.remove_callback(scenario_iter);
					FPSObj.add_once_callback(function(){
						if(use_data_set!==false){
							on_chunk_found(use_data_set);
						}else{
							try{console.log(page_data.scenarios_attribs, page_data.scenarios);}catch(e){}
						}
						page_data.scenarios=false;
						page_data.scenarios_attribs=false;
						return;
					});
				}
				scenario_inc++;
			};
			setTimeout(function(){
				FPSObj.add_callback(scenario_iter);
			},base_delay);
		});
	}
	function on_chunk_found(dataSetIn){
		var sci_inc=0;

		//FPSObj.change_fps(20);//lets speed it up!
		FPSObj.change_fps(40);//lets speed it up!
		//FPSObj.change_fps(1);//lets speed it up!
		update_status_msg('reviewing_science');
		update_ui_msg('Parsing Relevant Data');
		var chunk_tick=function(){
			FPSObj.remove_callback(chunk_tick);//stop from stacking
//console.log('chunk -=- tick',sci_inc+' of '+page_data.sciences.length);
			var t_obj={},
				_attribs=kspObj.attr_reader(page_data.sciences[sci_inc].clean_chunk,t_obj);
//console.log('-_attribs',_attribs,'t_obj',t_obj,'floatval('+typeof(t_obj.sci)+' '+t_obj.sci+')',parseFloat(t_obj.sci));

			page_data.science_max_total=page_data.science_max_total+parseFloat(t_obj.sci);
			page_data.parsed_science.push({'raw_id':t_obj.id,'title':t_obj.title,'sci':parseFloat(t_obj.sci),'cap':parseFloat(t_obj.cap)});
			page_data.parsed_kac.push(t_obj);

			update_status_msg('count_off_science',{'pre':addCommas(sci_inc+1),'end':(sci_inc+1!=1?'s':'')+' for '+addCommas(page_data.science_max_total.toFixed(2))+' Science'});

			if(sci_inc>=(page_data.sciences.length-1)){
				FPSObj.remove_callback(chunk_tick);
				FPSObj.add_once_callback(function(){
					setTimeout(function(){
						FPSObj.change_fps(base_fps);//revert
						on_captured_science(page_data.parsed_science);
					},base_delay*0.35);//1/3 of base delay the user has already seen this message
				});
				return;
			}
			sci_inc++;
			FPSObj.add_callback(chunk_tick);//stop from stacking
		};

		//page_data.sciences=kspObj.chunk_reader(dataSetIn.chunk,'Science');
		page_data.sciences=kspObj.chunk_reader(dataSetIn.chunk,'Item');
//console.log('page_data.sciences',page_data.sciences);

		setTimeout(function(){
			update_status_msg('count_off_science',{'pre':sci_inc,'end':(sci_inc!=1?'s':'')});
			FPSObj.add_callback(chunk_tick);
		},base_delay*1.2);
	}

	if(typeof window.FileReader === 'undefined'){
		$(msg_obj).addClass('fail');}
	else{
		update_status_msg('ready');
		$(msg_obj).addClass('success');}
	function dodrop(e){
//console.log('e',e,e.target.files,$('#file-browse').get(0).files[0]);
		$(this).removeClass('hover');
		if($('body').hasClass(body_busy_class)){return;}

		show_all_sci=$('#show-sci').prop('checked');
		show_all_bodies=$('#show-all-bodies').prop('checked');
		show_roids=$('#show-roids').prop('checked');
		$.cookie('displayprefs', JSON.stringify({'show_all_sci':show_all_sci,'show_all_bodies':show_all_bodies,'show_roids':show_roids}));

		processor_clock.start=new Date();
		processor_clock.end=false;
		$(table_target_obj).html('');
		this.className = '';
		e.preventDefault();
$('#file-browse').blur();
$('fieldset input').blur();
$('.file-browse,fieldset').css('display','none');
		if(e.originalEvent && e.originalEvent.dataTransfer){var file = e.originalEvent.dataTransfer.files[0];}//jQuery
		else if(e.target===$('#file-browse')[0]){var file = e.target.files[0];}
		else{var file = e.dataTransfer.files[0];}
		var reader = new FileReader();
		reader.onload = function (event){
			$('body').addClass(body_busy_class);
			page_data=$.extend(true,{},page_data_schema);//break pass by reference - populate defaults
			update_status_msg('have_file');
			update_ui_msg('File Uploaded Successfully');
			run_count++;
			if(run_count==2){base_delay=base_delay/2;}

			setTimeout(function(){
				$(drag_target).trigger('dragend');
				var inputstr=reader.result;
				FPSObj.add_once_callback(function(){
					update_status_msg('searching_file');
					setTimeout(function(){
						update_ui_msg('Reading File Contents');
						read_scenario_chunks(inputstr);
					},base_delay);
				});
			},base_delay);
		};
		reader.readAsText(file);
		return false;
	}
	$('body').on('dragover',function () {
		if(!$('body').hasClass(body_busy_class)){
			update_status_msg('ready');update_ui_msg(default_ui_msg);
		}
	});
	$('#file-browse').on('change',dodrop);
	$(drag_target).on('dragover',function () { $(this).addClass('hover'); return false; });
	$(drag_target).on('dragend dragleave',function () { $(this).removeClass('hover'); return false; });
	$(drag_target).on('drop',dodrop);
	if($.cookie('displayprefs')){
		var displayprefs=JSON.parse($.cookie('displayprefs'));
		show_all_sci=displayprefs.show_all_sci;
		show_all_bodies=displayprefs.show_all_bodies;
		show_roids=displayprefs.show_roids;
		$('#show-sci').prop('checked',show_all_sci);
		$('#show-all-bodies').prop('checked',show_all_bodies);
		$('#show-roids').prop('checked',show_roids);
	}
