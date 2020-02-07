const fs = require('fs').promises
const http = require('http')

const logToFile = async (user, action) => {
	try {
		const date = new Date(Date.now()).toLocaleString()
		const logString = `user ${user} ${action} at ${date}\n`

		await fs.appendFile('./log.txt', logString)
	} catch (err) {
		console.log('Nåt gick fel med logfilen.' + err)
	}
}

http.createServer((req, res) => {
	if ( req.url === '/favicon.ico' ) {
		res.writeHead(200, {
			'Content-Type': 'image/xicon'
		})
		res.end()
		return
	}

	if ( req.url === '/' ) {
		res.writeHead(200)
		res.write('Publik information')
		res.end()
		return
	}

	if ( /^\/login/.test(req.url) ) {
		if ( /^\/login\/[a-z]+/.test(req.url) ) {
			const username = req.url.split('/')[2]

			logToFile(username, 'logged in')
			
			console.log(`User ${username} just logged in`)
			res.writeHead(200)
			res.end()
			return
		}

		fs.readFile('./log.txt', 'utf8')
			.then(data => {
				const latestLogin = data.split('\n')
					.filter(rows => /logged in/.test(rows))
					.sort((a, b) => a - b)
				
				res.writeHead(200)
				res.write(latestLogin[latestLogin.length - 1])
				res.end()
			}).catch(err => {
				res.write('oops')
				res.end()
			})
		return
	}

	if ( /^\/logout\/[a-z]+/ ) {
		const username = req.url.split('/')[2]

		logToFile(username, 'logged out')
		console.log(`user ${username} just logged out`)

		res.writeHead(200)
		res.end()
	}
}).listen(8000, () => console.log('Server listening on port 8000'))
