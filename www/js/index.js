window.mobile_hotel_card_toggle = true;
window.prev_width = window.innerWidth;
var mobile_recognizer = "";
var mobile_recognizing = false;
var mobile_speechResult = [];
var mobile_speechResultCount = 0;
var mobile_saidResult = '';
window.unique_key = "";
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
document.addEventListener('deviceready', onDeviceReady, false);


window.addEventListener("resize", function () {
    if (window.innerWidth > window.prev_width)
    {
    document.getElementById("mobile").classList.add("hide");
    document.getElementById("landscape").classList.remove("hide");
    }
else{
    document.getElementById("mobile").classList.remove("hide");
    document.getElementById("landscape").classList.add("hide");
    }
});

function onDeviceReady() {
    get_unique_key();
    show_splash();
    mobile_recognizer = new SpeechRecognition();
    mobile_recognizer.continuous = true;
    mobile_recognizer.interimResults = false;
    
    mobile_recognizer.onresult = function (event) {
        console.log('Options are: ');
        console.log(event.results);
        for (var i = 0; i < event.results.length; i++) {
            for (var j = 0; j < event.results[i].length; j++) {
                console.log("result[" + i + "][" + j + "] =" + event.results[i][j].transcript);
                console.log("result[" + i + "][" + j + "].confidence =" + event.results[i][j].confidence);
                console.log("result[" + i + "][" + j + "].final =" + event.results[i][j].final);
            }
        }
        console.log('We have a speech result:' + event.results[0][0].transcript);
        mobile_saidResult = event.results[0][0].transcript;
        document.getElementById("mobile-user-speech").textContent = '"' + mobile_saidResult + '"';
    }
}

function show_splash() {
    document.getElementById("splash-screen").style.zIndex = "1";
    document.getElementById("splash-logo").style.opacity = "1";
    setTimeout(function () {
        document.getElementById("splash-screen").style.zIndex = "-1";
        //document.getElementById("page-content").classList.remove("hide");
        get_api_key();
    }, 2000);
}


function get_api_key() {
    console.log("getting api key");
    if (localStorage.getItem("api_key") == null) {
        document.getElementById("mobile-api-key-modal").style.zIndex = "1";
        document.getElementById("api_key_submit_btn").disabled = false;
        document.getElementById("api_key_box").addEventListener("keyup", function () {
            document.getElementById("api_key_submit_btn").value = "Submit";
        });
    }
    else {
        document.getElementById("page-content").classList.remove("hide");
    }
}

function api_key_submit() {
    var api_key_str = document.getElementById("api_key_box").value;
    if (api_key_str == "") {
        document.getElementById("api_key_submit_btn").value = "Submit";
    }
    else {
        var submit_btn = document.getElementById("api_key_submit_btn");
        submit_btn.value = "Processing...";
        submit_btn.disabled = true;
        get_endpoint(api_key_str);
    }
}

function get_endpoint(api_key_str) {
    console.log("getting endpoint");
    var url = "https://leova-platform.appspot.com/api_ref?api_key="+api_key_str;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            if (xhr.responseText == "None") {
                console.log("Invalid API Key");
                document.getElementById("api_key_submit_btn").value = "Invalid API KEY";
                get_api_key();
            }
            else {
                localStorage.setItem("endpoint", xhr.responseText);
                localStorage.setItem("api_key", api_key_str);
                document.getElementById("page-content").classList.remove("hide");
                document.getElementById("mobile-api-key-modal").style.zIndex = "-2";
                console.log("ep=" + localStorage.getItem("endpoint"));
                console.log("api_key=" + localStorage.getItem("api_key"));
            }
        }
    };
}

function to_title(str) {
    var temp_list = str.split(" ");
    var temp_str = "";
    for (var i = 0; i < temp_list.length ; i++) {
        var temp_word = temp_list[i];
        temp_str += temp_word.substr(0, 1).toUpperCase() + temp_word.substr(1, temp_word.length);
        temp_str += " ";
    }
    return temp_str.trim();
}

function get_unique_key() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://leova-platform.appspot.com/unikeygen");
    xhr.send();
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            window.unique_key = xhr.responseText;
            console.log("unique_key= " + window.unique_key);
        }
    };
}

function modal_mic_clicked() {

    setTimeout(mobile_toggle(), 1000);
    setTimeout(mobile_submit(), 2000);
}

