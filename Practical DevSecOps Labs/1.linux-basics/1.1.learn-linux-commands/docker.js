function showstep(elem) {
    var id = $(elem).attr("id");
    console.log("ID:", id)
    $("#course-text").hide();
    step_id = "step"+id
    console.log("Step ID", step_id)
    //$("#"+step_id).show();
    //$("#"+step_id).removeClass("hidden");
    //$("#"+step_id).toggle();
    //$('#steps').not("#"+step_id).show();
}
document.getElementById("timercount").innerHTML = duration + " Minutes";

function get_term_size() {
    var init_width = 9;
    var init_height = 23;

    var windows_width = $(window).width();
    var windows_height = $(window).height();

    return {
        cols: Math.floor(windows_width/init_width),
        rows: Math.floor(windows_height/init_height),
    }
}
// $("code").wrap("<div></div>");
// Clipboard copy functionality
$("code").click(function() {
        //console.log('started copying');

    
        var range = document.createRange();
        range.selectNode(this);
        window.getSelection().removeAllRanges(); // clear current selection
        window.getSelection().addRange(range); // to select text
        var e = $(this).text();

        var terminal = $('.terminal');
        terminal.click();
        var codeFontSize = parseFloat($(this).css('font-size')); //12.25px
        var incrSize = (codeFontSize + 0.43) + 'px';
        if ($(this).hasClass("copy")) {
            //console.log(host);
            console.log("text copied");
            var successful = document.execCommand("copy");
            console.log("Copy Successful: " + successful);
            $(this).animate({fontSize: incrSize},100, function(){
                $(this).animate({fontSize: codeFontSize},100);
            });
            
        } else if ($(this).hasClass("bash") ){
            console.log("bash clicked");
        } else {
            $(this).addClass("copied");
            document.execCommand("copy");
            if (window.mySock) {
                console.log(window.mySock);
                window.mySock.send($(this).text() + "\n");
            }

        }


        window.getSelection().removeAllRanges();// to deselect
    

});

function get_time() {
    // body...
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    return time
}

function close_conn(){
    window.mySock.close();
}

function websocket() {

    var cols = get_term_size().cols;
    var rows = get_term_size().rows;

    $( "#start-button" ).remove();
    $("#terminal-tab-main").removeClass("hidden")

    var term = new Terminal(
        {
            cols: cols,
            rows: rows,
            useStyle: true,
            cursorBlink: true,
            theme: {
                background: '#012B36'
            }
        }),
        protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://',
        socketURL = protocol + location.hostname + ((location.port) ? (':' + location.port) : '') +
            '/dockerssh/?' + '&width=' + cols + '&height=' + rows;


    term.write('Welcome to \x1B[1;3;31mPractical DevSecOps Labs\x1B[0m\n\r')

    // Open websocket connection, open web terminal
    var sock;
    sock = new WebSocket(socketURL);
    
    const attachAddon = new AttachAddon.AttachAddon(sock);
    const fitAddon = new FitAddon.FitAddon();

    sock.addEventListener('open', function () {
        
        $('#form').addClass('hide');
        $('#django-docker-terminal').removeClass('hide');
        term.open(document.getElementById('terminal'));
        term.focus();
        
        // Make the terminal's size and geometry fit the size of #terminal-container
		term.loadAddon(fitAddon);
        fitAddon.fit();
        
    	term.loadAddon(attachAddon);
	    console.log('attached terminal to the socket');
        //term.write('\n\r$');
        
        //$("body").attr("onbeforeunload",'checkwindow()'); // Refresh Close prompt
        sock.send("\n");
        sock.send("\n");
		
    });

    // Read the data sent by the server and write to the web terminal
    sock.addEventListener('message', function (recv) {
    console.log('receiving the message now');
    term.focus();
        //var data = JSON.parse(recv.data);
        //var message = data.message;
        //var message = data;
        //var status = data.status;
        // term.write(recv.data)
        //} else {
            //window.location.reload() 端口连接后刷新页面
			//term.clear()
			//term.write(recv.data)
			//$("body").removeAttr("onbeforeunload"); //删除刷新关闭提示属性
			
			//$(document).keyup(function(event){	// 监听回车按键事件
			//	if(event.keyCode == 13){
					//window.location.reload();
			//	}
			//});
			//term.dispose()
			//$('#django-webssh-terminal').addClass('hide');
			//$('#form').removeClass('hide');
    });
    function timedout() {
    setTimeout(function(){ close_conn(); }, 1200000); // 20 minutes timeout
    }
    timedout();

    sock.addEventListener('close', function () {
    term.write("\n \x1B[1;3;31m Connection is closed, Please reload the page \x1B[0m\n\r" );
    console.log('closing');
    });


    window.mySock = sock;
    // Send data to the server
    //term.onData(data => {
	    // message['status'] = 0;
        // message['data'] = data;
        //var send_data = JSON.stringify(message);
        //term.write(data)
        //sock.send(data)
    //});

    /*
    term.onData(data function (data) {
        //message['status'] = 0;
        //message['data'] = data;
        var send_data = JSON.stringify(data);
        sock.send(send_data)
    });
    */

    // Listen to the browser window, modify the terminal size according to the browser window size
/*     $(window).resize(function () {
        var message = {'status': 0, 'data': null, 'cols': null, 'rows': null};
        var cols = get_term_size().cols;
        var rows = get_term_size().rows;
        message['status'] = 1;
        message['cols'] = cols;
        message['rows'] = rows;
        var send_data = JSON.stringify(message);
        sock.send(send_data);
        term.resize(cols, rows)
    }) */

    
    var twentyMinutesLater = new Date();
    duration = parseInt(duration);

    twentyMinutesLater.setMinutes(twentyMinutesLater.getMinutes() + duration);
    twentyMinutesLater.setSeconds(twentyMinutesLater.getSeconds() + 15);
    // Update the count down every 1 second
    var x = setInterval(function() {

    // Get today's date and time
    var now = new Date().getTime();
        
    // Find the distance between now and the count down date
    var distance = twentyMinutesLater - now;
        
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
    // Output the result in an element with id="demo"
    document.getElementById("timercount").innerHTML = duration > 60 ? hours + 'h ' + minutes + "m " + seconds + "s ": minutes + "m " + seconds + "s ";
    sock.addEventListener('close', function () {
        clearInterval(x);
        document.getElementById("timercount").innerHTML = "Closed";
        });
    // If the count down is over, write some text 
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("timercount").innerHTML = "EXPIRED";
        close_conn();
    }
    }, 1000);
}
