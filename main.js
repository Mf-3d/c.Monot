const {app, BrowserWindow, BrowserView, dialog, ipcMain, ipcRenderer, screen, Menu}=require('electron');
const fs=require('fs');
var win;
var bv=[];
const viewY=75;
var nowTab=0;

function nw(){
  win=new BrowserWindow({
    width: 1000, height: 700, minWidth: 500, minHeight: 200,
    frame: false,
    transparent: false,
    backgroundColor: '#ffffff',
    title: 'Monot by monochrome.',
    icon: `${__dirname}/src/image/logo.png`,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration:false,
      contextIsolation: true,
      preload: `${__dirname}/src/script/preload.js`
    }
  });
  win.loadFile(`${__dirname}/src/index.html`);
  bv[0]=new BrowserView({
    webPreferences: {
      nodeIntegration: false
    }
  })
  let winSize=win.getSize();
  win.setBrowserView(bv[0]);
  bv[0].setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  bv[0].setAutoResize({width: true, height: true});
  bv[0].webContents.loadURL(`file://${__dirname}/src/resource/index.html`);

  win.on('closed',()=>{
    win=null;
  })
  win.on('maximize',()=>{
    winSize=win.getContentSize();
    bv[0].setBounds({x:0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  })
  win.on('unmaximize',()=>{
    winSize=win.getContentSize();
    bv[0].setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  })
  win.on('enter-full-screen',()=>{
    winSize=win.getContentSize();
    bv[0].setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});
  })

  bv[0].webContents.on('did-start-loading',()=>{
    win.webContents.executeJavaScript('document.getElementsByTagName(\'yomikomi-bar\')[0].setAttribute(\'id\',\'loading\')')
  })
  bv[0].webContents.on('did-finish-load',()=>{
    win.webContents.executeJavaScript('document.getElementsByTagName(\'yomikomi-bar\')[0].setAttribute(\'id\',\'loaded\')').then(()=>{win.webContents.executeJavaScript('document.getElementsByTagName(\'yomikomi-bar\')[0].removeAttribute(\'id\')')})
  })
}

app.on('ready', nw);

app.on('window-all-closed',()=>{
  if(process.platform!=='darwin')
    app.quit();
});

app.on('activate',()=>{
  if(win===null)
    nw();
})

//ipc channels
ipcMain.on('moveView',(e,link)=>{
  if(link==''){
    return true;
  }else{
    bv[0].webContents.loadURL(link).then(()=>{
      win.webContents.executeJavaScript(`document.getElementsByTagName('input')[0].value='${bv[0].webContents.getURL().substring(bv[0].webContents.getURL().indexOf('/')+2, bv[0].webContents.getURL().length)}'`)
    }).catch(()=>{
      bv[0].webContents.loadURL(`file://${__dirname}/src/resource/server-notfound.html`).then(()=>{
        win.webContents.executeJavaScript(`document.getElementsByTagName('input')[0].value='';`);
        bv[0].webContents.executeJavaScript(`document.getElementsByTagName('span')[0].innerText='${link}';
          var requiredUrl='${link}';
        `);
      })
      console.log('The previous error is normal. It redirected to a page where the server couldn\'t be found.');
    })
  }

  if(link!=`file://${__dirname}/../resource/index.html`){
    bv[0].webContents.executeJavaScript(`
      document.getElementsByTagName('head')[0].innerHTML=document.getElementsByTagName('head')[0].innerHTML+'<style>*{-webkit-app-region: none!important}</style>'
      document.body.style.userSelect='inherit'
    `);
  }
})
ipcMain.on('windowClose',()=>{
  win.close();
})
ipcMain.on('windowMaximize',()=>{
  win.maximize();
})
ipcMain.on('windowMinimize',()=>{
  win.minimize();
})
ipcMain.on('windowUnmaximize',()=>{
  win.unmaximize();
})
ipcMain.on('windowMaxMin',()=>{
  if(win.isMaximized()==true){
    win.unmaximize();
  }else{
    win.maximize();
  }
})
ipcMain.on('moveViewBlank',()=>{
  bv[0].webContents.loadURL(`file://${__dirname}/src/resource/blank.html`);
})
ipcMain.on('reloadBrowser',()=>{
  bv[0].webContents.reload();
})
ipcMain.on('browserBack',()=>{
  bv[0].webContents.goBack();
})
ipcMain.on('browserGoes',()=>{
  bv[0].webContents.goForward();
})
ipcMain.on('getTabList',()=>{
  return bv[0];
})
ipcMain.on('makeNewTab',()=>{
  newTab();
})

let menu=Menu.buildFromTemplate([
  {
    label: '??????',
    submenu: [
      {
        label: 'Monot????????????',
        accelerator: 'CmdOrCtrl+Alt+A',
        click: ()=>{
          dialog.showMessageBox(null, {
            type: 'info',
            icon: './src/image/logo.png',
            title: 'Monot????????????',
            message: 'Monot 1.0.0 Beta 3????????????',
            detail: `???????????????: 1.0.0 Beta 3
???????????????: 3
?????????: Sorakime

???????????????: https://github.com/Sorakime/monot
???????????????: https://sorakime.github.io/mncr/project/monot

Copyright 2021 Sorakime.`
          })
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen',
        accelerator: 'F11',
        label: '???????????????'
      },
      {
        role: 'hide',
        label: '??????'
      },
      {
        role: 'hideothers',
        label: '????????????'
      },
      {
        role: 'reload',
        label: 'nav????????????',
        accelerator: 'CmdOrCtrl+Alt+R'
      },
      {
        label: '??????',
        role: 'quit',
        accelerator: 'CmdOrCtrl+Q'
      }
    ]
  },
  {
    label: '??????',
    submenu: [
      {
        label: '???????????????',
        accelerator: 'CmdOrCtrl+R',
        click: ()=>{
          bv[0].webContents.reload();
        }
      },
      {
        label: '??????',
        accelerator: 'CmdOrCtrl+Alt+Z',
        click: ()=>{
          bv[0].webContents.goBack();
        }
      },
      {
        label: '??????',
        accelerator: 'CmdOrCtrl+Alt+X',
        click: ()=>{
          bv[0].webContents.goForward();
        }
      }
    ]
  },
  {
    label: '??????',
    submenu: [
      {
        label: '????????????????????????',
        accelerator: 'F12',
        click: ()=>{
          bv[0].webContents.toggleDevTools();
        }
      },
      {
        label: 'Monot???????????????????????????',
        accelerator: 'Alt+F12',
        click: ()=>{
          win.webContents.toggleDevTools();
        }
      }
    ]
  }
])
Menu.setApplicationMenu(menu);
