const electron = require('electron');
const url = require('url');
const path = require('path');
const fs  = require('fs');
const cron = require('node-cron');
const shell = require('shelljs');
const { type } = require('os');
const {Tray,app, BrowserWindow, Menu, ipcMain} = electron;
const {PythonShell} = require('python-shell')

// Parse JSON
const configFilePath = path.join(__dirname,'config.json');
const configString = fs.readFileSync(configFilePath);
const config = JSON.parse(configString);

let mainWindow;
let tray = null;
let force_quit = false;
const iconPath = path.join(__dirname,'xen.jpg')

// Get Current IST Time
let currentTime = new Date();
let currentOffset = currentTime.getTimezoneOffset();
let ISTOffset = 330;   
let ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
let hoursIST = ISTTime.getHours()
let minutesIST = ISTTime.getMinutes()
currentTime = hoursIST+":"+minutesIST;

let cronStartHour = config.startTime.toString().substring(0,2)
let cronStartMin = config.startTime.toString().substring(3,5)
scheduleCron("* "+cronStartMin+" "+cronStartHour+" * * *")

// Main Function
app.on('ready', function(){

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  const mainMenu = Menu.buildFromTemplate(mainMenuTemaplate);

  Menu.setApplicationMenu(mainMenu)

  mainWindow.loadURL(url.format({
    pathname: fs.existsSync(configFilePath)?path.join(__dirname,'configWindow.html'):path.join(__dirname,'configWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('close', function(e){
    if(!force_quit){
      e.preventDefault();
      mainWindow.hide();
    }
  })

  tray = new Tray(iconPath)
  tray.setToolTip('Xen')

  tray.on('click',function(){
    if(mainWindow.isVisible()){
      mainWindow.hide()
    }else{
      mainWindow.show()
    }
  })
});



app.on('window-all-closed',function(){
  console.log('Config window closed')
})

// schedule Cron
function scheduleCron(cronString) {
  console.log("Cron updated to "+cronString);
  let schedule = cron.schedule(cronString,function(){
    console.log("Running");
    if(schedule.getStatus() == "running"){
      mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'timerWindow.html'),
        protocol: 'file:',
        slashes: true
      }));

      schedule.stop()
    }
  },{
    scheduled: false
  })

  schedule.start();
}

// Disable Keyboard and mouse inputs - python script
ipcMain.on("disableTime:add", function(e,disableTime){
  console.log(disableTime)
  if(!(disableTime.toString().includes("-"))){
    let options = {
      mode: 'text',
      pythonPath: 'C:/Users/Roshni - Skcript/AppData/Local/Programs/Python/Python36/python.exe',
      pythonOptions: ['-u'],
      scriptPath: 'C:/Users/Roshni - Skcript/Desktop/Xen Electron/',
      args: [disableTime]
    };

    PythonShell.run('DisableEnableInputs.py',options,function(err,results){
      if(err) throw err;
      console.log("finsihed")
    });
  }
})

// Get start and end time
ipcMain.on("Time:add", function(e, Time){
  if("startTime" in Time){
    config.startTime = Time.startTime;
    fs.writeFile(configFilePath, JSON.stringify(config), (err) => {
      if(err) console.log("Error : ", err)
    });
  }

  if("endTime" in Time){
    config.endTime = Time.endTime;
    fs.writeFile(configFilePath, JSON.stringify(config),(err)=>{
      if(err) console.log("Error : ", err)
    });
  }

  let cronStartHour = config.startTime.toString().substring(0,2)
  let cronStartMin = config.startTime.toString().substring(3,5)
  scheduleCron("* "+cronStartMin+" "+cronStartHour+" * * *")
});

// Get Tasks and write it json
ipcMain.on('task:add', function(e, task){
  config.tasks.push(task)
  console.log(JSON.stringify(config))
  fs.writeFile(configFilePath, JSON.stringify(config),(err)=>{
    if(err){
      console.log("Error : ", err)
    }else{
      mainWindow.webContents.send('task:add', task)
    }
  });
})

// Delete Task
ipcMain.on('task:clear', function(e, clearTask){
  config.tasks.splice(config.tasks.indexOf(clearTask),1)
  fs.writeFile(configFilePath, JSON.stringify(config),(err)=>{
    if(err){
      console.log("Error : ", err)
    }
  });
})

// Main Menu Tmeplate
const mainMenuTemaplate = [{
    label: 'Config',
    click(){
      mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'configWindow.html'),
        protocol: 'file:',
        slashes: true
      }));
    }
  }
  // {
  //   label: 'Reload',
  //   role: 'reload'
  // },
  // {
  //   label: 'Dev Tools',
  //   click(item, focusedWindow){
  //     focusedWindow.toggleDevTools();
  //   }
  // }
]