function mobile_hotel_card() {
    if (window.mobile_hotel_card_toggle == false) {
        //when minimized
        document.getElementById("mobile-hotel").style.top = "calc(100% - 4rem)";
        document.getElementById("mobile-hotel").style.width = "15rem";
        document.getElementById("mobile-hotel").style.height = "4rem";
        document.getElementById("mobile-left-arrow").style.transform = "rotate(0deg)";
        document.getElementById("mobile-right-arrow").style.transform = "rotate(0deg)";
        window.mobile_hotel_card_toggle = true;
    }
    else {
        //when expanded
        document.getElementById("mobile-hotel").style.top = "60%";
        document.getElementById("mobile-hotel").style.width = "100%";
        document.getElementById("mobile-hotel").style.height = "40%";
        document.getElementById("mobile-left-arrow").style.transform = "rotate(180deg)";
        document.getElementById("mobile-right-arrow").style.transform = "rotate(180deg)";
        window.mobile_hotel_card_toggle = false;
    }

}

function close_user_speech() {
    document.getElementById("mobile-user-speech-modal").style.top = "-80%";
    document.getElementById("mobile-user-speech").textContent = "";
}


function mobile_submit() {
    console.log("in submit");
    setTimeout(function () {
        console.log("in submit setTimeout");
        document.getElementById("mobile-user-speech-modal").style.top = "-1rem";
        var user_speech = mobile_saidResult;
        var api_key = localStorage.getItem("api_key");
        var endpoint = localStorage.getItem("endpoint");
        if (endpoint.length == 0) {
            get_api_key();
        }
        else {
            var channel_id = window.unique_key;
            console.log("channel_id= " + channel_id);
            var data = JSON.stringify({
                "q": user_speech,
                "api_key": api_key,
                "channel": channel_id,
                "tzo": "-330",
                "sr": "gvr-mobile"
            });

            var xhr = new XMLHttpRequest();

            xhr.open("POST", endpoint);
            xhr.setRequestHeader("content-type", "application/json");
            console.log("data = " + data);
            xhr.send(data);
        }


        xhr.onreadystatechange = function () {
            document.getElementById("mobile-hotel").classList.add("hide");
            if (xhr.readyState == 4 && xhr.status == 200) {
                mobile_saidResult = '';
                console.log(this.responseText);
                window.resp = JSON.parse(this.responseText);
                var resp = window.resp;
                if (jQuery.isEmptyObject(window.resp["error_dict"])) {
                    if (resp["FlightType"] == "One-Way") {
                        document.getElementById("mobile-hotel").classList.remove("hide");
                        console.log("one-way");
                        document.getElementById("mobile-trip-type").textContent = resp["FlightType"];
                        document.getElementById("container1").classList.add("hide");
                        document.getElementById("container2").classList.remove("hide");
                        document.getElementById("container3").classList.add("hide");
                        document.getElementById("container4").classList.add("hide");
                        document.getElementById("container5").classList.add("hide");
                        var from_city = resp["trips"][0]["from_city_name"];
                        document.getElementById("mobile-one-way-from").textContent = to_title(from_city) + " (" + resp["trips"][0]["from_city_code"] + ")";
                        var to_city = resp["trips"][0]["to_city_name"];
                        document.getElementById("mobile-one-way-to").textContent = to_title(to_city) + " (" + resp["trips"][0]["to_city_code"] + ")";
                        var trip_date1 = resp["trips"][0]["date1"];
                        trip_date1 = trip_date1.replace(" 2015", ", '15");
                        trip_date1 = trip_date1.replace(" 2016", ", '16");
                        document.getElementById("mobile-one-way-date").textContent = "on " + trip_date1;

                        var text_str = resp["text"];
                        var passenger_str = text_str.substr(text_str.indexOf('">') + 2);

                        var passenger = passenger_str.substr(0, passenger_str.indexOf("<"));
                        if (passenger.search(":") > -1) {
                            passenger = passenger.substr(passenger.indexOf(":") + 1, passenger.length);
                        }
                        document.getElementById("mobile-one-way-passenger").textContent = "for " + passenger;
                        var hotel_destination = resp["hotel_dict"]["destination"];
                        var hotel_date1 = resp["hotel_dict"]["from_date"];
                        var hotel_date2 = resp["hotel_dict"]["to_date"];
                        hotel_date1 = hotel_date1.substr(4, hotel_date1.length);
                        hotel_date1 = hotel_date1.replace(" 2015", ", '15");
                        hotel_date1 = hotel_date1.replace(" 2016", ", '16");
                        hotel_date2 = hotel_date2.substr(4, hotel_date2.length);
                        hotel_date2 = hotel_date2.replace(" 2015", ", '15");
                        hotel_date2 = hotel_date2.replace(" 2016", ", '16");
                        passenger = passenger.replace(" passengers", "s");
                        passenger = passenger.replace(" passenger", "");
                        document.getElementById("mobile-hotel-city").textContent = to_title(hotel_destination);
                        document.getElementById("mobile-hotel-date1").textContent = hotel_date1;
                        document.getElementById("mobile-hotel-date2").textContent = hotel_date2;
                        document.getElementById("mobile-hotel-passenger").textContent = "for " + passenger;

                    }

                    if (resp["FlightType"] == "Multi-City") {
                        document.getElementById("mobile-hotel").classList.add("hide");
                        console.log("multi-way");
                        document.getElementById("mobile-trip-type").textContent = resp["FlightType"];
                        document.getElementById("container1").classList.add("hide");
                        document.getElementById("container2").classList.add("hide");
                        document.getElementById("container3").classList.add("hide");
                        document.getElementById("container4").classList.remove("hide");
                        document.getElementById("container5").classList.add("hide");
                        var trips_list = resp["trips"];
                        for (var i = 0; i < trips_list.length ; i++) {
                            document.getElementById("mobile-multi-city-row" + i).classList.remove("hide");
                            if (i > 4) {
                                break;
                            }
                            var from_city_code = trips_list[i]["from_city_code"];
                            var to_city_code = trips_list[i]["to_city_code"];
                            var date1 = trips_list[i]["date1"];
                            date1 = date1.replace(" 2015", ", 2015");
                            date1 = date1.replace(" 2016", ", 2016");
                            date1 = date1.substr(4, date1.length);
                            document.getElementById("mobile-multi-city" + i).textContent = from_city_code + " - " + to_city_code;
                            document.getElementById("mobile-multi-city-date" + i).textContent = date1;
                        }
                        var text_str = resp["people_dict"];
                        var adult_count = text_str["adult"];
                        var child_count = text_str["child"];

                        if (adult_count > 1) {
                            var adult_text = adult_count + " adults";
                        }
                        else {
                            var adult_text = adult_count + " adult";
                        }
                        if (child_count > 1) {
                            var child_text = " and " + child_count + " children";
                        }
                        else if (child_count == 1) {
                            var child_text = " and " + child_count + " child";
                        }
                        else {
                            var child_text = "";
                        }

                        document.getElementById("mobile-multi-city-passenger").textContent = "for " + adult_text + child_text;
                    }
                    else {
                        if (resp["FlightType"] == "Return") {
                            document.getElementById("mobile-hotel").classList.remove("hide");
                            console.log("two-way");
                            document.getElementById("mobile-trip-type").textContent = resp["FlightType"];
                            document.getElementById("container1").classList.add("hide");
                            document.getElementById("container2").classList.add("hide");
                            document.getElementById("container3").classList.remove("hide");
                            document.getElementById("container4").classList.add("hide");
                            document.getElementById("container5").classList.add("hide");
                            var from_city = resp["trips"][0]["from_city_name"];
                            document.getElementById("mobile-two-way-from").textContent = to_title(from_city) + " (" + resp["trips"][0]["from_city_code"] + ")";
                            var to_city = resp["trips"][0]["to_city_name"];
                            document.getElementById("mobile-two-way-to").textContent = to_title(to_city) + " (" + resp["trips"][0]["to_city_code"] + ")";
                            var trip_date1 = resp["trips"][0]["date1"];
                            trip_date1 = trip_date1.replace(" 2015", ", '15");
                            trip_date1 = trip_date1.replace(" 2016", ", '16");
                            document.getElementById("mobile-two-way-date1").textContent = "leaving on " + trip_date1;

                            var trip_date2 = resp["trips"][0]["date2"];
                            trip_date2 = trip_date2.replace(" 2015", ", '15");
                            trip_date2 = trip_date2.replace(" 2016", ", '16");
                            document.getElementById("mobile-two-way-date2").textContent = "back on " + trip_date2;

                            var text_str = resp["text"];
                            var passenger_str = text_str.substr(text_str.indexOf('">') + 2);

                            var passenger = passenger_str.substr(0, passenger_str.indexOf("<"));
                            if (passenger.search(":") > -1) {
                                passenger = passenger.substr(passenger.indexOf(":") + 1, passenger.length);
                            }
                            document.getElementById("mobile-two-way-passenger").textContent = "for " + passenger;
                            var hotel_destination = resp["hotel_dict"]["destination"];
                            var hotel_date1 = resp["hotel_dict"]["from_date"];
                            var hotel_date2 = resp["hotel_dict"]["to_date"];
                            hotel_date1 = hotel_date1.substr(4, hotel_date1.length);
                            hotel_date1 = hotel_date1.replace(" 2015", ", '15");
                            hotel_date1 = hotel_date1.replace(" 2016", ", '16");

                            hotel_date2 = hotel_date2.substr(4, hotel_date2.length);
                            hotel_date2 = hotel_date2.replace(" 2015", ", '15");
                            hotel_date2 = hotel_date2.replace(" 2016", ", '16");
                            passenger = passenger.replace(" passengers", "s");
                            passenger = passenger.replace(" passenger", "");
                            document.getElementById("mobile-hotel-city").textContent = to_title(hotel_destination);
                            document.getElementById("mobile-hotel-date1").textContent = hotel_date1;
                            document.getElementById("mobile-hotel-date2").textContent = hotel_date2;
                            document.getElementById("mobile-hotel-passenger").textContent = "for " + passenger;
                        }
                    }
                }
                else {
                    document.getElementById("mobile-trip-type").textContent = "Error"
                    document.getElementById("container1").classList.add("hide");
                    document.getElementById("container2").classList.add("hide");
                    document.getElementById("container3").classList.add("hide");
                    document.getElementById("container4").classList.add("hide");
                    document.getElementById("container5").classList.remove("hide");
                    var error_code = resp["error_dict"]["error_code"];
                    var error_msg = resp["error_dict"]["error_message"];
                    document.getElementById("error-title").textContent = "Error " + error_code;
                    document.getElementById("error-text").textContent = error_msg;
                }
            }
        };
    }, 1000);
    setTimeout(function () {
        console.log("close timeout");
        close_user_speech();
        var ul_iterator = 0;
        var si = setInterval(function () {
            if (ul_iterator > 4) { clearInterval(si); }
            else {
               // Materialize.showStaggeredList('#staggered-multi-city-row' + ul_iterator);
               // ul_iterator++;
                document.getElementById("mobile-multi-city-passenger").classList.remove("hide");
            }
        }, 500)
    }, 5000);
}




