const chatForm= document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');
const locationDOM=document.getElementById('sendLocation')


const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix: true});

const socket= io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('locationMessage', pos => {
   console.log(pos);
   outputLocation(pos)
  
   chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

locationDOM.addEventListener('click',()=>{
  //disable untill acknowledgement
  if(!navigator.geolocation)
  {
      return alert('Geolocation is not suported by your browser')
  }
  locationDOM.setAttribute('disabled','disabled');
  navigator.geolocation.getCurrentPosition((position)=>{
      pos={
          latitude: position.coords.latitude,
          longitude:position.coords.longitude
      }

      socket.emit('sendLocation',pos);
      locationDOM.removeAttribute('disabled')
  })
})

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

//Output location to DOM
function outputLocation(loc) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${loc.username} <span>${loc.time}</span></p>
  <a href=${loc.url}>Click to see my location</span></a>`;
  document.querySelector('.chat-messages').appendChild(div);
}
// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}
