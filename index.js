const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const glob = require('glob')

let config = require(path.join(__dirname, 'config.json'))
ffmpeg.setFfmpegPath(path.join(__dirname, 'bin/ffmpeg.exe'))

let current = 0
let last = 0

function render_video(fname) {
	return new Promise((resolve,reject)=>{
		ffmpeg(fname)
		  .inputOptions('-crf ' + config.crf)
		  .audioCodec('lib' + config.audioCodec)
		  .videoCodec('lib' + config.videoCodec)
		  .save(path.basename(fname,path.extname(fname)) + config.prefix + '.mp4')
		  
		  .on('start', (commandLine) => {
			// console.log('Spawned Ffmpeg with command: ' + commandLine
			current++;
			console.log('['+ current + '/' + last + '] [' + path.basename(fname) + '] - Rendering...')
		  })
		  
		  .on('progress',(progress) => {
			//console.log(progress)
			console.log('-> [ Render process on : ' + progress.timemark + ' ]')
		  })
		  
		  .on('end', () => {
			console.log('Finished one job')
			return resolve()
		  })
		  
		  .on('err'), (err) => {
			return reject(err)
		  }
	})
}

var getDirectories = (src, callback) => {
  glob(src + '/input/**/*.mkv', callback);
};

getDirectories(__dirname, (err, res) => {
  if (err) {
    console.log('Error', err)
  } else {
	current = 0
	last = res.length
	processVideo(res)
  }
});

async function processVideo(array) {
	for (const item of array) {
		await render_video(item)
	}
	console.log('Done!')
}