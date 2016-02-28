var Cylon = require('cylon');

Cylon.robot({
	connections: {
		leapmotion: {adaptor: 'leapmotion'},
		ardrone: { adaptor: 'ardrone', port: '192.168.1.1' }
	},

	devices: {
		leapmotion: {driver: 'leapmotion', connection: 'leapmotion'},
		drone: { driver: 'ardrone' , connection: 'ardrone'}
	},

work: function(my) {
	
	
	
    my.leapmotion.on('frame', function(frame){
		if(frame.hands.length > 0){
			console.log('TAKEOFF');
			my.drone.takeoff();
		} else {
			console.log('LAND');
			my.drone.land();
		}
		
		
    if(frame.hands.length > 0)
    {
        var hand = frame.hands[0];
        var position = hand.palmPosition;
        var velocity = hand.palmVelocity;
        var direction = hand.direction;
		var cur = position;
		
		//console.log(position[0]);
		//console.log(position[1]);
		console.log(position[2]);
		
		if(position[1] > 400)
		{
			console.log("kyyylam");	
			my.drone.up(1);
		}
			
		if(position[1] < 100)
		{
			console.log("leidžiamėėės");
			my.drone.down(1);
		}
		
		if( position[0] > 60 )	
		{
			console.log("dešinėn");	
			my.drone.right();
		}
		
		if( position[0] < -60 )	
		{
			console.log("kairėn");
			my.drone.left();			
		}
		
		if( position[2] < -70 )	
		{
			console.log("pirmyn");
			my.drone.forward();
		}
		
		if( position[2] > 70 )	
		{
			console.log("atgal");
			my.drone.back();			
		}
		
    }
		var center = frame.interactionBox.center;
		
		
					
		
		
		if(frame.valid && frame.gestures.length > 0){
				frame.gestures.forEach(function(g){
					if(g.type == 'keyTap')
					{
						console.log("lalalalala");
					}
					
					
					if(g.type == 'swipe'){
						
					var currentPosition = g.position;
					var startPosition = g.startPosition;
					
						var xDirection = currentPosition[0] - startPosition[0];
						var yDirection = currentPosition[1] - startPosition[1];
						var zDirection = currentPosition[2] - startPosition[2];

						var xAxis = Math.abs(xDirection);
						var yAxis = Math.abs(yDirection);
						var zAxis = Math.abs(zDirection);

						var superiorPosition  = Math.max(xAxis, yAxis, zAxis);
						
						
						if(superiorPosition === xAxis){
							if(xDirection < 0){
								console.log('LEFT');
								my.drone.left();
							} else {
								my.drone.right();
								console.log('RIGHT');
							}
						}

						if(superiorPosition === zAxis){
							if(zDirection > 0){
								console.log('BACKWARDS');
								my.drone.back();
							} else {
								console.log('FORWARD');
								my.drone.forward();
							}
						}

						if(superiorPosition === yAxis){
							if(yDirection > 0){
								console.log('UP');
								my.drone.up(1);
							} else {
								console.log('DOWN');
								my.drone.down(1);
							}
						}
					} else if(g.type === 'keyTap'){
						my.drone.backFlip();
						after((5).seconds(), function(){
							my.drone.land();
						})
					}
				})
			}
		})
	}
}).start();

