import {} from "spinal-core-connectorjs";
import * as Q from 'q';

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

class spinal {
  constructor() {
    this.user = {
      username: "",
      password: ""
    };
  }

  init() {
    let defer = Q.defer();

    let user = this.getUser();
    if (this.user.username) {
      SpinalUserManager.get_user_id('http://' + window.location.host, this.user.username, this.user.password, (response) => {
          let id = parseInt(response);
          this.conn = spinalCore.connect(`http://${id}:${this.user.username}@${window.location.host}/`);
          defer.resolve();
        },
        () => {
          window.location = "/html/drive/";
          // defer.reject();
        });
    } else
      window.location = "/html/drive/";
    return defer.promise;
  }

  getUser() {
    if (!this.user.username) {
      let _user = window.localStorage.getItem("spinalhome_cfg");
      if (_user) {
        this.user = JSON.parse(atob(_user));
      }
    }
    return this.user;
  }

  getModel() {
    let defer = Q.defer();

    this.init().then(() => {
      let path = getParameterByName("path");
      if (!path) {
        window.location = "/html/drive/";
      }
      path = atob(path);
      spinalCore.load(this.conn, path, (forgefile) => {
        if (forgefile.groupAlertPlugin) {
          forgefile.groupAlertPlugin.load((model) => {
            this.model = model;
            defer.resolve(this.model);
          });
        } else
          window.location = "/html/drive/";
        // defer.reject();
      }, () => {
        window.location = "/html/drive/";
        // defer.reject();
      });
    }, () => {
      window.location = "/html/drive/";
      // defer.reject();
    });

    return defer.promise;
  }
}

spinal.signOut = () => {
  window.localStorage.setItem("spinalhome_cfg", "");
}



export default spinal;