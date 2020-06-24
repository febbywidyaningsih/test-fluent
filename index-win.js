const fs = require('fs')
const path = require('path')
const glob = require('glob')
const os = require('os')
const { EOL } = os
let tempy = ''

let output_folder = path.join(process.cwd(), 'output/')
let path_config = path.join(process.cwd(), 'config.json')

let config = require(path_config)

let ffmpegloc = path.join(process.cwd(), 'bin/ffmpeg')
if (os.platform().substring(0,3) == 'win') {
    ffmpegloc = ffmpegloc + '.exe'
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
		// ffmpeg -crf 23 -preset ultrafast -i D:/Cmder/tastis/remtangan-cli/input/input.mkv -y -filter_complex "subtitles='D\:/Cmder/tastis/remtangan-cli/input/input.mkv'" -acodec libopus -vcodec libx265 D:\Cmder\tastis\remtangan-cli\output\input-uwu.mp4
		tempy = tempy + ffmpegloc + ' -crf ' + config.crf + ' -preset ' + config.present + ' -i ' + '"' + item + '"' + ' -y -filter_complex "subtitles=' + "'" + item.split(':/').join('\\:/') + "'" + '" ' + '-acodec lib' + config.audioCodec + ' -vcodec lib' + config.videoCodec + ' "' + output_folder + path.basename(item,path.extname(item)) + config.prefix + '.mp4' + '"' + EOL
	}
	fs.writeFile('batch.bat', tempy, (err) => {
		if (err) throw err;
		console.log('Batch File Created!');
	})
}