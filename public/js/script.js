var config = {
	apiKey : "AIzaSyA5c28XacQFZqu6OW4U8ZERhZblpmUIluA",
	authDomain : " carpark-5ddcc.firebaseapp.com",
	databaseURL : "https://carpark-5ddcc.firebaseio.com",
	projectId : "carpark-5ddcc",
	storageBucket : "carpark-5ddcc.appspot.com",
	messagingSenderId : "988099882250"
};
firebase.initializeApp(config);
var db = firebase.database();
var carsRef = db.ref('cars');
var disabledRef = db.ref('disabled');


var capacity = 0; // capacity of the parking lot
var occupied = 0; // maintaining original carpark occupied space for extension
var disabled_capacity = 0;
var disabled_occupied = 0;


/*========== Drawing the Carpark Usage ==========*/
var tau = 2 * Math.PI;

// init the arc
var arc = d3.arc()
	.innerRadius(170)
	.outerRadius(220)
	.startAngle(0);

// init svg
var svg1 = d3.select(".USArc"),
	USwidth = +svg1.attr("width"),
	USheight = +svg1.attr("height"),
	g = svg1.append("g").attr("transform", "translate(" + USwidth/2 + "," + USheight/2 + ")");

// background arg
var background = g.append("path")
	.datum({endAngle: tau})
	.style("fill", "#FFFFFF")
	.attr("d", arc);

// foreground arc
var foreground = g.append("path")
	.datum({endAngle: 0 * tau})
	.style("fill", "#EFB509")
	.attr("d", arc)
	.attr("d", arc.cornerRadius(30));

// Displaying the percentage of use on top of circle
svg1.append("path")
	.attr("id", "circular")
	.attr("d", "M 110,360 A 200,200 0 0,1 610,360")
	.style("fill", "none")
	.style("stroke", "none");

var totalUsage = svg1.append("text")
	.append("textPath")
	.attr("xlink:href", "#circular")
	.style("fill", "#FF4447")
	.style("font-size", "50px")
	.style("text-anchor", "middle")
	.attr("startOffset", "50%")
   	.style("font-weight", "700");

// draw usage of the carpark
function drawUsage(usage) {
	foreground.transition()
		.duration(750)
		.attrTween("d", arcTween(usage/100 * tau));

	totalUsage.text(usage + '% Occupied');
	console.log("Page 2: draw circle - DONE");
}

// Tween the Arc!!!
function arcTween(newAngle) {
	return function(d) {
		var interpolate = d3.interpolate(d.endAngle, newAngle);
		return function(t) {
			d.endAngle = interpolate(t);
			return arc(d);
		};
	};
}
/*============================================*/


// reset the pages when faulty input
function reset() {
	// reset City Score page
	theCityName.text('Oops, "' + capacity + '" has no scores!');
	totalScore.text("0.0");

	foreground.transition()
		.duration(750)
		.attrTween("d", arcTween(0));

	$('#page3 p').html("");
}


function openTab(evt, option) {
	// Declare all variables
	var i, tabcontent, tablinks;

	// Get all elements with class="tabcontent" and hide them
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
			tabcontent[i].style.display = "none";
	}

	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
			tablinks[i].className = tablinks[i].className.replace(" active", "");
	}

	// Show the current tab, and add an "active" class to the button that opened the tab
	document.getElementById(option).style.display = "block";
	evt.currentTarget.className += " active";
}


// convert milliseconds to day, hour, and minutes
function dhm(t) {
	var cd = 24 * 60 * 60 * 1000,
			ch = 60 * 60 * 1000,
			d = Math.floor(t / cd),
			h = Math.floor( (t - d * cd) / ch),
			m = Math.round( (t - d * cd - h * ch) / 60000),
			pad = function(n) { return n < 10 ? '0' + n : n; };
	if(m === 60) {
		h++;
		m = 0;
	}
	if(h === 24) {
		d++;
		h = 0;
	}

	return d + " days " + pad(h) + " hours " + pad(m) + " minutes";
	// return [d, pad(h), pad(m)].join(':');
}


$( "#car-entry" ).click(function() {	
	if (occupied > capacity) {
		alert("Carpark has reached full capacity. Please come back another time!");
	}
	else {
		var plateNumber = document.getElementById("plate-number").value;
		var entryDate = document.getElementById("entry-date").value;
		var entryTime = document.getElementById("entry-time").value;
		var isDisabled = document.getElementById("disabled").checked ? true : false;
		// console.log(plateNumber, entryDate, entryTime);
	
		var date_str = entryDate.split("-");
		var time_str = entryTime.split(":");
		var date = new Date();
		date.setFullYear(date_str[0]);
		date.setMonth(date_str[1] - 1);
		date.setDate(date_str[2]);
		date.setHours(time_str[0]);
		date.setMinutes(time_str[1]);
		// console.log(date);

		var data = {
			plateNumber: plateNumber,
			datetime: date.getTime(),
			disabled: isDisabled.toString(),
			isValid: "true"
		}

		// add car to db
		if (isDisabled) {
			disabledRef.push(data);
			disabled_occupied++;
		}
		else {
			if ((capacity - disabled_capacity) < occupied) { // if regular space is fully occupied
				var data = {
					plateNumber: plateNumber,
					datetime: date.getTime(),
					disabled: isDisabled.toString(),
					isValid: "false"
				}
			}
			carsRef.push(data);
			occupied++;
		}

		var empty = capacity - occupied - disabled_occupied;
		$("#totalSpace").text(capacity);
		$("#occupiedSpace").text(occupied);
		$("#emptySpace").text(empty);
		$("#disabledSpace").text(disabled_capacity);
		$("#disabledOccupied").text(disabled_occupied);

		// redraw circle
		console.log((occupied/capacity).toFixed(2) * 100);
		drawUsage(((occupied+disabled_occupied)/capacity).toFixed(2) * 100);
		alert("Car parked");
	}

	// reset input values
	document.getElementById("plate-number").value = '';
	document.getElementById("entry-date").value = '';
	document.getElementById("entry-time").value = '';
});


