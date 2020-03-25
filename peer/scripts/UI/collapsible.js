function collapsible_init(divMotherId, title, divContentId) {
	var divMother = $("#" + divMotherId);
	var divContent = $("#" + divContentId);


	divMother.addClass(" mdl-shadow--2dp mdlext-dark-color-theme");
	divContent.addClass("mdl-card__supporting-text");
	
	var header = $("<header>");
	header.addClass("mdl-card__title mdl-color--primary mdl-color-text--primary-contrast mdlext-js-collapsible mdlext-collapsible softcorner bottom_border");
	
	header.click(function() {		
		divContent.toggle();
		if(divContent.is(":visible"))
			header.css("background-image", "url(styles/up-arrow.png)");
		else  		
			header.css("background-image", "url(styles/down-arrow.png)");
		
	});
	var h2 = $("<h2>");
	h2.addClass("mdl-card__title-text");
	h2.html(title);
	
	header.append(h2);
	divContent.before(header);
	divContent.hide(); // hide from the start
}
function collapsible_updateTitle(divMotherId, title){
	var h2 = $("#" + divMotherId).find("header").find("h2");
	h2.html(title);	
}