function mobile_stop_voice() {
    mobile_recognizing = false;
    mobile_recognizer.stop();
    clearInterval(window.mic_timer);
    document.getElementById("modal-mic").style.animationName = "";
    document.getElementById("mobile-mic-modal").style.zIndex = "-1";
    document.getElementById("modal-mic").setAttribute("src", "./img/mic0.png");
    document.getElementById("mobile-mic").style.opacity = "1";
}

function mobile_start_voice() {
    mobile_recognizer.start();
    mobile_recognizing = true;
    change_mic();
    document.getElementById("mobile-mic-modal").style.zIndex = "0";
    document.getElementById("mobile-mic").style.opacity = "0";
}


function mobile_toggle() {
    if (mobile_recognizing) {
        mobile_stop_voice();
    }
    else {
        mobile_start_voice();
        console.log("a2");
    }
}


mobile_recognizer.onstart = function (event) {
    change_mic();
    document.getElementById("mobile-mic-modal").style.top = "0";
    document.getElementById("mobile-mic").style.opacity = "0";
}

mobile_recognizer.onstop = function (event) {
    console.log("recog stop");
}

mobile_recognizer.onerror = function (event) {
    if (event.error == 'no-speech') {
        console.log("no speech");
    }
    if (event.error == 'audio-capture') {
        console.log("audio capture");
    }
    if (event.error == 'not-allowed') {
        console.log("not allowed");
    }
};

function change_mic() {
    var iterator = 1;
    var mic = document.getElementById("modal-mic");
    mic.style.animationName = "modal-mic-visibility";
    mic.setAttribute("src", "./img/mic" + iterator + ".png");
    iterator++;
    window.mic_timer = setInterval(function () {
        if (iterator > 2) { iterator = 1; }
        mic.setAttribute("src", "./img/mic" + iterator + ".png");
        iterator++;
    }, 1500);
}
