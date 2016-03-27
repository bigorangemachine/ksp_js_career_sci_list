
	document.body.className=document.body.className+' hasJS';
	var form_elmts={
			'form':$('.calc-form')[0],
			'target_time':$('[name="timeUT"]')[0],
			'delta_avail': $('[name="delta-avail"]')[0],
			'time_burn':$('[name="time-burn"]')[0],
			'time_recharge':$('[name="time-recharge"]')[0],
			'prograde':$('[name="prograde-val"]')[0],
			'normal':$('[name="normal-val"]')[0],
			'radial':$('[name="radial-val"]')[0]
		},
		form_imgs={
			'prograde':" <img src=\""+$(form_elmts.prograde).parent().find('img').attr('src')+"\" width=\""+$(form_elmts.prograde).parent().find('img').attr('width')+"\" height=\""+$(form_elmts.prograde).parent().find('img').attr('height')+"\">",
			'normal':" <img src=\""+$(form_elmts.normal).parent().find('img').attr('src')+"\" width=\""+$(form_elmts.normal).parent().find('img').attr('width')+"\" height=\""+$(form_elmts.normal).parent().find('img').attr('height')+"\">",
			'radial':" <img src=\""+$(form_elmts.radial).parent().find('img').attr('src')+"\" width=\""+$(form_elmts.radial).parent().find('img').attr('width')+"\" height=\""+$(form_elmts.radial).parent().find('img').attr('height')+"\">"
		},
		table_target_obj=$('.table-output')[0];

$(form_elmts.form).on('submit',function(){
	var form_vals={
			'target_time':parseFloat($(form_elmts.target_time).val()),
			'delta_avail': parseFloat($(form_elmts.delta_avail).val()),
			'time_burn': parseFloat($(form_elmts.time_burn).val()),
			'time_recharge': parseFloat($(form_elmts.time_recharge).val()),
			'prograde':parseFloat($(form_elmts.prograde).val()),
			'normal':parseFloat($(form_elmts.normal).val()),
			'radial':parseFloat($(form_elmts.radial).val())
		};
	if((Math.abs(form_vals.prograde) + Math.abs(form_vals.normal) + Math.abs(form_vals.radial))===0){return false;}

	var js_row_prefix='js-manouver-num-',
		js_data_row_css='js-data-row',
		js_indic_css='js-indic',
		js_t_row='js-title-row',
		tableObj=new bdTabler(),
		delta_total=Math.abs(form_vals.prograde) + Math.abs(form_vals.normal) + Math.abs(form_vals.radial),
		segments=Math.ceil(delta_total/(form_vals.delta_avail===0?1:Math.abs(form_vals.delta_avail))),
		num_of_recharges=segments-2,
		total_event=0,//init
		total_delay=0,//init
		straddle_start_time=0,//init
		results=[],
		results_schema={'time':false,'prograde':false,'normal':false,'radial':false};
	//modify a few vars
	form_vals.time_recharge=form_vals.time_recharge*60;//convert from minutes to seconds
	form_vals.time_burn=form_vals.time_burn*60;
	total_delay=form_vals.time_burn+form_vals.time_recharge;//segment duration
	total_event=(form_vals.time_burn * segments) + (form_vals.time_recharge * num_of_recharges); //no recharge on first event, no recharge on last
	straddle_start_time=form_vals.target_time - (total_event / 2);
	
	for(var s=0;s<segments;s++){
		//results.push($.extend(true, {}, results_schema, {'time': form_vals.target_time + (total_delay * (s)),'prograde':form_vals.prograde/segments,'normal':form_vals.normal/segments,'radial':form_vals.radial/segments}));
		results.push($.extend(true, {}, results_schema, {
			'time': straddle_start_time + (total_delay * (s)),//first is ignored duration - loops does not do last technically
			'prograde':form_vals.prograde/segments,
			'normal':form_vals.normal/segments,
			'radial':form_vals.radial/segments
		}));
	}

	$(table_target_obj).html('');
	tableObj.add_line(['Results',tableObj.reserve_merge_row()],{'add_class_row':'sci-head','add_class':['',''],'row_type':'head'});

	if(results.length>0){
		for(var i=0;i<results.length;i++){
			var this_row_class=js_row_prefix+(i+1);
			tableObj.add_line(['<a class="show-hide" href="javascript:;">'+'Maneuver #' + (i+1)+' <span class="indic_wrap">(<span class="' + js_indic_css + '">&ndash;</span>)</span></a>', tableObj.reserve_merge_row()],{'add_class_row':this_row_class + ' '+js_t_row,'add_class':['cell-sci sci-grey','cell-sci sci-grey']});
			tableObj.add_line(['UT', results[i].time.toString()],{'add_class_row':this_row_class+' '+js_data_row_css});
			if(results[i].prograde!==0){
				tableObj.add_line(['Prograde'+form_imgs.prograde, results[i].prograde.toString()],{'add_class_row':this_row_class+' '+js_data_row_css});}
			if(results[i].normal!==0){
				tableObj.add_line(['Normal'+form_imgs.normal, results[i].normal.toString()],{'add_class_row':this_row_class+' '+js_data_row_css});}
			if(results[i].radial!==0){
				tableObj.add_line(['Radial'+form_imgs.radial, results[i].radial.toString()],{'add_class_row':this_row_class+' '+js_data_row_css});}
		}

		tableObj.draw_table(table_target_obj);
		$('.show-hide').on('click',function(){
			var classes=$(this).closest('tr').attr('class').split(' '),
				this_row_num=false;
			for(var c=0;c<classes.length;c++){
				if(classes[c].indexOf(js_row_prefix)===0){
					this_row_num=check_strip_first(classes[c],js_row_prefix);
					break;
				}
			}
			if(this_row_num!==false){
				var row_sel=js_row_prefix+this_row_num;
				if($($('.'+row_sel+'.'+js_data_row_css)[0]).is(':visible')){
					$('.'+row_sel+'.'+js_t_row).find('.'+js_indic_css).html('+');
					$('.'+row_sel+'.'+js_data_row_css).hide();
				}else{
					$('.'+row_sel+'.'+js_t_row).find('.'+js_indic_css).html('&ndash;');
					$('.'+row_sel+'.'+js_data_row_css).show();

				}
			}
		});
	}

	return false;
});