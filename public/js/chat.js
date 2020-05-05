const socket = io()

//Elements
const $messageform = document.querySelector('#message-form')
const $messageformInput = document.querySelector('input')
const $messageformButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Options
const {username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
	// new message element
	const $newMessage = $messages.lastElementChild

	// height of the new message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

	// visible height
	const visibleHeight = $messages.offsetHeight

	// Height of message container
	const containerHeight = $messages.scrollHeight

	// how far have i scrolled
	const scrollOffset = $messages.scrollTop + visibleHeight

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight
	}

}

socket.on('location', (message) => {
	console.log(message)
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()
})

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	})
	document.querySelector('#sidebar').innerHTML = html
})

socket.on('message', (message) => {
	console.log(message)
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()
})


$messageform.addEventListener('submit', (e) => {
	e.preventDefault()
	//disable

	$messageformButton.setAttribute('disabled', 'disabled')

	const message = e.target.elements.message.value

	socket.emit('sendMessage', message, (error) => {
		$messageformButton.removeAttribute('disabled')
		$messageformInput.value = ''
		$messageformInput.focus()

		if (error) {
			return console.log(error)
		}
		console.log('The message was delivered', message)
	})
})

$sendLocationButton.addEventListener('click', ()=> {
	if (!navigator.geolocation) {
		return alert('Geolocation not supported')
	}

	//disable
	$sendLocationButton.setAttribute('disabled', 'disabled')

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit('sendLocation', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}, () => {
			$sendLocationButton.removeAttribute('disabled')
			console.log('location shared')
		})
	})
})

// document.querySelector('#send').addEventListener('send', (e)=> {
// 	e.preventDefault()

// 	const message = document.querySelector('mes').value

socket.emit('join', { username, room}, (error) => {
	if (error) {
		alert(error)
		location.href = '/'
	}
})