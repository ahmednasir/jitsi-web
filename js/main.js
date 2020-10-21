meeting = {
    domain: 'meet.jit.si',
    api: "",
    unAuthusers :[],
    initPage: () => {
        try {
            let url = window.location.href

            let meetingRoom = meeting.getRoomId(decodeURIComponent(url))
            if (!meetingRoom) {
                throw "nullMeetingRoom"
            }

            meeting.initMeeting(meetingRoom)
        } catch (error) {
            console.log(error)
        }
    },

    initMeeting: (meetingRoom) => {
        try {
            let options = {
                roomName: meetingRoom,
                width: "100%",
                height: window.innerHeight,
                parentNode: document.querySelector('#meet'),
            };
            meeting.api = new JitsiMeetExternalAPI(meeting.domain, options);
            $('.info-row').hide()
            meeting.api.getCurrentDevices().then(devices => {
                console.log(devices)
            })
            meeting.api.addEventListener("participantJoined", (e) => {
                console.log("participantJoined", e)
                meeting.verifyUser(meetingRoom, e.displayName).then(resp => {
                    debugger
                    console.log("--------------------------------------------")
                    console.log(resp)
                    console.log("--------------------------------------------")
                }).catch(err => {
                    console.log(err)
                    
                    
                    if (err.Status == 401) {
                        meeting.unAuthusers.push(e.displayName)
                        let message = formatUnAuthMessage();
                        // alert(`Unauthorised user: ${e.displayName} entered`)
                        $("#unauth-user").text(message)
                        $("#myModal").modal("show");
                        // unauth-user
                        
                        // meeting.api.executeCommand('sendEndpointTextMessage', err.TrainerId, `Unauthorised user: ${e.displayName}`);
                    }
                })
                // 
            });
        } catch (error) {
            console.log(error)
        }
    },

    addEventListener: () => {
        meeting.api.addEventListener("participantJoined", () => {
            console.log("participantJoined")
        });
    },

    getRoomId: (url) => {

        url = url.split('?')
        for (let val of url) {
            if (val.includes("id=")) {
                return val.replace("id=", "")
            }
        }
        return null;
    },

    verifyUser: (meetingId, participantId) => {
        return new Promise((resolve, reject) => {
            try {
                let url = `${meeting.config.BASE_URL}${meeting.config.BOOKING_URL}${meetingId}/${participantId}`
                $.ajax({
                    url: url,
                    method: "GET",

                    success: data => {
                        if (data.Status != 200) {
                            reject(data)
                        }
                        resolve(data)
                    },
                    error: error => {
                        console.log(error)
                        reject(error)
                    }
                });
            } catch (error) {
                console.log(error)
                reject(error)
            }
        })

    },

    formatUnAuthMessage = ()=>{
        let message = "Usernames: "
        meeting.unAuthusers.forEach(element => {
            message += element + ", "
        });
        return message
    },

    config: {
        BASE_URL: "http://localhost:3000",
        BOOKING_URL: "/bookings/validate/"
    }


}