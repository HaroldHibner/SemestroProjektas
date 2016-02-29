/*
	PASTABA - rankos pasukimas kertasi su kumsciu, jei naudosime abu reikes nustatyti prioriteta
	TODO - pagalvoti del pakilimo nuleidimo, gal geriau su tap, o neradus rankos naudoti hover?
*/
var Cylon = require('cylon');

var ROLL_JAUTRUMAS = 0.5; // kiek reikia pasukti i sonus radianai
var PITCH_JAUTRUMAS_PRIEKIN = 0.5 // kiek reikia delnu i prieki radianai
var PITCH_JAUTRUMAS_ATGAL = 0.3 // kiek reikia delnu atgal radianai
var SUKIMO_GREITIS = 0.5; // 0 - 1
var KYLIMO_GREITIS = 0.5; // 0 - 1
var DESINE_KAIRE_JAUTRUMAS = 60; // cia ir toliau kiek mm nuo centro randasi ranka
var PIRMYN_ATGAL_JAUTRUMAS = 70;
var PAKILTI_JAUTRUMAS = 400;
var NUSILEISTI_JAUTRUMAS = 100;

var inFlight = false; // tikrina ar dabar skrenda
var lifted = false;    // tikrina ar dronas pakiles

Cylon.robot({
	connections: {
		leapmotion: {adaptor: 'leapmotion'},
		ardrone: { adaptor: 'ardrone', port: '192.168.1.1' },
		keyboard: { adaptor: 'keyboard' },
	},

	devices: {
		leapmotion: {driver: 'leapmotion', connection: 'leapmotion'},
		drone: { driver: 'ardrone' , connection: 'ardrone'},
		keyboard: { driver: 'keyboard' , connection: 'keyboard'},
	},
	
	
work: function(my) {
		
	// klaviaturos kontrole - galima imesti kitu komandu
	// http://cylonjs.com/documentation/drivers/keyboard/#Commands
	// http://cylonjs.com/documentation/drivers/ardrone-flight/
	// resetina emergency moda, gali vel valdyti ir nereikia resetini
	my.keyboard.on('r', function(key) {
		console.log("reseting emergency");
		my.drone.disableEmergency();
	})
	// calibruoja, bet nezinau ka
	my.keyboard.on('z', function(key) {
		console.log("calibrating");
		my.drone.calibrate(SUKIMO_GREITIS);
	})
	
	my.leapmotion.on('frame', 
	function(frame){
		// rankos pozicija	
		if(frame.hands.length > 0)
		{
			var hand = frame.hands[0];
			var position = hand.palmPosition;
			var velocity = hand.palmVelocity;
			var normal = hand.palmNormal;
			var roll = hand.roll(); // rankos pasukimas i sonus
			var pitch = hand.pitch();
			var cur = position;
			
			// jei ranka yra
			if(!lifted){
				console.log("Pakeleme drona");
				my.drone.takeoff();
				lifted = true;
			}
			// kumstis - nezinau kiek patikima
			if(hand.grabStrength==1){
				console.log("kumstis");
			}
			//console.log(hand.roll());
			if(roll > ROLL_JAUTRUMAS) {
				console.log("Delnas i desine");
				my.drone.counterClockwise(SUKIMO_GREITIS);
			} else if(roll < -1*ROLL_JAUTRUMAS) { 
					console.log("Delnas i kaire");
					my.drone.clockwise(SUKIMO_GREITIS);
			} else {
				console.log("Delnas nepasuktas");
			}
			//console.log(hand.pitch());
			PITCH_JAUTRUMAS_PRIEKIN
			if(pitch > PITCH_JAUTRUMAS_PRIEKIN) {
				console.log("Delnas i prieki");
			} else if (pitch < -1*PITCH_JAUTRUMAS_ATGAL) {
				console.log("Delnas i tave");
			} else {
				console.log("Delnas nepalenktas");
			}
			// galbut reiketu tik vienos krypties ?
			//console.log(position[0]);
			//console.log(position[1]);
			//console.log(position[2]);
			if(position[1] > PAKILTI_JAUTRUMAS){
				console.log("kyyylam");	
				my.drone.up(1);
			} else if(position[1] < NUSILEISTI_JAUTRUMAS){
				console.log("leidziameees");
				my.drone.down(1);
			} else {
				console.log("centras - kylam/leidziames");
			}
			
			if( position[0] > DESINE_KAIRE_JAUTRUMAS ){
				console.log("desinen");	
				my.drone.right();
			} else if( position[0] < -1*DESINE_KAIRE_JAUTRUMAS ){
				console.log("kairen");
				my.drone.left();			
			} else {
				console.log("centras - kairen/desinen");
			}
			
			if( position[2] < -1*PIRMYN_ATGAL_JAUTRUMAS ){
				console.log("pirmyn");
				my.drone.forward();
			} else if( position[2] > PIRMYN_ATGAL_JAUTRUMAS ){
				console.log("atgal");
				my.drone.back();			
			} else {
				console.log("centras - pirmyn/atgal");
			}
			
		} 
		// jei rankos nera
		else if(lifted) {
			console.log("Nuleidziame drona");
			lifted = false;
			my.drone.land();
		}
		// gestai
		if(frame.valid && frame.gestures.length > 0) {
			
			frame.gestures.forEach(function(g){
				// stop tam kad nespaminti gestures rezultatu, viena gesture - vienas vygdymas
				if(g.type == "circle" && g.state == "stop") {
					console.log("circle");
				}		
				// kertasi su circle - reiketu naudoti tik kuri viena
				if(g.type == "keyTap" && g.state == "stop"){
					console.log("tap");
				}
				// sitas kertasi su cirle ir kartais su tap - patarimas nenaudoti
				if(g.type == "swipe" && g.state == "stop") {
					//suranda swipe krypti
					
					var currentPosition = g.position;
					var startPosition = g.startPosition;
					
					var xDirection = currentPosition[0] - startPosition[0];
					var yDirection = currentPosition[1] - startPosition[1];
					var zDirection = currentPosition[2] - startPosition[2];
					
					var xAxis = Math.abs(xDirection);
					var yAxis = Math.abs(yDirection);
					var zAxis = Math.abs(zDirection);
					// tik viena kryptim, komentuoti kartu su tolimesniais ifais jei imti kitas kryptis
					var superiorPosition  = Math.max(xAxis, yAxis, zAxis);
					
					if(superiorPosition == xAxis){
						if(xDirection < 0){
							console.log('swipe - kaire');
						} else {
							console.log('swipe - desine');
						}
					}
					if(superiorPosition == zAxis){
						if(zDirection > 0){
							console.log('swipe - atgal');
						} else {
							console.log('swipe - pirmyn');
						}
					}
					if(superiorPosition == yAxis){
						if(yDirection > 0){
							console.log('swipe - virsun');
						} else {
							console.log('swipe - zemyn');
						}
					}
					
				}
			})
		}
	})
}

}).start();