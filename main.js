var Cylon = require('cylon');

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
		my.drone.calibrate();
	})
	
	my.leapmotion.on('frame', 
	function(frame){
		
		// rankos pozicija	
		if(frame.hands.length > 0)
		{
			// jei ranka yra
			if(!lifted){
				console.log("Pakeleme drona");
				my.drone.takeoff();
				lifted = true;
			}

			var hand = frame.hands[0];
			var position = hand.palmPosition;
			var velocity = hand.palmVelocity;
			var direction = hand.direction;
			var cur = position;
			
			// kumstis - nezinau kiek patikima
			if(hand.grabStrength==1){
				console.log("kumstis");
			}
		
			//console.log(position[0]);
			//console.log(position[1]);
			//console.log(position[2]);
			
			// galbut reiketu tik vienos krypties ?
			
			if(position[1] > 400){
				console.log("kyyylam");	
				my.drone.up(1);
			} else if(position[1] < 100){
				console.log("leidziameees");
				my.drone.down(1);
			} else {
				console.log("centras - kylam/leidziames");
			}
		
			if( position[0] > 60 ){
				console.log("desinen");	
				my.drone.right();
			} else if( position[0] < -60 ){
				console.log("kairen");
				my.drone.left();			
			} else {
				console.log("centras - kairen/desinen");
			}
		
			if( position[2] < -70 ){
				console.log("pirmyn");
				my.drone.forward();
			} else if( position[2] > 70 ){
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