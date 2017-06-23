const AdmZip = require('adm-zip');
const EasyZip = require('easy-zip').EasyZip;
const fs = require('fs');
const Pageres = require('pageres');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

let trustme = () => {
  return new Promise((resolve, reject)=>{
    fs.readdirSync(`./`).forEach(file => {
  		if(fs.statSync(`./${file}`).isDirectory()&&file=='300x250'){
  			let zip = new EasyZip();
        let filesToZip = [];
  			fs.readdirSync(`./${file}`).forEach(fileInFolder => {
  				if((!fileInFolder.includes('DS_Store')||!fileInFolder.includes('RECYCLER'))&&
            !fs.statSync(`./${file}/${fileInFolder}`).isDirectory()
            ){
  					if(fileInFolder.toLowerCase().includes('.html')){
              let makeBackupImage = makeBackup(`./${file}/`, `${fileInFolder}`, `${file.split('x')[0]}`, `${file.split('x')[1]}`);
              //async
              makeBackupImage.then((done)=>{
                filesToZip.push({source:`./${file}/${fileInFolder}`, target:fileInFolder});
                filesToZip.push({source:`./${file}/backup_image.jpg`, target:`backup_image.jpg`});
              }).catch((err)=>{
                console.log(err);
                reject(err);
              });
            }
            filesToZip.push({source:`./${file}/${fileInFolder}`, target:`${fileInFolder}`});
  				}
  			});
        //async rejected
        if(validate()){
          zip.batchAdd(filesToZip,function(){
              zip.writeToFile(`./${file}.zip`);
          });
        }else{
          reject(`Maximum size exceed ${file}`);
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

let compress = (qua=70) =>{
  return new Promise((resolve, reject)=>{
    imagemin(['./*.{jpg,png}'], './', {
  	   plugins: [
  	       imageminJpegtran(),
  	       imageminPngquant({quality: qua})
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
        let zip = new EasyZip();
        let filesToZip = [];
        fs.readdirSync(`./${file}`).forEach(fileInFolder => {
  				if(
            (!fileInFolder.includes('DS_Store')||!fileInFolder.includes('RECYCLER'))&&
            !fs.statSync(`./${file}/${fileInFolder}`).isDirectory()
            ){
            filesToZip.push({source:`./${file}/${fileInFolder}`, target:`${fileInFolder}`});
          }
        });
        zip.batchAdd(filesToZip,function(){
            zip.writeToFile(`./${file}.zip`);
        });
      }
    });
    resolve(true);
  });
};

let validate = () =>{
    let sizeBanner = 0;
    let sizeBackup = 0;
    fs.readdirSync(`./`).forEach(file => {
      if(file.toLowerCase().includes('backup')){
        sizeBackup+=getSize(`./${file}`);
      }else{
        sizeBanner+=getSize(`./${file}`);
      }
    });
    if(sizeBanner>100||sizeBackup>40){
      return false;
    }
    return true;
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