$( "#car-exit" ).click(function() {
	var plateNumber = document.getElementById("exit-plate-number").value;
	var exitDate = document.getElementById("exit-date").value;
	var exitTime = document.getElementById("exit-time").value;
	// console.log(exitDate, exitTime);

	var date_str = exitDate.split("-");
	var time_str = exitTime.split(":");
	var date = new Date();
	date.setFullYear(date_str[0]);
	date.setMonth(date_str[1] - 1);
	date.setDate(date_str[2]);
	date.setHours(time_str[0]);
	date.setMinutes(time_str[1]);

	carsRef.orderByChild("plateNumber").equalTo(plateNumber).on("child_added", function(snapshot) {
		// decrement occupied by one
		occupied--;
		var empty = capacity - occupied - disabled_occupied;
		$("#totalSpace").text(capacity);
		$("#occupiedSpace").text(occupied);
		$("#emptySpace").text(empty);
		$("#disabledSpace").text(disabled_capacity);
		$("#disabledOccupied").text(disabled_occupied);
		// redraw circle
		console.log((occupied/capacity).toFixed(2) * 100);
		drawUsage(((occupied+disabled_occupied)/capacity).toFixed(2) * 100);

		// calculate duration of stay for the car
		var duration = date.getTime() - snapshot.val().datetime;
		var hours = Math.ceil(duration/3600000);
		var cost = 15 + ((hours - 1) * 10);
		if (snapshot.val().isValid == "false") {
			cost += 1000;
		}
		alert("Car parked for " + dhm(duration) + ". The charge is: " + cost + " AED.");
		// remove the car from db
		if (snapshot.val().disabled == "true") {
			disabledRef.child(snapshot.key).remove();
		}
		else {
			carsRef.child(snapshot.key).remove();
		}
	});

	// reset input values
	document.getElementById("exit-plate-number").value = '';
	document.getElementById("exit-date").value = '';
	document.getElementById("exit-time").value = '';
});


// when "enter" key is pressed, fade out landing page
$('.input').keypress(function(event) {
	// console.log(event);
	// console.log(event.which);
	// check if enter was pressed
	if (event.which == 13) {
    	// console.log("Enter was pressed!");

    	$('html, body').animate({
	        scrollTop: $("#page1").offset().top
	    }, 600);

    	var inputValue;
    	if ($('#input-field').is(':focus')) {
    		inputValue = $('#input-field').val();
			// console.log(inputValue);
    	}
    	else {
    		inputValue = $('#main-input').val();
    		// console.log(inputValue);
    	}

		if (parseInt(inputValue) > capacity) {
			// make sure inputValue is an integer
			capacity = parseInt(inputValue);
			disabled_capacity = Math.floor(capacity * 0.2);
			// var occupied = oldOccupied;
			var empty = capacity - occupied;
			$("#totalSpace").text(capacity);
			$("#occupiedSpace").text(occupied);
			$("#emptySpace").text(empty);
			$("#disabledSpace").text(disabled_capacity);
			$("#disabledOccupied").text(disabled_occupied);

			drawUsage((occupied/capacity).toFixed(2) * 100);

			$(".input").val(""); // clearing input-field
			$(".input").blur(); // get focus off input-field
		}
	}
});


// set cursor to input-field when page loads
$(document).ready(function() {
	$('#input-field').focus();

	$(window).scroll(function() {
		if ($(this).scrollTop() >= $(window).height()) {
			$('.nav-bar').fadeIn(500);
		}
		else {
			$('.nav-bar').fadeOut(500);
		}
	});

	var contentSections = $('.page'),
		navigationItems = $('#cd-vertical-nav a');

	updateNavigation();
	$(window).on('scroll', function() {
		updateNavigation();
	});

	//smooth scroll to the section
	navigationItems.on('click', function(event) {
        event.preventDefault();
        smoothScroll($(this.hash));
    });
    //smooth scroll to second section
    $('.cd-scroll-down').on('click', function(event) {
        event.preventDefault();
        smoothScroll($(this.hash));
    });

	function updateNavigation() {
		contentSections.each(function() {
			var activeSection = $('#cd-vertical-nav a[href="#'+$(this).attr('id')+'"]').data('number');
			if (($(this).offset().top - $(window).height()/2 < $(window).scrollTop()) &&
				($(this).offset().top + $(this).height() - $(window).height()/2 > $(window).scrollTop())) {
				navigationItems.eq(activeSection).addClass('is-selected');
			}
			else {
				navigationItems.eq(activeSection).removeClass('is-selected');
			}
		});
	}

	function smoothScroll(target) {
        $('body,html').animate({ 'scrollTop':target.offset().top }, 600);
	}
});