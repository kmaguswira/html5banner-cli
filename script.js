#!/usr/bin/env node
'use strict';

const meow = require('meow');
const Util = require('./util');

const cli = meow(`
	HOW TO USE:
	backup_image           =>	to make a backup_image in a folder (type your html name and it takes 30s)
	backup_image_set       => generate backup_image for a set of banners
	compress               =>	to compress all images in a folder (*.jpg and *.png)
	init                   =>	init a standard banners template folder (coming soon)
	rename                 =>	to replace filename that contain '-min' to ''
	trustme	               => compress + create backup_image + validate and zip a set of banners (almost done)
	validate               => validate a banner (size and type) (coming soon)
	zip                    => zip a set of banners
`, {
	boolean: [],
	string: [],
	alias: {}
});

if (cli.input.length === 0) {
	console.error('read more on --help');
	process.exit(1);
}

let doThatThing = [];

switch (cli.input[0]) {
	case 'backup_image':
		doThatThing.push(Util.makeBackup('./', `${cli.input[1]}.html`, cli.input[1].split('x')[0], cli.input[1].split('x')[1]));
		break;
	case 'backup_image_set':
		doThatThing.push(Util.makeBackupSet());
		break;
	case 'compress':
		if(cli.input.length == 2){
			if(Number.isInteger(cli.input[1]) && cli.input[1] < 95)
				doThatThing.push(Util.compress(cli.input[1]));
			else{
				console.error('Input error');
				process.exit(1);
			}
		}else{
			doThatThing.push(Util.compress());
		}
		break;
	case 'rename':
		doThatThing.push(Util.rename('-min.','.'));
		break;
	case 'trustme':
		doThatThing.push(Util.trustme());
		break;
	case 'validate':
		doThatThing.push(Util.validate());
		break;
	case 'zip':
		doThatThing.push(Util.zip());
		break;
	default:
		console.error('read more on --help');
		process.exit(1);
}

Promise
	.all(doThatThing)
	.then(() => console.log('done!'))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
