const AdmZip = require('adm-zip');
const fs = require('fs');
const Pageres = require('pageres');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

let trustme = () => {
  return new Promise((resolve, reject)=>{
    fs.readdirSync(`./`).forEach(file => {
  		if(fs.statSync(`./${file}`).isDirectory()){
  			let zip = new AdmZip();
        let size = false;
  			fs.readdirSync(`./${file}`).forEach(fileInFolder => {
  				if(!fileInFolder.includes('DS_Store')||!fileInFolder.includes('RECYCLER')){
  					if(fileInFolder.toLowerCase().includes('.html')){
              let makeBackupImage = makeBackup(`./${file}/`, `${fileInFolder}`, `${file.split('x')[0]}`, `${file.split('x')[1]}`);
              makeBackupImage.then((done)=>{
                let input1 = fs.readFileSync(`./${file}/${fileInFolder}`);
      					zip.addFile(fileInFolder, input1, '', 0644);
                let input2 = fs.readFileSync(`./${file}/backup_image.jpg`);
                zip.addFile(fileInFolder, input2, '', 0644);
              }).catch((err)=>{
                console.log(err);
                reject(err);
              });
            }
  					let input = fs.readFileSync(`./${file}/${fileInFolder}`);
  					zip.addFile(fileInFolder, input, '', 0644);
  				}
  			});
        if(!size)
          reject(`Maximum size exceed ${file}`);
        else{
          zip.writeZip(`./${file}.zip`);
        }
  		}
  	});
    resolve(true);
  });
};

let makeBackup = (path, name, width, height, delay=30) => {
  return new Promise((resolve, reject)=>{
    let pageres = new Pageres({
      delay:delay,
      selector:'#banner',
      format:'jpg',
      filename:'backup_image'
    })
    .src(`${path}/${name}`,[`${width}x${height}`])
    .dest(`./${path}`)
    .run()
    .then(()=>{
      resolve(true);
    })
    .catch((err)=>{
      reject(err);
    });
  });
};

let makeBackupSet = () =>{
  return new Promise((resolve, reject)=>{
    let promises = [];

    fs.readdirSync(`./`).forEach(file =>{
      if(fs.statSync(`./${file}`).isDirectory()){
        fs.readdirSync(`./${file}`).forEach(fileInFolder =>{
          if(fileInFolder.includes('.html')){
            promises.push(makeBackup(`./${file}/`, `${fileInFolder}`, `${file.split('x')[0]}`, `${file.split('x')[1]}`));
          }
        });
      }
    });

    Promise
      .all(promises)
      .then(()=> resolve(true))
      .catch((err)=> reject(err));
  });
};

let rename = (from, to) =>{
  return new Promise((resolve, reject)=>{
    fs.readdirSync('./').forEach(file => {
  	  if(file.includes('-min.')){
  	    let newName = file.replace(from,to);
  	    fs.renameSync(`./${file}`, `./${newName}`);
  	    console.log(`Renamed ${file} to ${newName}`);
  	  }
  	});
    resolve(true);
  });
};

let compress = () =>{
  return new Promise((resolve, reject)=>{
    imagemin(['./*.{jpg,png}'], './', {
  	   plugins: [
  	       imageminJpegtran(),
  	       imageminPngquant({quality: '60-70'})
  	   ]
  	}).then(files => {
  	   resolve(true);
  	}).catch(err=>{
  		reject(err);
  	});
  });
};

let zip = () =>{
  return new Promise((resolve, reject)=>{
    fs.readdirSync(`./`).forEach(file => {
      if(fs.statSync(`./${file}`).isDirectory()){
        let zip = new AdmZip();
        fs.readdirSync(`./${file}`).forEach(fileInFolder => {
  				if(!fileInFolder.includes('DS_Store')||!fileInFolder.includes('RECYCLER')){
            let input = fs.readFileSync(`./${file}/${fileInFolder}`);
  					zip.addFile(fileInFolder, input, '', 0644);
          }
        });
        zip.writeZip(`./${file}.zip`);
      }
    });
    resolve(true);
  });
};

let validate = () =>{
  return new Promise((resolve, reject)=>{
    let sizeBanner = 0;
    let sizeBackup = 0;
    fs.readdirSync(`./`).forEach(file => {
      if(file.toLowerCase().includes('backup')){
        sizeBackup+=getSize(`./${file}`);
      }else{
        sizeBanner+=getSize(`./${file}`);
      }
    });
    if(sizeBanner>100||sizeBackup>40)
      reject(`Not Valid! Banner size = ${sizeBanner} and Backup image = ${sizeBackup}`);
    resolve(true);
  });
};

let getSize = (filename) => {
    return fs.statSync(filename).size/1000;
};

module.exports = {
  compress:compress,
  makeBackup:makeBackup,
  makeBackupSet:makeBackupSet,
  rename:rename,
  trustme:trustme,
  validate:validate,
  zip:zip
};
