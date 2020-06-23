const fs = require('fs')
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const glob = require('glob')
const os = require('os');

let output_folder = path.join(process.cwd(), 'output/')
let path_config = path.join(process.cwd(), 'config.json')

let config = require(path_config)

let ffmpegloc = path.join(process.cwd(), 'bin/ffmpeg')
if (os.platform().substring(0,3) == 'win') {
    ffmpegloc = ffmpegloc + '.exe'
}

ffmpeg.setFfmpegPath(ffmpegloc)

let current = 0
let last = 0

function render_video(fname) {
	return new Promise((resolve,reject)=>{
        ffmpeg(fname)
          .inputOptions([
              '-crf ' + config.crf,
              '-preset ' + config.present
          ])
		  .audioCodec('lib' + config.audioCodec)
		  .videoCodec('lib' + config.videoCodec)
		  .save(output_folder + path.basename(fname,path.extname(fname)) + config.prefix + '.mp4')
		  
		  .on('start', (commandLine) => {
			console.log('[?] - Spawned Ffmpeg with command: ' + commandLine)
			current++;
			console.log('['+ current + '/' + last + '] [' + path.basename(fname) + '] - Rendering...')
		  })
		  
		  .on('progress',(progress) => {
			//console.log(progress)
			console.log('-> [ Render process on : ' + progress.timemark + ' ] - ' + progress.currentFps + ' FPS')
		  })
		  
		  .on('end', () => {
			console.log('[+] - Finished one job')
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

getDirectories(process.cwd(), (err, res) => {
  console.log(process.cwd())
  if (err) {
    console.log('Error', err)
  } else {
	current = 0
	if (res.length > 0) {
		last = res.length
		processVideo(res)
	} else {
		console.log('There no videos on input folder.')
		process.exit()
	}
  }
});

async function processVideo(array) {
	console.log(output_folder)
	if (fs.existsSync(output_folder) && fs.lstatSync(output_folder).isDirectory()) {
		console.log('[+] Target output : ' + output_folder)
	} else {
		console.log('[+] Making folder : ' + output_folder)
		fs.mkdirSync(path.join(process.cwd(), 'output'));
	}
	for (const item of array) {
		await render_video(item)
	}
	console.log('Done!')
	process.exit()
}